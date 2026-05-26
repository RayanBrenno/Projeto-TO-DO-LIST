from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/invites", tags=["Invites"])


@router.get("/me")
def get_my_invites(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]

    invites = list(db.organization_invites.find({
        "invited_user_id": user_id,
        "status": "pending"
    }))

    result = []
    for invite in invites:
        org = db.organizations.find_one({"_id": invite["organization_id"]})
        inviter = db.users.find_one({"_id": invite["invited_by"]})
        result.append({
            "invite_id": str(invite["_id"]),
            "org_id": str(invite["organization_id"]),
            "org_name": org.get("name") if org else "Organização desconhecida",
            "invited_by_name": inviter.get("name") if inviter else "Usuário desconhecido",
            "created_at": invite.get("created_at"),
        })

    return result


@router.post("/{invite_id}/accept")
def accept_invite(invite_id: str, current_user=Depends(get_current_user)):
    try:
        inv_id = ObjectId(invite_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID do convite inválido")

    invite = db.organization_invites.find_one({
        "_id": inv_id,
        "invited_user_id": current_user["_id"],
        "status": "pending"
    })

    if not invite:
        raise HTTPException(status_code=404, detail="Convite não encontrado")

    now = datetime.utcnow().isoformat()

    db.organization_members.insert_one({
        "organization_id": invite["organization_id"],
        "user_id": current_user["_id"],
        "role": "member",
        "joined_at": now,
    })

    db.organization_invites.update_one(
        {"_id": inv_id},
        {"$set": {"status": "accepted"}}
    )

    return {"message": "Convite aceito com sucesso"}


@router.post("/{invite_id}/decline")
def decline_invite(invite_id: str, current_user=Depends(get_current_user)):
    try:
        inv_id = ObjectId(invite_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID do convite inválido")

    invite = db.organization_invites.find_one({
        "_id": inv_id,
        "invited_user_id": current_user["_id"],
        "status": "pending"
    })

    if not invite:
        raise HTTPException(status_code=404, detail="Convite não encontrado")

    db.organization_invites.update_one(
        {"_id": inv_id},
        {"$set": {"status": "declined"}}
    )

    return {"message": "Convite recusado"}
