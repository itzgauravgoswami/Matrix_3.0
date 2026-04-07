const mongoose = require('mongoose'); 

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  context: {
    subject: String,
    topic: String,
    relatedQuizId: mongoose.Schema.Types.ObjectId,
    relatedNoteId: mongoose.Schema.Types.ObjectId
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}); 

const TutorConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  subject: String,
  topic: String,
  messages: [ChatMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model('TutorConversation', TutorConversationSchema); 