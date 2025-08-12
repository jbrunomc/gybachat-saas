import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Send, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileSpreadsheet,
  Printer,
  Loader2,
  Users,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Eye,
  Target,
  AlertTriangle,
  Play,
  Pause
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

const CampaignsReport: React.FC = () => {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Carregar campanhas ao iniciar
  useEffect(() => {
    if (user?.companyId) {
      loadCampaigns();
    }
  }, [user?.companyId]);

  // Filtrar campanhas quando os filtros mudarem
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, filterStatus, filterType, sortBy, sortOrder]);

  // Carregar campanhas da API
  const loadCampaigns = async () => {
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

  // Filtrar e ordenar campanhas
  const filterCampaigns = () => {
    let filtered = [...campaigns];
    
    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filterStatus);
    }
    
    // Aplicar filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === filterType);
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCampaigns(filtered);
  };

  // Alternar ordem de classificação
  const toggleSort = (field: 'name' | 'createdAt' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatar hora
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Descrição', 'Status', 'Tipo', 'Canal', 'Criado em', 'Agendado para', 'Enviados', 'Entregues', 'Lidos', 'Cliques', 'Conversões', 'Receita'];
    const csvRows = [headers];
    
    filteredCampaigns.forEach(campaign => {
      csvRows.push([
        campaign.name,
        campaign.description,
        campaign.status,
        campaign.type,
        campaign.channel,
        formatDate(campaign.createdAt),
        campaign.scheduledAt ? formatDate(campaign.scheduledAt) : 'N/A',
        campaign.stats.sent.toString(),
        campaign.stats.delivered.toString(),
        campaign.stats.read.toString(),
        campaign.stats.clicked.toString(),
        campaign.stats.converted.toString(),
        `R$ ${campaign.stats.revenue.toLocaleString()}`
      ]);
    });
    
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campanhas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir relatório
  const printReport = () => {
    window.print();
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3 mr-1" />;
      case 'paused': return <Pause className="h-3 w-3 mr-1" />;
      case 'completed': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'scheduled': return <Calendar className="h-3 w-3 mr-1" />;
      case 'cancelled': return <XCircle className="h-3 w-3 mr-1" />;
      case 'draft': return <Eye className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  // Obter cor do tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotional': return 'bg-orange-100 text-orange-800';
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'retargeting': return 'bg-blue-100 text-blue-800';
      case 'survey': return 'bg-purple-100 text-purple-800';
      case 'product_launch': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular taxa de abertura
  const calculateOpenRate = (read: number, delivered: number) => {
    if (delivered === 0) return 0;
    return ((read / delivered) * 100).toFixed(1);
  };

  // Calcular taxa de clique
  const calculateClickRate = (clicked: number, read: number) => {
    if (read === 0) return 0;
    return ((clicked / read) * 100).toFixed(1);
  };

  // Calcular taxa de conversão
  const calculateConversionRate = (converted: number, clicked: number) => {
    if (clicked === 0) return 0;
    return ((converted / clicked) * 100).toFixed(1);
  };

  // Calcular totais
  const calculateTotals = () => {
    return filteredCampaigns.reduce((acc, campaign) => ({
      sent: acc.sent + campaign.stats.sent,
      delivered: acc.delivered + campaign.stats.delivered,
      read: acc.read + campaign.stats.read,
      clicked: acc.clicked + campaign.stats.clicked,
      converted: acc.converted + campaign.stats.converted,
      revenue: acc.revenue + campaign.stats.revenue
    }), { sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0, revenue: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Send className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatório de Campanhas</h2>
            <p className="text-sm text-gray-600">
              {filteredCampaigns.length} campanhas encontradas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          
          <button
            onClick={loadCampaigns}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Atualizar"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-32 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={exportToCSV}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </button>
                <button
                  onClick={printReport}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
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
              <p className="text-2xl font-bold text-gray-900">{totals.sent.toLocaleString()}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregues</p>
              <p className="text-2xl font-bold text-green-600">{totals.delivered.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {totals.sent > 0 ? ((totals.delivered / totals.sent) * 100).toFixed(1) : 0}% taxa entrega
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lidas</p>
              <p className="text-2xl font-bold text-purple-600">{totals.read.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateOpenRate(totals.read, totals.delivered)}% taxa abertura
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cliques</p>
              <p className="text-2xl font-bold text-orange-600">{totals.clicked.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateClickRate(totals.clicked, totals.read)}% taxa clique
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversões</p>
              <p className="text-2xl font-bold text-red-600">{totals.converted.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {calculateConversionRate(totals.converted, totals.clicked)}% conversão
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
                R$ {(totals.revenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">
                R$ {(totals.revenue / totals.converted || 0).toFixed(0)} por conversão
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
            <option value="paused">Pausada</option>
            <option value="completed">Concluída</option>
            <option value="scheduled">Agendada</option>
            <option value="draft">Rascunho</option>
            <option value="cancelled">Cancelada</option>
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

      {/* Tabela de Campanhas */}
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Campanha</span>
                      {sortBy === 'name' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortBy === 'status' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audiência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Criada em</span>
                      {sortBy === 'createdAt' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status === 'running' ? 'Em Execução' : 
                         campaign.status === 'paused' ? 'Pausada' : 
                         campaign.status === 'completed' ? 'Concluída' : 
                         campaign.status === 'scheduled' ? 'Agendada' : 
                         campaign.status === 'cancelled' ? 'Cancelada' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type === 'promotional' ? 'Promocional' : 
                         campaign.type === 'welcome' ? 'Boas-vindas' : 
                         campaign.type === 'retargeting' ? 'Retargeting' : 
                         campaign.type === 'survey' ? 'Pesquisa' : 'Lançamento'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{campaign.targetAudience.total}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaign.targetAudience.segments.join(', ')}
                      </div>
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
                            {calculateConversionRate(campaign.stats.converted, campaign.stats.clicked)}% conversão
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
                          {formatDate(campaign.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        por {campaign.createdBy}
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

      {/* Resumo por Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Campanhas por Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Em Execução</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.status === 'running').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Pausadas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.status === 'paused').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-600">Concluídas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-sm text-gray-600">Agendadas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-sm text-gray-600">Rascunhos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.status === 'draft').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Campanhas por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-sm text-gray-600">Promocional</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.type === 'promotional').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Boas-vindas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.type === 'welcome').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-600">Retargeting</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.type === 'retargeting').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-sm text-gray-600">Pesquisa</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.type === 'survey').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span className="text-sm text-gray-600">Lançamento</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {campaigns.filter(c => c.type === 'product_launch').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Métricas de Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Entrega</span>
              <span className="text-sm font-medium text-gray-900">
                {totals.sent > 0 ? ((totals.delivered / totals.sent) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Abertura</span>
              <span className="text-sm font-medium text-gray-900">
                {calculateOpenRate(totals.read, totals.delivered)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Clique</span>
              <span className="text-sm font-medium text-gray-900">
                {calculateClickRate(totals.clicked, totals.read)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxa de Conversão</span>
              <span className="text-sm font-medium text-gray-900">
                {calculateConversionRate(totals.converted, totals.clicked)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Receita por Envio</span>
              <span className="text-sm font-medium text-gray-900">
                R$ {totals.sent > 0 ? (totals.revenue / totals.sent).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsReport;