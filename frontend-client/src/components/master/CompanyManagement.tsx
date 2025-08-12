import React from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Star,
  Zap
} from 'lucide-react';

const CompanyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('asc');

  // Dados mockados das empresas
  const companies = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      email: 'contato@techcorp.com',
      plan: 'Enterprise',
      status: 'active',
      users: 25,
      messagesThisMonth: 15420,
      messageLimit: 50000,
      createdAt: '2024-01-15',
      lastActivity: '2 min atrás',
      whatsappStatus: 'connected',
      domain: 'techcorp.gybachat.com'
    },
    {
      id: 2,
      name: 'StartupXYZ',
      email: 'admin@startupxyz.com',
      plan: 'Profissional',
      status: 'active',
      users: 8,
      messagesThisMonth: 3250,
      messageLimit: 10000,
      createdAt: '2024-02-20',
      lastActivity: '15 min atrás',
      whatsappStatus: 'disconnected',
      domain: 'startupxyz.gybachat.com'
    },
    {
      id: 3,
      name: 'InovaCorp',
      email: 'suporte@inovacorp.com',
      plan: 'Básico',
      status: 'trial',
      users: 3,
      messagesThisMonth: 890,
      messageLimit: 2000,
      createdAt: '2024-06-01',
      lastActivity: '1 hora atrás',
      whatsappStatus: 'connected',
      domain: 'inovacorp.gybachat.com'
    },
    {
      id: 4,
      name: 'MegaEmpresa Ltd',
      email: 'ti@megaempresa.com',
      plan: 'Enterprise',
      status: 'suspended',
      users: 45,
      messagesThisMonth: 0,
      messageLimit: 100000,
      createdAt: '2023-11-10',
      lastActivity: '3 dias atrás',
      whatsappStatus: 'disconnected',
      domain: 'megaempresa.gybachat.com'
    },
    {
      id: 5,
      name: 'SmallBiz Co',
      email: 'owner@smallbiz.com',
      plan: 'Básico',
      status: 'active',
      users: 2,
      messagesThisMonth: 1650,
      messageLimit: 2000,
      createdAt: '2024-03-12',
      lastActivity: '30 min atrás',
      whatsappStatus: 'warning',
      domain: 'smallbiz.gybachat.com'
    },
    {
      id: 6,
      name: 'Consultoria ABC',
      email: 'contato@consultoriaabc.com',
      plan: 'Profissional',
      status: 'active',
      users: 12,
      messagesThisMonth: 7890,
      messageLimit: 10000,
      createdAt: '2023-12-05',
      lastActivity: '5 min atrás',
      whatsappStatus: 'connected',
      domain: 'abc.gybachat.com'
    },
    {
      id: 7,
      name: 'Loja Virtual Express',
      email: 'atendimento@lojavirtual.com',
      plan: 'Básico',
      status: 'expired',
      users: 4,
      messagesThisMonth: 0,
      messageLimit: 2000,
      createdAt: '2023-10-18',
      lastActivity: '15 dias atrás',
      whatsappStatus: 'disconnected',
      domain: 'lojavirtual.gybachat.com'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Ativo',
      trial: 'Trial',
      suspended: 'Suspenso',
      expired: 'Expirado'
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      trial: <Star className="h-3 w-3 mr-1" />,
      suspended: <XCircle className="h-3 w-3 mr-1" />,
      expired: <AlertTriangle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      'Básico': 'bg-gray-100 text-gray-800',
      'Profissional': 'bg-blue-100 text-blue-800',
      'Enterprise': 'bg-purple-100 text-purple-800'
    };

    const icons = {
      'Básico': <Zap className="h-3 w-3 mr-1" />,
      'Profissional': <Star className="h-3 w-3 mr-1" />,
      'Enterprise': <Crown className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan as keyof typeof styles]}`}>
        {icons[plan as keyof typeof icons]}
        {plan}
      </span>
    );
  };

  const getWhatsAppStatus = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" title="Conectado" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" title="Desconectado" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" title="Atenção" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" title="Desconhecido" />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Ordenar e filtrar empresas
  const sortedAndFilteredCompanies = companies
    .filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'plan':
          comparison = a.plan.localeCompare(b.plan);
          break;
        case 'users':
          comparison = a.users - b.users;
          break;
        case 'messages':
          comparison = a.messagesThisMonth - b.messagesThisMonth;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestão de Contas</h2>
            <p className="text-sm text-gray-600">Gerencie todas as empresas clientes da plataforma</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', 
                  borderColor: 'var(--color-primary)', 
                  '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou domínio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspenso</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Empresa</span>
                    {sortBy === 'name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('plan')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Plano</span>
                    {sortBy === 'plan' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('users')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Usuários</span>
                    {sortBy === 'users' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('messages')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Mensagens</span>
                    {sortBy === 'messages' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domínio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Atividade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredCompanies.map((company) => {
                const usagePercentage = getUsagePercentage(company.messagesThisMonth, company.messageLimit);
                
                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(company.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{company.users}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {company.messagesThisMonth.toLocaleString()} / {company.messageLimit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getUsageColor(usagePercentage)}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">{usagePercentage}% utilizado</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getWhatsAppStatus(company.whatsappStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {company.domain}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{company.lastActivity}</span>
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
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition-colors" 
                          title="Mais opções"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedAndFilteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando sua primeira empresa'
              }
            </p>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
          <div className="text-sm text-gray-500">Total de Empresas</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {companies.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-500">Empresas Ativas</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {companies.filter(c => c.status === 'trial').length}
          </div>
          <div className="text-sm text-gray-500">Em Trial</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {companies.filter(c => c.status === 'suspended' || c.status === 'expired').length}
          </div>
          <div className="text-sm text-gray-500">Suspensas/Expiradas</div>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;