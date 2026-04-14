from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.schemas.organization import OrganizationCreate
from app.utils.utils_serializers import serialize_organization
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


@router.get("/my")
def list_my_organizations_legacy(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]
    relations = list(db.organization_members.find({"user_id": user_id}))

    if not relations:
        return []

    org_ids = [rel["organization_id"] for rel in relations]
    organizations = list(db.organizations.find({"_id": {"$in": org_ids}}))

    return [serialize_organization(org) for org in organizations]


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

    # busca membros
    relations = list(
        db.organization_members.find({"organization_id": org_id})
    )

    members = []
    for relation in relations:
        user = db.users.find_one({"_id": relation["user_id"]})
        if user:
            members.append({
                "id": str(user["_id"]),
                "email": user.get("email"),
                "role": relation.get("role"),
                "joined_at": relation.get("joined_at"),
            })

    return members


@router.post("/{organization_id}/members")
def add_organization_member(
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
            detail="Apenas o dono da organização pode adicionar membros"
        )

    user_to_add = db.users.find_one({"email": data.email.lower().strip()})
    if not user_to_add:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    existing_membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": user_to_add["_id"]
    })

    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="Esse usuário já faz parte da organização"
        )

    now = datetime.utcnow().isoformat()

    member_relation = {
        "organization_id": org_id,
        "user_id": user_to_add["_id"],
        "role": "member",
        "joined_at": now,
    }

    db.organization_members.insert_one(member_relation)

    return {
        "message": "Membro adicionado com sucesso",
        "member": {
            "id": str(user_to_add["_id"]),
            "email": user_to_add.get("email"),
        }
    }
