import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { type Organization } from '../types';
import { CheckCircle } from 'lucide-react';

export function CreateTaskPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert('Por favor, preencha o título');
      return;
    }

    try {
      setLoading(true);

      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        organization_id: organizationId,
        status: 'to_do',
        due_date: dueDate || null,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setDueDate('');
      setOrganizationId(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      <Header title="Criar Tarefa" subtitle="Adicione uma nova tarefa ao seu sistema" />
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Tarefa criada com sucesso!</p>
                <p className="text-green-700 text-sm">
                  Sua tarefa foi adicionada ao sistema
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateTask} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Título da Tarefa *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar autenticação"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da tarefa..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Data de Prazo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Organização
                </label>
                <select
                  value={organizationId || ''}
                  onChange={(e) => setOrganizationId(e.target.value || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={loading}
                >
                  <option value="">Pessoal</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setDueDate('');
                  setOrganizationId(null);
                }}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}