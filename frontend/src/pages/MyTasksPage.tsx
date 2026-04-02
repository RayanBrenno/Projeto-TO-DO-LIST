import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { TaskCard } from '../components/TaskCard';
import { api } from '../services/api';
import { type Task } from '../types';
import { Filter } from 'lucide-react';

export function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'to_do' | 'doing' | 'done'
  >('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter]);

  async function fetchTasks() {
    try {
      setLoading(true);

      const response = await api.get('/tasks/me');
      setTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  function filterTasks() {
    if (statusFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === statusFilter));
    }
  }

  async function handleStatusChange(taskId: string, newStatus: Task['status']) {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'to_do', label: 'A Fazer' },
    { value: 'doing', label: 'Fazendo' },
    { value: 'done', label: 'Concluído' },
  ];

  if (loading) {
    return (
      <>
        <Header title="Minhas Tarefas" />
        <div className="p-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Minhas Tarefas" />
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-gray-400" />
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setStatusFilter(
                    option.value as 'all' | 'to_do' | 'doing' | 'done'
                  )
                }
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
            <p className="text-gray-400 text-sm mt-2">
              Crie uma nova tarefa para começar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}