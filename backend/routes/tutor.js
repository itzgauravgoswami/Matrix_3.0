const express = require('express'); 
const router = express.Router(); 
const tutorController = require('../controllers/tutorController'); 
const auth = require('../middleware/auth'); 

// All routes require authentication
router.use(auth); 

/**
 * Tutor Conversation Routes
 */
router.post('/conversations/start', tutorController.startConversation); 
router.post('/conversations/message', tutorController.sendMessage); 
router.get('/conversations', tutorController.getUserConversations); 
router.get('/conversations/:conversationId', tutorController.getConversation); 
router.delete('/conversations/:conversationId', tutorController.deleteConversation); 

/**
 * Question Explanation Routes
 */
router.post('/explain-question', tutorController.getQuestionExplanation); 

/**
 * Learning Recommendations Routes
 */
router.get('/recommendations/:subject', tutorController.getLearningRecommendations); 

module.exports = router; 