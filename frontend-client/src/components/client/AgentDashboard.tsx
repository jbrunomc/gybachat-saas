import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Award,
  Users,
  BarChart3,
  Calendar,
  Star,
  Zap,
  Timer,
  ThumbsUp,
  Activity,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Dados mockados para o agente específico
  const agentStats = {
    today: {
      conversations: 23,
      avgResponseTime: '1m 45s',
      resolutionRate: 92,
      satisfaction: 4.7,
      messagesHandled: 156,
      activeTime: '7h 23m'
    },
    thisWeek: {
      conversations: 127,
      avgResponseTime: '2m 12s',
      resolutionRate: 89,
      satisfaction: 4.6,
      messagesHandled: 892,
      activeTime: '38h 15m'
    },
    thisMonth: {
      conversations: 542,
      avgResponseTime: '2m 34s',
      resolutionRate: 91,
      satisfaction: 4.5,
      messagesHandled: 3847,
      activeTime: '162h 45m'
    }
  };

  // Dados de performance ao longo do tempo
  const performanceData = [
    { day: 'Seg', conversations: 18, satisfaction: 4.2, responseTime: 145 },
    { day: 'Ter', conversations: 25, satisfaction: 4.5, responseTime: 132 },
    { day: 'Qua', conversations: 22, satisfaction: 4.8, responseTime: 98 },
    { day: 'Qui', conversations: 28, satisfaction: 4.6, responseTime: 115 },
    { day: 'Sex', conversations: 31, satisfaction: 4.9, responseTime: 87 },
    { day: 'Sáb', conversations: 15, satisfaction: 4.3, responseTime: 156 },
    { day: 'Dom', conversations: 8, satisfaction: 4.7, responseTime: 134 }
  ];

  // Distribuição de tipos de atendimento
  const conversationTypes = [
    { name: 'Suporte Técnico', value: 45, color: '#3B82F6' },
    { name: 'Vendas', value: 30, color: '#10B981' },
    { name: 'Dúvidas Gerais', value: 15, color: '#F59E0B' },
    { name: 'Reclamações', value: 10, color: '#EF4444' }
  ];

  // Horários de maior atividade
  const hourlyActivity = [
    { hour: '08h', activity: 12 },
    { hour: '09h', activity: 28 },
    { hour: '10h', activity: 35 },
    { hour: '11h', activity: 42 },
    { hour: '12h', activity: 25 },
    { hour: '13h', activity: 18 },
    { hour: '14h', activity: 38 },
    { hour: '15h', activity: 45 },
    { hour: '16h', activity: 52 },
    { hour: '17h', activity: 38 },
    { hour: '18h', activity: 22 }
  ];

  // Metas e objetivos
  const goals = [
    { name: 'Conversas/Dia', current: 23, target: 25, percentage: 92 },
    { name: 'Tempo Resposta', current: 105, target: 120, percentage: 112 }, // Invertido - menor é melhor
    { name: 'Satisfação', current: 4.7, target: 4.5, percentage: 104 },
    { name: 'Taxa Resolução', current: 92, target: 90, percentage: 102 }
  ];

  const getGoalColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGoalBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Personalizado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 mt-1">
              Aqui está seu desempenho de hoje - Continue assim!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{agentStats.today.conversations}</div>
            <div className="text-blue-100 text-sm">conversas hoje</div>
          </div>
        </div>
      </div>

      {/* Métricas Principais do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio Resposta</p>
              <p className="text-2xl font-bold text-gray-900">{agentStats.today.avgResponseTime}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                15% melhor que ontem
              </p>
            </div>
            <Timer className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
              <p className="text-2xl font-bold text-gray-900">{agentStats.today.resolutionRate}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Acima da meta
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação Média</p>
              <p className="text-2xl font-bold text-gray-900">{agentStats.today.satisfaction}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-3 w-3 ${star <= Math.floor(agentStats.today.satisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <ThumbsUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Ativo</p>
              <p className="text-2xl font-bold text-gray-900">{agentStats.today.activeTime}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Activity className="h-3 w-3 mr-1" />
                Online agora
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Metas e Objetivos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Suas Metas Hoje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => (
            <div key={goal.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                <span className={`text-sm font-bold ${getGoalColor(goal.percentage)}`}>
                  {goal.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getGoalBgColor(goal.percentage)}`}
                  style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {goal.current} / {goal.target} {goal.name === 'Tempo Resposta' ? 'segundos' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Semanal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Conversas"
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Satisfação"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de Atendimento */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Atendimento</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversationTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {conversationTypes.map((type) => (
              <div key={type.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-600">
                  {type.name} ({type.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atividade por Horário */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sua Atividade por Horário</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="activity" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo Comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Hoje</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{agentStats.today.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mensagens</span>
              <span className="text-sm font-medium">{agentStats.today.messagesHandled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo Ativo</span>
              <span className="text-sm font-medium">{agentStats.today.activeTime}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Esta Semana</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{agentStats.thisWeek.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mensagens</span>
              <span className="text-sm font-medium">{agentStats.thisWeek.messagesHandled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo Ativo</span>
              <span className="text-sm font-medium">{agentStats.thisWeek.activeTime}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Este Mês</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversas</span>
              <span className="text-sm font-medium">{agentStats.thisMonth.conversations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mensagens</span>
              <span className="text-sm font-medium">{agentStats.thisMonth.messagesHandled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo Ativo</span>
              <span className="text-sm font-medium">{agentStats.thisMonth.activeTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dicas de Melhoria */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              💡 Dicas para Melhorar seu Desempenho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Mantenha respostas rápidas nos horários de pico</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Use templates para dúvidas frequentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Peça feedback ao finalizar atendimentos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Mantenha-se atualizado com produtos/serviços</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;