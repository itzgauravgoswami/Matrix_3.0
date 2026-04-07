const mongoose = require('mongoose'); 

const LearningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: false
  },
  userGoal: {
    type: String,
    required: false
  },
  goal: {
    type: String,
    required: false
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'master'],
    default: 'beginner'
  },
  estimatedDurationDays: {
    type: Number,
    required: false
  },
  learningPhases: [
    {
      phase: Number,
      name: String,
      description: String,
      duration: String,
      topics: [String],
      objectives: [String],
      resources: [String],
      completed: {
        type: Boolean,
        default: false
      }
    }
  ],
  topicsCovered: [
    {
      topicName: String,
      level: String,
      completed: Boolean,
      score: Number,
      attempts: Number,
      completedAt: Date
    }
  ],
  recommendedTopics: [String],
  focusAreas: [
    {
      topic: String,
      weaknessScore: Number,
      recommendedActions: [String]
    }
  ],
  resources: [String],
  milestones: [
    {
      phase: Number,
      milestone: String
    }
  ],
  dailyTargets: {
    readingTime: String,
    practiceProblems: String,
    reviewTime: String
  },
  nextRecommendedTopic: String,
  estimatedTimeToMastery: Number, // in days
  progressPercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model('LearningPath', LearningPathSchema); 