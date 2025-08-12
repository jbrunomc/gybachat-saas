import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
}

export const themes: Record<string, Theme> = {
  blue: {
    name: 'blue',
    displayName: 'Azul Corporativo',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    }
  },
  green: {
    name: 'green',
    displayName: 'Verde Natureza',
    colors: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      }
    }
  },
  purple: {
    name: 'purple',
    displayName: 'Roxo Elegante',
    colors: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87'
      }
    }
  },
  orange: {
    name: 'orange',
    displayName: 'Laranja Vibrante',
    colors: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      }
    }
  },
  red: {
    name: 'red',
    displayName: 'Vermelho Dinâmico',
    colors: {
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      }
    }
  },
  teal: {
    name: 'teal',
    displayName: 'Azul Turquesa',
    colors: {
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a'
      }
    }
  }
};

interface GlobalSettings {
  // Configurações Gerais
  platformName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  defaultTimezone: string;
  defaultLanguage: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;

  // Configurações de Segurança
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordStrength: string;
  require2FA: boolean;
  enableAuditLogs: boolean;
  enableEncryption: boolean;

  // Limites e Quotas
  maxUsersPerCompany: number;
  maxChatsPerUser: number;
  basicPlanMessageLimit: number;
  proPlanMessageLimit: number;
  enterprisePlanMessageLimit: number;
  maxFileSize: number;
  dataRetentionDays: number;
  apiRateLimit: number;

  // Integrações
  enableWhatsApp: boolean;
  enableTelegram: boolean;
  enableInstagram: boolean;
  enableFacebook: boolean;
  enableWebChat: boolean;
  enableEmail: boolean;

  // Notificações
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  enableSlackIntegration: boolean;
  enableDiscordIntegration: boolean;

  // Faturamento
  enableBilling: boolean;
  defaultPaymentMethod: string;
  invoicePrefix: string;
  taxRate: number;
  trialPeriodDays: number;
  gracePeriodDays: number;

  // Automação
  enableChatbots: boolean;
  enableAutoResponders: boolean;
  enableWorkflowAutomation: boolean;
  enableScheduledMessages: boolean;

  // Monitoramento
  enableSystemMonitoring: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUptime: boolean;

  // Backup e Logs
  enableAutoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  logLevel: string;
  enableLogRotation: boolean;

  // API e Webhooks
  enablePublicAPI: boolean;
  enableWebhooks: boolean;
  webhookRetryAttempts: number;
  apiVersioning: boolean;

  // Sistema
  enableCDN: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableSSL: boolean;
}

interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  globalSettings: GlobalSettings;
  setTheme: (themeName: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  applyThemeGlobally: () => void;
}

const defaultGlobalSettings: GlobalSettings = {
  // Configurações Gerais
  platformName: 'Gybachat',
  companyName: 'Gybachat',
  supportEmail: 'suporte@gybachat.com',
  supportPhone: '+55 11 99999-9999',
  defaultTimezone: 'America/Sao_Paulo',
  defaultLanguage: 'pt-BR',
  defaultCurrency: 'BRL',
  maintenanceMode: false,
  allowNewRegistrations: true,

  // Configurações de Segurança
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  passwordStrength: 'medium',
  require2FA: false,
  enableAuditLogs: true,
  enableEncryption: true,

  // Limites e Quotas
  maxUsersPerCompany: 50,
  maxChatsPerUser: 100,
  basicPlanMessageLimit: 2000,
  proPlanMessageLimit: 10000,
  enterprisePlanMessageLimit: 100000,
  maxFileSize: 16,
  dataRetentionDays: 365,
  apiRateLimit: 100,

  // Integrações
  enableWhatsApp: true,
  enableTelegram: true,
  enableInstagram: false,
  enableFacebook: false,
  enableWebChat: true,
  enableEmail: true,

  // Notificações
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  enablePushNotifications: true,
  enableSlackIntegration: false,
  enableDiscordIntegration: false,

  // Faturamento
  enableBilling: true,
  defaultPaymentMethod: 'credit_card',
  invoicePrefix: 'GYB',
  taxRate: 0,
  trialPeriodDays: 14,
  gracePeriodDays: 7,

  // Automação
  enableChatbots: true,
  enableAutoResponders: true,
  enableWorkflowAutomation: true,
  enableScheduledMessages: true,

  // Monitoramento
  enableSystemMonitoring: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableUptime: true,

  // Backup e Logs
  enableAutoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30,
  logLevel: 'info',
  enableLogRotation: true,

  // API e Webhooks
  enablePublicAPI: true,
  enableWebhooks: true,
  webhookRetryAttempts: 3,
  apiVersioning: true,

  // Sistema
  enableCDN: true,
  enableCaching: true,
  cacheTimeout: 3600,
  enableCompression: true,
  enableSSL: true,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: themes.blue,
      availableThemes: Object.values(themes),
      globalSettings: defaultGlobalSettings,

      setTheme: (themeName: string) => {
        const theme = themes[themeName];
        if (theme) {
          set({ currentTheme: theme });
          // Aplicar tema globalmente
          get().applyThemeGlobally();
        }
      },

      updateGlobalSettings: (newSettings: Partial<GlobalSettings>) => {
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...newSettings }
        }));
      },

      applyThemeGlobally: () => {
        const { currentTheme } = get();
        const root = document.documentElement;
        
        // Remove existing theme classes
        Object.keys(themes).forEach(themeName => {
          root.classList.remove(`theme-${themeName}`);
        });
        
        // Add current theme class
        root.classList.add(`theme-${currentTheme.name}`);
        
        // Set CSS custom properties for global use
        Object.entries(currentTheme.colors.primary).forEach(([shade, color]) => {
          root.style.setProperty(`--primary-${shade}`, color);
        });

        // Set additional CSS variables for common use cases
        root.style.setProperty('--color-primary', currentTheme.colors.primary[600]);
        root.style.setProperty('--color-primary-hover', currentTheme.colors.primary[700]);
        root.style.setProperty('--color-primary-light', currentTheme.colors.primary[100]);
        root.style.setProperty('--color-primary-dark', currentTheme.colors.primary[800]);

        // Broadcast theme change to all components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
          detail: { theme: currentTheme } 
        }));
      }
    }),
    {
      name: 'gybachat-theme',
      onRehydrate: (state) => {
        // Apply theme immediately when store is rehydrated
        if (state) {
          setTimeout(() => state.applyThemeGlobally(), 0);
        }
      }
    }
  )
);