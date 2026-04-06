import express from 'express'
import { generateNotes } from '../controllers/notesController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST /api/notes/generate - Generate notes using Gemini API
router.post('/generate', authenticateToken, generateNotes)

export default router
