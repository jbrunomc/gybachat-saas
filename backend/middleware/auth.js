import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente existem
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variáveis SUPABASE não configuradas. Usando modo de teste.');
}

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Middleware de autenticação
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Configuração de JWT não encontrada'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Se não há supabase configurado, usar dados mock
    if (!supabase) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: 'Usuário Teste'
      };
      return next();
    }

    // Buscar usuário no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware de verificação de empresa
export const verifyCompany = async (req, res, next) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'ID da empresa requerido'
      });
    }

    // Verificar se o usuário pertence à empresa
    const { data: userCompany, error } = await supabase
      .from('user_companies')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('company_id', companyId)
      .single();

    if (error || !userCompany) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado à empresa'
      });
    }

    req.companyId = companyId;
    req.userRole = userCompany.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar empresa'
    });
  }
};

// Middleware de verificação de permissões
export const checkPermission = (requiredRole) => {
  return (req, res, next) => {
    const roleHierarchy = {
      'agent': 1,
      'supervisor': 2,
      'admin': 3,
      'master': 4
    };

    const userRoleLevel = roleHierarchy[req.userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente'
      });
    }

    next();
  };
};

// Middleware apenas para master
export const masterOnly = checkPermission('master');

