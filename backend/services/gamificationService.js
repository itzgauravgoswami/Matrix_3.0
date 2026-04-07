const Badge = require('../models/Badge'); 
const Streak = require('../models/Streak'); 
const UserXP = require('../models/UserXP'); 

class GamificationService {
  /**
   * Badge definitions
   */
  static badgeDefinitions = {
    first_quiz: {
      title: 'First Step',
      description: 'Completed your first quiz',
      icon: '🎯'
    },
    quiz_master_10: {
      title: 'Quiz Master',
      description: 'Completed 10 quizzes',
      icon: '🏆'
    },
    quiz_master_25: {
      title: 'Quiz Legend',
      description: 'Completed 25 quizzes',
      icon: '👑'
    },
    quiz_master_50: {
      title: 'Quiz Maestro',
      description: 'Completed 50 quizzes',
      icon: '🎪'
    },
    perfect_score: {
      title: 'Perfect Score',
      description: 'Scored 100% on a quiz',
      icon: '💯'
    },
    consistency_7day: {
      title: '7-Day Warrior',
      description: 'Maintained 7-day learning streak',
      icon: '🔥'
    },
    consistency_30day: {
      title: 'Consistency Champion',
      description: 'Maintained 30-day learning streak',
      icon: '🚀'
    },
    high_scorer: {
      title: 'High Scorer',
      description: 'Average score reached 85%+',
      icon: '⭐'
    }
  }; 

  /**
   * ENSURE USER XP EXISTS - Creates if doesn't exist
   * Returns fresh data from database
   */
  static async ensureUserXPExists(userId) {
    try {
      console.log('[GamificationService] Ensuring UserXP exists for:', userId); 
      
      let userXP = await UserXP.findOne({ userId }); 
      
      if (!userXP) {
        console.log('[GamificationService] Creating new UserXP record for:', userId); 
        userXP = await UserXP.create({
          userId,
          totalXP: 0,
          currentLevelXP: 0,
          level: 1,
          xpToNextLevel: 100,
          xpHistory: []
        }); 
        console.log('[GamificationService] UserXP created:', {
          id: userXP._id,
          userId: userXP.userId,
          totalXP: userXP.totalXP
        }); 
      }
      
      return userXP; 
    } catch (error) {
      console.error('[GamificationService] Error ensuring UserXP:', error.message); 
      throw error; 
    }
  }

  /**
   * ENSURE STREAK EXISTS - Creates if doesn't exist
   * Returns fresh data from database
   */
  static async ensureStreakExists(userId) {
    try {
      console.log('[GamificationService] Ensuring Streak exists for:', userId); 
      
      let streak = await Streak.findOne({ userId }); 
      
      if (!streak) {
        console.log('[GamificationService] Creating new Streak record for:', userId); 
        streak = await Streak.create({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          totalDaysActive: 0,
          streakStartDate: null
        }); 
        console.log('[GamificationService] Streak created:', {
          id: streak._id,
          userId: streak.userId,
          currentStreak: streak.currentStreak
        }); 
      }
      
      return streak; 
    } catch (error) {
      console.error('[GamificationService] Error ensuring Streak:', error.message); 
      throw error; 
    }
  }

  /**
   * ENSURE BADGE EXISTS - Creates if doesn't exist
   * Returns fresh data from database
   */
  static async ensureBadgeExists(userId) {
    try {
      console.log('[GamificationService] Ensuring Badge exists for:', userId); 
      
      let badge = await Badge.findOne({ userId }); 
      
      if (!badge) {
        console.log('[GamificationService] Creating new Badge record for:', userId); 
        badge = await Badge.create({
          userId,
          badges: [],
          totalBadges: 0
        }); 
        console.log('[GamificationService] Badge created:', {
          id: badge._id,
          userId: badge.userId,
          totalBadges: badge.totalBadges
        }); 
      }
      
      return badge; 
    } catch (error) {
      console.error('[GamificationService] Error ensuring Badge:', error.message); 
      throw error; 
    }
  }

