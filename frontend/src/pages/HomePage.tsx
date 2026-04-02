import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { TaskCard } from "../components/TaskCard";
import { api } from "../services/api";
import { type Task, type Organization } from "../types";

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

      const [tasksResponse, organizationsResponse] = await Promise.all([
        api.get("/tasks", {
          params: {
            limit: 6,
            order_by: "created_at",
            order: "desc",
          },
        }),
        api.get("/organizations", {
          params: {
            limit: 4,
            order_by: "created_at",
            order: "desc",
          },
        }),
      ]);

      setTasks(tasksResponse.data || []);
      setOrganizations(organizationsResponse.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados da home:", error);
      setTasks([]);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    return task.due_date === today;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter((task) => task.status === "doing").length;

  if (loading) {
    return (
      <>
        <Header
          title="Bem-vindo ao TaskHub"
          subtitle="Aqui você pode gerenciar todas as suas tarefas"
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
        subtitle="Aqui você pode gerenciar todas as suas tarefas"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
              Total de Tarefas
            </p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{totalTasks}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-wide">
              Em Progresso
            </p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              {inProgressTasks}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">
              Concluídas
            </p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {completedTasks}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
              Organizações
            </p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              {organizations.length}
            </p>
          </div>
        </div>

        {todayTasks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Tarefas de Hoje
            </h3>
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={fetchData}
                  onDelete={fetchData}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Tarefas Recentes
          </h3>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma tarefa criada ainda
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Clique em "Criar Tarefa" para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 6).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={fetchData}
                  onDelete={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}