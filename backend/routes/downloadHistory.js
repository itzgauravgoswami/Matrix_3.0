const express = require('express'); 
const { recordDownload, getDownloadHistory } = require('../controllers/downloadHistoryController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// All routes require authentication
router.use(auth); 

// Record a download
router.post('/', recordDownload); 

// Get download history
router.get('/', getDownloadHistory); 

module.exports = router; 
