from bson import ObjectId


def serialize_object_id(value):
    return str(value) if isinstance(value, ObjectId) else value


def serialize_organization(org):
    return {
        "id": str(org["_id"]),
        "name": org["name"],
        "owner_id": serialize_object_id(org["owner_id"]),
        "created_at": org["created_at"],
        "updated_at": org["updated_at"],
    }


def serialize_organization_member(member):
    return {
        "id": str(member["_id"]),
        "organization_id": serialize_object_id(member["organization_id"]),
        "user_id": serialize_object_id(member["user_id"]),
        "role": member["role"],
        "joined_at": member["joined_at"],
    }


def serialize_task(task):
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "due_date": task.get("due_date"),
        "type": task["type"],
        "status": task["status"],
        "created_by": serialize_object_id(task["created_by"]),
        "user_id": serialize_object_id(task.get("user_id")),
        "organization_id": serialize_object_id(task.get("organization_id")),
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
    }