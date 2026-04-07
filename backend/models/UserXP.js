const mongoose = require('mongoose'); 

const UserXPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  currentLevelXP: {
    type: Number,
    default: 0
  },
  xpHistory: [
    {
      source: {
        type: String,
        enum: ['quiz_completion', 'quiz_perfect_score', 'note_creation', 'daily_test', 'streak_bonus']
      },
      xpAmount: Number,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      relatedId: mongoose.Schema.Types.ObjectId
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model('UserXP', UserXPSchema); 