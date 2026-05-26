import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Clock, Loader2, LogOut, Mail, Plus, Trash2 } from "lucide-react";
import type {
  OrganizationMember,
  OrganizationWithMembers,
} from "../../types/organization";

interface OrganizationCardAccordionProps {
  organization: OrganizationWithMembers;
  onAddMember: (orgId: string, email: string) => Promise<void>;
  onLoadMembers: (orgId: string) => Promise<void>;
  onDeleteOrganization?: () => Promise<void>;
  onLeaveOrganization?: () => Promise<void>;
  isOwner?: boolean;
}

export function OrganizationCardAccordion({
  organization,
  onAddMember,
  onLoadMembers,
  onDeleteOrganization,
  onLeaveOrganization,
  isOwner = false,
}: OrganizationCardAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const orgContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (organization.membersLoaded && membersOpen) {
      orgContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [organization.membersLoaded]);

  const members = organization.members || [];
  const activeMembers = members.filter((m) => !m.is_pending);
  const pendingMembers = members.filter((m) => m.is_pending);

  function formatDate(date?: string) {
    if (!date) return "Não informado";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Não informado";
    return parsed.toLocaleDateString("pt-BR");
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleAddMember() {
    const email = memberEmail.trim().toLowerCase();
    setMemberError("");
    setMemberSuccess("");

    if (!email) {
      setMemberError("O e-mail do membro é obrigatório.");
      return;
    }

    if (!isValidEmail(email)) {
      setMemberError("Informe um e-mail válido.");
      return;
    }

    const alreadyExists = members.some(
      (member) => member.email.toLowerCase() === email,
    );
    if (alreadyExists) {
      setMemberError("Esse e-mail já faz parte da organização.");
      return;
    }

    try {
      setAddingMember(true);
      await onAddMember(organization.id, email);
      setMemberEmail("");
      setMemberSuccess("Convite enviado com sucesso.");
      setMembersOpen(true);
    } catch (error: any) {
      console.error("Erro ao adicionar membro:", error);
      setMemberError(
        error?.response?.data?.detail || "Erro ao adicionar membro.",
      );
    } finally {
      setAddingMember(false);
    }
  }

  async function handleDeleteOrg() {
    if (!onDeleteOrganization) return;
    try {
      setActionLoading(true);
      await onDeleteOrganization();
    } catch {
      setConfirmDelete(false);
      setActionLoading(false);
    }
  }

  async function handleLeaveOrg() {
    if (!onLeaveOrganization) return;
    try {
      setActionLoading(true);
      await onLeaveOrganization();
    } catch {
      setConfirmLeave(false);
      setActionLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) setTimeout(() => orgContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
            return !prev;
          });
          if (!organization.membersLoaded) {
            onLoadMembers(organization.id);
          }
        }}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-100 transition-colors"
      >
        <div>
          <h3 className="text-sm md:text-base font-semibold text-slate-900">
            {organization.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {organization.description || "Sem descrição"}
          </p>
        </div>
        <div className="text-slate-500">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {isOpen && (
        <div ref={orgContentRef} className="border-t border-slate-200 bg-white px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Criado por
              </p>
              <p className="text-sm text-slate-900 mt-1">
                {organization.owner_name || organization.owner_email || "Não informado"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Data de criação
              </p>
              <p className="text-sm text-slate-900 mt-1">
                {formatDate(organization.created_at)}
              </p>
            </div>
          </div>

          <div className="ml-0 md:ml-4 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setMembersOpen((prev) => {
                  if (!prev) setTimeout(() => orgContentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
                  return !prev;
                });
              }}
              className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-100 transition-colors"
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Membros</h4>
                <p className="text-sm text-slate-500 mt-1">
                  {organization.membersLoaded ? (
                    <>
                      {activeMembers.length} membro(s)
                      {isOwner && pendingMembers.length > 0 && (
                        <span className="ml-2 text-amber-600">
                          · {pendingMembers.length} convite(s) pendente(s)
                        </span>
                      )}
                    </>
                  ) : (
                    "Carregando..."
                  )}
                </p>
              </div>
              <div className="text-slate-500">
                {membersOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {membersOpen && (
              <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-4">
                {!organization.membersLoaded ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Carregando membros...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {members.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500 border border-slate-200">
                          Nenhum membro cadastrado.
                        </div>
                      ) : (
                        members.map((member: OrganizationMember, index: number) => (
                          <div
                            key={member.id || `${member.email}-${index}`}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                              member.is_pending
                                ? "border-amber-200 bg-amber-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            {member.is_pending ? (
                              <Clock size={16} className="text-amber-500 shrink-0" />
                            ) : (
                              <Mail size={16} className="text-slate-500 shrink-0" />
                            )}
                            <span className="text-sm text-slate-800 flex-1">
                              {member.email}
                            </span>
                            {member.is_pending ? (
                              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Convite Pendente
                              </span>
                            ) : member.role === "owner" ? (
                              <span className="text-xs font-medium text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                                Dono
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                Membro
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {isOwner && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 space-y-3">
                        <label className="block text-sm font-medium text-slate-700">
                          Adicionar novo membro
                        </label>
                        <div className="flex flex-col md:flex-row gap-3">
                          <input
                            type="email"
                            value={memberEmail}
                            onChange={(e) => {
                              setMemberEmail(e.target.value);
                              if (memberError) setMemberError("");
                              if (memberSuccess) setMemberSuccess("");
                            }}
                            placeholder="email@exemplo.com"
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddMember}
                            disabled={addingMember || !memberEmail.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {addingMember ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Adicionando...
                              </>
                            ) : (
                              <>
                                <Plus size={16} />
                                Adicionar
                              </>
                            )}
                          </button>
                        </div>
                        {memberError && (
                          <p className="text-sm text-red-600">{memberError}</p>
                        )}
                        {memberSuccess && (
                          <p className="text-sm text-green-600">{memberSuccess}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            {isOwner ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Tem certeza? Isso é irreversível.</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={actionLoading}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteOrg}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {actionLoading && <Loader2 size={12} className="animate-spin" />}
                    Confirmar exclusão
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={13} />
                  Excluir organização
                </button>
              )
            ) : confirmLeave ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Tem certeza?</span>
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLeaveOrg}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {actionLoading && <Loader2 size={12} className="animate-spin" />}
                  Confirmar saída
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <LogOut size={13} />
                Sair da organização
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