  /**
   * GET GAMIFICATION STATS - READS FRESH FROM DATABASE
   * This is the main method called by frontend to display stats
   * ALWAYS returns current data from database
   */
  static async getUserGamificationStats(userId) {
    try {
      console.log('[GamificationService] Getting fresh gamification stats for:', userId); 
      
      // Ensure all records exist first
      await Promise.all([
        this.ensureUserXPExists(userId),
        this.ensureStreakExists(userId),
        this.ensureBadgeExists(userId)
      ]); 
      
      // NOW read fresh from database
      const [xpRecord, streakRecord, badgeRecord] = await Promise.all([
        UserXP.findOne({ userId }).lean(),
        Streak.findOne({ userId }).lean(),
        Badge.findOne({ userId }).lean()
      ]); 
      
      console.log('[GamificationService] Fresh data from DB:', {
        xp: xpRecord?.totalXP || 0,
        level: xpRecord?.level || 1,
        currentStreak: streakRecord?.currentStreak || 0,
        totalBadges: badgeRecord?.totalBadges || 0
      }); 
      
      const stats = {
        totalXP: xpRecord?.totalXP || 0,
        level: xpRecord?.level || 1,
        xpToNextLevel: xpRecord?.xpToNextLevel || 100,
        currentStreak: streakRecord?.currentStreak || 0,
        longestStreak: Math.max(streakRecord?.longestStreak || 0, streakRecord?.currentStreak || 0),
        totalBadges: badgeRecord?.totalBadges || 0,
        badges: badgeRecord?.badges || []
      }; 
      
      console.log('[GamificationService] Returning stats:', stats); 
      return stats; 
    } catch (error) {
      console.error('[GamificationService] Error getting stats:', error.message); 
      throw error; 
    }
  }

  /**
   * GET LEADERBOARD - Fresh from database
   * Joins data from UserXP, Streak, and Badge collections
   */
  static async getLeaderboard(limit = 10, filterBy = 'level') {
    try {
      console.log('[GamificationService] Getting leaderboard, filter:', filterBy); 
      
      // Always get all users from UserXP (the source of truth for users)
      let sortBy = { level: -1, totalXP: -1 }; 
      if (filterBy === 'streak') {
        sortBy = { currentStreak: -1, longestStreak: -1 }; 
      } else if (filterBy === 'badges') {
        sortBy = { totalBadges: -1 }; 
      }
      
      const userXPs = await UserXP.find()
        .sort(sortBy)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(); 
      
      // For each user, fetch their streak and badge data
      const leaderboard = await Promise.all(
        userXPs.map(async (xpRecord) => {
          const streakRecord = await Streak.findOne({ userId: xpRecord.userId._id || xpRecord.userId }).lean(); 
          const badgeRecord = await Badge.findOne({ userId: xpRecord.userId._id || xpRecord.userId }).lean(); 
          
          const userName = typeof xpRecord.userId === 'object' ? (xpRecord.userId.name || 'Anonymous') : 'Anonymous'; 
          const userIdValue = typeof xpRecord.userId === 'object' ? xpRecord.userId._id : xpRecord.userId; 
          
          return {
            rank: 0, // Will be set after
            ...xpRecord,
            name: userName,
            userId: userIdValue,
            currentStreak: streakRecord?.currentStreak || 0,
            longestStreak: Math.max(streakRecord?.longestStreak || 0, streakRecord?.currentStreak || 0),
            totalBadges: badgeRecord?.totalBadges || 0,
            badges: badgeRecord?.badges || [],
            userLevel: xpRecord.level || 1
          }; 
        })
      ); 
      
      // Re-sort by the filtered field in case we need to re-rank
      if (filterBy === 'streak') {
        leaderboard.sort((a, b) => {
          if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak; 
          return b.longestStreak - a.longestStreak; 
        }); 
      } else if (filterBy === 'badges') {
        leaderboard.sort((a, b) => b.totalBadges - a.totalBadges); 
      } else {
        leaderboard.sort((a, b) => {
          if (b.level !== a.level) return b.level - a.level; 
          return b.totalXP - a.totalXP; 
        }); 
      }
      
      // Set ranks
      leaderboard.forEach((item, idx) => {
        item.rank = idx + 1; 
      }); 
      
      return leaderboard; 
    } catch (error) {
      console.error('[GamificationService] Error getting leaderboard:', error); 
      return []; 
    }
  }

