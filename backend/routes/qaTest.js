const express = require('express'); 
const {
  generateQuestions,
  submitAnswer,
  getQATestDetails,
  getAllQATests,
  deleteQATest,
  checkQATestsRemaining,
  getRecentQATests,
} = require('../controllers/qaTestController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// All QA Test routes require authentication
router.use(auth); 

// Check remaining QA tests (must come BEFORE /:qaTestId to avoid route conflicts)
router.get('/check/remaining', checkQATestsRemaining); 

// Get recent QA tests for dashboard (must come BEFORE /:qaTestId to avoid route conflicts)
router.get('/recent', getRecentQATests); 

// Generate new test
router.post('/', generateQuestions); 

// Get all QA Tests
router.get('/', getAllQATests); 

// Get specific QA Test details
router.get('/:qaTestId', getQATestDetails); 

// Submit answer
router.post('/:qaTestId/submit', submitAnswer); 

// Delete QA Test
router.delete('/:qaTestId', deleteQATest); 

module.exports = router; 
