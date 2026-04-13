import { useEffect, useMemo, useState } from "react";
import { PlusCircle, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Header } from "../components/Header";
import { createTask } from "../services/task";
import { getMyOrganizations } from "../services/organization";
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
        const data = await getMyOrganizations();
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
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const value = e.target.value as TaskType;
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                        organization_id:
                          value === "organization" ? prev.organization_id : "",
                      }));
                      if (error) setError("");
                      if (success) setSuccess("");
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="personal">Pessoal</option>
                    <option value="organization">Organização</option>
                  </select>
                </div>
              </div>

              {isOrganizationTask && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Organização
                  </label>
                  <select
                    value={formData.organization_id || ""}
                    onChange={(e) =>
                      handleChange("organization_id", e.target.value)
                    }
                    disabled={loadingOrganizations}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                  >
                    <option value="">
                      {loadingOrganizations
                        ? "Carregando organizações..."
                        : "Selecione uma organização"}
                    </option>

                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>

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