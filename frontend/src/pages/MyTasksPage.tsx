import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { api } from "../services/api";
import { type Task, type TaskStatus } from "../types/task";
import { CalendarDays, Building2, Filter, ListTodo } from "lucide-react";

type StatusFilter = "all" | "to_do" | "doing" | "done";

const statusLabelMap: Record<TaskStatus, string> = {
  to_do: "A Fazer",
  doing: "Fazendo",
  done: "Concluído",
};

const statusClassMap: Record<TaskStatus, string> = {
  to_do: "bg-amber-100 text-amber-700 border border-amber-200",
  doing: "bg-blue-100 text-blue-700 border border-blue-200",
  done: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const response = await api.get("/tasks/me");
      setTasks(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: Task["status"]) {
    try {
      setUpdatingTaskId(taskId);

      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Sem data";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("pt-BR");
  }

  function getStatusLabel(status: Task["status"]) {
    return statusLabelMap[status];
  }

  function getStatusClasses(status: Task["status"]) {
    return statusClassMap[status];
  }

  function sortTasksByPriority(taskList: Task[]) {
    return [...taskList].sort((a, b) => {
      const aDone = a.status === "done";
      const bDone = b.status === "done";

      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;

      const aHasDate = !!a.due_date;
      const bHasDate = !!b.due_date;

      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;
      if (!aHasDate && !bHasDate) return 0;

      const aTime = new Date(a.due_date!).getTime();
      const bTime = new Date(b.due_date!).getTime();

      return aTime - bTime;
    });
  }

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const personalTasks = useMemo(() => {
    return sortTasksByPriority(
      filteredTasks.filter((task) => task.type === "personal"),
    );
  }, [filteredTasks]);

  const organizationTasks = useMemo(() => {
    return sortTasksByPriority(
      filteredTasks.filter((task) => task.type === "organization"),
    );
  }, [filteredTasks]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "to_do", label: "A Fazer" },
    { value: "doing", label: "Fazendo" },
    { value: "done", label: "Concluído" },
  ];

  const taskStatusOptions: { value: Task["status"]; label: string }[] = [
    { value: "to_do", label: "A Fazer" },
    { value: "doing", label: "Fazendo" },
    { value: "done", label: "Concluído" },
  ];

  if (loading) {
    return (
      <>
        <Header
          title="Minhas Tarefas"
          subtitle="Acompanhe o progresso e mantenha suas atividades sob controle."
        />
        <div className="p-8">
          <p className="text-slate-500">Carregando tarefas...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Minhas Tarefas"
        subtitle="Acompanhe o progresso e mantenha suas atividades sob controle."
      />

      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">
              Filtrar por status
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-blue-100 p-2">
                <ListTodo size={20} className="text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Tasks Pessoais
                </h2>
                <p className="text-sm text-slate-500">
                  {personalTasks.length} tarefa
                  {personalTasks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {personalTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-slate-500 font-medium">
                  Nenhuma task pessoal encontrada
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  As suas tarefas pessoais irão aparecer aqui
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {personalTasks.map((task) => {
                  const isUrgent =
                    task.status !== "done" && task.due_date === today;

                  const isOverdue =
                    task.status !== "done" &&
                    !!task.due_date &&
                    task.due_date < today;

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-800">
                          {task.title}
                        </h3>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              task.status,
                            )}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>

                          {isUrgent && (
                            <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                              Urgente
                            </span>
                          )}

                          {isOverdue && (
                            <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              Atrasada
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mb-4 text-sm leading-6 text-slate-600">
                        {task.description?.trim()
                          ? task.description
                          : "Sem descrição para esta tarefa."}
                      </p>

                      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={16} />
                        <span>{formatDate(task.due_date)}</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-500">
                          Alterar status
                        </label>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as Task["status"],
                            )
                          }
                          disabled={updatingTaskId === task.id}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {taskStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-violet-100 p-2">
                <Building2 size={20} className="text-violet-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Tasks de Organização
                </h2>
                <p className="text-sm text-slate-500">
                  {organizationTasks.length} tarefa
                  {organizationTasks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {organizationTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-slate-500 font-medium">
                  Nenhuma task de organização encontrada
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  As tarefas vinculadas às organizações irão aparecer aqui
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {organizationTasks.map((task) => {
                  const isUrgent =
                    task.status !== "done" && task.due_date === today;

                  const isOverdue =
                    task.status !== "done" &&
                    !!task.due_date &&
                    task.due_date < today;

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-800">
                          {task.title}
                        </h3>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              task.status,
                            )}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>

                          {isUrgent && (
                            <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                              Urgente
                            </span>
                          )}

                          {isOverdue && (
                            <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              Atrasada
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mb-4 text-sm leading-6 text-slate-600">
                        {task.description?.trim()
                          ? task.description
                          : "Sem descrição para esta tarefa."}
                      </p>

                      <div className="mb-4 space-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          <span>{formatDate(task.due_date)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Building2 size={16} />
                          <span>
                            {task.organization_name ||
                              "Organização não informada"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-slate-500">
                          Alterar status
                        </label>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as Task["status"],
                            )
                          }
                          disabled={updatingTaskId === task.id}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {taskStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
