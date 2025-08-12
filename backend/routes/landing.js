import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generalRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// ==================== ROTAS PÚBLICAS (PARA A LANDING PAGE) ====================

// Buscar configurações da landing page
router.get('/public/settings', generalRateLimit, async (req, res) => {
  try {
    const databaseManager = req.app.locals.databaseManager;
    
    // Buscar todas as configurações da landing page
    const { data: landingSettings, error } = await databaseManager.supabase
      .from('landing_settings')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Organizar por seção
    const settings = {};
    landingSettings.forEach(setting => {
      settings[setting.section] = setting.content;
    });

    // Buscar configurações do sistema
    const { data: systemSettings, error: systemError } = await databaseManager.supabase
      .from('system_settings')
      .select('*')
      .in('key', ['site_name', 'site_description', 'default_logo', 'default_favicon']);

    if (systemError) throw systemError;

    // Organizar configurações do sistema
    const system = {};
    systemSettings.forEach(setting => {
      system[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: {
        settings,
        system
      }
    });
  } catch (error) {
    console.error('Erro ao buscar configurações da landing:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS ADMINISTRATIVAS ====================

// Middleware de autenticação para rotas protegidas
router.use(authenticateToken);

// Middleware para verificar permissões de master
const masterOnly = (req, res, next) => {
  if (req.user.userType !== 'master' && !req.user.permissions.includes('all')) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado'
    });
  }
  next();
};

// Buscar todas as configurações da landing (incluindo inativas)
router.get('/admin/settings', masterOnly, async (req, res) => {
  try {
    const databaseManager = req.app.locals.databaseManager;
    
    const { data: landingSettings, error } = await databaseManager.supabase
      .from('landing_settings')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Organizar por seção
    const settings = {};
    landingSettings.forEach(setting => {
      settings[setting.section] = {
        ...setting.content,
        _meta: {
          id: setting.id,
          active: setting.active,
          sort_order: setting.sort_order,
          updated_at: setting.updated_at
        }
      };
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar configuração de uma seção
router.put('/admin/settings/:section', masterOnly, async (req, res) => {
  try {
    const { section } = req.params;
    const { content, active = true } = req.body;
    const databaseManager = req.app.locals.databaseManager;

    // Validar seção
    const validSections = ['hero', 'features', 'testimonials', 'faq', 'footer', 'pricing', 'demo'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Seção inválida'
      });
    }

    // Verificar se a seção já existe
    const { data: existingSetting } = await databaseManager.supabase
      .from('landing_settings')
      .select('id')
      .eq('section', section)
      .single();

    let result;
    if (existingSetting) {
      // Atualizar existente
      const { data, error } = await databaseManager.supabase
        .from('landing_settings')
        .update({
          content,
          active,
          updated_by: req.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('section', section)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar novo
      const { data, error } = await databaseManager.supabase
        .from('landing_settings')
        .insert([{
          section,
          content,
          active,
          updated_by: req.user.id,
          sort_order: validSections.indexOf(section) + 1
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// Ativar/desativar seção
router.patch('/admin/settings/:section/toggle', masterOnly, async (req, res) => {
  try {
    const { section } = req.params;
    const databaseManager = req.app.locals.databaseManager;

    const { data, error } = await databaseManager.supabase
      .from('landing_settings')
      .select('active')
      .eq('section', section)
      .single();

    if (error) throw error;

    const { data: updated, error: updateError } = await databaseManager.supabase
      .from('landing_settings')
      .update({
        active: !data.active,
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('section', section)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erro ao alternar seção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Upload de imagem para landing page
router.post('/admin/upload', masterOnly, async (req, res) => {
  try {
    // TODO: Implementar upload de imagens
    // Por enquanto, retornar URL mockada
    const mockUrl = `/images/uploaded/${Date.now()}.jpg`;
    
    res.json({
      success: true,
      data: {
        url: mockUrl
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no upload'
    });
  }
});

// Buscar configurações do sistema
router.get('/admin/system', masterOnly, async (req, res) => {
  try {
    const databaseManager = req.app.locals.databaseManager;
    
    const { data: systemSettings, error } = await databaseManager.supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    // Organizar por categoria
    const settings = {};
    systemSettings.forEach(setting => {
      if (!settings[setting.category]) {
        settings[setting.category] = {};
      }
      settings[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at
      };
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar configuração do sistema
router.put('/admin/system/:key', masterOnly, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const databaseManager = req.app.locals.databaseManager;

    const { data, error } = await databaseManager.supabase
      .from('system_settings')
      .update({
        value,
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Preview da landing page
router.get('/admin/preview', masterOnly, async (req, res) => {
  try {
    const databaseManager = req.app.locals.databaseManager;
    
    // Buscar todas as configurações (incluindo inativas para preview)
    const { data: landingSettings, error } = await databaseManager.supabase
      .from('landing_settings')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Organizar por seção
    const settings = {};
    landingSettings.forEach(setting => {
      settings[setting.section] = {
        ...setting.content,
        _active: setting.active
      };
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;

