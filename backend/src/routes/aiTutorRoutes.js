import express from 'express'
import { sendMessage, startSession, getSessionHistory, endSession } from '../controllers/aiTutorController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Start a new tutoring session
router.post('/start-session', startSession)

// Send message to AI tutor
router.post('/send-message', sendMessage)

// Get session history
router.get('/history/:sessionId', getSessionHistory)

// End session
router.post('/end-session', endSession)

export default router
