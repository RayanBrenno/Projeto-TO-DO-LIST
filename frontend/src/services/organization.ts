import { api } from "./api";
import type { Organization } from "../types/task";

export async function getMyOrganizations(): Promise<Organization[]> {
  const response = await api.get("/organizations/my");
  return response.data;
}