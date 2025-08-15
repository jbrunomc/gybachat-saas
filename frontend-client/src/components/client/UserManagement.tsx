import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'active' | 'inactive';
  avatar?: string;
  department?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  stats?: {
    conversationsToday: number;
    avgResponseTime: number;
    satisfaction: number;
    totalConversations: number;
  };
}

const UserManagement: React.FC = () => {
  const { user, hasPermission } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissões
  if (!hasPermission('manage_users')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-500">
          Você não tem permissão para gerenciar usuários.
        </p>
      </div>
    );
  }

  // Carregar usuários ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadUsers();
    }
  }, [user?.companyId]);

  // Carregar usuários da API
  const loadUsers = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de usuários desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getUsers(user.companyId);
      
      if (response.success && response.data) {
        setUsers(response.data.map((userData: any) => ({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          avatar: userData.avatar_url,
          department: userData.metadata?.department,
          phone: userData.metadata?.phone,
          lastLogin: userData.last_login ? new Date(userData.last_login).toLocaleString('pt-BR') : 'Nunca',
          createdAt: userData.created_at,
          permissions: userData.permissions || [],
          stats: userData.stats || {
            conversationsToday: 0,
            avgResponseTime: 0,
            satisfaction: 0,
            totalConversations: 0
          }
        })));
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar os usuários. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800'
    };

    const labels = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      agent: 'Agente'
    };

    const icons = {
      admin: <Shield className="h-3 w-3 mr-1" />,
      supervisor: <Star className="h-3 w-3 mr-1" />,
      agent: <UserCheck className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {icons[role as keyof typeof icons]}
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo'
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      inactive: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPerformanceColor = (value: number, type: string) => {
    if (type === 'satisfaction') {
      if (value >= 4.5) return 'text-green-600';
      if (value >= 4.0) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'responseTime') {
      if (value <= 120) return 'text-green-600';
      if (value <= 180) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  // Filtrar usuários
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Usuários</h2>
            <p className="text-sm text-gray-600">Gerencie a equipe da sua empresa</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Cargos</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="agent">Agente</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agentes</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'agent' && u.status === 'active').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Hoje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {userItem.avatar ? (
                          <img
                            src={userItem.avatar}
                            alt={userItem.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(userItem.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userItem.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userItem.department || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{userItem.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userItem.role === 'agent' && userItem.status === 'active' && userItem.stats ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Target className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {userItem.stats.conversationsToday} conversas
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className={`text-xs ${getPerformanceColor(userItem.stats.avgResponseTime, 'responseTime')}`}>
                              {userItem.stats.avgResponseTime}s resp.
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-gray-400" />
                            <span className={`text-xs ${getPerformanceColor(userItem.stats.satisfaction, 'satisfaction')}`}>
                              {userItem.stats.satisfaction}/5
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {userItem.role === 'admin' ? 'Administração' : 'Sem dados'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{userItem.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 transition-colors" 
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {userItem.id !== user?.id && (
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors" 
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition-colors" 
                          title="Mais opções"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando usuários à sua equipe'
              }
            </p>
          </div>
        )}
      </div>

      {/* Performance da Equipe */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Performance da Equipe Hoje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {users
                .filter(u => u.role === 'agent' && u.status === 'active' && u.stats)
                .reduce((sum, u) => sum + (u.stats?.conversationsToday || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total de Conversas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {Math.round(
                users
                  .filter(u => u.role === 'agent' && u.status === 'active' && u.stats && u.stats.avgResponseTime > 0)
                  .reduce((sum, u, _, arr) => sum + (u.stats?.avgResponseTime || 0) / (arr.length || 1), 0)
              )}s
            </div>
            <div className="text-sm text-gray-600">Tempo Médio Resposta</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {(users
                .filter(u => u.role === 'agent' && u.status === 'active' && u.stats && u.stats.satisfaction > 0)
                .reduce((sum, u, _, arr) => sum + (u.stats?.satisfaction || 0) / (arr.length || 1), 0)
              ).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Satisfação Média</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;