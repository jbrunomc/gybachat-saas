import express from 'express';
import { authenticateToken, verifyCompany } from '../middleware/auth.js';

const router = express.Router();

// Dashboard analytics (modo de teste)
router.get('/dashboard', authenticateToken, verifyCompany, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        summary: {
          totalConversations: 150,
          activeConversations: 25,
          totalMessages: 1250,
          avgResponseTime: 120
        },
        conversationsByStatus: {
          open: 25,
          closed: 125
        },
        messagesByDay: {
          '2024-01-01': 50,
          '2024-01-02': 75
        }
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

