import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { prefetchLikelyRoutes } from './lib/preloadRoutes';
import { isOffline } from './lib/serviceWorker';
import { initializeSocket } from './lib/socket';
import UpdatePrompt from './components/ui/UpdatePrompt';

// Master Panel Components
import MasterLogin from './components/master/MasterLogin';
import MasterDashboard from './components/master/MasterDashboard';

// Client Panel Components
import ClientLogin from './components/client/ClientLogin';
import ClientDashboard from './components/client/ClientDashboard';
import WhatsAppConnection from './components/client/WhatsAppConnection';
import WhatsAppMonitoring from './components/client/WhatsAppMonitoring';
import ConversationsModule from './components/client/ConversationsModule';
import TagsManagement from './components/client/TagsManagement';
import UserManagement from './components/client/UserManagement';
import CampaignManagement from './components/client/CampaignManagement';
import QueueManagement from './components/client/QueueManagement';
import SocialMediaIntegration from './components/client/SocialMediaIntegration';
import SocialMediaConnection from './components/client/SocialMediaConnection';
import SocialMediaMonitoring from './components/client/SocialMediaMonitoring';

// Relatórios
import WhatsAppReport from './components/client/WhatsAppReport';
import ConversationsReport from './components/client/ConversationsReport';
import UsersReport from './components/client/UsersReport';
import ContactsReport from './components/client/ContactsReport';
import CampaignsReport from './components/client/CampaignsReport';
import TagsReport from './components/client/TagsReport';
import QueueReport from './components/client/QueueReport';

// Master Panel Components
import ThemeSelector from './components/master/ThemeSelector';
import GlobalSettings from './components/master/GlobalSettings';
import CompanyManagement from './components/master/CompanyManagement';

// Layout Components
import MasterLayout from './components/layouts/MasterLayout';
import ClientLayout from './components/layouts/ClientLayout';

