from pydantic import BaseModel, Field
from typing import Optional, Literal


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    due_date: Optional[str] = None
    type: Literal["personal", "organization"]
    organization_id: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    type: Literal["personal", "organization"]
    status: Literal["pending", "done"]
    created_by: str
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    created_at: str
    updated_at: str
