const mongoose = require('mongoose'); 

const StreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  totalDaysActive: {
    type: Number,
    default: 0
  },
  streakStartDate: {
    type: Date
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

module.exports = mongoose.model('Streak', StreakSchema); 