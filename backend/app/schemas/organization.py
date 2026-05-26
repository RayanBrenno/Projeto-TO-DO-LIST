from pydantic import BaseModel, Field
from typing import Literal, Optional


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(None, max_length=500)


class InviteMemberRequest(BaseModel):
    user_email: str


class OrganizationMemberResponse(BaseModel):
    id: str
    organization_id: str
    user_id: str
    role: Literal["owner", "member"]
    joined_at: str


class OrganizationResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    created_at: str
    updated_at: str


class InviteResponse(BaseModel):
    invite_id: str
    org_id: str
    org_name: str
    invited_by_name: str
    created_at: Optional[str] = None