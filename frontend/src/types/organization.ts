export interface Organization {
  id: string;
  name: string;
  description?: string | null;
}

export interface OrganizationMember {
  id?: string;
  email: string;
}

export interface OrganizationWithMembers extends Organization {
  created_at?: string;
  owner_name?: string | null;
  owner_email?: string | null;
  members?: OrganizationMember[];
  membersLoaded?: boolean; // flag para indicar se os membros já foram carregados
}