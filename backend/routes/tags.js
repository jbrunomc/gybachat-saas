import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Listar tags (modo de teste)
router.get('/', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 1, name: 'Urgente', color: '#ff0000' },
        { id: 2, name: 'Cliente VIP', color: '#00ff00' }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

