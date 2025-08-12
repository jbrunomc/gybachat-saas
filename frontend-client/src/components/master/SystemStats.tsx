import React from 'react';
import { 
  Users, 
  Building2, 
  MessageCircle, 
  TrendingUp, 
  Server, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const SystemStats: React.FC = () => {
  // Dados mockados para demonstração
  const monthlyData = [
    { month: 'Jan', empresas: 45, mensagens: 125000, receita: 85000 },
    { month: 'Fev', empresas: 52, mensagens: 145000, receita: 98000 },
    { month: 'Mar', empresas: 61, mensagens: 165000, receita: 112000 },
    { month: 'Abr', empresas: 68, mensagens: 185000, receita: 125000 },
    { month: 'Mai', empresas: 75, mensagens: 205000, receita: 138000 },
    { month: 'Jun', empresas: 82, mensagens: 225000, receita: 152000 },
  ];

  const planDistribution = [
    { name: 'Básico', value: 45, color: '#3B82F6' },
    { name: 'Profissional', value: 28, color: '#10B981' },
    { name: 'Enterprise', value: 9, color: '#8B5CF6' },
  ];

  const serverMetrics = [
    { name: 'CPU', usage: 65, status: 'normal' },
    { name: 'Memória', usage: 78, status: 'warning' },
    { name: 'Disco', usage: 45, status: 'normal' },
    { name: 'Rede', usage: 32, status: 'normal' },
  ];

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'Empresa "TechCorp" atingiu 90% do limite de mensagens', time: '5 min atrás' },
    { id: 2, type: 'error', message: 'Falha na conexão WhatsApp - Empresa "StartupXYZ"', time: '12 min atrás' },
    { id: 3, type: 'info', message: 'Nova empresa cadastrada: "InovaCorp"', time: '1 hora atrás' },
    { id: 4, type: 'success', message: 'Backup automático concluído com sucesso', time: '2 horas atrás' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getUsageColor = (usage: number, status: string) => {
    if (status === 'warning' || usage > 80) return 'bg-red-500';
    if (usage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">82</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +9.3% este mês
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mensagens/Mês</p>
              <p className="text-2xl font-bold text-gray-900">225K</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +21.5% este mês
              </p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">R$ 152K</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +10.1% este mês
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime Sistema</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Excelente
              </p>
            </div>
            <Server className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento Mensal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="empresas" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Empresas"
              />
              <Line 
                type="monotone" 
                dataKey="mensagens" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Mensagens (K)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Planos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Planos</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-sm text-gray-600">
                  {plan.name} ({plan.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas do Servidor e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas do Servidor */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas do Servidor</h3>
          <div className="space-y-4">
            {serverMetrics.map((metric) => (
              <div key={metric.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  <span className="text-sm text-gray-500">{metric.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(metric.usage, metric.status)}`}
                    style={{ width: `${metric.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Recentes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recentes</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Ver todos os alertas
            </button>
          </div>
        </div>
      </div>

      {/* Receita por Mês */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal (R$)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
            <Bar dataKey="receita" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SystemStats;