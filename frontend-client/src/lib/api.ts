import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { user } = useAuthStore.getState();
    
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        ...(user?.companyId && { 'X-Company-ID': user.companyId }),
        ...options.headers,
      },
      ...options,
    };

    try {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log(`🔄 API Request: ${endpoint}`, { 
          method: options.method || 'GET',
          hasToken: !!user?.token,
          hasCompanyId: !!user?.companyId
        });
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error [${endpoint}]:`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string, userType: 'master' | 'client') {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`🔑 Tentando login: ${email}, tipo: ${userType}`);
    }
    return this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyDomain: string;
  }) {
    return this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/auth/verify');
  }

  // WhatsApp endpoints
  async getWhatsAppStatus(companyId: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/whatsapp/status/${companyId}`);
  }

  async connectWhatsApp(companyId: string, options?: { connectionType?: string }) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/whatsapp/connect/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async disconnectWhatsApp(companyId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/whatsapp/disconnect/${companyId}`, {
      method: 'POST',
    });
  }

  async sendWhatsAppMessage(
    companyId: string,
    to: string,
    message: string,
    type: string = 'text'
  ) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/whatsapp/send/${companyId}`, {
      method: 'POST',
      body: JSON.stringify({ to, message, type }),
    });
  }

  async getWhatsAppQRCode(companyId: string) {
    return this.request<{
      success: boolean;
      data: { qrCode: string };
    }>(`/whatsapp/qr-code/${companyId}`);
  }
  
  async getWhatsAppSessions(companyId: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/whatsapp/sessions/${companyId}`);
  }
  
  async getWhatsAppStats(companyId: string, dateRange: any = {}) {
    const queryParams = new URLSearchParams(dateRange).toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/whatsapp/stats/${companyId}?${queryParams}`);
  }
  
  async getWhatsAppMonitoring(companyId: string, instanceName: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/whatsapp/monitoring/${companyId}/${instanceName}`);
  }

  async getWhatsAppConnectionTypes() {
    return this.request<{
      success: boolean;
      data: { id: string; name: string; description: string }[];
    }>('/whatsapp/connection-types');
  }
  
  // Social Media endpoints
  async getSocialMediaStatus(companyId: string, platform: 'instagram' | 'facebook') {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/social-media/${platform}/status/${companyId}`);
  }
  
  async connectSocialMedia(companyId: string, platform: 'instagram' | 'facebook', authData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/social-media/${platform}/connect/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(authData),
    });
  }
  
  async disconnectSocialMedia(companyId: string, platform: 'instagram' | 'facebook') {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/social-media/${platform}/disconnect/${companyId}`, {
      method: 'POST',
    });
  }
  
  async getSocialMediaSessions(companyId: string, platform: 'instagram' | 'facebook') {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/social-media/${platform}/sessions/${companyId}`);
  }
  
  async getSocialMediaStats(companyId: string, platform: 'instagram' | 'facebook', dateRange: any = {}) {
    const queryParams = new URLSearchParams(dateRange).toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/social-media/${platform}/stats/${companyId}?${queryParams}`);
  }

  // Conversations endpoints
  async getConversations(companyId: string, filters: any = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/conversations/${companyId}?${queryParams}`);
  }
  
  async getConversationsReport(companyId: string, filters: any = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request<{
      success: boolean;
      data: any;
      stats: any;
    }>(`/conversations/${companyId}/report?${queryParams}`);
  }

  async getConversation(companyId: string, conversationId: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/conversations/${companyId}/${conversationId}`);
  }

  async updateConversation(
    companyId: string,
    conversationId: string,
    updateData: any
  ) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/conversations/${companyId}/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getMessages(
    companyId: string,
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/conversations/${companyId}/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(
    companyId: string,
    conversationId: string,
    messageData: any
  ) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/conversations/${companyId}/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Users endpoints
  async getUsers(companyId: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/users/${companyId}`);
  }
  
  async getUsersReport(companyId: string, filters: any = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request<{
      success: boolean;
      data: any[];
      stats: any;
    }>(`/users/${companyId}/report?${queryParams}`);
  }

  async createUser(companyId: string, userData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/users/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(companyId: string, userId: string, userData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/users/${companyId}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(companyId: string, userId: string) {
    return this.request<{
      success: boolean;
    }>(`/users/${companyId}/${userId}`, {
      method: 'DELETE',
    });
  }

  // Tags endpoints
  async getTags(companyId: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/tags/${companyId}`);
  }

  async createTag(companyId: string, tagData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/tags/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  async updateTag(companyId: string, tagId: string, tagData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/tags/${companyId}/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
  }

  async deleteTag(companyId: string, tagId: string) {
    return this.request<{
      success: boolean;
    }>(`/tags/${companyId}/${tagId}`, {
      method: 'DELETE',
    });
  }

  // Campaigns endpoints
  async getCampaigns(companyId: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/campaigns/${companyId}`);
  }

  async createCampaign(companyId: string, campaignData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/campaigns/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(companyId: string, campaignId: string, campaignData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/campaigns/${companyId}/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(companyId: string, campaignId: string) {
    return this.request<{
      success: boolean;
    }>(`/campaigns/${companyId}/${campaignId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(companyId: string, dateRange: any = {}) {
    const queryParams = new URLSearchParams(dateRange).toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/analytics/${companyId}?${queryParams}`);
  }

  // Upload endpoints
  async uploadFile(companyId: string, file: File, type: string = 'message') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{
      success: boolean;
      data: { url: string; path: string };
    }>(`/uploads/${companyId}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type para FormData
    });
  }

  // Companies endpoints (apenas para master)
  async getCompanies() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/companies');
  }

  async createCompany(companyData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(companyId: string, companyData: any) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(companyId: string) {
    return this.request<{
      success: boolean;
    }>(`/companies/${companyId}`, {
      method: 'DELETE',
    });
  }
}

// Instância singleton da API
export const api = new ApiClient(API_BASE_URL);

export default api;