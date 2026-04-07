/**
 * Diagnostic endpoint to check if quiz submission updates are working
 */

const express = require('express'); 
const router = express.Router(); 
const auth = require('../middleware/auth'); 
const UserXP = require('../models/UserXP'); 
const Streak = require('../models/Streak'); 
const Badge = require('../models/Badge'); 
const UserAnalytics = require('../models/UserAnalytics'); 

/**
 * GET /api/debug/gamification-status
 * Check current gamification status for user
 */
router.get('/gamification-status', auth, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('Checking gamification status for user:', userId); 

    const [xp, streak, badge, analytics] = await Promise.all([
      UserXP.findOne({ userId }),
      Streak.findOne({ userId }),
      Badge.findOne({ userId }),
      UserAnalytics.findOne({ userId })
    ]); 

    console.log('Status retrieved:', {
      xp: xp ? { totalXP: xp.totalXP, level: xp.level } : 'Not found',
      streak: streak ? { current: streak.currentStreak, longest: streak.longestStreak } : 'Not found',
      badge: badge ? { totalBadges: badge.totalBadges } : 'Not found',
      analytics: analytics ? { totalQuizzes: analytics.totalQuizzesTaken, avgScore: analytics.overallAverageScore } : 'Not found'
    }); 

    res.json({
      success: true,
      userId,
      xp: xp || { totalXP: 0, level: 1, xpHistory: [] },
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      badge: badge || { totalBadges: 0, badges: [] },
      analytics: analytics || { totalQuizzesTaken: 0, overallAverageScore: 0 }
    }); 
  } catch (error) {
    console.error('Error checking gamification status:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}); 

/**
 * POST /api/debug/test-xp
 * Test adding XP directly
 */
router.post('/test-xp', auth, async (req, res) => {
  try {
    const { xpAmount = 50 } = req.body; 
    const userId = req.user.id; 
    
    console.log('Testing XP addition:', { userId, xpAmount }); 

    let userXP = await UserXP.findOne({ userId }); 
    
    if (!userXP) {
      console.log('Creating new UserXP'); 
      userXP = new UserXP({
        userId,
        totalXP: xpAmount,
        currentLevelXP: xpAmount,
        level: 1,
        xpToNextLevel: 100 - xpAmount
      }); 
    } else {
      console.log('Updating existing UserXP'); 
      userXP.totalXP += xpAmount; 
      userXP.currentLevelXP += xpAmount; 
      
      const xpPerLevel = 100; 
      const newLevel = Math.floor(userXP.totalXP / xpPerLevel) + 1; 
      if (newLevel > userXP.level) {
        console.log(`Level up: ${userXP.level} → ${newLevel}`); 
        userXP.level = newLevel; 
        userXP.currentLevelXP = userXP.totalXP % xpPerLevel; 
      }
      userXP.xpToNextLevel = (xpPerLevel * userXP.level) - userXP.totalXP; 
    }

    if (!userXP.xpHistory) {
      userXP.xpHistory = []; 
    }

    userXP.xpHistory.push({
      source: 'test',
      xpAmount,
      earnedAt: new Date()
    }); 

    userXP.updatedAt = new Date(); 
    await userXP.save(); 

    console.log('XP saved successfully:', {
      totalXP: userXP.totalXP,
      level: userXP.level,
      xpToNextLevel: userXP.xpToNextLevel
    }); 

    res.json({
      success: true,
      message: 'XP test completed',
      userXP
    }); 
  } catch (error) {
    console.error('Error testing XP:', error); 
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    }); 
  }
}); 

/**
 * POST /api/debug/test-streak
 * Test updating streak directly
 */
router.post('/test-streak', auth, async (req, res) => {
  try {
    const userId = req.user.id; 
    
    console.log('Testing streak update:', { userId }); 

    let streak = await Streak.findOne({ userId }); 
    
    if (!streak) {
      console.log('Creating new streak'); 
      streak = new Streak({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
        totalDaysActive: 1,
        streakStartDate: new Date()
      }); 
    } else {
      console.log('Updating existing streak'); 
      streak.currentStreak += 1; 
      streak.lastActiveDate = new Date(); 
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak; 
      }
    }

    streak.updatedAt = new Date(); 
    await streak.save(); 

    console.log('Streak saved successfully:', {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak
    }); 

    res.json({
      success: true,
      message: 'Streak test completed',
      streak
    }); 
  } catch (error) {
    console.error('Error testing streak:', error); 
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    }); 
  }
}); 

module.exports = router; 