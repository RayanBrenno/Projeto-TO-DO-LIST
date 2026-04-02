import { type Task } from '../types';
import { Calendar, User, Building2, Trash2} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  authorName?: string;
  organizationName?: string;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  authorName,
  organizationName,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const statusColors = {
    to_do: 'bg-red-100 text-red-800 border-red-300',
    doing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    done: 'bg-green-100 text-green-800 border-green-300',
  };

  const statusLabels = {
    to_do: 'A Fazer',
    doing: 'Fazendo',
    done: 'Concluído',
  };

  const nextStatus: Record<Task['status'], Task['status']> = {
    to_do: 'doing',
    doing: 'done',
    done: 'to_do',
  };

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('pt-BR')
    : null;

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-2"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            className={`px-3 py-1 rounded-full border font-medium text-sm transition-colors cursor-pointer hover:opacity-80 ${statusColors[task.status]}`}
          >
            {statusLabels[task.status]}
          </button>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
              Atrasado
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {dueDate && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{dueDate}</span>
            </div>
          )}
          {organizationName && (
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              <span>{organizationName}</span>
            </div>
          )}
          {authorName && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>{authorName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
