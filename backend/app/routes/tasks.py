from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.schemas.tasks import TaskCreate
from app.utils.utils_serializers import serialize_task
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("")
def create_task(data: TaskCreate, current_user=Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    current_user_id = current_user["_id"]

    task = {
        "title": data.title.strip(),
        "description": data.description.strip() if data.description else None,
        "due_date": data.due_date,
        "type": data.type,
        "status": "pending",
        "created_by": current_user_id,
        "user_id": None,
        "organization_id": None,
        "created_at": now,
        "updated_at": now,
    }

    if data.type == "personal":
        task["user_id"] = current_user_id

    elif data.type == "organization":
        if not data.organization_id:
            raise HTTPException(
                status_code=400,
                detail="organization_id é obrigatório para tarefa de organização"
            )

        try:
            org_id = ObjectId(data.organization_id)
        except Exception:
            raise HTTPException(status_code=400, detail="ID da organização inválido")

        organization = db.organizations.find_one({"_id": org_id})
        if not organization:
            raise HTTPException(status_code=404, detail="Organização não encontrada")

        # regra principal: só owner pode criar tarefa da organização
        owner_membership = db.organization_members.find_one({
            "organization_id": org_id,
            "user_id": current_user_id,
            "role": "owner",
        })

        if not owner_membership:
            raise HTTPException(
                status_code=403,
                detail="Apenas o líder da organização pode criar tarefas organizacionais"
            )

        task["organization_id"] = org_id

    result = db.tasks.insert_one(task)
    task["_id"] = result.inserted_id

    return {
        "message": "Tarefa criada com sucesso",
        "task": serialize_task(task),
    }


@router.get("/my")
def list_my_tasks(current_user=Depends(get_current_user)):
    user_id = current_user["_id"]

    tasks = list(
        db.tasks.find({
            "type": "personal",
            "user_id": user_id
        }).sort("created_at", -1)
    )

    return [serialize_task(task) for task in tasks]


@router.get("/organization/{organization_id}")
def list_organization_tasks(organization_id: str, current_user=Depends(get_current_user)):
    try:
        org_id = ObjectId(organization_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID da organização inválido")

    user_id = current_user["_id"]

    membership = db.organization_members.find_one({
        "organization_id": org_id,
        "user_id": user_id
    })

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="Você não participa desta organização"
        )

    tasks = list(
        db.tasks.find({
            "type": "organization",
            "organization_id": org_id
        }).sort("created_at", -1)
    )

    return [serialize_task(task) for task in tasks]