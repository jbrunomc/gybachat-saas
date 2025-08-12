// Utilitário de API para Gybachat Landing Page
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.gybachat.com.br';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Método genérico para fazer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    // Adicionar token se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar company_id se disponível
    const companyId = localStorage.getItem('company_id');
    if (companyId) {
      config.headers['X-Company-ID'] = companyId;
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Tratamento de erros específicos
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      
      if (error.message.includes('401')) {
        // Token expirado
        localStorage.removeItem('token');
        localStorage.removeItem('company_id');
        window.location.href = '/login';
        return;
      }

      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivos
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type para FormData
    });
  }
}

// Instância singleton
const api = new ApiClient();

// Serviços específicos da Landing Page
export const landingService = {
  // Buscar configurações públicas da landing
  async getConfig() {
    try {
      return await api.get('/api/public/landing-config');
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      // Retornar configurações padrão em caso de erro
      return {
        plans: [
          {
            id: 'starter',
            name: 'Starter',
            price: 49.90,
            features: ['1 WhatsApp', '5 usuários', '1.000 mensagens/mês', 'Suporte por email'],
            popular: false
          },
          {
            id: 'professional',
            name: 'Professional',
            price: 99.90,
            features: ['3 WhatsApp', '15 usuários', '5.000 mensagens/mês', 'Suporte prioritário'],
            popular: true
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199.90,
            features: ['10 WhatsApp', 'Usuários ilimitados', '25.000 mensagens/mês', 'Suporte 24/7'],
            popular: false
          }
        ],
        features: [
          {
            title: 'Multi-WhatsApp',
            description: 'Conecte múltiplos números WhatsApp em uma única plataforma',
            icon: 'MessageSquare'
          },
          {
            title: 'Equipe Colaborativa',
            description: 'Gerencie sua equipe com diferentes níveis de permissão',
            icon: 'Users'
          },
          {
            title: 'Automação Inteligente',
            description: 'Respostas automáticas e distribuição inteligente de conversas',
            icon: 'Zap'
          }
        ],
        testimonials: [
          {
            name: 'Carlos Silva',
            company: 'TechSolutions',
            content: 'Aumentamos nossas vendas em 300% com o Gybachat!',
            rating: 5
          }
        ]
      };
    }
  },

  // Registrar nova empresa
  async register(data) {
    try {
      const response = await api.post('/api/auth/register', data);
      
      // Salvar token e dados no localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('company_id', response.company.id);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      toast.success('Conta criada com sucesso! Bem-vindo ao Gybachat!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  },

  // Processar pagamento
  async processPayment(paymentData) {
    try {
      return await api.post('/api/billing/process-payment', paymentData);
    } catch (error) {
      toast.error(error.message || 'Erro ao processar pagamento');
      throw error;
    }
  },

  // Verificar disponibilidade de subdomínio
  async checkSubdomain(subdomain) {
    try {
      return await api.get('/api/public/check-subdomain', { subdomain });
    } catch (error) {
      console.error('Erro ao verificar subdomínio:', error);
      return { available: false };
    }
  },

  // Enviar contato/lead
  async sendContact(contactData) {
    try {
      const response = await api.post('/api/public/contact', contactData);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      return response;
    } catch (error) {
      toast.error(error.message || 'Erro ao enviar mensagem');
      throw error;
    }
  },

  // Newsletter
  async subscribeNewsletter(email) {
    try {
      const response = await api.post('/api/public/newsletter', { email });
      toast.success('Inscrição realizada com sucesso!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Erro ao se inscrever');
      throw error;
    }
  }
};

// Serviços de autenticação
export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('company_id', response.company.id);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('company_id');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// Utilitários de validação
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  },

  password: (password) => {
    return password.length >= 8;
  },

  companyName: (name) => {
    return name.length >= 2 && name.length <= 100;
  },

  subdomain: (subdomain) => {
    const regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    return subdomain.length >= 3 && subdomain.length <= 20 && regex.test(subdomain);
  }
};

// Utilitários de formatação
export const formatters = {
  currency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },

  cpfCnpj: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  }
};

// Hook personalizado para API
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

export default api;

