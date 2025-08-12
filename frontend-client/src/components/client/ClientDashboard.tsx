import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Users, 
  Phone, 
  BarChart3, 
  Settings, 
  UserPlus,
  Send,
  FileSpreadsheet,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Tag,
  Instagram,
  Facebook
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import WhatsAppConnection from './WhatsAppConnection';
import ConversationsModule from './ConversationsModule';
import TagsManagement from './TagsManagement';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CampaignManagement from './CampaignManagement';
import QueueManagement from './QueueManagement';
import WhatsAppReport from './WhatsAppReport';
import ConversationsReport from './ConversationsReport';
import UsersReport from './UsersReport';
import ContactsReport from './ContactsReport';
import CampaignsReport from './CampaignsReport';
import TagsReport from './TagsReport';
import QueueReport from './QueueReport';
import WhatsAppMonitoring from './WhatsAppMonitoring';
import SocialMediaIntegration from './SocialMediaIntegration';
import SocialMediaMonitoring from './SocialMediaMonitoring';
import api from '../../lib/api';

const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, hasPermission, isAdminOrSupervisor } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definir menu baseado nas permissões do usuário
  const getMenuItems = () => {
    const items = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
      { id: 'conversations', name: 'Conversas', icon: MessageCircle },
      { id: 'tags', name: 'Tags', icon: Tag },
    ];

    // Adicionar itens apenas se o usuário tiver permissão
    if (hasPermission('manage_users')) {
      items.push({ id: 'queue', name: 'Fila de Atendimento', icon: Users });
      items.push({ id: 'ura', name: 'URA', icon: Phone });
      items.push({ id: 'users', name: 'Usuários', icon: UserPlus });
      // WhatsApp só para admin/supervisor
      items.push({ id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle });
      // Adicionar Instagram e Facebook
      items.push({ id: 'social-media', name: 'Instagram/Facebook', icon: Instagram });
    }

    if (hasPermission('manage_contacts')) {
      items.push({ id: 'contacts', name: 'Contatos', icon: FileSpreadsheet });
    }

    if (hasPermission('manage_campaigns')) {
      items.push({ id: 'campaigns', name: 'Campanhas', icon: Send });
    }

    if (hasPermission('manage_automations')) {
      items.push({ id: 'automations', name: 'Automações', icon: Zap });
    }

    if (hasPermission('manage_settings')) {
      items.push({ id: 'settings', name: 'Configurações', icon: Settings });
    }

    // Adicionar relatórios
    if (hasPermission('view_analytics') || isAdminOrSupervisor()) {
      items.push({ id: 'reports', name: 'Relatórios', icon: BarChart3 });
    }

    return items;
  };

  // Definir submenu de relatórios
  const getReportItems = () => {
    const items = [
      { id: 'whatsapp-report', name: 'WhatsApp', icon: MessageCircle },
      { id: 'conversations-report', name: 'Conversas', icon: MessageCircle },
      { id: 'contacts-report', name: 'Contatos', icon: FileSpreadsheet },
      { id: 'users-report', name: 'Usuários', icon: Users },
      { id: 'campaigns-report', name: 'Campanhas', icon: Send },
      { id: 'tags-report', name: 'Tags', icon: Tag },
      { id: 'queue-report', name: 'Fila', icon: Users }
    ];

    return items;
  };

  const menuItems = getMenuItems();
  const reportItems = getReportItems();

  const renderDashboard = () => {
    // Renderizar dashboard específico baseado no role do usuário
    if (isAdminOrSupervisor()) {
      return <AdminDashboard />;
    } else {
      return <AgentDashboard />;
    }
  };

  const renderModulePlaceholder = (title: string, description: string, icon: React.ReactNode, features: string[], color: string) => (
    <div className="text-center py-12">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className={`${color} rounded-lg p-6 max-w-2xl mx-auto`}>
        <p className="text-sm font-semibold mb-4">
          🚧 <strong>Em desenvolvimento:</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-left">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
        
      case 'conversations':
        return <ConversationsModule />;

      case 'tags':
        return <TagsManagement />;
        
      case 'whatsapp':
        return <WhatsAppConnection companyId={user?.companyId || 'company-1'} />;
        
      case 'whatsapp-monitoring':
        return <WhatsAppMonitoring />;
        
      case 'social-media':
        return <SocialMediaIntegration />;
        
      case 'instagram':
        return <SocialMediaConnection companyId={user?.companyId || 'company-1'} platform="instagram" />;
        
      case 'facebook':
        return <SocialMediaConnection companyId={user?.companyId || 'company-1'} platform="facebook" />;
        
      case 'instagram-monitoring':
        return <SocialMediaMonitoring platform="instagram" />;
        
      case 'facebook-monitoring':
        return <SocialMediaMonitoring platform="facebook" />;

      case 'users':
        return <UserManagement />;

      case 'campaigns':
        return <CampaignManagement />;

      case 'queue':
        return <QueueManagement />;
      
      case 'ura':
        return renderModulePlaceholder(
          'URA Personalizável',
          'Configure respostas automáticas inteligentes',
          <Phone className="h-16 w-16 text-gray-400" />,
          [
            'Fluxos condicionais',
            'Integração com IA',
            'Respostas contextuais',
            'Analytics de fluxo',
            'Horário de funcionamento',
            'Múltiplos idiomas',
            'Testes A/B',
            'Templates prontos'
          ],
          'bg-purple-50'
        );

      case 'contacts':
        return renderModulePlaceholder(
          'Gerenciamento de Contatos',
          'Upload de planilhas e gerenciamento de listas',
          <FileSpreadsheet className="h-16 w-16 text-gray-400" />,
          [
            'Upload CSV/Excel',
            'Validação de números',
            'Segmentação avançada',
            'Tags personalizadas',
            'Histórico de interações',
            'Blacklist automática',
            'Sincronização CRM',
            'Backup automático'
          ],
          'bg-indigo-50'
        );

      case 'automations':
        return renderModulePlaceholder(
          'Automações Inteligentes',
          'Fluxos automatizados e chatbots avançados',
          <Zap className="h-16 w-16 text-gray-400" />,
          [
            'Triggers personalizados',
            'Integração com CRM',
            'IA conversacional',
            'Workflows visuais',
            'Condições complexas',
            'Machine Learning',
            'API integrations',
            'Analytics preditivos'
          ],
          'bg-orange-50'
        );

      case 'settings':
        return renderModulePlaceholder(
          'Configurações da Empresa',
          'Personalize sua experiência na plataforma',
          <Settings className="h-16 w-16 text-gray-400" />,
          [
            'Dados da empresa',
            'Configurações de notificação',
            'Integrações externas',
            'Backup e segurança',
            'Personalização visual',
            'Webhooks',
            'API keys',
            'Logs de auditoria'
          ],
          'bg-gray-50'
        );

      // Relatórios
      case 'whatsapp-report':
        return <WhatsAppReport />;

      case 'conversations-report':
        return <ConversationsReport />;

      case 'users-report':
        return <UsersReport />;

      case 'contacts-report':
        return <ContactsReport />;

      case 'campaigns-report':
        return <CampaignsReport />;

      case 'tags-report':
        return <TagsReport />;

      case 'queue-report':
        return <QueueReport />;

      default:
        return renderDashboard();
    }
  };

  // Verificar se o tab atual é um relatório
  const isReportTab = activeTab.includes('-report');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdminOrSupervisor() ? 'Painel Administrativo' : 'Painel do Agente'} - Gybachat
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdminOrSupervisor() 
            ? 'Gerencie sua operação, equipe e campanhas de mensagens'
            : 'Acompanhe seu desempenho e gerencie seus atendimentos'
          }
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Usuário: {user?.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Cargo: {user?.role === 'admin' ? 'Administrador' : user?.role === 'supervisor' ? 'Supervisor' : 'Agente'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Empresa: {user?.companyName}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Se clicar em Relatórios, abrir o primeiro relatório por padrão
                    if (item.id === 'reports' && reportItems.length > 0) {
                      setActiveTab(reportItems[0].id);
                    }
                  }}
                  className={`${
                    (activeTab === item.id || (item.id === 'reports' && isReportTab) || 
                     (item.id === 'social-media' && (activeTab === 'instagram' || activeTab === 'facebook' || 
                                                    activeTab === 'instagram-monitoring' || activeTab === 'facebook-monitoring')))
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Submenu de Relatórios */}
        {isReportTab && (
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-4 px-6 py-2 overflow-x-auto" aria-label="Report Tabs">
              {reportItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`${
                      activeTab === item.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
        
        {/* Submenu de Redes Sociais */}
        {(activeTab === 'social-media' || activeTab === 'instagram' || activeTab === 'facebook' || 
          activeTab === 'instagram-monitoring' || activeTab === 'facebook-monitoring') && (
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-4 px-6 py-2 overflow-x-auto" aria-label="Social Media Tabs">
              <button
                onClick={() => setActiveTab('social-media')}
                className={`${
                  activeTab === 'social-media'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
              >
                <Instagram className="h-4 w-4" />
                <span>Integração</span>
              </button>
              
              <button
                onClick={() => setActiveTab('instagram')}
                className={`${
                  activeTab === 'instagram'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </button>
              
              <button
                onClick={() => setActiveTab('instagram-monitoring')}
                className={`${
                  activeTab === 'instagram-monitoring'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Monitoramento Instagram</span>
              </button>
              
              <button
                onClick={() => setActiveTab('facebook')}
                className={`${
                  activeTab === 'facebook'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => setActiveTab('facebook-monitoring')}
                className={`${
                  activeTab === 'facebook-monitoring'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } rounded-md py-2 px-3 text-sm font-medium flex items-center space-x-2 transition-colors`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Monitoramento Facebook</span>
              </button>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className={activeTab === 'conversations' || activeTab === 'queue' || activeTab === 'tags' ? '' : 'p-6'}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;