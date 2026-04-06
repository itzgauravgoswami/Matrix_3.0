import express from 'express'
import { generateQuiz, getQuizExplanations } from '../controllers/quizController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Generate quiz
router.post('/generate', authenticateToken, generateQuiz)

// Submit quiz and get explanations
router.post('/submit', authenticateToken, getQuizExplanations)

export default router
