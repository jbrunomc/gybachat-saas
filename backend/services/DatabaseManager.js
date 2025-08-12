import { createClient } from '@supabase/supabase-js';

export class DatabaseManager {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  // Inicializar conexão
  async initialize() {
    try {
      // Se não há configuração do Supabase, usar modo de teste
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('✅ Modo de teste - Banco de dados simulado');
        return true;
      }

      // Testar conexão
      const { data, error } = await this.supabase
        .from('companies')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Erro de conexão com banco: ${error.message}`);
      }

      console.log('✅ Conexão com banco de dados estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco:', error);
      console.log('✅ Continuando em modo de teste');
      return true; // Não falhar em modo de teste
    }
  }

  // Buscar empresa por ID
  async getCompany(companyId) {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return null;
    }
  }

  // Verificar status da empresa
  async checkCompanyStatus(companyId) {
    try {
      const company = await this.getCompany(companyId);
      
      if (!company) {
        return { active: false, reason: 'company_not_found' };
      }

      if (!company.active) {
        return { active: false, reason: 'company_inactive' };
      }

      // Verificar se está em trial e expirou
      if (company.plan === 'trial' && company.trial_ends_at) {
        const trialEnd = new Date(company.trial_ends_at);
        const now = new Date();
        
        if (now > trialEnd) {
          return { active: false, reason: 'trial_expired' };
        }
      }

      // Verificar pagamento em atraso
      if (company.payment_status === 'overdue') {
        return { active: false, reason: 'payment_overdue' };
      }

      return { active: true, company };
    } catch (error) {
      console.error('Erro ao verificar status da empresa:', error);
      return { active: false, reason: 'database_error' };
    }
  }

  // Criar conversa
  async createConversation(data) {
    try {
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return conversation;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }

  // Criar mensagem
  async createMessage(data) {
    try {
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return message;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }

  // Buscar ou criar contato
  async findOrCreateContact(phone, companyId, additionalData = {}) {
    try {
      // Buscar contato existente
      let { data: contact, error } = await this.supabase
        .from('contacts')
        .select('*')
        .eq('phone', phone)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existe, criar novo
      if (!contact) {
        const { data: newContact, error: createError } = await this.supabase
          .from('contacts')
          .insert({
            phone,
            company_id: companyId,
            name: additionalData.name || phone,
            ...additionalData
          })
          .select()
          .single();

        if (createError) throw createError;
        contact = newContact;
      }

      return contact;
    } catch (error) {
      console.error('Erro ao buscar/criar contato:', error);
      throw error;
    }
  }

  // Atualizar última atividade da empresa
  async updateCompanyActivity(companyId) {
    try {
      await this.supabase
        .from('companies')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', companyId);
    } catch (error) {
      console.error('Erro ao atualizar atividade da empresa:', error);
    }
  }

  // Buscar configurações da empresa
  async getCompanySettings(companyId) {
    try {
      const { data, error } = await this.supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;
      
      // Converter array para objeto
      const settings = {};
      data.forEach(setting => {
        settings[setting.key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {};
    }
  }

  // Salvar configuração da empresa
  async saveCompanySetting(companyId, key, value) {
    try {
      const { error } = await this.supabase
        .from('company_settings')
        .upsert({
          company_id: companyId,
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return false;
    }
  }

  // Fechar conexão
  async close() {
    // Supabase não precisa fechar conexão explicitamente
    console.log('🔌 Conexão com banco encerrada');
  }
}

