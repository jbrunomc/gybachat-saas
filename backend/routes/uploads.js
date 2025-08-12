import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Upload de arquivo (modo de teste)
router.post('/', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: 'test-file-id',
        filename: 'test-file.jpg',
        url: '/api/uploads/test-file-id'
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

