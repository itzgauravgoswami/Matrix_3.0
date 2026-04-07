const express = require('express'); 
const {
  getQuizzes,
  createQuiz,
  getQuizById,
  submitQuiz,
  deleteQuiz,
  generateQuizWithGemini,
  getRecentQuizzes,
} = require('../controllers/quizController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// All quiz routes require authentication
router.use(auth); 

// Get recent quizzes for dashboard (BEFORE /:quizId)
router.get('/recent', getRecentQuizzes); 

// Get all quizzes for user
router.get('/', getQuizzes); 

// Create a new quiz
router.post('/', createQuiz); 

// Generate quiz with Gemini
router.post('/generate/gemini', generateQuizWithGemini); 

// Get a specific quiz
router.get('/:quizId', getQuizById); 

// Submit quiz answers
router.post('/:quizId/submit', submitQuiz); 

// Delete a quiz
router.delete('/:quizId', deleteQuiz); 

module.exports = router; 
