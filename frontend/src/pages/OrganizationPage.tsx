import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { type Organization, type Task } from '../types';
import { Plus } from 'lucide-react';

interface OrganizationWithMembers extends Organization {
  membersCount?: number;
}

export function OrganizationPage() {
  const [organizations, setOrganizations] = useState<
    OrganizationWithMembers[]
  >([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrgTasks(selectedOrg.id);
    }
  }, [selectedOrg]);

  async function fetchOrganizations() {
    try {
      setLoading(true);

      const response = await api.get('/organizations');
      const data = response.data || [];

      setOrganizations(data);

      if (data.length > 0) {
        setSelectedOrg(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrgTasks(orgId: string) {
    try {
      const response = await api.get(`/organizations/${orgId}/tasks`);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas da organização:', error);
      setTasks([]);
    }
  }

  async function createOrganization() {
    if (!newOrgName.trim()) return;

    try {
      const response = await api.post('/organizations', {
        name: newOrgName,
        description: newOrgDescription,
      });

      const newOrg = response.data;

      setOrganizations((prev) => [newOrg, ...prev]);
      setSelectedOrg(newOrg);
      setNewOrgName('');
      setNewOrgDescription('');
      setShowNewOrgForm(false);
    } catch (error) {
      console.error('Erro ao criar organização:', error);
    }
  }

  const statusColors = {
    to_do: 'text-red-600 bg-red-50',
    doing: 'text-yellow-600 bg-yellow-50',
    done: 'text-green-600 bg-green-50',
  };

  const statusLabels = {
    to_do: 'A Fazer',
    doing: 'Fazendo',
    done: 'Concluído',
  };

  if (loading) {
    return (
      <>
        <Header title="Organização" />
        <div className="p-8">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Organização" />
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Organizações
              </h3>
              <button
                onClick={() => setShowNewOrgForm(!showNewOrgForm)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>

            {showNewOrgForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nome da organização"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={createOrganization}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowNewOrgForm(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="space-y-2">
              {organizations.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhuma organização criada
                </p>
              ) : (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedOrg?.id === org.id
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {org.description}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedOrg ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedOrg.name}
                  </h3>
                  {selectedOrg.description && (
                    <p className="text-gray-600 mt-2">{selectedOrg.description}</p>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Tarefas da Organização
                  </h4>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Nenhuma tarefa criada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">
                                {task.title}
                              </h5>
                              {task.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                statusColors[task.status]
                              }`}
                            >
                              {statusLabels[task.status]}
                            </span>
                          </div>

                          {task.due_date && (
                            <p className="text-xs text-gray-500 mt-3">
                              Prazo:{' '}
                              {new Date(task.due_date).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Crie ou selecione uma organização
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}