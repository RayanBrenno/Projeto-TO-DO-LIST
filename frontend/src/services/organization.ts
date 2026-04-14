import { api } from "./api";
import type { Organization, OrganizationWithMembers,OrganizationMember } from "../types/organization";

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export async function getMyOrganizations(): Promise<Organization[]> {
  const response = await api.get("/organizations/my");
  return response.data;
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