// Placeholder para módulos em desenvolvimento
const ModulePlaceholder: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}> = ({ title, description, icon, features, color }) => (
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
            <div className="h-4 w-4 text-green-600">✓</div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const { user, userType } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState('');

  // Inicializar socket quando o usuário fizer login
  useEffect(() => {
    if (user && user.token) {
      initializeSocket();
    }
  }, [user]);

  // Aplicar tema ao documento root
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;
    
    // Remover classes de tema existentes
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    
    // Adicionar classe do tema atual
    root.classList.add(`theme-${theme.name}`);
    
    // Definir propriedades CSS personalizadas
    Object.entries(theme.colors.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--primary-${shade}`, color);
    });
    
    // Definir variáveis adicionais para uso comum
    root.style.setProperty('--color-primary', theme.colors.primary[600]);
    root.style.setProperty('--color-primary-hover', theme.colors.primary[700]);
    root.style.setProperty('--color-primary-light', theme.colors.primary[100]);
    root.style.setProperty('--color-primary-dark', theme.colors.primary[800]);
  }, [currentTheme]);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    // Verificar status inicial
    setOfflineMode(isOffline());
    
    // Adicionar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Prefetch de rotas prováveis
  useEffect(() => {
    if (currentRoute) {
      prefetchLikelyRoutes(currentRoute);
    }
  }, [currentRoute]);

  // Componente de alerta offline
  const OfflineAlert = () => (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Modo Offline</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {offlineMode && <OfflineAlert />}
        
        {/* Update Prompt */}
        <UpdatePrompt />
        
        <Routes>
          {/* Master Panel Routes */}
          <Route path="/master/login" element={
            user && userType === 'master' ? <Navigate to="/master" /> : <MasterLogin />
          } />
          
          <Route path="/master/*" element={
            user && userType === 'master' ? (
              <MasterLayout>
                <Routes>
                  <Route path="/" element={<MasterDashboard />} />
                  <Route path="/dashboard" element={<MasterDashboard />} />
                  <Route path="/companies" element={<CompanyManagement />} />
                  <Route path="/themes" element={<ThemeSelector />} />
                  <Route path="/settings" element={<GlobalSettings />} />
                </Routes>
              </MasterLayout>
            ) : (
              <Navigate to="/master/login" />
            )
          } />

          {/* Client Panel Routes */}
          <Route path="/client/login" element={
            user && userType === 'client' ? <Navigate to="/client" /> : <ClientLogin />
          } />
          
          <Route path="/client/*" element={
            user && userType === 'client' ? (
              <ClientLayout>
                <Routes>
                  <Route path="/" element={<ClientDashboard />} />
                  <Route path="/dashboard" element={<ClientDashboard />} />
                  <Route path="/whatsapp" element={<WhatsAppConnection companyId={user?.companyId || 'company-1'} />} />
                  <Route path="/whatsapp-monitoring" element={<WhatsAppMonitoring />} />
                  <Route path="/conversations" element={<ConversationsModule />} />
                  <Route path="/tags" element={<TagsManagement />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/campaigns" element={<CampaignManagement />} />
                  <Route path="/queue" element={<QueueManagement />} />
                  <Route path="/social-media" element={<SocialMediaIntegration />} />
                  <Route path="/instagram" element={<SocialMediaConnection companyId={user?.companyId || 'company-1'} platform="instagram" />} />
                  <Route path="/facebook" element={<SocialMediaConnection companyId={user?.companyId || 'company-1'} platform="facebook" />} />
                  <Route path="/instagram-monitoring" element={<SocialMediaMonitoring platform="instagram" />} />
                  <Route path="/facebook-monitoring" element={<SocialMediaMonitoring platform="facebook" />} />
                  
                  {/* Módulos em desenvolvimento */}
                  <Route path="/contacts" element={
                    <ModulePlaceholder
                      title="Gerenciamento de Contatos"
                      description="Upload de planilhas e gerenciamento de listas"
                      icon={<div className="h-16 w-16 text-gray-400 mx-auto">📊</div>}
                      features={[
                        'Upload CSV/Excel',
                        'Validação de números',
                        'Segmentação avançada',
                        'Tags personalizadas',
                        'Histórico de interações',
                        'Blacklist automática',
                        'Sincronização CRM',
                        'Backup automático'
                      ]}
                      color="bg-indigo-50"
                    />
                  } />
                  <Route path="/automations" element={
                    <ModulePlaceholder
                      title="Automações Inteligentes"
                      description="Fluxos automatizados e chatbots avançados"
                      icon={<div className="h-16 w-16 text-gray-400 mx-auto">⚡</div>}
                      features={[
                        'Triggers personalizados',
                        'Integração com CRM',
                        'IA conversacional',
                        'Workflows visuais',
                        'Condições complexas',
                        'Machine Learning',
                        'API integrations',
                        'Analytics preditivos'
                      ]}
                      color="bg-orange-50"
                    />
                  } />
                  <Route path="/settings" element={
                    <ModulePlaceholder
                      title="Configurações da Empresa"
                      description="Personalize sua experiência na plataforma"
                      icon={<div className="h-16 w-16 text-gray-400 mx-auto">⚙️</div>}
                      features={[
                        'Dados da empresa',
                        'Configurações de notificação',
                        'Integrações externas',
                        'Backup e segurança',
                        'Personalização visual',
                        'Webhooks',
                        'API keys',
                        'Logs de auditoria'
                      ]}
                      color="bg-gray-50"
                    />
                  } />
                  
                  {/* Rotas de Relatórios */}
                  <Route path="/whatsapp-report" element={<WhatsAppReport />} />
                  <Route path="/conversations-report" element={<ConversationsReport />} />
                  <Route path="/users-report" element={<UsersReport />} />
                  <Route path="/contacts-report" element={<ContactsReport />} />
                  <Route path="/campaigns-report" element={<CampaignsReport />} />
                  <Route path="/tags-report" element={<TagsReport />} />
                  <Route path="/queue-report" element={<QueueReport />} />
                </Routes>
              </ClientLayout>
            ) : (
              <Navigate to="/client/login" />
            )
          } />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/client/login" />} />
          <Route path="*" element={<Navigate to="/client/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;