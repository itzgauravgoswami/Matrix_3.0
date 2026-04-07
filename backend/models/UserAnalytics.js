const mongoose = require('mongoose'); 

const UserAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalQuizzesTaken: {
    type: Number,
    default: 0
  },
  totalNotesCrated: {
    type: Number,
    default: 0
  },
  totalTestsAttempted: {
    type: Number,
    default: 0
  },
  overallAverageScore: {
    type: Number,
    default: 0
  },
  subjectPerformance: [
    {
      subject: String,
      totalAttempts: Number,
      averageScore: Number,
      bestScore: Number,
      worstScore: Number,
      lastAttempt: Date
    }
  ],
  dailyLearningStats: [
    {
      date: Date,
      studyTimeMinutes: Number,
      quizzesCompleted: Number,
      averageScore: Number,
      notesCreated: Number
    }
  ],
  learningHeatmap: [
    {
      date: Date,
      intensity: Number // 0-5
    }
  ],
  weakTopics: [
    {
      topic: String,
      averageScore: Number,
      failureCount: Number,
      totalAttempts: Number
    }
  ],
  strongTopics: [
    {
      topic: String,
      averageScore: Number,
      successCount: Number,
      totalAttempts: Number
    }
  ],
  timeSpentPerSubject: [
    {
      subject: String,
      totalMinutes: Number
    }
  ],
  studyConsistency: {
    daysActiveThisMonth: Number,
    averageDailyMinutes: Number,
    mostActiveDay: String
  },
  predictedPerformance: {
    estimatedNextExamScore: Number,
    improvementTrend: String, // 'improving', 'stable', 'declining'
    recommendedFocusAreas: [String]
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

module.exports = mongoose.model('UserAnalytics', UserAnalyticsSchema); 