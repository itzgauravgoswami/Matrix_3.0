const express = require('express'); 
const router = express.Router(); 
const auth = require('../middleware/auth'); 
const { generateSupremeLearning } = require('../controllers/learningController'); 

// POST route to generate supreme learning content
router.post('/supreme', auth, generateSupremeLearning); 

module.exports = router; 
