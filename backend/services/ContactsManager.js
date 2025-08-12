import { createClient } from '@supabase/supabase-js';

export class ContactsManager {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  // Inicializar serviço
  async initialize() {
    console.log('✅ ContactsManager inicializado');
  }

  // Buscar ou criar contato
  async findOrCreateContact(phone, companyId, additionalData = {}) {
    try {
      // Normalizar telefone
      const normalizedPhone = this.normalizePhone(phone);

      // Buscar contato existente
      let { data: contact, error } = await this.supabase
        .from('contacts')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existe, criar novo
      if (!contact) {
        const contactData = {
          phone: normalizedPhone,
          company_id: companyId,
          name: additionalData.name || normalizedPhone,
          email: additionalData.email || null,
          avatar: additionalData.avatar || null,
          notes: additionalData.notes || null,
          tags: additionalData.tags || [],
          metadata: additionalData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newContact, error: createError } = await this.supabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single();

        if (createError) throw createError;
        contact = newContact;
      } else if (Object.keys(additionalData).length > 0) {
        // Atualizar dados se fornecidos
        await this.updateContact(contact.id, companyId, additionalData);
        contact = { ...contact, ...additionalData };
      }

      return contact;
    } catch (error) {
      console.error('Erro ao buscar/criar contato:', error);
      throw error;
    }
  }

  // Atualizar contato
  async updateContact(contactId, companyId, updateData) {
    try {
      const { error } = await this.supabase
        .from('contacts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }
  }

  // Buscar contatos da empresa
  async getCompanyContacts(companyId, filters = {}) {
    try {
      let query = this.supabase
        .from('contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: contacts, error } = await query;

      if (error) throw error;
      return contacts;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }
  }

  // Normalizar número de telefone
  normalizePhone(phone) {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 55 (Brasil), manter
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned;
    }
    
    // Se não tem código do país, adicionar 55 (Brasil)
    if (cleaned.length >= 10) {
      return '55' + cleaned;
    }
    
    return cleaned;
  }

  // Adicionar tag ao contato
  async addTagToContact(contactId, companyId, tag) {
    try {
      const { data: contact, error: fetchError } = await this.supabase
        .from('contacts')
        .select('tags')
        .eq('id', contactId)
        .eq('company_id', companyId)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = contact.tags || [];
      if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag];
        
        const { error } = await this.supabase
          .from('contacts')
          .update({ 
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', contactId)
          .eq('company_id', companyId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
      throw error;
    }
  }

  // Remover tag do contato
  async removeTagFromContact(contactId, companyId, tag) {
    try {
      const { data: contact, error: fetchError } = await this.supabase
        .from('contacts')
        .select('tags')
        .eq('id', contactId)
        .eq('company_id', companyId)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = contact.tags || [];
      const newTags = currentTags.filter(t => t !== tag);
      
      const { error } = await this.supabase
        .from('contacts')
        .update({ 
          tags: newTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover tag:', error);
      throw error;
    }
  }

  // Estatísticas de contatos
  async getContactStats(companyId) {
    try {
      // Total de contatos
      const { count: totalContacts } = await this.supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      // Contatos com conversas ativas
      const { count: activeContacts } = await this.supabase
        .from('contacts')
        .select(`
          id,
          conversations!inner(id)
        `, { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('conversations.status', 'open');

      // Tags mais usadas
      const { data: contactsWithTags } = await this.supabase
        .from('contacts')
        .select('tags')
        .eq('company_id', companyId)
        .not('tags', 'is', null);

      const tagCounts = {};
      contactsWithTags.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      return {
        totalContacts: totalContacts || 0,
        activeContacts: activeContacts || 0,
        topTags
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de contatos:', error);
      throw error;
    }
  }
}

