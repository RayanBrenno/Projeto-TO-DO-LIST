from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.schemas.organization import OrganizationCreate
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/organizations", tags=["Organizations"])


class AddOrganizationMemberPayload(BaseModel):
    email: EmailStr


@router.post("")
def create_organization(
    data: OrganizationCreate,
    current_user=Depends(get_current_user)
):
    now = datetime.utcnow().isoformat()
    owner_id = current_user["_id"]

    organization = {
        "name": data.name.strip(),
        "description": data.description.strip() if data.description else None,
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now,
    }

    result = db.organizations.insert_one(organization)
    organization["_id"] = result.inserted_id

    member_relation = {
        "organization_id": organization["_id"],
        "user_id": owner_id,
        "role": "owner",
        "joined_at": now,
    }
    db.organization_members.insert_one(member_relation)

    owner_name = current_user.get("name")
    owner_email = current_user.get("email")

    return {
        "message": "Organização criada com sucesso",
        "id": str(organization["_id"]),
        "name": organization["name"],
        "description": organization.get("description"),
        "created_at": organization["created_at"],
        "owner_name": owner_name,
        "owner_email": owner_email,
        "members": [
            {
                "id": str(owner_id),
                "email": owner_email,
            }
        ],
    }


@router.get("")
def list_my_organizations(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]

    relations = list(db.organization_members.find({"user_id": user_id}))
    if not relations:
        return []

    org_ids = [rel["organization_id"] for rel in relations]

    organizations = list(db.organizations.find({"_id": {"$in": org_ids}}))

    result = []

    for org in organizations:
        owner = db.users.find_one({"_id": org["owner_id"]})

        result.append({
            "id": str(org["_id"]),
            "name": org["name"],
            "description": org.get("description"),
            "created_at": org.get("created_at"),
            "owner_name": owner.get("name") if owner else None,
            "owner_email": owner.get("email") if owner else None,
        })

    return result


@router.get("/{organization_id}/members")
def list_organization_members(
    organization_id: str,
    current_user=Depends(get_current_user)
):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": current_user["_id"]
    })

    if not membership:
        raise HTTPException(status_code=403, detail="Sem acesso")

    relations = list(db.organization_members.find({"organization_id": org_id}))

    members = []
    for relation in relations:
        user = db.users.find_one({"_id": relation["user_id"]})
        if user:
            members.append({
                "id": str(user["_id"]),
                "email": user.get("email"),
                "role": relation.get("role"),
                "joined_at": relation.get("joined_at"),
                "is_pending": False,
            })

    if membership.get("role") == "owner":
        pending_invites = list(db.organization_invites.find({
            "organization_id": org_id,
            "status": "pending"
        }))
        for invite in pending_invites:
            user = db.users.find_one({"_id": invite["invited_user_id"]})
            if user:
                members.append({
                    "id": str(invite["_id"]),
                    "email": user.get("email"),
                    "role": "member",
                    "joined_at": None,
                    "is_pending": True,
                })

    return members


@router.delete("/{organization_id}")
def delete_organization(
    organization_id: str,
    current_user=Depends(get_current_user)
):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": current_user["_id"],
        "role": "owner",
    })
    if not membership:
        raise HTTPException(status_code=403, detail="Apenas o dono pode excluir a organização")

    db.tasks.delete_many({"organization_id": org_id})
    db.organization_invites.delete_many({"organization_id": org_id})
    db.organization_members.delete_many({"organization_id": org_id})
    db.organizations.delete_one({"_id": org_id})

    return {"message": "Organização excluída com sucesso"}


@router.delete("/{organization_id}/members/me")
def leave_organization(
    organization_id: str,
    current_user=Depends(get_current_user)
):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": current_user["_id"],
    })
    if not membership:
        raise HTTPException(status_code=404, detail="Você não é membro desta organização")

    if membership.get("role") == "owner":
        raise HTTPException(
            status_code=400,
            detail="O dono não pode sair da organização. Exclua-a se desejar."
        )

    db.organization_members.delete_one({
        "organization_id": org_id,
        "user_id": current_user["_id"],
    })

    return {"message": "Você saiu da organização"}


@router.post("/{organization_id}/members")
def invite_organization_member(
    organization_id: str,
    data: AddOrganizationMemberPayload,
    current_user=Depends(get_current_user)
):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(
            status_code=400, detail="ID da organização inválido")

    org = db.organizations.find_one({"_id": org_id})
    if not org:
        raise HTTPException(
            status_code=404, detail="Organização não encontrada")

    current_membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": current_user["_id"]
    })

    if not current_membership:
        raise HTTPException(
            status_code=403,
            detail="Você não participa desta organização"
        )

    if current_membership.get("role") != "owner":
        raise HTTPException(
            status_code=403,
            detail="Apenas o dono da organização pode convidar membros"
        )

    user_to_invite = db.users.find_one({"email": data.email.lower().strip()})
    if not user_to_invite:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    existing_membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": user_to_invite["_id"]
    })
    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="Esse usuário já faz parte da organização"
        )

    existing_invite = db.organization_invites.find_one({
        "organization_id": org_id,
        "invited_user_id": user_to_invite["_id"],
        "status": "pending"
    })
    if existing_invite:
        raise HTTPException(
            status_code=400,
            detail="Já existe um convite pendente para este usuário"
        )

    now = datetime.utcnow().isoformat()
    invite = {
        "organization_id": org_id,
        "invited_user_id": user_to_invite["_id"],
        "invited_by": current_user["_id"],
        "status": "pending",
        "created_at": now,
    }
    db.organization_invites.insert_one(invite)

    return {
        "message": "Convite enviado com sucesso",
        "member": {
            "id": str(invite["_id"]),
            "email": user_to_invite.get("email"),
            "is_pending": True,
        }
    }
