import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";

interface CreateOrganizationAccordionProps {
  onCreateOrganization: (name: string, description: string) => Promise<void>;
}

export function CreateOrganizationAccordion({
  onCreateOrganization,
}: CreateOrganizationAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function handleCreateOrganization() {
    const trimmedName = newOrgName.trim();
    const trimmedDescription = newOrgDescription.trim();

    setCreateError("");
    setCreateSuccess("");

    if (!trimmedName) {
      setCreateError("O nome da organização é obrigatório.");
      return;
    }

    try {
      setCreatingOrganization(true);

      await onCreateOrganization(trimmedName, trimmedDescription);

      setCreateSuccess("Organização criada com sucesso.");
      setNewOrgName("");
      setNewOrgDescription("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Erro ao criar organização:", error);
      setCreateError(
        error?.response?.data?.detail || "Erro ao criar organização.",
      );
    } finally {
      setCreatingOrganization(false);
    }
  }

  function clearForm() {
    setNewOrgName("");
    setNewOrgDescription("");
    setCreateError("");
    setCreateSuccess("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Criar organização
            </h2>
            <p className="text-sm text-slate-500">
              Cadastre uma nova organização com nome e descrição.
            </p>
          </div>
        </div>

        <div className="text-slate-500">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-5 py-5">
          <div className="space-y-4">
            {createError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {createSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome da organização
              </label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  if (createError) setCreateError("");
                  if (createSuccess) setCreateSuccess("");
                }}
                placeholder="Ex: Time Produto Crédito"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={newOrgDescription}
                onChange={(e) => {
                  setNewOrgDescription(e.target.value);
                  if (createError) setCreateError("");
                  if (createSuccess) setCreateSuccess("");
                }}
                placeholder="Descreva o foco da organização"
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleCreateOrganization}
                disabled={creatingOrganization || !newOrgName.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {creatingOrganization ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Criar organização
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="rounded-xl bg-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
