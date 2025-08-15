import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Play,
  Pause,
  Calendar,
  Users,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  FileText,
  Smartphone,
  Globe,
  Star,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'promotional' | 'welcome' | 'retargeting' | 'survey' | 'product_launch';
  channel: 'whatsapp' | 'email' | 'sms';
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  template: {
    subject: string;
    content: string;
  };
  targetAudience: {
    total: number;
    segments: string[];
  };
  stats: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
}

const CampaignManagement: React.FC = () => {
  const { user, hasPermission } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar permissões
  if (!hasPermission('manage_campaigns')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
        <p className="text-gray-500">
          Você não tem permissão para gerenciar campanhas.
        </p>
      </div>
    );
  }

  // Carregar campanhas ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadCampaigns();
    }
  }, [user?.companyId]);

  // Carregar campanhas da API
  const loadCampaigns = async () => {
    // Proteção para desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚫 Carregamento de campanhas desabilitado em desenvolvimento');
      setIsLoading(false);
      return;
    }

    if (!user?.companyId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getCampaigns(user.companyId);
      
      if (response.success && response.data) {
        setCampaigns(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err);
      setError('Não foi possível carregar as campanhas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      running: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      running: 'Em Execução',
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      scheduled: 'Agendada',
      cancelled: 'Cancelada',
      draft: 'Rascunho'
    };

    const icons = {
      running: <Play className="h-3 w-3 mr-1" />,
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      paused: <Pause className="h-3 w-3 mr-1" />,
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      scheduled: <Clock className="h-3 w-3 mr-1" />,
      cancelled: <XCircle className="h-3 w-3 mr-1" />,
      draft: <FileText className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      promotional: 'bg-orange-100 text-orange-800',
      welcome: 'bg-green-100 text-green-800',
      retargeting: 'bg-blue-100 text-blue-800',
      survey: 'bg-purple-100 text-purple-800',
      product_launch: 'bg-pink-100 text-pink-800'
    };

    const labels = {
      promotional: 'Promocional',
      welcome: 'Boas-vindas',
      retargeting: 'Retargeting',
      survey: 'Pesquisa',
      product_launch: 'Lançamento'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'email': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'sms': return <MessageCircle className="h-4 w-4 text-purple-600" />;
      default: return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateConversionRate = (converted: number, sent: number) => {
    if (sent === 0) return 0;
    return ((converted / sent) * 100).toFixed(1);
  };

  const calculateOpenRate = (read: number, delivered: number) => {
    if (delivered === 0) return 0;
    return ((read / delivered) * 100).toFixed(1);
  };

  const calculateClickRate = (clicked: number, read: number) => {
    if (read === 0) return 0;
    return ((clicked / read) * 100).toFixed(1);
  };

  // Filtrar campanhas
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Estatísticas gerais
  const totalStats = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.stats.sent,
    delivered: acc.delivered + campaign.stats.delivered,
    read: acc.read + campaign.stats.read,
    clicked: acc.clicked + campaign.stats.clicked,
    converted: acc.converted + campaign.stats.converted,
    revenue: acc.revenue + campaign.stats.revenue
  }), { sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0, revenue: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Send className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Campanhas</h2>
            <p className="text-sm text-gray-600">Crie e gerencie campanhas de marketing</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Campanha</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.sent.toLocaleString()}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregues</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.delivered.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateOpenRate(totalStats.delivered, totalStats.sent)}% taxa entrega
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lidas</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.read.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateOpenRate(totalStats.read, totalStats.delivered)}% taxa abertura
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cliques</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.clicked.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateClickRate(totalStats.clicked, totalStats.read)}% taxa clique
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversões</p>
              <p className="text-2xl font-bold text-red-600">{totalStats.converted.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateConversionRate(totalStats.converted, totalStats.sent)}% conversão
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {(totalStats.revenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">
                R$ {(totalStats.revenue / totalStats.converted || 0).toFixed(0)} por conversão
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="running">Em Execução</option>
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="completed">Concluída</option>
            <option value="scheduled">Agendada</option>
            <option value="draft">Rascunho</option>
          </select>

          {/* Filtro de Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="promotional">Promocional</option>
            <option value="welcome">Boas-vindas</option>
            <option value="retargeting">Retargeting</option>
            <option value="survey">Pesquisa</option>
            <option value="product_launch">Lançamento</option>
          </select>
        </div>
      </div>

      {/* Lista de Campanhas */}
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
                    Campanha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criada em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getChannelIcon(campaign.channel)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(campaign.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Send className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {campaign.stats.sent.toLocaleString()} enviadas
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {calculateOpenRate(campaign.stats.read, campaign.stats.delivered)}% abertura
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {calculateConversionRate(campaign.stats.converted, campaign.stats.sent)}% conversão
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {campaign.stats.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaign.stats.converted} conversões
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        por {campaign.createdBy}
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
                        {campaign.status === 'running' ? (
                          <button 
                            className="text-yellow-600 hover:text-yellow-900 transition-colors" 
                            title="Pausar"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : campaign.status === 'paused' ? (
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors" 
                            title="Retomar"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira campanha'
              }
            </p>
          </div>
        )}
      </div>

      {/* Campanhas em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Melhor Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Melhor Performance
          </h3>
          {campaigns
            .filter(c => c.stats.sent > 0)
            .sort((a, b) => 
              (b.stats.converted / b.stats.sent) - (a.stats.converted / a.stats.sent)
            )
            .slice(0, 3)
            .map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-xs text-gray-500">
                      {calculateConversionRate(campaign.stats.converted, campaign.stats.sent)}% conversão
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    R$ {campaign.stats.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {campaign.stats.converted} conversões
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Campanhas Recentes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Campanhas Recentes
          </h3>
          {campaigns
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {getChannelIcon(campaign.channel)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(campaign.status)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignManagement;