const express = require('express'); 
const {
  adminLogin,
  getAllUsers,
  getUser,
  getUserPreview,
  resetUserPassword,
  updateUser,
  grantPlan,
  deleteUser,
  blockUser,
  unblockUser,
  searchUsers,
  getDashboardStats,
  sendNotification,
  grantBulkAccess,
  cancelSubscription,
  grantFreeQuizCredits,
  triggerStreakMaintenance,
  getStreakStatistics,
  getActiveUsers,
  resetUserStreak,
  getUserStreak,
} = require('../controllers/adminController'); 
const { verifyAdminToken } = require('../middleware/adminAuth'); 

const router = express.Router(); 

// Public route - Admin login
router.post('/login', adminLogin); 

// Protected routes - Require admin token
router.get('/stats', verifyAdminToken, getDashboardStats); 
router.get('/users', verifyAdminToken, getAllUsers); 
router.get('/users/search/:query', verifyAdminToken, searchUsers); 
router.get('/users/:id', verifyAdminToken, getUser); 
router.get('/users/:id/preview', verifyAdminToken, getUserPreview); 
router.put('/users/:id', verifyAdminToken, updateUser); 
router.post('/users/:id/grant-plan', verifyAdminToken, grantPlan); 
router.post('/users/:id/grant-quiz-credits', verifyAdminToken, grantFreeQuizCredits); 
router.post('/users/:id/reset-password', verifyAdminToken, resetUserPassword); 
router.delete('/users/:id', verifyAdminToken, deleteUser); 

// Block/Unblock user routes
router.post('/users/block', verifyAdminToken, blockUser); 
router.post('/users/unblock', verifyAdminToken, unblockUser); 

// New routes for bulk operations
router.post('/send-notification', verifyAdminToken, sendNotification); 
router.post('/grant-bulk-access', verifyAdminToken, grantBulkAccess); 
router.post('/cancel-subscription', verifyAdminToken, cancelSubscription); 

// Streak management routes
router.post('/streaks/maintenance', verifyAdminToken, triggerStreakMaintenance); 
router.get('/streaks/statistics', verifyAdminToken, getStreakStatistics); 
router.get('/streaks/active-users', verifyAdminToken, getActiveUsers); 
router.get('/streaks/:userId', verifyAdminToken, getUserStreak); 
router.post('/streaks/:userId/reset', verifyAdminToken, resetUserStreak); 

module.exports = router; 