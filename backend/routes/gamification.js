const express = require('express'); 
const router = express.Router(); 
const gamificationController = require('../controllers/gamificationController'); 
const auth = require('../middleware/auth'); 

// All routes require authentication
router.use(auth); 

/**
 * Gamification Stats Routes
 */
router.get('/stats', gamificationController.getGamificationStats); 
router.get('/leaderboard', gamificationController.getLeaderboard); 
router.get('/badges', gamificationController.getUserBadges); 

/**
 * Analytics Routes
 */
router.get('/analytics/dashboard', gamificationController.getAnalyticsDashboard); 
router.get('/analytics/detailed', gamificationController.getDetailedAnalytics); 

/**
 * Learning Path Routes
 */
router.get('/learning-path/:subject', gamificationController.getLearningPath); 
router.get('/learning-paths', gamificationController.getAllLearningPaths); 
router.post('/generate-plan', gamificationController.generateLearningPlan); 

module.exports = router; 