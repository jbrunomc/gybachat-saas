import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { prefetchLikelyRoutes } from './lib/preloadRoutes';
import { isOffline } from './lib/serviceWorker';
import { initializeSocket } from './lib/socket';

// Master Panel Components
import MasterLogin from './components/master/MasterLogin';
import MasterDashboard from './components/master/MasterDashboard';

// Client Panel Components
import ClientLogin from './components/client/ClientLogin';
import ClientDashboard from './components/client/ClientDashboard';

// Layout Components
import MasterLayout from './components/layouts/MasterLayout';
import ClientLayout from './components/layouts/ClientLayout';

// Lazy-loaded components
const WhatsAppConnection = React.lazy(() => import('./components/client/WhatsAppConnection'));
const WhatsAppMonitoring = React.lazy(() => import('./components/client/WhatsAppMonitoring'));
const ConversationsModule = React.lazy(() => import('./components/client/ConversationsModule'));
const TagsManagement = React.lazy(() => import('./components/client/TagsManagement'));
const UserManagement = React.lazy(() => import('./components/client/UserManagement'));
const CampaignManagement = React.lazy(() => import('./components/client/CampaignManagement'));
const QueueManagement = React.lazy(() => import('./components/client/QueueManagement'));

// Relatórios
const WhatsAppReport = React.lazy(() => import('./components/client/WhatsAppReport'));
const ConversationsReport = React.lazy(() => import('./components/client/ConversationsReport'));
const UsersReport = React.lazy(() => import('./components/client/UsersReport'));
const ContactsReport = React.lazy(() => import('./components/client/ContactsReport'));
const CampaignsReport = React.lazy(() => import('./components/client/CampaignsReport'));
const TagsReport = React.lazy(() => import('./components/client/TagsReport'));
const QueueReport = React.lazy(() => import('./components/client/QueueReport'));

// Fallback para componentes lazy-loaded
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
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
                  <Route path="/whatsapp" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <WhatsAppConnection companyId={user?.companyId || 'company-1'} />
                    </React.Suspense>
                  } />
                  <Route path="/whatsapp-monitoring" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <WhatsAppMonitoring />
                    </React.Suspense>
                  } />
                  <Route path="/conversations" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <ConversationsModule />
                    </React.Suspense>
                  } />
                  <Route path="/tags" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <TagsManagement />
                    </React.Suspense>
                  } />
                  <Route path="/users" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <UserManagement />
                    </React.Suspense>
                  } />
                  <Route path="/campaigns" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <CampaignManagement />
                    </React.Suspense>
                  } />
                  <Route path="/queue" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <QueueManagement />
                    </React.Suspense>
                  } />
                  
                  {/* Rotas de Relatórios */}
                  <Route path="/whatsapp-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <WhatsAppReport />
                    </React.Suspense>
                  } />
                  <Route path="/conversations-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <ConversationsReport />
                    </React.Suspense>
                  } />
                  <Route path="/users-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <UsersReport />
                    </React.Suspense>
                  } />
                  <Route path="/contacts-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <ContactsReport />
                    </React.Suspense>
                  } />
                  <Route path="/campaigns-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <CampaignsReport />
                    </React.Suspense>
                  } />
                  <Route path="/tags-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <TagsReport />
                    </React.Suspense>
                  } />
                  <Route path="/queue-report" element={
                    <React.Suspense fallback={<LazyLoadingFallback />}>
                      <QueueReport />
                    </React.Suspense>
                  } />
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