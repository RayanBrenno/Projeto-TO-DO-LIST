export interface Organization {
  id: string;
  name: string;
  description?: string | null;
}

export interface OrganizationMember {
  id?: string;
  email: string;
  role?: string;
  joined_at?: string | null;
  is_pending?: boolean;
}

export interface OrganizationWithMembers extends Organization {
  created_at?: string;
  owner_name?: string | null;
  owner_email?: string | null;
  members?: OrganizationMember[];
  membersLoaded?: boolean;
}

export interface Invite {
  invite_id: string;
  org_id: string;
  org_name: string;
  invited_by_name: string;
  created_at: string | null;
}