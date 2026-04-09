import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { OrganizationCardAccordion } from "./OrganizationCardAccordion";
import type { OrganizationWithMembers } from "../../types/organization";

interface OrganizationListAccordionProps {
  organizations: OrganizationWithMembers[];
  loading: boolean;
  onAddMember: (orgId: string, email: string) => Promise<void>;
}

export function OrganizationListAccordion({
  organizations,
  loading,
  onAddMember,
}: OrganizationListAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Consultar organizações
            </h2>
            <p className="text-sm text-slate-500">
              Visualize detalhes, criador e membros de cada organização.
            </p>
          </div>
        </div>

        <div className="text-slate-500">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-5 py-5">
          {loading ? (
            <div className="py-8 text-sm text-slate-500">Carregando...</div>
          ) : organizations.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-500">
              Nenhuma organização cadastrada.
            </div>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <OrganizationCardAccordion
                  key={org.id}
                  organization={org}
                  onAddMember={onAddMember}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
