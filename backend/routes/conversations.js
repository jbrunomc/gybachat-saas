import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Listar conversas (modo de teste)
router.get('/', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 'conv-1',
          contact: {
            name: 'João Silva',
            phone: '5511999999999'
          },
          status: 'open',
          lastMessage: 'Olá, preciso de ajuda',
          updatedAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

