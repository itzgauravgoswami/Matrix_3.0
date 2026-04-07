const Streak = require('../models/Streak'); 
const User = require('../models/user'); 

/**
 * Streak Maintenance Service
 * Handles daily streak updates at midnight (12:00 AM)
 * For active users: increments streak if active yesterday
 * For inactive users: resets streak if no activity for more than 1 day
 */

class StreakMaintenanceService {
  /**
   * Get the start of a specific day in UTC
   */
  static getStartOfDay(date) {
    const d = new Date(date); 
    d.setUTCHours(0, 0, 0, 0); 
    return d; 
  }

  /**
   * Get the end of a specific day in UTC
   */
  static getEndOfDay(date) {
    const d = new Date(date); 
    d.setUTCHours(23, 59, 59, 999); 
    return d; 
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1, date2) {
    const day1 = this.getStartOfDay(date1); 
    const day2 = this.getStartOfDay(date2); 
    return day1.getTime() === day2.getTime(); 
  }

  /**
   * Check if date1 is yesterday compared to date2
   */
  static isYesterday(date1, date2) {
    const day1 = this.getStartOfDay(date1); 
    const day2 = this.getStartOfDay(date2); 
    const oneDay = 24 * 60 * 60 * 1000; 
    return day2.getTime() - day1.getTime() === oneDay; 
  }

  /**
   * Process daily streak maintenance
   * Call this every day at 12:00 AM (midnight) UTC
   * 
   * Logic:
   * 1. For each user with a streak record:
   *    - If lastActivityDate is yesterday: increment streak + 1
   *    - If lastActivityDate is today: do nothing (already counted)
   *    - If lastActivityDate is > 1 day ago: reset streak to 0
   * 2. Update lastProcessedDate to prevent duplicate processing
   */
  static async processDailyStreakMaintenance() {
    try {
      console.log('[StreakMaintenanceService] Starting daily streak maintenance...'); 
      const now = new Date(); 

      // Get all streak records
      const streaks = await Streak.find({}); 
      console.log(`[StreakMaintenanceService] Found ${streaks.length} streak records to process`); 

      let updated = 0; 
      let reset = 0; 
      let noChange = 0; 

      for (const streak of streaks) {
        try {
          if (!streak.lastActiveDate) {
            console.log(`[StreakMaintenanceService] Skipping streak ${streak._id} - no lastActiveDate`); 
            noChange++; 
            continue; 
          }

          const lastActive = new Date(streak.lastActiveDate); 
          const isSameDay = this.isSameDay(now, lastActive); 
          const isYesterday = this.isYesterday(lastActive, now); 

          if (isSameDay) {
            // User was active today, no update needed
            noChange++; 
            console.log(`[StreakMaintenanceService] User ${streak.userId} - same day, no update`); 
          } else if (isYesterday) {
            // User was active yesterday, increment streak
            streak.currentStreak += 1; 
            streak.totalDaysActive = (streak.totalDaysActive || 0) + 1; 

            // Update longestStreak if current exceeds it
            if (streak.currentStreak > streak.longestStreak) {
              streak.longestStreak = streak.currentStreak; 
            }

            streak.updatedAt = now; 
            await streak.save(); 
            updated++; 

            console.log(
              `[StreakMaintenanceService] User ${streak.userId} - streak incremented to ${streak.currentStreak}`
            ); 
          } else {
            // User was inactive (gap > 1 day), reset streak
            const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24)); 
            console.log(
              `[StreakMaintenanceService] User ${streak.userId} - inactive for ${daysDiff} days, resetting streak`
            ); 

            streak.currentStreak = 0; 
            streak.streakStartDate = null; 
            streak.updatedAt = now; 
            await streak.save(); 
            reset++; 
          }
        } catch (error) {
          console.error(
            `[StreakMaintenanceService] Error processing streak ${streak._id}:`,
            error
          ); 
        }
      }

      console.log('[StreakMaintenanceService] Daily streak maintenance completed'); 
      console.log(`  - Updated: ${updated} streaks`); 
      console.log(`  - Reset: ${reset} streaks`); 
      console.log(`  - No change: ${noChange} streaks`); 

