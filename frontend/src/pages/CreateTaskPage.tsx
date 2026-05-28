import { useEffect, useMemo, useRef, useState } from "react";
import { PlusCircle, AlertCircle, Loader2, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { Header } from "../components/Header";
import { createTask } from "../services/task";
import { getOrganizations } from "../services/organization";
import type { CreateTaskPayload, TaskType } from "../types/task";
import type { Organization } from "../types/organization";

const initialForm: CreateTaskPayload = {
  title: "",
  description: "",
  due_date: "",
  type: "personal",
  organization_id: "",
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreateTaskPage() {
  const [formData, setFormData] = useState<CreateTaskPayload>(initialForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node))
        setTypeDropdownOpen(false);
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node))
        setOrgDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = useMemo(() => getTodayDateString(), []);

  const isOrganizationTask = useMemo(
    () => formData.type === "organization",
    [formData.type],
  );

  const isPastDueDate = useMemo(() => {
    if (!formData.due_date) return false;
    return formData.due_date < today;
  }, [formData.due_date, today]);

  const isFormInvalid = useMemo(() => {
    return (
      !formData.title.trim() ||
      !formData.due_date ||
      isPastDueDate ||
      (isOrganizationTask && !formData.organization_id)
    );
  }, [
    formData.title,
    formData.due_date,
    formData.organization_id,
    isPastDueDate,
    isOrganizationTask,
  ]);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        setLoadingOrganizations(true);
        const data = await getOrganizations();
        setOrganizations(data);
      } catch (err: any) {
        console.error("Erro ao carregar organizações:", err);
      } finally {
        setLoadingOrganizations(false);
      }
    }

    loadOrganizations();
  }, []);

  function handleChange<K extends keyof CreateTaskPayload>(
    field: K,
    value: CreateTaskPayload[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedTitle = formData.title.trim();
    const dueDate = formData.due_date?.trim();

    if (!trimmedTitle) {
      setError("O título é obrigatório.");
      return;
    }

    if (!dueDate) {
      setError("A data limite é obrigatória.");
      return;
    }

    if (dueDate < today) {
      setError(
        "A data limite não pode ser anterior à data de criação da tarefa.",
      );
      return;
    }

    if (isOrganizationTask && !formData.organization_id) {
      setError("Selecione uma organização para criar a tarefa organizacional.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateTaskPayload = {
        title: trimmedTitle,
        description: formData.description?.trim() || undefined,
        due_date: dueDate,
        type: formData.type,
        organization_id: isOrganizationTask
          ? formData.organization_id
          : undefined,
      };

      await createTask(payload);

      setSuccess("Tarefa criada com sucesso.");
      setFormData(initialForm);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erro ao criar tarefa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title="Criar Tarefa"
        subtitle="Cadastre uma nova tarefa pessoal ou vinculada a uma organização"
      />

      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <PlusCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Nova tarefa
                </h2>
                <p className="text-sm text-slate-500">
                  Preencha os dados abaixo para criar a tarefa.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Revisar documentação da sprint"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Detalhes da tarefa"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prazo *
                  </label>
                  <input
                    type="date"
                    value={formData.due_date || ""}
                    min={today}
                    onChange={(e) => handleChange("due_date", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                  />
                  {isPastDueDate && (
                    <p className="text-sm text-red-600 mt-2">
                      A data limite não pode ser anterior a hoje.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo da tarefa
                  </label>
                  <div ref={typeDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setTypeDropdownOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 hover:border-slate-300 transition-all"
                    >
                      <span>{formData.type === "personal" ? "Pessoal" : "Organização"}</span>
                      <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {typeDropdownOpen && (
                      <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                        {(["personal", "organization"] as TaskType[]).map((value) => {
                          const label = value === "personal" ? "Pessoal" : "Organização";
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setTypeDropdownOpen(false);
                                setFormData((prev) => ({
                                  ...prev,
                                  type: value,
                                  organization_id: value === "organization" ? prev.organization_id : "",
                                }));
                                if (error) setError("");
                                if (success) setSuccess("");
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              {label}
                              {formData.type === value && <Check size={13} className="text-slate-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isOrganizationTask && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Organização
                  </label>
                  <div ref={orgDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => !loadingOrganizations && organizations.length > 0 && setOrgDropdownOpen((prev) => !prev)}
                      disabled={loadingOrganizations}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 hover:border-slate-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className={formData.organization_id ? "text-slate-800" : "text-slate-400"}>
                        {loadingOrganizations
                          ? "Carregando organizações..."
                          : formData.organization_id
                          ? organizations.find((o) => o.id === formData.organization_id)?.name ?? "Selecione uma organização"
                          : "Selecione uma organização"}
                      </span>
                      {!loadingOrganizations && organizations.length > 0 && (
                        <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform ${orgDropdownOpen ? "rotate-180" : ""}`} />
                      )}
                      {loadingOrganizations && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
                    </button>
                    {orgDropdownOpen && (
                      <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setOrgDropdownOpen(false);
                              handleChange("organization_id", org.id);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            {org.name}
                            {formData.organization_id === org.id && <Check size={13} className="text-slate-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {!loadingOrganizations && organizations.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Você ainda não participa de nenhuma organização.
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || isFormInvalid}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Criar tarefa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}