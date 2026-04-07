const mongoose = require('mongoose'); 

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  examType: {
    type: String,
    enum: ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive'],
    default: 'competitive',
  },
  tags: {
    type: [String],
    default: [],
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}); 

// Update the updatedAt timestamp before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now(); 
  next(); 
}); 

module.exports = mongoose.model('Note', noteSchema); 
