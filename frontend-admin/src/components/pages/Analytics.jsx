import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Building2,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      totalCompanies: 0,
      totalMessages: 0,
      totalRevenue: 0,
      growthRate: 0,
      churnRate: 0
    },
    charts: {
      userGrowth: [],
      revenueGrowth: [],
      messageVolume: [],
      companyGrowth: []
    },
    topMetrics: {
      topCompanies: [],
      topPlans: [],
      topFeatures: []
    },
    realTime: {
      activeUsers: 0,
      messagesLastHour: 0,
      newSignups: 0,
      systemLoad: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('users')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      } else {
        // Dados mockados para demonstração
        const mockData = {
          overview: {
            totalUsers: 1834,
            totalCompanies: 247,
            totalMessages: 156789,
            totalRevenue: 89250.00,
            growthRate: 12.5,
            churnRate: 2.3
          },
          charts: {
            userGrowth: [
              { date: '2024-12-01', value: 1200 },
              { date: '2024-12-08', value: 1350 },
              { date: '2024-12-15', value: 1500 },
              { date: '2024-12-22', value: 1680 },
              { date: '2024-12-29', value: 1834 }
            ],
            revenueGrowth: [
              { date: '2024-12-01', value: 65000 },
              { date: '2024-12-08', value: 72000 },
              { date: '2024-12-15', value: 78000 },
              { date: '2024-12-22', value: 84000 },
              { date: '2024-12-29', value: 89250 }
            ],
            messageVolume: [
              { date: '2024-12-01', value: 98000 },
              { date: '2024-12-08', value: 112000 },
              { date: '2024-12-15', value: 128000 },
              { date: '2024-12-22', value: 145000 },
              { date: '2024-12-29', value: 156789 }
            ],
            companyGrowth: [
              { date: '2024-12-01', value: 180 },
              { date: '2024-12-08', value: 195 },
              { date: '2024-12-15', value: 215 },
              { date: '2024-12-22', value: 232 },
              { date: '2024-12-29', value: 247 }
            ]
          },
          topMetrics: {
            topCompanies: [
              { name: 'TechSolutions Ltda', revenue: 1999.00, growth: 15.2 },
              { name: 'E-commerce Plus', revenue: 999.00, growth: 8.7 },
              { name: 'Digital Corp', revenue: 499.00, growth: -2.1 }
            ],
            topPlans: [
              { name: 'Professional', subscribers: 156, revenue: 155440.00 },
              { name: 'Enterprise', subscribers: 45, revenue: 89955.00 },
              { name: 'Starter', subscribers: 89, revenue: 4441.10 }
            ],
            topFeatures: [
              { name: 'WhatsApp Integration', usage: 89.5 },
              { name: 'Automations', usage: 76.3 },
              { name: 'Analytics', usage: 65.8 }
            ]
          },
          realTime: {
            activeUsers: 234,
            messagesLastHour: 1247,
            newSignups: 12,
            systemLoad: 67.8
          }
        }
        setAnalyticsData(mockData)
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      toast.error('Erro ao carregar dados de analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (value) => {
    return value >= 0 ? ArrowUpRight : ArrowDownRight
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/analytics/export?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Dados exportados com sucesso!')
      } else {
        toast.error('Erro ao exportar dados')
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Métricas detalhadas e insights do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={exportData}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas em Tempo Real</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.realTime.activeUsers}</p>
            <p className="text-sm text-gray-500">Usuários Online</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.realTime.messagesLastHour)}</p>
            <p className="text-sm text-gray-500">Mensagens/Hora</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.realTime.newSignups}</p>
            <p className="text-sm text-gray-500">Novos Cadastros</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.realTime.systemLoad}%</p>
            <p className="text-sm text-gray-500">Carga do Sistema</p>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview.totalUsers)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {(() => {
              const Icon = getGrowthIcon(analyticsData.overview.growthRate)
              return <Icon className={`w-4 h-4 mr-1 ${getGrowthColor(analyticsData.overview.growthRate)}`} />
            })()}
            <span className={getGrowthColor(analyticsData.overview.growthRate)}>
              {formatPercentage(analyticsData.overview.growthRate)}
            </span>
            <span className="text-gray-500 ml-1">vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview.totalCompanies)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500 ml-1">crescimento</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Mensagens</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.overview.totalMessages)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+22.1%</span>
            <span className="text-gray-500 ml-1">vs período anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{analyticsData.overview.growthRate}%</span>
            <span className="text-gray-500 ml-1">crescimento</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Principal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crescimento ao Longo do Tempo</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="users">Usuários</option>
              <option value="companies">Empresas</option>
              <option value="messages">Mensagens</option>
              <option value="revenue">Receita</option>
            </select>
          </div>
          
          {/* Simulação de gráfico */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de {selectedMetric}</p>
              <p className="text-sm text-gray-400">Dados do período: {dateRange}</p>
            </div>
          </div>
        </div>

        {/* Top Métricas */}
        <div className="space-y-6">
          {/* Top Empresas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Empresas por Receita</h3>
            <div className="space-y-3">
              {analyticsData.topMetrics.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{company.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(company.revenue)}</p>
                    <p className={`text-xs ${getGrowthColor(company.growth)}`}>
                      {formatPercentage(company.growth)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Planos */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Planos Mais Populares</h3>
            <div className="space-y-3">
              {analyticsData.topMetrics.topPlans.map((plan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-500">{plan.subscribers} assinantes</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(plan.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades Mais Usadas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades Mais Utilizadas</h3>
        <div className="space-y-4">
          {analyticsData.topMetrics.topFeatures.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{feature.name}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${feature.usage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{feature.usage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

