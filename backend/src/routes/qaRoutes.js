import express from 'express'
import { generateQA, evaluateQA } from '../controllers/qaController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Generate QA test
router.post('/generate', authenticateToken, generateQA)

// Evaluate QA test
router.post('/evaluate', authenticateToken, evaluateQA)

export default router
