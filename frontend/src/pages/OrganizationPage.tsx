import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { api } from "../services/api";
import { CreateOrganizationAccordion } from "../components/organizations/CreateOrganizationAccordion";
import { OrganizationListAccordion } from "../components/organizations/OrganizationListAccordion";
import type {
  OrganizationWithMembers,
  OrganizationMember,
} from "../types/organization";

export function OrganizationPage() {
  const [organizations, setOrganizations] = useState<OrganizationWithMembers[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      setLoading(true);
      setPageError("");

      const response = await api.get("/organizations");
      const data = Array.isArray(response.data) ? response.data : [];

      const normalizedData: OrganizationWithMembers[] = data.map((org) => ({
        ...org,
        members: Array.isArray(org.members) ? org.members : [],
      }));

      setOrganizations(normalizedData);
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
      setPageError("Erro ao carregar organizações.");
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(name: string, description: string) {
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    const response = await api.post("/organizations", payload);

    const createdOrg: OrganizationWithMembers = {
      ...response.data,
      members: Array.isArray(response.data?.members)
        ? response.data.members
        : [],
    };

    setOrganizations((prev) => [createdOrg, ...prev]);
  }

  async function addMember(orgId: string, email: string) {
    const response = await api.post(`/organizations/${orgId}/members`, {
      email,
    });

    const returnedMember = response.data?.member;
    const normalizedMember: OrganizationMember = returnedMember?.email
      ? returnedMember
      : { email };

    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === orgId
          ? {
              ...org,
              members: [...(org.members || []), normalizedMember],
            }
          : org,
      ),
    );
  }

  return (
    <>
      <Header 
        title="Organizações" 
        subtitle="Acesse e administre as organizações das quais você participa."
      />

      <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-5">
          {pageError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pageError}
            </div>
          )}

          <CreateOrganizationAccordion onCreateOrganization={createOrganization} />

          <OrganizationListAccordion
            organizations={organizations}
            loading={loading}
            onAddMember={addMember}
          />
        </div>
      </div>
    </>
  );
}