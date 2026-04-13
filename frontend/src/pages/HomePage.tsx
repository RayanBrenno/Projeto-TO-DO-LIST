import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { getMyTasks, updateTaskStatus } from "../services/task";
import { getOrganizations } from "../services/organization";
import { type Organization } from "../types/organization";
import { type Task } from "../types/task";
import { Calendar, Building2 } from "lucide-react";

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const [tasks, organizations] = await Promise.all([
        getMyTasks(),
        getOrganizations(),
      ]);

      setTasks(tasks);
      setOrganizations(organizations);
    } catch (error) {
      console.error("Erro ao buscar dados da home:", error);
      setTasks([]);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: Task["status"]) {
    try {
      await updateTaskStatus(taskId, status);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const statusColors = {
    to_do: "bg-red-100 text-red-800 border-red-300",
    doing: "bg-yellow-100 text-yellow-800 border-yellow-300",
    done: "bg-green-100 text-green-800 border-green-300",
  };

  const statusLabels = {
    to_do: "A Fazer",
    doing: "Fazendo",
    done: "Concluído",
  };

  const nextStatus: Record<Task["status"], Task["status"]> = {
    to_do: "doing",
    doing: "done",
    done: "to_do",
  };

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === "doing",
    ).length;
    const completedTasks = tasks.filter(
      (task) => task.status === "done",
    ).length;

    return {
      totalTasks,
      inProgressTasks,
      completedTasks,
      totalOrganizations: organizations.length,
    };
  }, [tasks, organizations]);

  const urgentTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return task.due_date === today && task.status !== "done";
    });
  }, [tasks, today]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return task.due_date < today && task.status !== "done";
    });
  }, [tasks, today]);

  if (loading) {
    return (
      <>
        <Header
          title="Bem-vindo ao TaskHub"
          subtitle="Aqui você pode acompanhar seu resumo geral"
        />
        <div className="p-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Bem-vindo ao TaskHub"
        subtitle="Aqui você pode acompanhar seu resumo geral"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
              Total de Tarefas
            </p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {stats.totalTasks}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-wide">
              Em Progresso
            </p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              {stats.inProgressTasks}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">
              Concluídas
            </p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {stats.completedTasks}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
              Organizações
            </p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              {stats.totalOrganizations}
            </p>
          </div>
        </div>

        {urgentTasks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Tarefas Urgentes
            </h3>
            <div className="space-y-4">
              {urgentTasks.map((task) => {
                const dueDate = task.due_date
                  ? new Date(task.due_date).toLocaleDateString("pt-BR")
                  : null;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, nextStatus[task.status])
                          }
                          className={`px-3 py-1 rounded-full border font-medium text-sm transition-colors cursor-pointer hover:opacity-80 ${statusColors[task.status]}`}
                        >
                          {statusLabels[task.status]}
                        </button>

                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-sm font-medium">
                          Urgente
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{dueDate}</span>
                          </div>
                        )}

                        {task.organization_name && (
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <span>{task.organization_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Tarefas Atrasadas
            </h3>
            <div className="space-y-4">
              {overdueTasks.map((task) => {
                const dueDate = task.due_date
                  ? new Date(task.due_date).toLocaleDateString("pt-BR")
                  : null;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, nextStatus[task.status])
                          }
                          className={`px-3 py-1 rounded-full border font-medium text-sm transition-colors cursor-pointer hover:opacity-80 ${statusColors[task.status]}`}
                        >
                          {statusLabels[task.status]}
                        </button>

                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
                          Atrasado
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{dueDate}</span>
                          </div>
                        )}

                        {task.organization_name && (
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <span>{task.organization_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
