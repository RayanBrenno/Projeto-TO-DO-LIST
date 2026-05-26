import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { CreateOrganizationAccordion } from "../components/organizations/CreateOrganizationAccordion";
import { OrganizationListAccordion } from "../components/organizations/OrganizationListAccordion";
import type { Invite, OrganizationWithMembers } from "../types/organization";
import {
  acceptInvite,
  addOrganizationMember,
  createOrganization,
  declineInvite,
  deleteOrganization,
  getOrganizationMembers,
  getOrganizations,
  getPendingInvites,
  leaveOrganization,
} from "../services/organization";
import { useAuth } from "../contexts/AuthContext";
import { Mail, UserCheck, UserX } from "lucide-react";

export function OrganizationPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationWithMembers[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    fetchOrganizations();
    fetchInvites();
  }, []);

  async function fetchOrganizations() {
    try {
      setLoading(true);
      setPageError("");

      const orgs = await getOrganizations();

      const normalized = orgs.map((org) => ({
        ...org,
        members: [],
        membersLoaded: false,
      }));

      setOrganizations(normalized);
    } catch {
      setPageError("Erro ao carregar organizações.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvites() {
    try {
      const data = await getPendingInvites();
      setInvites(data);
    } catch {
      // silencia erros de convite para não bloquear a página
    }
  }

  async function loadMembers(orgId: string) {
    const members = await getOrganizationMembers(orgId);

    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === orgId ? { ...org, members, membersLoaded: true } : org,
      ),
    );
  }

  async function handleCreateOrganization(name: string, description: string) {
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    const createdOrg = await createOrganization(payload);

    setOrganizations((prev) => [createdOrg, ...prev]);
  }

  async function addMember(orgId: string, email: string) {
    const normalizedMember = await addOrganizationMember(orgId, email);

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

  async function handleAcceptInvite(inviteId: string, orgId: string) {
    await acceptInvite(inviteId);
    setInvites((prev) => prev.filter((i) => i.invite_id !== inviteId));

    // recarrega orgs para mostrar a nova org aceita
    const orgs = await getOrganizations();
    setOrganizations(
      orgs.map((org) => ({ ...org, members: [], membersLoaded: false })),
    );

    // Remove o orgId da lista de membros carregados para forçar reload quando abrir
    void orgId;
  }

  async function handleDeclineInvite(inviteId: string) {
    await declineInvite(inviteId);
    setInvites((prev) => prev.filter((i) => i.invite_id !== inviteId));
  }

  async function handleDeleteOrganization(orgId: string) {
    await deleteOrganization(orgId);
    setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
  }

  async function handleLeaveOrganization(orgId: string) {
    await leaveOrganization(orgId);
    setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
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

          {invites.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900">
                  Convites Recebidos
                </h3>
                <p className="text-sm text-blue-600 mt-0.5">
                  Você tem {invites.length} convite(s) pendente(s).
                </p>
              </div>

              <div className="bg-white divide-y divide-slate-100">
                {invites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="flex items-center justify-between px-5 py-4 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail size={16} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {invite.org_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Convidado por {invite.invited_by_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptInvite(invite.invite_id, invite.org_id)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                      >
                        <UserCheck size={13} />
                        Aceitar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineInvite(invite.invite_id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <UserX size={13} />
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CreateOrganizationAccordion
            onCreateOrganization={handleCreateOrganization}
          />

          <OrganizationListAccordion
            organizations={organizations}
            loading={loading}
            onAddMember={addMember}
            onLoadMembers={loadMembers}
            onDeleteOrganization={handleDeleteOrganization}
            onLeaveOrganization={handleLeaveOrganization}
            currentUserEmail={user?.email}
          />
        </div>
      </div>
    </>
  );
}
