import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Listar automações (modo de teste)
router.get('/', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

