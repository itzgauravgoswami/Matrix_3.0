const mongoose = require('mongoose'); 

const BadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badges: [
    {
      badgeName: {
        type: String,
        enum: [
          'first_quiz',
          'quiz_master_10',
          'quiz_master_25',
          'quiz_master_50',
          'perfect_score',
          'speed_demon',
          'consistent_learner_7',
          'consistent_learner_30',
          'note_taker_5',
          'note_taker_20',
          'score_hundred',
          'comeback_kid',
          'learning_enthusiast'
        ]
      },
      badgeTitle: String,
      badgeDescription: String,
      badgeIcon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  totalBadges: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Badge', BadgeSchema); 