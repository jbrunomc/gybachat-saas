import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Activity,
  Target,
  Award,
  Zap,
  Timer,
  ThumbsUp,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  Smartphone,
  Globe,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Dados gerais da empresa
  const companyStats = {
    today: {
      totalConversations: 127,
      activeAgents: 8,
      avgResponseTime: '2m 34s',
      resolutionRate: 94.2,
      satisfaction: 4.6,
      messagesHandled: 1247,
      peakHour: '15:00',
      conversionRate: 12.5
    },
    thisWeek: {
      totalConversations: 892,
      avgResponseTime: '2m 45s',
      resolutionRate: 91.8,
      satisfaction: 4.5,
      messagesHandled: 8934,
      newCustomers: 156,
      revenue: 45600
    },
    thisMonth: {
      totalConversations: 3847,
      avgResponseTime: '3m 12s',
      resolutionRate: 89.5,
      satisfaction: 4.4,
      messagesHandled: 38472,
      newCustomers: 678,
      revenue: 198500
    }
  };

  // Performance dos agentes
  const agentsPerformance = [
    { name: 'Carlos Lima', conversations: 156, satisfaction: 4.8, responseTime: 95, efficiency: 96 },
    { name: 'Maria Santos', conversations: 142, satisfaction: 4.7, responseTime: 105, efficiency: 94 },
    { name: 'João Silva', conversations: 138, satisfaction: 4.6, responseTime: 120, efficiency: 92 },
    { name: 'Ana Costa', conversations: 134, satisfaction: 4.5, responseTime: 135, efficiency: 89 },
    { name: 'Pedro Oliveira', conversations: 128, satisfaction: 4.4, responseTime: 145, efficiency: 87 },
    { name: 'Lucia Ferreira', conversations: 125, satisfaction: 4.3, responseTime: 155, efficiency: 85 }
  ];

  // Dados de performance ao longo do tempo
  const performanceData = [
    { day: 'Seg', conversations: 118, satisfaction: 4.2, responseTime: 145, agents: 7 },
    { day: 'Ter', conversations: 125, satisfaction: 4.5, responseTime: 132, agents: 8 },
    { day: 'Qua', conversations: 142, satisfaction: 4.8, responseTime: 98, agents: 8 },
    { day: 'Qui', conversations: 138, satisfaction: 4.6, responseTime: 115, agents: 9 },
    { day: 'Sex', conversations: 151, satisfaction: 4.9, responseTime: 87, agents: 9 },
    { day: 'Sáb', conversations: 95, satisfaction: 4.3, responseTime: 156, agents: 6 },
    { day: 'Dom', conversations: 78, satisfaction: 4.7, responseTime: 134, agents: 5 }
  ];

  // Distribuição de canais
  const channelDistribution = [
    { name: 'WhatsApp', value: 65, color: '#25D366', conversations: 2498 },
    { name: 'Web Chat', value: 20, color: '#3B82F6', conversations: 769 },
    { name: 'Telegram', value: 10, color: '#0088CC', conversations: 385 },
    { name: 'Instagram', value: 5, color: '#E4405F', conversations: 192 }
  ];

  // Horários de pico
  const hourlyVolume = [
    { hour: '08h', volume: 45, agents: 3 },
    { hour: '09h', volume: 78, agents: 5 },
    { hour: '10h', volume: 95, agents: 6 },
    { hour: '11h', volume: 112, agents: 7 },
    { hour: '12h', volume: 85, agents: 5 },
    { hour: '13h', volume: 68, agents: 4 },
    { hour: '14h', volume: 125, agents: 8 },
    { hour: '15h', volume: 145, agents: 9 },
    { hour: '16h', volume: 138, agents: 8 },
    { hour: '17h', volume: 95, agents: 6 },
    { hour: '18h', volume: 72, agents: 4 }
  ];

  // Métricas de qualidade
  const qualityMetrics = [
    { metric: 'Tempo Primeira Resposta', current: '45s', target: '60s', status: 'good', trend: 'up' },
    { metric: 'Taxa de Resolução', current: '94.2%', target: '90%', status: 'excellent', trend: 'up' },
    { metric: 'Satisfação do Cliente', current: '4.6/5', target: '4.5/5', status: 'good', trend: 'stable' },
    { metric: 'Taxa de Abandono', current: '3.2%', target: '5%', status: 'excellent', trend: 'down' },
    { metric: 'Retrabalho', current: '8.5%', target: '10%', status: 'good', trend: 'down' },
    { metric: 'Escalação', current: '12%', target: '15%', status: 'good', trend: 'stable' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
      case 'stable': return <Minus className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Executivo */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
            <p className="text-purple-100 mt-1">
              Visão geral da operação - {user?.companyName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{companyStats.today.totalConversations}</div>
            <div className="text-purple-100 text-sm">conversas hoje</div>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agentes Online</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats.today.activeAgents}/12</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <UserCheck className="h-3 w-3 mr-1" />
                67% da equipe
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio Resposta</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats.today.avgResponseTime}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                8% melhor que ontem
              </p>
            </div>
            <Timer className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats.today.resolutionRate}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Meta: 90%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação Geral</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats.today.satisfaction}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 ${star <= Math.floor(companyStats.today.satisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <ThumbsUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Métricas de Qualidade */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Métricas de Qualidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qualityMetrics.map((metric) => (
            <div key={metric.metric} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{metric.current}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                  Meta: {metric.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance dos Agentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de Performance dos Agentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Agente</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Conversas</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Satisfação</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Tempo Resposta</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Eficiência</th>
              </tr>
            </thead>
            <tbody>
              {agentsPerformance.map((agent, index) => (
                <tr key={agent.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{agent.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-900">{agent.conversations}</td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-gray-900">{agent.satisfaction}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-900">{agent.responseTime}s</td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${agent.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{agent.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume por Horário */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume de Atendimento por Horário</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                name="Volume de Conversas"
              />
              <Area 
                type="monotone" 
                dataKey="agents" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
                name="Agentes Online"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Canal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Canal</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {channelDistribution.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="text-sm text-gray-600">{channel.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{channel.value}%</div>
                  <div className="text-xs text-gray-500">{channel.conversations}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Semanal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência de Performance Semanal</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="conversations" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Conversas"
            />
            <Line 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Satisfação"
            />
            <Line 
              type="monotone" 
              dataKey="agents" 
              stroke="#F59E0B" 
              strokeWidth={3}
              name="Agentes Online"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Hoje
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{companyStats.today.totalConversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mensagens</span>
              <span className="text-sm font-medium">{companyStats.today.messagesHandled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Horário Pico</span>
              <span className="text-sm font-medium">{companyStats.today.peakHour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversão</span>
              <span className="text-sm font-medium">{companyStats.today.conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Esta Semana</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{companyStats.thisWeek.totalConversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Novos Clientes</span>
              <span className="text-sm font-medium">{companyStats.thisWeek.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receita</span>
              <span className="text-sm font-medium">R$ {companyStats.thisWeek.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Satisfação</span>
              <span className="text-sm font-medium">{companyStats.thisWeek.satisfaction}/5</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Este Mês</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{companyStats.thisMonth.totalConversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Novos Clientes</span>
              <span className="text-sm font-medium">{companyStats.thisMonth.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receita</span>
              <span className="text-sm font-medium">R$ {companyStats.thisMonth.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Crescimento</span>
              <span className="text-sm font-medium text-green-600">+23.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-orange-900 mb-2">
              🚨 Alertas e Recomendações Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-800">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span>Pico de volume às 15h - considere escalar mais agentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span>3 agentes com tempo resposta acima da meta</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-orange-600" />
                <span>WhatsApp representa 65% do volume - otimizar templates</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span>Satisfação em alta - momento ideal para campanhas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;