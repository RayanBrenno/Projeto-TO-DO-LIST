import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Mail, Plus } from "lucide-react";
import type {
  OrganizationMember,
  OrganizationWithMembers,
} from "../../types/organization";

interface OrganizationCardAccordionProps {
  organization: OrganizationWithMembers;
  onAddMember: (orgId: string, email: string) => Promise<void>;
}

export function OrganizationCardAccordion({
  organization,
  onAddMember,
}: OrganizationCardAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  const members = organization.members || [];

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
      setMemberSuccess("Membro adicionado com sucesso.");
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
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
        <div className="border-t border-slate-200 bg-white px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Criado por
              </p>
              <p className="text-sm text-slate-900 mt-1">
                {organization.owner_name ||
                  organization.owner_email ||
                  "Não informado"}
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
              onClick={() => setMembersOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-100 transition-colors"
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Membros
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {members.length} membro(s)
                </p>
              </div>

              <div className="text-slate-500">
                {membersOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </div>
            </button>

            {membersOpen && (
              <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-4">
                <div className="space-y-2">
                  {members.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500 border border-slate-200">
                      Nenhum membro cadastrado.
                    </div>
                  ) : (
                    members.map((member: OrganizationMember, index: number) => (
                      <div
                        key={member.id || `${member.email}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <Mail size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-800">
                          {member.email}
                        </span>
                      </div>
                    ))
                  )}
                </div>

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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
