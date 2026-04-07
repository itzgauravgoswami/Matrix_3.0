const express = require('express'); 
const bcrypt = require('bcryptjs'); 
const User = require('../models/user'); 
const Payment = require('../models/Payment'); 
const Quiz = require('../models/Quiz'); 
const auth = require('../middleware/auth'); 
const { sendAccountDeletionEmail } = require('../services/emailService'); 

const router = express.Router(); 

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' }); 
    }

    // Calculate quiz limits for free users
    let quizLimits = null; 
    if (user.subscriptionPlan === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7);  // YYYY-MM format
      
      // Reset quiz count if month changed
      if (user.quizAttemptMonth !== currentMonth) {
        // console.log(`Monthly reset triggered for user ${user._id}. Old month: ${user.quizAttemptMonth}, New month: ${currentMonth}`); 
        user.quizAttemptMonth = currentMonth; 
        user.quizzesPlayedThisMonth = 0; 
        user.extraQuizCreditsGranted = 0;  // Reset extra credits on new month
        user.extraQuizCreditsGrantedMonth = null; 
        await user.save(); 
      }

      // If extra credits were granted in a different month, clear them
      if (user.extraQuizCreditsGrantedMonth !== currentMonth) {
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
        await user.save(); 
      }

      // Calculate total allowed and remaining
      const totalAllowed = 5 + user.extraQuizCreditsGranted; 
      quizLimits = {
        totalQuizzes: totalAllowed,
        quizzesUsed: user.quizzesPlayedThisMonth,
        quizzesRemaining: totalAllowed - user.quizzesPlayedThisMonth,
      }; 
      // console.log(`Profile endpoint - User ${user._id}: base=5, extra=${user.extraQuizCreditsGranted}, used=${user.quizzesPlayedThisMonth}, remaining=${quizLimits.quizzesRemaining}`); 
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan || 'free',
        subscriptionPeriod: user.subscriptionPeriod || 'monthly',
        isPremium: user.isPremium || false,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        phone: user.phone,
        freeQuizCredits: 5 + user.extraQuizCreditsGranted, // Return current total for admin display
        quizLimits,
      },
    }); 
  } catch (error) {
    // console.error('Error fetching user profile:', error); 
    res.status(500).json({ success: false, message: 'Internal server error' }); 
  }
}); 

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body; 

    const user = await User.findById(req.user.id); 
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' }); 
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email }); 
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        }); 
      }
      user.email = email; 
    }

    // Update fields if provided
    if (name) user.name = name; 
    if (phone !== undefined) user.phone = phone; 

    await user.save(); 

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan || 'free',
        subscriptionPeriod: user.subscriptionPeriod || 'monthly',
        isPremium: user.isPremium || false,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        phone: user.phone,
      },
    }); 
  } catch (error) {
    // console.error('Error updating user profile:', error); 
    res.status(500).json({ success: false, message: 'Internal server error' }); 
  }
}); 

// Get user progress/statistics
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id; 

    // Get quiz statistics
    const totalQuizzes = await Quiz.countDocuments({ userId }); 
    const completedQuizzes = await Quiz.countDocuments({ userId, isCompleted: true }); 
    const quizzes = await Quiz.find({ userId, isCompleted: true }); 

    let totalScore = 0; 
    let subjectStats = {}; 

    quizzes.forEach(quiz => {
      totalScore += quiz.score; 
      
      if (!subjectStats[quiz.subject]) {
        subjectStats[quiz.subject] = {
          subject: quiz.subject,
          count: 0,
          totalScore: 0,
          averageScore: 0,
        }; 
      }
      
      subjectStats[quiz.subject].count++; 
      subjectStats[quiz.subject].totalScore += quiz.score; 
    }); 

    // Calculate averages
    const averageScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0; 

    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject]; 
      stats.averageScore = Math.round(stats.totalScore / stats.count); 
    }); 

    // Get recent activity
    const recentQuizzes = await Quiz.find({ userId, isCompleted: true })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('title subject score completedAt'); 

    res.json({
      success: true,
      progress: {
        totalQuizzes,
        completedQuizzes,
        averageScore,
        subjectStats: Object.values(subjectStats),
        recentActivity: recentQuizzes,
      },
    }); 
  } catch (error) {
    // console.error('Error fetching user progress:', error); 
    res.status(500).json({ success: false, message: 'Internal server error' }); 
  }
}); 

// Delete account with password verification
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const { password } = req.body; 

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required to delete account' 
      }); 
    }

    // Find user
    const user = await User.findById(req.user.id); 
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      }); 
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password); 
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      }); 
    }

    // Log account deletion info
    // console.log(`Deleting account for user: ${user.email}`); 
    // console.log(`Current subscription: ${user.subscriptionPlan} until ${user.subscriptionEndDate}`); 

    // Delete all payment records associated with this user
    await Payment.deleteMany({ userId: req.user.id }); 
    // console.log('Payment records deleted'); 

    // Delete user account
    await User.findByIdAndDelete(req.user.id); 
    // console.log('User account deleted successfully'); 

    // Send account deletion confirmation email (non-blocking)
    // console.log('=== ACCOUNT DELETION EMAIL DEBUG ==='); 
    // console.log('User Email:', user.email); 
    // console.log('User Name:', user.name); 
    // console.log('Attempting to send email...'); 
    
    sendAccountDeletionEmail(user.email, user.name)
      .then((result) => {
        // console.log('Email send result:', result); 
        if (result && result.success) {
          // console.log('✓ Account deletion email sent successfully to:', user.email); 
        } else {
          // console.error('✗ Failed to send account deletion email:', result?.error || 'Unknown error'); 
        }
      })
      .catch((err) => {
        // console.error('✗ Exception while sending account deletion email:', err.message); 
        // console.error('Stack:', err.stack); 
      }); 

    res.json({
      success: true,
      message: 'Account deleted successfully. All subscription data has been removed. A confirmation email will be sent shortly.',
      userEmail: user.email
    }); 
  } catch (error) {
    // console.error('Error deleting account:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while deleting account' 
    }); 
  }
}); 

// Test email endpoint (for debugging)
router.post('/test-deletion-email', auth, async (req, res) => {
  try {
    // console.log('\n=== TEST EMAIL ENDPOINT ==='); 
    const user = await User.findById(req.user.id); 
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      }); 
    }

    // console.log('Testing email send to:', user.email); 
    // console.log('User name:', user.name); 

    const result = await sendAccountDeletionEmail(user.email, user.name); 
    
    // console.log('Email function result:', result); 

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        userEmail: user.email,
        timestamp: new Date().toISOString()
      }); 
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      }); 
    }
  } catch (error) {
    console.error('Test email error:', error); 
    res.status(500).json({
      success: false,
      message: 'Error testing email',
      error: error.message
    }); 
  }
}); 

// Get user's streak information
router.get('/streak', auth, async (req, res) => {
  try {
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log('[user routes] Getting streak for user:', req.user.id); 

    const streakInfo = await StreakMaintenanceService.getUserStreak(req.user.id); 

    res.json({
      success: true,
      message: 'User streak information retrieved successfully',
      streak: streakInfo,
    }); 
  } catch (error) {
    console.error('[user routes] Error getting streak:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get streak information',
    }); 
  }
}); 

module.exports = router; 