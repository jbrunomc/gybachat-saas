import React, { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Users, 
  MessageCircle, 
  Bell, 
  DollarSign,
  Zap,
  Activity,
  Database,
  Globe,
  Server,
  Lock,
  FileText,
  Clock,
  Upload,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

const GlobalSettings: React.FC = () => {
  const { globalSettings, updateGlobalSettings } = useThemeStore();
  const [settings, setSettings] = useState(globalSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simular delay de salvamento
    setTimeout(() => {
      try {
        updateGlobalSettings(settings);
        setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setHasChanges(false);
        setIsSaving(false);
        
        // Limpar mensagem após 3 segundos
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } catch (error) {
        setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
        setIsSaving(false);
      }
    }, 800);
  };

  const handleReset = () => {
    setSettings(globalSettings);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: <Settings className="h-4 w-4" /> },
    { id: 'security', name: 'Segurança', icon: <Shield className="h-4 w-4" /> },
    { id: 'limits', name: 'Limites', icon: <Users className="h-4 w-4" /> },
    { id: 'integrations', name: 'Integrações', icon: <Globe className="h-4 w-4" /> },
    { id: 'notifications', name: 'Notificações', icon: <Bell className="h-4 w-4" /> },
    { id: 'billing', name: 'Faturamento', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'automation', name: 'Automação', icon: <Zap className="h-4 w-4" /> },
    { id: 'monitoring', name: 'Monitoramento', icon: <Activity className="h-4 w-4" /> },
    { id: 'backup', name: 'Backup', icon: <Database className="h-4 w-4" /> },
    { id: 'api', name: 'API', icon: <Server className="h-4 w-4" /> },
    { id: 'system', name: 'Sistema', icon: <Server className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configurações Globais</h2>
            <p className="text-sm text-gray-600">Gerencie as configurações globais da plataforma</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                <div className="flex items-center space-x-1">
                  <RotateCcw className="h-4 w-4" />
                  <span>Cancelar</span>
                </div>
              </button>
              
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                disabled={isSaving}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <div className="flex items-center space-x-1">
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-md ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {saveMessage.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : undefined,
                  color: activeTab === tab.id ? 'var(--color-primary)' : undefined
                }}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações Gerais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleChange('general', 'platformName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de Suporte
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone de Suporte
                  </label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuso Horário Padrão
                  </label>
                  <select
                    value={settings.defaultTimezone}
                    onChange={(e) => handleChange('general', 'defaultTimezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma Padrão
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => handleChange('general', 'defaultLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                    <option value="fr-FR">Français</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moeda Padrão
                  </label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => handleChange('general', 'defaultCurrency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                  Modo de Manutenção
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowNewRegistrations"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => handleChange('general', 'allowNewRegistrations', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowNewRegistrations" className="text-sm font-medium text-gray-700">
                  Permitir Novos Registros
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configurações de Segurança</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout de Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Tentativas de Login
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração do Bloqueio (minutos)
                  </label>
                  <input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Força da Senha
                  </label>
                  <select
                    value={settings.passwordStrength}
                    onChange={(e) => handleChange('security', 'passwordStrength', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="low">Baixa (mínimo 6 caracteres)</option>
                    <option value="medium">Média (mínimo 8 caracteres, letras e números)</option>
                    <option value="high">Alta (mínimo 10 caracteres, letras, números e símbolos)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="require2FA"
                    checked={settings.require2FA}
                    onChange={(e) => handleChange('security', 'require2FA', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="require2FA" className="text-sm font-medium text-gray-700">
                    Exigir Autenticação de Dois Fatores (2FA)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableAuditLogs"
                    checked={settings.enableAuditLogs}
                    onChange={(e) => handleChange('security', 'enableAuditLogs', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableAuditLogs" className="text-sm font-medium text-gray-700">
                    Habilitar Logs de Auditoria
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableEncryption"
                    checked={settings.enableEncryption}
                    onChange={(e) => handleChange('security', 'enableEncryption', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEncryption" className="text-sm font-medium text-gray-700">
                    Habilitar Criptografia de Dados Sensíveis
                  </label>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Alterações nas configurações de segurança podem afetar todos os usuários da plataforma.
                      Certifique-se de comunicar mudanças importantes aos administradores das empresas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Outros tabs seriam implementados de forma similar */}
          {activeTab !== 'general' && activeTab !== 'security' && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de {tabs.find(t => t.id === activeTab)?.name}</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Esta seção de configurações será implementada na próxima atualização.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;