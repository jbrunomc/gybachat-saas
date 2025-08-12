import { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Bell, 
  Globe,
  Lock,
  Key,
  Server,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const [settings, setSettings] = useState({
    general: {
      site_name: 'GybaChat',
      site_description: 'Plataforma de comunicação empresarial',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      maintenance_mode: false,
      registration_enabled: true,
      email_verification_required: true
    },
    security: {
      session_timeout: 24,
      max_login_attempts: 5,
      password_min_length: 8,
      require_2fa: false,
      api_rate_limit: 1000,
      allowed_domains: '',
      ip_whitelist: ''
    },
    notifications: {
      email_notifications: true,
      slack_webhook: '',
      discord_webhook: '',
      telegram_bot_token: '',
      telegram_chat_id: '',
      notification_types: {
        new_user: true,
        payment_received: true,
        system_error: true,
        backup_completed: true
      }
    },
    backup: {
      auto_backup: true,
      backup_frequency: 'daily',
      backup_retention: 30,
      backup_location: 'local',
      s3_bucket: '',
      s3_region: '',
      s3_access_key: '',
      s3_secret_key: ''
    },
    api: {
      api_key: '',
      webhook_secret: '',
      cors_origins: '*',
      rate_limit_per_minute: 60
    },
    system: {
      debug_mode: false,
      log_level: 'info',
      max_log_size: 100,
      auto_cleanup: true,
      performance_monitoring: true
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings[section])
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleBackupNow = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Backup iniciado com sucesso!')
      } else {
        toast.error('Erro ao iniciar backup')
      }
    } catch (error) {
      console.error('Erro no backup:', error)
      toast.error('Erro ao iniciar backup')
    }
  }

  const generateApiKey = () => {
    const newKey = 'gbc_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        api_key: newKey
      }
    }))
    toast.success('Nova chave API gerada!')
  }

  const tabs = [
    { id: 'general', name: 'Geral', icon: SettingsIcon },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'api', name: 'API', icon: Key },
    { id: 'system', name: 'Sistema', icon: Server }
  ]

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
          <h1 className="text-2xl font-semibold text-gray-900">Configurações do Sistema</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie configurações gerais, segurança e sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Aba Geral */}
            {activeTab === 'general' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações Gerais</h3>
                  <button
                    onClick={() => handleSave('general')}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome do Site</label>
                      <input
                        type="text"
                        value={settings.general.site_name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, site_name: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuso Horário</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, timezone: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                        <option value="America/New_York">Nova York (UTC-5)</option>
                        <option value="Europe/London">Londres (UTC+0)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição do Site</label>
                    <textarea
                      value={settings.general.site_description}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, site_description: e.target.value }
                      }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="maintenance-mode"
                        type="checkbox"
                        checked={settings.general.maintenance_mode}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, maintenance_mode: e.target.checked }
                        }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
                        Modo de Manutenção
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="registration-enabled"
                        type="checkbox"
                        checked={settings.general.registration_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, registration_enabled: e.target.checked }
                        }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="registration-enabled" className="ml-2 block text-sm text-gray-900">
                        Permitir Novos Registros
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="email-verification"
                        type="checkbox"
                        checked={settings.general.email_verification_required}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, email_verification_required: e.target.checked }
                        }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="email-verification" className="ml-2 block text-sm text-gray-900">
                        Exigir Verificação de Email
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Segurança */}
            {activeTab === 'security' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações de Segurança</h3>
                  <button
                    onClick={() => handleSave('security')}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timeout de Sessão (horas)</label>
                      <input
                        type="number"
                        value={settings.security.session_timeout}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, session_timeout: parseInt(e.target.value) }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Máximo de Tentativas de Login</label>
                      <input
                        type="number"
                        value={settings.security.max_login_attempts}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, max_login_attempts: parseInt(e.target.value) }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tamanho Mínimo da Senha</label>
                      <input
                        type="number"
                        value={settings.security.password_min_length}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, password_min_length: parseInt(e.target.value) }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rate Limit API (req/min)</label>
                      <input
                        type="number"
                        value={settings.security.api_rate_limit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, api_rate_limit: parseInt(e.target.value) }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domínios Permitidos (separados por vírgula)</label>
                    <input
                      type="text"
                      value={settings.security.allowed_domains}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, allowed_domains: e.target.value }
                      }))}
                      placeholder="exemplo.com, outrodominio.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lista de IPs Permitidos (separados por vírgula)</label>
                    <input
                      type="text"
                      value={settings.security.ip_whitelist}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, ip_whitelist: e.target.value }
                      }))}
                      placeholder="192.168.1.1, 10.0.0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="require-2fa"
                      type="checkbox"
                      checked={settings.security.require_2fa}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, require_2fa: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="require-2fa" className="ml-2 block text-sm text-gray-900">
                      Exigir Autenticação de Dois Fatores (2FA)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Backup */}
            {activeTab === 'backup' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações de Backup</h3>
                  <div className="space-x-3">
                    <button
                      onClick={handleBackupNow}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Backup Agora
                    </button>
                    <button
                      onClick={() => handleSave('backup')}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frequência do Backup</label>
                      <select
                        value={settings.backup.backup_frequency}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backup: { ...prev.backup, backup_frequency: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="hourly">A cada hora</option>
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Retenção (dias)</label>
                      <input
                        type="number"
                        value={settings.backup.backup_retention}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backup: { ...prev.backup, backup_retention: parseInt(e.target.value) }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Local do Backup</label>
                    <select
                      value={settings.backup.backup_location}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        backup: { ...prev.backup, backup_location: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="local">Local</option>
                      <option value="s3">Amazon S3</option>
                      <option value="google">Google Cloud</option>
                    </select>
                  </div>

                  {settings.backup.backup_location === 's3' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">S3 Bucket</label>
                        <input
                          type="text"
                          value={settings.backup.s3_bucket}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, s3_bucket: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">S3 Region</label>
                        <input
                          type="text"
                          value={settings.backup.s3_region}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, s3_region: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="auto-backup"
                      type="checkbox"
                      checked={settings.backup.auto_backup}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        backup: { ...prev.backup, auto_backup: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-backup" className="ml-2 block text-sm text-gray-900">
                      Backup Automático
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Aba API */}
            {activeTab === 'api' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações de API</h3>
                  <button
                    onClick={() => handleSave('api')}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chave da API</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.api.api_key}
                        readOnly
                        className="flex-1 block w-full border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={generateApiKey}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:text-gray-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Use esta chave para autenticar requisições à API
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
                    <input
                      type="password"
                      value={settings.api.webhook_secret}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, webhook_secret: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CORS Origins</label>
                    <input
                      type="text"
                      value={settings.api.cors_origins}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, cors_origins: e.target.value }
                      }))}
                      placeholder="* ou https://exemplo.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Limit (req/min)</label>
                    <input
                      type="number"
                      value={settings.api.rate_limit_per_minute}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        api: { ...prev.api, rate_limit_per_minute: parseInt(e.target.value) }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

