/**
 * Streak Maintenance Scheduler
 * 
 * Runs a daily task at midnight UTC (12:00 AM) to:
 * 1. Increment streak for users who were active yesterday
 * 2. Reset streak for users who have been inactive for more than 1 day
 * 
 * Uses node-schedule library for cron jobs
 */

const schedule = require('node-schedule'); 

let maintenanceJob = null; 

/**
 * Initialize the streak maintenance scheduler
 * Call this when your Express server starts
 */
function initializeStreakMaintenance() {
  try {
    console.log('[StreakScheduler] Initializing streak maintenance scheduler...'); 

    // Schedule job to run every day at 12:00 AM UTC
    // Cron pattern: '0 0 * * *' = at 00:00 UTC every day
    maintenanceJob = schedule.scheduleJob('0 0 * * *', async () => {
      try {
        console.log('[StreakScheduler] Running daily streak maintenance...'); 
        const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
        const result = await StreakMaintenanceService.processDailyStreakMaintenance(); 
        console.log('[StreakScheduler] Maintenance completed:', result); 
      } catch (error) {
        console.error('[StreakScheduler] Error during scheduled maintenance:', error); 
      }
    }); 

    console.log('[StreakScheduler] ✓ Streak maintenance scheduler initialized'); 
    console.log('[StreakScheduler] Scheduled to run daily at 12:00 AM UTC'); 

    return maintenanceJob; 
  } catch (error) {
    console.error('[StreakScheduler] Error initializing scheduler:', error); 
    throw error; 
  }
}

/**
 * Stop the maintenance scheduler
 */
function stopStreakMaintenance() {
  if (maintenanceJob) {
    maintenanceJob.cancel(); 
    maintenanceJob = null; 
    console.log('[StreakScheduler] Streak maintenance scheduler stopped'); 
  }
}

/**
 * Manually trigger streak maintenance (for testing or admin panel)
 */
async function triggerStreakMaintenance() {
  try {
    console.log('[StreakScheduler] Manually triggering streak maintenance...'); 
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    const result = await StreakMaintenanceService.processDailyStreakMaintenance(); 
    return result; 
  } catch (error) {
    console.error('[StreakScheduler] Error triggering manual maintenance:', error); 
    throw error; 
  }
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
  return {
    isActive: maintenanceJob !== null,
    nextExecution: maintenanceJob ? maintenanceJob.nextInvocation() : null,
    lastExecution: maintenanceJob ? maintenanceJob.lastInvocation() : null
  }; 
}

module.exports = {
  initializeStreakMaintenance,
  stopStreakMaintenance,
  triggerStreakMaintenance,
  getSchedulerStatus
}; 