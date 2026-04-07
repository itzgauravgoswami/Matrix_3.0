const mongoose = require('mongoose'); 

const answerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  maxMarks: {
    type: Number,
    default: 10,
  },
  feedback: {
    type: String,
  },
  keyPointsCovered: [String],
  keyPointsMissed: [String],
  strengths: [String],
  weaknesses: [String],
  improvementSuggestions: [String],
  modelAnswer: String,
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
}); 

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['short-answer', 'descriptive', 'conceptual'],
    default: 'short-answer',
  },
  expectedKeyPoints: [String],
  examFrequency: {
    type: String,
    enum: ['Very High', 'High', 'Medium'],
    default: 'High',
  },
  marks: {
    type: Number,
    default: 5,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
}); 

const qaTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examType: {
    type: String,
    enum: ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  totalQuestions: {
    type: Number,
    default: 5,
  },
  questions: [questionSchema],
  answers: [answerSchema],
  
  // Score tracking
  totalScore: {
    type: Number,
    default: 0,
  },
  maxTotalMarks: {
    type: Number,
    default: 0,
  },
  scorePercentage: {
    type: Number,
    default: 0,
  },
  
  // Status
  status: {
    type: String,
    enum: ['started', 'in-progress', 'completed'],
    default: 'started',
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  duration: Number, // in seconds
}); 

module.exports = mongoose.model('QATest', qaTestSchema); 
