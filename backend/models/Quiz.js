const mongoose = require('mongoose'); 

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have 4 options'],
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
  },
}); 

function arrayLimit(val) {
  return val.length === 4; 
}

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    enum: ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive'],
    default: 'competitive',
  },
  subject: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 30,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
  answers: {
    type: Map,
    of: Number,
    default: {},
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}); 

module.exports = mongoose.model('Quiz', quizSchema); 
