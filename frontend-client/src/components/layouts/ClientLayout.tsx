import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  LogOut, 
  User, 
  Bell, 
  HelpCircle, 
  MessageCircle,
  Settings,
  ChevronDown,
  Home,
  Phone,
  Users,
  Send,
  Tag,
  BarChart3,
  Instagram,
  Facebook,
  Target,
  FileText,
  Zap,
  Shield,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Pin,
  PinOff
} from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  path?: string;
  badge?: number;
  children?: MenuItem[];
  permission?: string;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, logout, hasPermission, isAdminOrSupervisor } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['whatsapp', 'social-media', 'reports']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTooltip, setShowTooltip] = useState<{id: string, name: string, x: number, y: number} | null>(null);

  // Carregar estado inicial do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-pinned');
    if (saved) {
      setSidebarPinned(JSON.parse(saved));
    }
  }, []);

  // Salvar estado do pin no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('sidebar-pinned', JSON.stringify(sidebarPinned));
  }, [sidebarPinned]);

  // Determinar se sidebar deve estar expandida
  const sidebarExpanded = sidebarPinned || sidebarHovered;

  const notifications = [
    { id: 1, message: 'Nova mensagem recebida', time: '2 min atrás', unread: true },
    { id: 2, message: 'Agente João entrou online', time: '5 min atrás', unread: true },
    { id: 3, message: 'Campanha finalizada com sucesso', time: '1 hora atrás', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Menu items baseado nas permissões
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      path: '/client/dashboard'
    },
    {
      id: 'conversations',
      name: 'Conversas',
      icon: MessageCircle,
      path: '/client/conversations',
      badge: 5 // Simulado - seria dinâmico
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: Phone,
      permission: 'manage_users',
      children: [
        { id: 'whatsapp-connection', name: 'Conexão', icon: Phone, path: '/client/whatsapp' },
        { id: 'whatsapp-monitoring', name: 'Monitoramento', icon: BarChart3, path: '/client/whatsapp-monitoring' }
      ]
    },
    {
      id: 'social-media',
      name: 'Redes Sociais',
      icon: Instagram,
      permission: 'manage_users',
      children: [
        { id: 'social-integration', name: 'Integração', icon: Settings, path: '/client/social-media' },
        { id: 'instagram', name: 'Instagram', icon: Instagram, path: '/client/instagram' },
        { id: 'facebook', name: 'Facebook', icon: Facebook, path: '/client/facebook' }
      ]
    },
    {
      id: 'team',
      name: 'Equipe',
      icon: Users,
      permission: 'manage_users',
      children: [
        { id: 'users', name: 'Usuários', icon: User, path: '/client/users' },
        { id: 'queue', name: 'Fila de Atendimento', icon: Users, path: '/client/queue' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Target,
      permission: 'manage_campaigns',
      children: [
        { id: 'campaigns', name: 'Campanhas', icon: Send, path: '/client/campaigns' },
        { id: 'contacts', name: 'Contatos', icon: FileText, path: '/client/contacts', permission: 'manage_contacts' }
      ]
    },
    {
      id: 'tags',
      name: 'Tags',
      icon: Tag,
      path: '/client/tags'
    },
    {
      id: 'automations',
      name: 'Automações',
      icon: Zap,
      path: '/client/automations',
      permission: 'manage_automations'
    },
    {
      id: 'reports',
      name: 'Relatórios',
      icon: BarChart3,
      permission: 'view_analytics',
      children: [
        { id: 'whatsapp-report', name: 'WhatsApp', icon: Phone, path: '/client/whatsapp-report' },
        { id: 'conversations-report', name: 'Conversas', icon: MessageCircle, path: '/client/conversations-report' },
        { id: 'users-report', name: 'Usuários', icon: Users, path: '/client/users-report' },
        { id: 'contacts-report', name: 'Contatos', icon: FileText, path: '/client/contacts-report' },
        { id: 'campaigns-report', name: 'Campanhas', icon: Send, path: '/client/campaigns-report' },
        { id: 'tags-report', name: 'Tags', icon: Tag, path: '/client/tags-report' },
        { id: 'queue-report', name: 'Fila', icon: Users, path: '/client/queue-report' }
      ]
    },
    {
      id: 'settings',
      name: 'Configurações',
      icon: Settings,
      path: '/client/settings',
      permission: 'manage_settings'
    }
  ];

  // Filtrar menu items baseado nas permissões
  const getFilteredMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      if (item.children) {
        item.children = getFilteredMenuItems(item.children);
      }
      return true;
    });
  };

  const filteredMenuItems = getFilteredMenuItems(menuItems);

  // Toggle expanded menu
  const toggleMenu = (menuId: string) => {
    if (!sidebarExpanded) return; // Só permite toggle quando expandida
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Handle tooltip
  const handleMouseEnter = (e: React.MouseEvent, item: MenuItem) => {
    if (!sidebarExpanded) {
      const rect = e.currentTarget.getBoundingClientRect();
      setShowTooltip({
        id: item.id,
        name: item.name,
        x: rect.right + 8,
        y: rect.top + rect.height / 2
      });
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(null);
  };

  // Handle sidebar mouse events
  const handleSidebarMouseEnter = () => {
    setSidebarHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    setSidebarHovered(false);
    setShowTooltip(null); // Limpar tooltip ao sair da sidebar
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const currentPath = window.location.pathname;
    const isActive = item.path === currentPath || 
                    (item.children && item.children.some(child => child.path === currentPath));

    return (
      <div key={item.id}>
        <div
          className={`group relative flex items-center justify-between mx-2 rounded-xl cursor-pointer transition-all duration-200 ${
            isActive 
              ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200'
          } ${level > 0 && sidebarExpanded ? 'ml-4' : ''} ${sidebarExpanded ? 'px-3 py-2.5' : 'p-2.5 mx-3 justify-center'}`}
          style={{
            backgroundColor: isActive ? currentTheme.colors.primary[50] : undefined,
            color: isActive ? currentTheme.colors.primary[700] : undefined,
          }}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else if (item.path) {
              window.location.href = item.path;
            }
          }}
          onMouseEnter={(e) => handleMouseEnter(e, item)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <item.icon className={`h-5 w-5 flex-shrink-0 ${sidebarExpanded ? '' : 'mx-auto'}`} />
            {sidebarExpanded && (
              <>
                <span className="font-medium truncate">{item.name}</span>
                {item.badge && (
                  <span 
                    className="ml-auto px-2 py-1 text-xs font-bold text-white rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary[500] }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
          {hasChildren && sidebarExpanded && (
            <ChevronRight 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isExpanded && sidebarExpanded && (
          <div className="mt-1 space-y-1 ml-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`${sidebarExpanded ? 'w-72' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm relative z-30`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        {/* Header da Sidebar */}
        <div className={`border-b border-gray-200 ${sidebarExpanded ? 'p-4' : 'p-3'}`}>
          <div className={`flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: currentTheme.colors.primary[600] }}
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              {sidebarExpanded && (
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">Gybachat</h1>
                  <p className="text-xs text-gray-500 truncate">{user?.companyName}</p>
                </div>
              )}
            </div>
            
            {sidebarExpanded && (
              <button
                onClick={() => setSidebarPinned(!sidebarPinned)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  sidebarPinned 
                    ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  color: sidebarPinned ? currentTheme.colors.primary[600] : undefined,
                  backgroundColor: sidebarPinned ? currentTheme.colors.primary[50] : undefined
                }}
                title={sidebarPinned ? 'Desafixar menu' : 'Fixar menu'}
              >
                {sidebarPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Busca Global */}
        {sidebarExpanded && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all duration-200"
                style={{
                  '--tw-ring-color': currentTheme.colors.primary[500]
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1">
            {filteredMenuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* User Info na Sidebar */}
        <div className={`border-t border-gray-200 ${sidebarExpanded ? 'p-4' : 'p-3 flex justify-center'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'supervisor' ? 'Supervisor' : 'Agente'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip para menu minimizado */}
      {showTooltip && !sidebarExpanded && (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: showTooltip.x,
            top: showTooltip.y,
            transform: 'translateY(-50%)'
          }}
        >
          {showTooltip.name}
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium">Dashboard</span>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Busca global... (Ctrl+K)"
                  className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all duration-200"
                  style={{
                    '--tw-ring-color': currentTheme.colors.primary[500]
                  } as React.CSSProperties}
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm"
                      style={{ backgroundColor: currentTheme.colors.primary[500] }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                        {unreadCount > 0 && (
                          <span 
                            className="px-2 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: currentTheme.colors.primary[500] }}
                          >
                            {unreadCount} novas
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                            notification.unread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <button 
                        className="text-sm font-medium hover:text-primary-700 transition-colors"
                        style={{ color: currentTheme.colors.primary[600] }}
                      >
                        Ver todas as notificações
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <button className="p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <User className="h-4 w-4" />
                        <span>Meu Perfil</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Configurações</span>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};

export default ClientLayout;