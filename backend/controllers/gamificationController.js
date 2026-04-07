const GamificationService = require('../services/gamificationService'); 
const AnalyticsService = require('../services/analyticsService'); 
const LearningPathService = require('../services/learningPathService'); 

/**
 * Get user gamification stats
 */
exports.getGamificationStats = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('[gamificationController] Getting stats for user:', userId); 

    // Initialize gamification records if they don't exist
    await GamificationService.initializeGamification(userId); 

    // Get fresh stats from database
    const stats = await GamificationService.getUserGamificationStats(userId); 

    console.log('[gamificationController] Returning stats:', stats); 
    res.json({
      success: true,
      stats
    }); 
  } catch (error) {
    console.error('Error getting gamification stats:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, filterBy = 'level' } = req.query; 

    const leaderboard = await GamificationService.getLeaderboard(
      parseInt(limit),
      filterBy
    ); 

    res.json({
      success: true,
      leaderboard
    }); 
  } catch (error) {
    console.error('Error getting leaderboard:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get user's badge collection
 */
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id; 

    const badges = await GamificationService.getUserBadges(userId); 

    res.json({
      success: true,
      badges
    }); 
  } catch (error) {
    console.error('Error getting badges:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get analytics dashboard
 */
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const userId = req.user.id; 

    const analytics = await AnalyticsService.getDashboardAnalytics(userId); 
    
    // Get streak data
    const Streak = require('../models/Streak'); 
    const streakRecord = await Streak.findOne({ userId }).lean(); 
    const currentStreak = streakRecord?.currentStreak || 0; 

    if (!analytics) {
      // Return default analytics for new users
      return res.json({
        success: true,
        analytics: {
          summary: {
            totalQuizzes: 0,
            totalNotes: 0,
            overallAverage: 0,
            improvementTrend: 'stable',
            currentStreak: currentStreak,
            bestSubject: 'Not yet determined',
            recommendation: 'Start taking quizzes to build your analytics!'
          },
          subjectPerformance: [],
          weeklyActivity: [
            { day: 'Mon', quizzes: 0, score: 0 },
            { day: 'Tue', quizzes: 0, score: 0 },
            { day: 'Wed', quizzes: 0, score: 0 },
            { day: 'Thu', quizzes: 0, score: 0 },
            { day: 'Fri', quizzes: 0, score: 0 },
            { day: 'Sat', quizzes: 0, score: 0 },
            { day: 'Sun', quizzes: 0, score: 0 }
          ],
          streak: {
            currentStreak: currentStreak
          }
        }
      }); 
    }

    // Add streak to the analytics response
    analytics.streak = {
      currentStreak: currentStreak
    }; 

    res.json({
      success: true,
      analytics
    }); 
  } catch (error) {
    console.error('Error getting analytics dashboard:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get detailed analytics
 */
exports.getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; 

    const analytics = await AnalyticsService.getUserAnalytics(userId); 

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not found'
      }); 
    }

    res.json({
      success: true,
      analytics
    }); 
  } catch (error) {
    console.error('Error getting detailed analytics:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get learning path for subject
 */
exports.getLearningPath = async (req, res) => {
  try {
    const { subject } = req.params; 
    const userId = req.user.id; 

    const learningPath = await LearningPathService.getLearningPathAnalytics(userId, subject); 

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      }); 
    }

    res.json({
      success: true,
      learningPath
    }); 
  } catch (error) {
    console.error('Error getting learning path:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get all learning paths for user
 */
exports.getAllLearningPaths = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('[gamificationController] getAllLearningPaths: Getting paths for user:', userId); 

    const paths = await LearningPathService.getUserLearningPaths(userId); 
    
    console.log('[gamificationController] getAllLearningPaths: Found', paths.length, 'paths'); 
    console.log('[gamificationController] getAllLearningPaths: Paths data:', JSON.stringify(paths, null, 2)); 

    if (!paths || paths.length === 0) {
      console.log('[gamificationController] getAllLearningPaths: No paths found, returning defaults'); 
      // Return default learning paths for new users
      return res.json({
        success: true,
        paths: [
          {
            _id: '1',
            subject: 'Mathematics',
            currentLevel: 'beginner',
            topicsCovered: [],
            recommendedTopics: ['Basics', 'Algebra', 'Geometry'],
            progressPercentage: 0
          },
          {
            _id: '2',
            subject: 'Science',
            currentLevel: 'beginner',
            topicsCovered: [],
            recommendedTopics: ['Physics', 'Chemistry', 'Biology'],
            progressPercentage: 0
          },
          {
            _id: '3',
            subject: 'English',
            currentLevel: 'beginner',
            topicsCovered: [],
            recommendedTopics: ['Grammar', 'Literature', 'Comprehension'],
            progressPercentage: 0
          }
        ]
      }); 
    }

    console.log('[gamificationController] getAllLearningPaths: Returning real paths'); 
    res.json({
      success: true,
      paths
    }); 
  } catch (error) {
    console.error('[gamificationController] getAllLearningPaths: Error:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Generate AI-powered learning plan based on user's goal
 */
exports.generateLearningPlan = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { goal } = req.body; 

    if (!goal || !goal.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Learning goal is required'
      }); 
    }

    console.log('[gamificationController] Generating plan for user:', userId); 
    console.log('[gamificationController] User goal:', goal); 

    // Generate plan using AI service (Gemini)
    const GeminiService = require('../services/geminiService'); 
    const plan = await GeminiService.generateLearningPlan(goal, userId); 

    if (!plan) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate learning plan'
      }); 
    }

    console.log('[gamificationController] Generated plan:', JSON.stringify(plan, null, 2)); 
 
    // Save the plan to database
    const LearningPath = require('../models/LearningPath'); 
    const learningPath = new LearningPath({
      userId,
      userGoal: plan.userGoal || plan.goal || goal,
      goal: plan.goal || goal,
      subject: plan.subject,
      currentLevel: plan.currentLevel || 'beginner',
      estimatedDurationDays: plan.estimatedDurationDays,
      learningPhases: plan.learningPhases || [],
      resources: plan.resources || [],
      milestones: plan.milestones || [],
      dailyTargets: plan.dailyTargets,
      progressPercentage: plan.progressPercentage || 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    }); 

    await learningPath.save(); 
    console.log('[gamificationController] Learning path saved to database:', learningPath._id); 

    res.json({
      success: true,
      plan: learningPath
    }); 
  } catch (error) {
    console.error('[gamificationController] generateLearningPlan: Error:', error); 
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate learning plan'
    }); 
  }
}; 