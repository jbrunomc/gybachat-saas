import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  companyId?: string;
  companyName?: string;
  role: 'admin' | 'supervisor' | 'agent';
  permissions: string[];
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  token?: string; // Adicionar token JWT
}

interface AuthState {
  user: User | null;
  userType: 'master' | 'client' | null;
  isLoading: boolean;
  login: (email: string, password: string, type: 'master' | 'client') => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdminOrSupervisor: () => boolean;
}

// Definir permissões por role
const rolePermissions = {
  admin: [
    'manage_users',
    'manage_campaigns',
    'manage_settings',
    'view_all_conversations',
    'manage_integrations',
    'view_analytics',
    'manage_automations',
    'manage_contacts',
    'export_data',
    'manage_billing',
    'view_admin_dashboard'
  ],
  supervisor: [
    'manage_users',
    'manage_campaigns',
    'view_all_conversations',
    'view_analytics',
    'manage_automations',
    'manage_contacts',
    'export_data',
    'view_admin_dashboard'
  ],
  agent: [
    'view_assigned_conversations',
    'send_messages',
    'view_contacts',
    'basic_analytics',
    'view_agent_dashboard'
  ]
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userType: null,
      isLoading: false,

      login: async (email: string, password: string, type: 'master' | 'client') => {
        set({ isLoading: true });
        
        try {
          // Credenciais para login de demonstração
          if (type === 'master' && email === 'admin@gybachat.com' && password === 'admin123') {
            const userData: User = {
              id: 'master-1',
              name: 'Administrador Master',
              email: 'admin@gybachat.com',
              role: 'admin',
              permissions: ['all'],
              status: 'active',
              token: 'demo-master-token'
            };

            set({
              user: userData,
              userType: 'master',
              isLoading: false
            });
            
            return true;
          }
          
          // Credenciais para login de cliente de demonstração
          const demoUsers = {
            'admin@empresa.com': {
              id: 'user-1',
              name: 'João Silva - Admin',
              companyId: 'company-1',
              companyName: 'Empresa Demo',
              role: 'admin',
              permissions: ['manage_users', 'manage_campaigns', 'manage_settings', 'view_all_conversations'],
              status: 'active',
              token: 'demo-client-token'
            },
            'supervisor@empresa.com': {
              id: 'user-2',
              name: 'Maria Santos - Supervisora',
              companyId: 'company-1',
              companyName: 'Empresa Demo',
              role: 'supervisor',
              permissions: ['manage_users', 'view_all_conversations', 'view_analytics'],
              status: 'active',
              token: 'demo-supervisor-token'
            },
            'agente@empresa.com': {
              id: 'user-3',
              name: 'Carlos Lima - Agente',
              companyId: 'company-1',
              companyName: 'Empresa Demo',
              role: 'agent',
              permissions: ['view_assigned_conversations', 'send_messages'],
              status: 'active',
              token: 'demo-agent-token'
            }
          };
          
          if (type === 'client' && demoUsers[email] && password === 'demo123') {
            set({
              user: demoUsers[email] as User,
              userType: 'client',
              isLoading: false
            });
            
            return true;
          }
          
          // Tentar login real via API
          try {
            const response = await api.login(email, password, type);
            
            if (response.success && response.token && response.user) {
              // Salvar token no localStorage também (para compatibilidade)
              localStorage.setItem('token', response.token);
              
              // Mapear dados do backend para o formato do frontend
              const userData: User = {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
                avatar: response.user.avatar_url,
                companyId: response.user.company_id,
                companyName: response.user.companyName || 'Empresa',
                role: response.user.role,
                permissions: response.user.permissions || rolePermissions[response.user.role] || [],
                department: response.user.metadata?.department,
                phone: response.user.metadata?.phone,
                status: response.user.status || 'active',
                lastLogin: new Date().toISOString(),
                token: response.token
              };

              set({
                user: userData,
                userType: type,
                isLoading: false
              });
              
              return true;
            }
          } catch (apiError) {
            console.error('API login error:', apiError);
            // Continuar com o fluxo para retornar false
          }
          
          set({ isLoading: false });
          return false;
          
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        // Limpar token do localStorage
        localStorage.removeItem('token');
        
        // Desconectar socket se estiver conectado
        if (window.socket) {
          try {
            window.socket.disconnect();
          } catch (e) {
            console.error('Erro ao desconectar socket:', e);
          }
        }
        
        // Limpar estado de autenticação
        set({ user: null, userType: null });
        
        // Redirecionar para a página de login
        if (window.location.pathname.includes('/master')) {
          window.location.href = '/master/login';
        } else {
          window.location.href = '/client/login';
        }
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.permissions.includes('all')) return true;
        return user.permissions?.includes(permission) || false;
      },

      isAdminOrSupervisor: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'supervisor';
      }
    }),
    {
      name: 'gybachat-auth'
    }
  )
);