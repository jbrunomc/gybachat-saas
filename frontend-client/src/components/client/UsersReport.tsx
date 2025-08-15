import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Printer,
  RefreshCw,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  Star,
  Activity,
  MessageCircle,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'active' | 'inactive';
  department?: string;
  created_at: string;
  last_login?: string;
  avatar?: string;
  stats?: {
    conversationsToday: number;
    conversationsTotal: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    satisfaction: number;
    messagesCount: number;
  };
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  topPerformers: {
    byConversations: UserData[];
    byResponseTime: UserData[];
    bySatisfaction: UserData[];
  };
}

const UsersReport: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (user?.companyId) {
      loadUsers();
    }
  }, [user?.companyId]);

  const loadUsers = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de usuários para relatório desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Em produção, buscar do backend
      // const response = await api.getUsersReport(user.companyId, {
      //   dateFrom: dateRange.start,
      //   dateTo: dateRange.end
      // });
      
      // Dados mockados para demonstração
      const departments = ['Atendimento', 'Vendas', 'Suporte', 'Financeiro', 'Marketing'];
      
      const mockUsers: UserData[] = Array.from({ length: 20 }, (_, i) => {
        const role = i === 0 ? 'admin' : i < 3 ? 'supervisor' : 'agent';
        const status = Math.random() > 0.1 ? 'active' : 'inactive';
        const department = departments[Math.floor(Math.random() * departments.length)];
        const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
        const lastLogin = status === 'active' ? 
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : 
          new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
        
        // Estatísticas apenas para agentes ativos
        const stats = role === 'agent' && status === 'active' ? {
          conversationsToday: Math.floor(Math.random() * 20),
          conversationsTotal: Math.floor(100 + Math.random() * 900),
          avgResponseTime: Math.floor(30 + Math.random() * 120),
          avgResolutionTime: Math.floor(300 + Math.random() * 1800),
          satisfaction: 3 + Math.random() * 2,
          messagesCount: Math.floor(500 + Math.random() * 5000)
        } : undefined;
        
        return {
          id: `user-${i+1}`,
          name: `Usuário ${i+1}`,
          email: `usuario${i+1}@empresa.com`,
          role,
          status,
          department,
          created_at: createdAt,
          last_login: lastLogin,
          stats
        };
      });
      
      // Calcular estatísticas
      const statsData: UserStats = {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        inactive: mockUsers.filter(u => u.status === 'inactive').length,
        byRole: {},
        byDepartment: {},
        topPerformers: {
          byConversations: [],
          byResponseTime: [],
          bySatisfaction: []
        }
      };
      
      // Calcular distribuição por role
      mockUsers.forEach(u => {
        // Por role
        if (!statsData.byRole[u.role]) statsData.byRole[u.role] = 0;
        statsData.byRole[u.role]++;
        
        // Por departamento
        if (u.department) {
          if (!statsData.byDepartment[u.department]) statsData.byDepartment[u.department] = 0;
          statsData.byDepartment[u.department]++;
        }
      });
      
      // Top performers
      const agentsWithStats = mockUsers.filter(u => u.stats && u.role === 'agent' && u.status === 'active');
      
      statsData.topPerformers.byConversations = [...agentsWithStats]
        .sort((a, b) => (b.stats?.conversationsTotal || 0) - (a.stats?.conversationsTotal || 0))
        .slice(0, 5);
        
      statsData.topPerformers.byResponseTime = [...agentsWithStats]
        .sort((a, b) => (a.stats?.avgResponseTime || 999) - (b.stats?.avgResponseTime || 999))
        .slice(0, 5);
        
      statsData.topPerformers.bySatisfaction = [...agentsWithStats]
        .sort((a, b) => (b.stats?.satisfaction || 0) - (a.stats?.satisfaction || 0))
        .slice(0, 5);
      
      setUsers(mockUsers);
      setStats(statsData);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar o relatório de usuários');
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    loadUsers();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementar exportação para CSV/Excel
    alert('Exportação para CSV será implementada em breve');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Administrador
          </span>
        );
      case 'supervisor':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            Supervisor
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <User className="h-3 w-3 mr-1" />
            Agente
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </span>
        );
      default:
        return null;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = users
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (u.department?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || u.department === filterDepartment;
      
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'last_login':
          comparison = new Date(a.last_login || 0).getTime() - new Date(b.last_login || 0).getTime();
          break;
        case 'conversations':
          comparison = (a.stats?.conversationsTotal || 0) - (b.stats?.conversationsTotal || 0);
          break;
        case 'response_time':
          comparison = (a.stats?.avgResponseTime || 999) - (b.stats?.avgResponseTime || 999);
          break;
        case 'satisfaction':
          comparison = (a.stats?.satisfaction || 0) - (b.stats?.satisfaction || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Obter lista de departamentos únicos
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Usuários</h2>
            <p className="text-sm text-gray-600">Análise e estatísticas da equipe</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Atualizar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Imprimir"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            title="Exportar"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Período */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

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

          {/* Filtros */}
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>

          {departments.length > 0 && (
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes</p>
                <p className="text-2xl font-bold text-purple-600">{stats.byRole.agent || 0}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-orange-600">{(stats.byRole.admin || 0) + (stats.byRole.supervisor || 0)}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Usuários
            </h3>
            <div className="text-sm text-gray-500">
              {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'usuário' : 'usuários'} encontrados
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nome</span>
                      {sortBy === 'name' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {sortBy === 'email' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Cargo</span>
                      {sortBy === 'role' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Departamento</span>
                      {sortBy === 'department' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criado em</span>
                      {sortBy === 'created_at' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('last_login')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Último Login</span>
                      {sortBy === 'last_login' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('conversations')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Conversas</span>
                      {sortBy === 'conversations' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('response_time')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tempo Resposta</span>
                      {sortBy === 'response_time' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {userData.avatar ? (
                            <img src={userData.avatar} alt={userData.name} className="h-10 w-10 rounded-full" />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(userData.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userData.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {userData.last_login ? new Date(userData.last_login).toLocaleString() : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.stats?.conversationsTotal || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.stats ? formatDuration(userData.stats.avgResponseTime) : 'N/A'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterDepartment !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Não há usuários no período selecionado'
              }
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas Detalhadas */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Cargo */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Cargo</h3>
            <div className="space-y-4">
              {Object.entries(stats.byRole).map(([role, count]) => (
                <div key={role}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {role === 'admin' ? 'Administrador' :
                       role === 'supervisor' ? 'Supervisor' :
                       'Agente'}
                    </span>
                    <span className="text-sm text-gray-500">{count} ({Math.round((count / stats.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        role === 'admin' ? 'bg-purple-500' :
                        role === 'supervisor' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Departamento */}
          {Object.keys(stats.byDepartment).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Departamento</h3>
              <div className="space-y-4">
                {Object.entries(stats.byDepartment).map(([department, count]) => (
                  <div key={department}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{department}</span>
                      <span className="text-sm text-gray-500">{count} ({Math.round((count / stats.total) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Performers */}
      {stats && stats.topPerformers.byConversations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top por Conversas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
              Top por Conversas
            </h3>
            <div className="space-y-4">
              {stats.topPerformers.byConversations.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.stats?.conversationsTotal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top por Tempo de Resposta */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-500" />
              Top por Tempo de Resposta
            </h3>
            <div className="space-y-4">
              {stats.topPerformers.byResponseTime.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(user.stats?.avgResponseTime)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top por Satisfação */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Top por Satisfação
            </h3>
            <div className="space-y-4">
              {stats.topPerformers.bySatisfaction.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-1">{user.stats?.satisfaction.toFixed(1)}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersReport;