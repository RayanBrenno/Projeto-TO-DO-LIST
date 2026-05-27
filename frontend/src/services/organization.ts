import { api } from "./api";
import type { OrganizationWithMembers, OrganizationMember, Invite } from "../types/organization";

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export async function getOrganizations() {
  const { data } = await api.get("/organizations");
  return Array.isArray(data) ? data : [];
}

export async function getOrganizationMembers(orgId: string) {
  const { data } = await api.get(`/organizations/${orgId}/members`);
  return Array.isArray(data) ? data : [];
}

function normalizeOrganization(org: any): OrganizationWithMembers {
  return {
    ...org,
    members: Array.isArray(org?.members) ? org.members : [],
  };
}


export async function createOrganization(
  payload: CreateOrganizationPayload,
): Promise<OrganizationWithMembers> {
  const { data } = await api.post("/organizations", payload);
  return normalizeOrganization(data);
}

export async function addOrganizationMember(
  orgId: string,
  email: string,
): Promise<OrganizationMember> {
  const { data } = await api.post(`/organizations/${orgId}/members`, { email });

  const returnedMember = data?.member;

  return returnedMember?.email ? returnedMember : { email };
}

export async function getPendingInvites(): Promise<Invite[]> {
  const { data } = await api.get("/invites/me");
  return Array.isArray(data) ? data : [];
}

export async function acceptInvite(inviteId: string): Promise<void> {
  await api.post(`/invites/${inviteId}/accept`);
}

export async function declineInvite(inviteId: string): Promise<void> {
  await api.post(`/invites/${inviteId}/decline`);
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await api.delete(`/organizations/${orgId}`);
}

export async function leaveOrganization(orgId: string): Promise<void> {
  await api.delete(`/organizations/${orgId}/members/me`);
}

export async function cancelInvite(inviteId: string): Promise<void> {
  await api.delete(`/invites/${inviteId}`);
}

export async function updateMemberRole(
  orgId: string,
  memberId: string,
  role: "co-owner" | "member",
): Promise<void> {
  await api.patch(`/organizations/${orgId}/members/${memberId}/role`, { role });
}

export async function transferOwnership(
  orgId: string,
  newOwnerId: string,
): Promise<{ new_owner_email: string; new_owner_name: string }> {
  const { data } = await api.post(`/organizations/${orgId}/transfer-ownership`, {
    new_owner_id: newOwnerId,
  });
  return data;
}