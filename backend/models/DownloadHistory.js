const mongoose = require('mongoose'); 

const downloadHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null,
  },
  type: {
    type: String,
    enum: ['notes', 'quiz', 'qa'],
    default: 'notes',
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
}); 

// Create index for efficient queries
downloadHistorySchema.index({ userId: 1, downloadedAt: 1 }); 

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema); 
