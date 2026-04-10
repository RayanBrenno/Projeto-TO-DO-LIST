from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db
from app.schemas.tasks import TaskCreate, TaskUpdate
from app.utils.utils_serializers import serialize_task
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


def normalize_task_status(status: str) -> str:
    """
    Compatibilidade entre status antigos e novos.
    """
    if status == "pending":
        return "to_do"
    return status


def serialize_task_with_organization(task, organization_name=None):
    """
    Usa o serializer atual e adiciona organization_name + normalização de status
    sem quebrar o restante do projeto.
    """
    serialized = serialize_task(task)
    serialized["organization_name"] = organization_name
    serialized["status"] = normalize_task_status(serialized.get("status"))
    return serialized


@router.post("")
def create_task(data: TaskCreate, current_user=Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    current_user_id = current_user["_id"]

    task = {
        "title": data.title.strip(),
        "description": data.description.strip() if data.description else None,
        "due_date": data.due_date,
        "type": data.type,
        "status": "to_do",
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

    organization_name = None
    if task["type"] == "organization" and task.get("organization_id"):
        organization = db.organizations.find_one({"_id": task["organization_id"]})
        if organization:
            organization_name = organization.get("name")

    return {
        "message": "Tarefa criada com sucesso",
        "task": serialize_task_with_organization(task, organization_name),
    }


@router.get("/my")
def list_my_tasks(current_user=Depends(get_current_user)):
    """
    Mantido por compatibilidade:
    continua trazendo apenas tarefas pessoais do usuário.
    """
    user_id = current_user["_id"]

    tasks = list(
        db.tasks.find({
            "type": "personal",
            "user_id": user_id
        }).sort("created_at", -1)
    )

    return [serialize_task_with_organization(task) for task in tasks]


@router.get("/me")
def list_all_my_tasks(current_user=Depends(get_current_user)):
    """
    Endpoint novo para a página 'Minhas Tasks':
    - traz tarefas pessoais do usuário
    - traz tarefas das organizações em que ele participa
    - adiciona organization_name nas tasks organizacionais
    """
    user_id = current_user["_id"]

    memberships = list(
        db.organization_members.find({
            "user_id": user_id
        })
    )

    member_org_ids = [
        membership["organization_id"]
        for membership in memberships
        if membership.get("organization_id")
    ]

    tasks = list(
        db.tasks.find({
            "$or": [
                {"type": "personal", "user_id": user_id},
                {"type": "organization", "organization_id": {"$in": member_org_ids}},
            ]
        }).sort("created_at", -1)
    )

    organization_ids = list({
        task["organization_id"]
        for task in tasks
        if task.get("type") == "organization" and task.get("organization_id")
    })

    organizations_map = {}

    if organization_ids:
        organizations = list(
            db.organizations.find({
                "_id": {"$in": organization_ids}
            })
        )

        organizations_map = {
            org["_id"]: org.get("name")
            for org in organizations
        }

    return [
        serialize_task_with_organization(
            task,
            organizations_map.get(task.get("organization_id"))
        )
        for task in tasks
    ]


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

    organization = db.organizations.find_one({"_id": org_id})
    organization_name = organization.get("name") if organization else None

    tasks = list(
        db.tasks.find({
            "type": "organization",
            "organization_id": org_id
        }).sort("created_at", -1)
    )

    return [
        serialize_task_with_organization(task, organization_name)
        for task in tasks
    ]
    

@router.put("/{task_id}")
def update_task(task_id: str, data: TaskUpdate, current_user=Depends(get_current_user)):
    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID da task inválido")

    current_user_id = current_user["_id"]

    task = db.tasks.find_one({"_id": task_object_id})
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    can_update = False

    # tarefa pessoal: dono pode alterar
    if task.get("type") == "personal" and task.get("user_id") == current_user_id:
        can_update = True

    # tarefa organizacional: qualquer membro pode alterar status
    elif task.get("type") == "organization" and task.get("organization_id"):
        membership = db.organization_members.find_one({
            "organization_id": task["organization_id"],
            "user_id": current_user_id
        })
        if membership:
            can_update = True

    if not can_update:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para alterar esta tarefa"
        )

    update_data = {
        "updated_at": datetime.utcnow().isoformat()
    }

    if data.title is not None:
        update_data["title"] = data.title.strip()

    if data.description is not None:
        update_data["description"] = data.description.strip() if data.description else None

    if data.due_date is not None:
        update_data["due_date"] = data.due_date

    if data.status is not None:
        update_data["status"] = data.status

    db.tasks.update_one(
        {"_id": task_object_id},
        {"$set": update_data}
    )

    updated_task = db.tasks.find_one({"_id": task_object_id})

    organization_name = None
    if updated_task.get("type") == "organization" and updated_task.get("organization_id"):
        organization = db.organizations.find_one({"_id": updated_task["organization_id"]})
        if organization:
            organization_name = organization.get("name")

    return serialize_task_with_organization(updated_task, organization_name)