const express = require('express'); 
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
  generateNotes,
  checkRemainingDownloads,
} = require('../controllers/notesController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// All notes routes require authentication
router.use(auth); 

// Check remaining downloads (BEFORE specific ID routes)
router.get('/check/remaining-downloads', checkRemainingDownloads); 

// Generate notes from AI
router.post('/generate', generateNotes); 

// Get all notes for user
router.get('/', getNotes); 

// Create a new note
router.post('/', createNote); 

// Get a specific note
router.get('/:noteId', getNoteById); 

// Update a note
router.put('/:noteId', updateNote); 

// Delete a note
router.delete('/:noteId', deleteNote); 

module.exports = router; 
