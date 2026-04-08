from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.schemas.organization import OrganizationCreate
from app.utils.utils_serializers import serialize_organization, serialize_organization_member
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("")
def create_organization(data: OrganizationCreate, current_user=Depends(get_current_user)):
    now = datetime.utcnow().isoformat()

    owner_id = current_user["_id"]

    organization = {
        "name": data.name.strip(),
        "owner_id": owner_id,
        "created_at": now,
        "updated_at": now,
    }

    result = db.organizations.insert_one(organization)
    organization["_id"] = result.inserted_id

    # cria o vínculo do dono na coleção de relacionamento
    member_relation = {
        "organization_id": organization["_id"],
        "user_id": owner_id,
        "role": "owner",
        "joined_at": now,
    }
    db.organization_members.insert_one(member_relation)

    return {
        "message": "Organização criada com sucesso",
        "organization": serialize_organization(organization),
    }


@router.get("/my")
def list_my_organizations(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]
    relations = list(
        db.organization_members.find({"user_id": user_id})
    )

    if not relations:
        return []

    org_ids = [rel["organization_id"] for rel in relations]

    organizations = list(
        db.organizations.find({"_id": {"$in": org_ids}})
    )

    return [serialize_organization(org) for org in organizations]


@router.get("/{organization_id}/members")
def list_organization_members(organization_id: str, current_user=Depends(get_current_user)):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(
            status_code=400, detail="ID da organização inválido")

    org = db.organizations.find_one({"_id": org_id})
    if not org:
        raise HTTPException(
            status_code=404, detail="Organização não encontrada")

    # só membros da organização podem listar membros
    user_id = current_user["_id"]    
    membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": user_id
    })

    if not membership:
        raise HTTPException(
            status_code=403, detail="Você não participa desta organização")

    members = list(db.organization_members.find({"organization_id": org_id}))
    return [serialize_organization_member(member) for member in members]
