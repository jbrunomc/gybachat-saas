import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Status das redes sociais (modo de teste)
router.get('/status', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        instagram: { connected: false },
        facebook: { connected: false }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