      return {
        success: true,
        updated,
        reset,
        noChange,
        total: streaks.length,
        processedAt: now
      }; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error in processDailyStreakMaintenance:', error); 
      return {
        success: false,
        error: error.message
      }; 
    }
  }

  /**
   * Mark user as active for today
   * Called whenever user interacts with the app (quiz, test, notes, etc.)
   */
  static async markUserActive(userId) {
    try {
      let streak = await Streak.findOne({ userId }); 

      if (!streak) {
        // First time user is active, create streak record
        streak = new Streak({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date(),
          totalDaysActive: 1,
          streakStartDate: new Date()
        }); 
      } else {
        const now = new Date(); 
        const lastActive = new Date(streak.lastActiveDate); 
        const isSameDay = this.isSameDay(now, lastActive); 

        if (!isSameDay) {
          // Different day, update lastActiveDate
          // The actual streak increment will happen at midnight
          streak.lastActiveDate = now; 
        }
        // If same day, don't update - prevents duplicate counting
      }

      streak.updatedAt = new Date(); 
      await streak.save(); 

      return streak; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error marking user active:', error); 
      throw error; 
    }
  }

  /**
   * Get user's current streak info
   */
  static async getUserStreak(userId) {
    try {
      const streak = await Streak.findOne({ userId }); 

      if (!streak) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalDaysActive: 0,
          isActive: false
        }; 
      }

      const now = new Date(); 
      const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null; 
      const isSameDay = lastActive ? this.isSameDay(now, lastActive) : false; 
      const isYesterday = lastActive ? this.isYesterday(lastActive, now) : false; 

      return {
        _id: streak._id,
        currentStreak: streak.currentStreak || 0,
        longestStreak: streak.longestStreak || 0,
        totalDaysActive: streak.totalDaysActive || 0,
        lastActiveDate: streak.lastActiveDate,
        streakStartDate: streak.streakStartDate,
        isActive: isSameDay || isYesterday,
        isSameDay,
        isYesterday,
        updatedAt: streak.updatedAt,
        createdAt: streak.createdAt
      }; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error getting user streak:', error); 
      throw error; 
    }
  }

  /**
   * Reset user's streak manually (admin function or user request)
   */
  static async resetUserStreak(userId) {
    try {
      const streak = await Streak.findOne({ userId }); 

      if (!streak) {
        console.warn(`[StreakMaintenanceService] No streak found for user ${userId}`); 
        return null; 
      }

      streak.currentStreak = 0; 
      streak.streakStartDate = null; 
      streak.updatedAt = new Date(); 
      await streak.save(); 

      console.log(`[StreakMaintenanceService] Streak reset for user ${userId}`); 
      return streak; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error resetting user streak:', error); 
      throw error; 
    }
  }

  /**
   * Get all active users (those with activity in last 24-48 hours)
   */
  static async getActiveUsers() {
    try {
      const now = new Date(); 
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); 

      const streaks = await Streak.find({
        lastActiveDate: { $gte: twoDaysAgo }
      }); 

      return streaks; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error getting active users:', error); 
      throw error; 
    }
  }

  /**
   * Get streak statistics
   */
  static async getStreakStatistics() {
    try {
      const streaks = await Streak.find({}); 

      const stats = {
        totalUsers: streaks.length,
        usersWithStreak: streaks.filter(s => s.currentStreak > 0).length,
        averageStreak: streaks.length > 0
          ? streaks.reduce((sum, s) => sum + (s.currentStreak || 0), 0) / streaks.length
          : 0,
        maxStreak: Math.max(...streaks.map(s => s.longestStreak || 0), 0),
        totalDaysActive: streaks.reduce((sum, s) => sum + (s.totalDaysActive || 0), 0)
      }; 

      return stats; 
    } catch (error) {
      console.error('[StreakMaintenanceService] Error getting streak statistics:', error); 
      throw error; 
    }
  }
}

module.exports = StreakMaintenanceService; 