  /**
   * AWARD BADGE - Saves directly to database
   */
  static async awardBadge(userId, badgeName) {
    try {
      console.log('[GamificationService] Awarding badge:', { userId, badgeName }); 
      
      let badgeRecord = await Badge.findOne({ userId }); 
      
      if (!badgeRecord) {
        badgeRecord = await this.ensureBadgeExists(userId); 
      }
      
      // Check if already has badge
      if (badgeRecord.badges.some(b => b.badgeName === badgeName)) {
        console.log('[GamificationService] User already has badge:', badgeName); 
        return { success: false, message: 'Badge already earned' }; 
      }
      
      const badgeDef = this.badgeDefinitions[badgeName]; 
      if (!badgeDef) {
        console.log('[GamificationService] Badge definition not found:', badgeName); 
        return { success: false, message: 'Invalid badge' }; 
      }
      
      // Add badge
      badgeRecord.badges.push({
        badgeName,
        badgeTitle: badgeDef.title,
        badgeDescription: badgeDef.description,
        badgeIcon: badgeDef.icon,
        earnedAt: new Date()
      }); 
      
      badgeRecord.totalBadges = badgeRecord.badges.length; 
      badgeRecord.updatedAt = new Date(); 
      
      await badgeRecord.save(); 
      
      console.log('[GamificationService] Badge awarded successfully'); 
      return {
        success: true,
        message: `🎉 Badge Unlocked: ${badgeDef.title}!`,
        totalBadges: badgeRecord.totalBadges
      }; 
    } catch (error) {
      console.error('[GamificationService] Error awarding badge:', error); 
      return { success: false, error: error.message }; 
    }
  }

  /**
   * CHECK AND AWARD BADGES based on stats
   */
  static async checkAndAwardBadges(userId, completedQuizzes) {
    try {
      console.log('[GamificationService] Checking badges for:', { userId, completedQuizzes }); 
      
      // Get fresh badge record
      let badgeRecord = await Badge.findOne({ userId }); 
      if (!badgeRecord) {
        badgeRecord = await this.ensureBadgeExists(userId); 
      }
      
      const awardedBadges = []; 
      
      // First quiz
      if (completedQuizzes === 1) {
        const result = await this.awardBadge(userId, 'first_quiz'); 
        if (result.success) awardedBadges.push(result); 
      }
      
      // Quiz milestones
      if (completedQuizzes === 10) {
        const result = await this.awardBadge(userId, 'quiz_master_10'); 
        if (result.success) awardedBadges.push(result); 
      }
      if (completedQuizzes === 25) {
        const result = await this.awardBadge(userId, 'quiz_master_25'); 
        if (result.success) awardedBadges.push(result); 
      }
      if (completedQuizzes === 50) {
        const result = await this.awardBadge(userId, 'quiz_master_50'); 
        if (result.success) awardedBadges.push(result); 
      }
      
      console.log('[GamificationService] Badges checked, awarded:', awardedBadges.length); 
      return awardedBadges; 
    } catch (error) {
      console.error('[GamificationService] Error checking badges:', error); 
      return []; 
    }
  }

  /**
   * GET USER BADGES - Returns user's badge collection
   */
  static async getUserBadges(userId) {
    try {
      console.log('[GamificationService] Getting badges for user:', userId); 
      
      const badgeRecord = await Badge.findOne({ userId }).lean(); 
      
      if (!badgeRecord) {
        console.log('[GamificationService] No badges found, creating empty collection'); 
        return {
          badges: [],
          totalBadges: 0
        }; 
      }
      
      console.log('[GamificationService] Found badges:', badgeRecord.totalBadges); 
      return {
        badges: badgeRecord.badges || [],
        totalBadges: badgeRecord.totalBadges || 0
      }; 
    } catch (error) {
      console.error('[GamificationService] Error getting badges:', error.message); 
      return {
        badges: [],
        totalBadges: 0
      }; 
    }
  }

  /**
   * ENSURE ALL GAMIFICATION RECORDS EXIST FOR NEW USER
   */
  static async initializeGamification(userId) {
    try {
      console.log('[GamificationService] Initializing gamification for:', userId); 
      
      await Promise.all([
        this.ensureUserXPExists(userId),
        this.ensureStreakExists(userId),
        this.ensureBadgeExists(userId)
      ]); 
      
      console.log('[GamificationService] Gamification initialized'); 
      return true; 
    } catch (error) {
      console.error('[GamificationService] Error initializing:', error); 
      return false; 
    }
  }
}

module.exports = GamificationService; 