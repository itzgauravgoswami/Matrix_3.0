const User = require('../models/user'); 
const jwt = require('jsonwebtoken'); 
const { getEmailTemplate } = require('../utils/emailTemplate'); 

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
}; 

// Generate JWT Token for Admin
const generateAdminToken = (adminEmail) => {
  const secret = process.env.JWT_ADMIN_SECRET || 'admin-secret-key-change-in-production'; 
  console.log('🔐 generateAdminToken - Using secret from:', process.env.JWT_ADMIN_SECRET ? 'ENV (JWT_ADMIN_SECRET)' : 'FALLBACK'); 
  const token = jwt.sign({ admin: adminEmail, role: 'admin' }, secret, { expiresIn: '7d' }); 
  console.log('🔐 generateAdminToken - Generated token first 50 chars:', token.substring(0, 50)); 
  return token; 
}; 

// @desc    Admin Login
// @route   POST /api/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body; 

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' }); 
    }

    // Check credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      console.log('❌ Admin login failed - Invalid credentials'); 
      return res.status(401).json({ message: 'Invalid email or password' }); 
    }

    // Generate token
    const token = generateAdminToken(email); 

    console.log('✅ Admin login successful'); 
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: { email },
    }); 
  } catch (error) {
    console.error('Admin login error:', error); 
    res.status(500).json({ message: error.message || 'Admin login failed' }); 
  }
}; 

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password'); 
    
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    }); 
  } catch (error) {
    console.error('Get users error:', error); 
    res.status(500).json({ message: error.message || 'Failed to get users' }); 
  }
}; 

// @desc    Get single user
// @route   GET /api/admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); 
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Calculate quiz limits for free users
    let quizLimits = null; 
    if (user.subscriptionPlan === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7);  // YYYY-MM format
      
      // If extra credits were granted in a different month, clear them
      if (user.extraQuizCreditsGrantedMonth !== currentMonth) {
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
        await user.save(); 
      }
 
      // Calculate total allowed and remaining
      const totalAllowed = 5 + (user.extraQuizCreditsGranted || 0); 
      quizLimits = {
        totalQuizzes: totalAllowed,
        quizzesUsed: user.quizzesPlayedThisMonth || 0,
        quizzesRemaining: totalAllowed - (user.quizzesPlayedThisMonth || 0),
      }; 
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        quizLimits,
        freeQuizCredits: user.subscriptionPlan === 'free' ? (5 + (user.extraQuizCreditsGranted || 0)) : undefined,
      },
    }); 
  } catch (error) {
    console.error('Get user error:', error); 
    res.status(500).json({ message: error.message || 'Failed to get user' }); 
  }
}; 

// @desc    Get comprehensive user details for admin preview
// @route   GET /api/admin/users/:id/preview
exports.getUserPreview = async (req, res, next) => {
  try {
    const Note = require('../models/Note'); 
    const Quiz = require('../models/Quiz'); 
    const QATest = require('../models/QATest'); 
    const DownloadHistory = require('../models/DownloadHistory'); 
    const Payment = require('../models/Payment'); 
    const { decryptPassword } = require('../utils/encryptionUtils'); 
    
    const user = await User.findById(req.params.id); 
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Get user notes with detailed info
    const notes = await Note.find({ userId: req.params.id }).select('subject examType createdAt updatedAt isPinned color'); 
    const notesTopics = [...new Set(notes.map(n => n.subject).filter(Boolean))]; 
    const pinnedNotes = notes.filter(n => n.isPinned).length; 
    const notesExamTypes = [...new Set(notes.map(n => n.examType).filter(Boolean))]; 
    
    // Get user quizzes with detailed stats
    const quizzes = await Quiz.find({ userId: req.params.id }).select('subject examType score totalQuestions createdAt'); 
    const quizzesTopics = [...new Set(quizzes.map(q => q.subject).filter(Boolean))]; 
    const quizzesExamTypes = [...new Set(quizzes.map(q => q.examType).filter(Boolean))]; 
    
    // Calculate quiz stats
    const quizAverageScore = quizzes.length > 0 
      ? (quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length).toFixed(2)
      : 0; 
    const bestQuizScore = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.score || 0)) : 0; 
    const worstQuizScore = quizzes.length > 0 ? Math.min(...quizzes.map(q => q.score || 0)) : 0; 
    
    // Get user QA tests if available
    const qaTests = await QATest.find({ userId: req.params.id }).select('topic score totalQuestions createdAt'); 
    const qaTestsTopics = [...new Set(qaTests.map(q => q.topic).filter(Boolean))]; 
    
    // Calculate QA stats
    const qaAverageScore = qaTests.length > 0
      ? (qaTests.reduce((sum, q) => sum + (q.score || 0), 0) / qaTests.length).toFixed(2)
      : 0; 
    const bestQAScore = qaTests.length > 0 ? Math.max(...qaTests.map(q => q.score || 0)) : 0; 
    const worstQAScore = qaTests.length > 0 ? Math.min(...qaTests.map(q => q.score || 0)) : 0; 

    // Get download history
    const downloadHistory = await DownloadHistory.find({ userId: req.params.id }).select('resourceType resourceName downloadedAt'); 
    const uniqueDownloadTypes = [...new Set(downloadHistory.map(d => d.resourceType).filter(Boolean))]; 

    // Get payment history
    const payments = await Payment.find({ userId: req.params.id }).select('planType amount orderId paymentId status createdAt').sort({ createdAt: -1 }); 
    const totalSpent = payments
      .filter(p => p.status === 'completed' || p.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0); 

    // Count active devices
    let deviceCount = 0; 
    if (user.activeDevice && user.activeDevice.deviceId) {
      deviceCount = 1; 
    }
    if (user.previousDevice && user.previousDevice.deviceId) {
      if (user.previousDevice.deviceId !== user.activeDevice?.deviceId) {
        deviceCount += 1; 
      }
    }

    // Decrypt password
    let decryptedPassword = null; 
    if (user.encryptedPassword) {
      decryptedPassword = decryptPassword(user.encryptedPassword); 
    }

    // Calculate days since signup
    const daysActive = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)); 
    
    // Calculate subscription days remaining
    let daysRemaining = null; 
    if (user.subscriptionEndDate) {
      daysRemaining = Math.max(0, Math.ceil((new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24))); 
    }

    res.status(200).json({
      success: true,
      preview: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'Not provided',
          createdAt: user.createdAt,
          isEmailVerified: user.isEmailVerified,
          isBlocked: user.isBlocked,
          isDeleted: user.isDeleted,
          wasDeleted: user.wasDeleted,
          daysActive: daysActive,
        },
        accountStatus: {
          status: user.isBlocked ? '🔒 Blocked' : user.isDeleted ? '🗑️ Deleted' : user.wasDeleted ? '♻️ Reactivated' : '✅ Active',
          isBlocked: user.isBlocked,
          blockedAt: user.blockedAt,
          blockReason: user.blockReason,
          blockExpiryDate: user.blockExpiryDate,
          isBlockedPermanently: user.isBlockedPermanently,
          isDeleted: user.isDeleted,
          deletedAt: user.deletedAt,
          wasDeleted: user.wasDeleted,
        },
        subscription: {
          plan: user.subscriptionPlan,
          isPremium: user.isPremium,
          period: user.subscriptionPeriod,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
          daysRemaining: daysRemaining,
          purchaseDate: user.subscriptionPurchaseDate,
        },
        security: {
          hasPassword: !!user.password,
          password: decryptedPassword || 'Not available',
          lastLoginAt: user.activeDevice?.lastLoginAt,
          sessionTokenExpiry: user.sessionTokenExpiry,
        },
        devices: {
          count: deviceCount,
          active: user.activeDevice ? {
            deviceId: user.activeDevice.deviceId,
            deviceName: user.activeDevice.deviceName,
            userAgent: user.activeDevice.userAgent,
            ipAddress: user.activeDevice.ipAddress,
            lastLoginAt: user.activeDevice.lastLoginAt,
          } : null,
          previous: user.previousDevice && user.previousDevice.deviceId ? {
            deviceId: user.previousDevice.deviceId,
            deviceName: user.previousDevice.deviceName,
            userAgent: user.previousDevice.userAgent,
            ipAddress: user.previousDevice.ipAddress,
            lastLoginAt: user.previousDevice.lastLoginAt,
          } : null,
        },
        notes: {
          total: notes.length,
          pinned: pinnedNotes,
          topics: notesTopics,
          examTypes: notesExamTypes,
          lastUpdated: notes.length > 0 ? Math.max(...notes.map(n => new Date(n.updatedAt))) : null,
        },
        quizzes: {
          total: quizzes.length,
          topics: quizzesTopics,
          examTypes: quizzesExamTypes,
          averageScore: parseFloat(quizAverageScore),
          bestScore: bestQuizScore,
          worstScore: worstQuizScore,
          lastAttempt: quizzes.length > 0 ? Math.max(...quizzes.map(q => new Date(q.createdAt))) : null,
        },
        qaTests: {
          total: qaTests.length,
          topics: qaTestsTopics,
          averageScore: parseFloat(qaAverageScore),
          bestScore: bestQAScore,
          worstScore: worstQAScore,
          lastAttempt: qaTests.length > 0 ? Math.max(...qaTests.map(q => new Date(q.createdAt))) : null,
        },
        credits: {
          freeQuizCredits: user.subscriptionPlan === 'free' ? (5 + (user.extraQuizCreditsGranted || 0)) : 'Unlimited (Premium)',
          extraCreditsGranted: user.extraQuizCreditsGranted || 0,
          creditsGrantedMonth: user.extraQuizCreditsGrantedMonth,
          quizzesPlayedThisMonth: user.quizzesPlayedThisMonth || 0,
          quizAttemptMonth: user.quizAttemptMonth,
        },
        downloads: {
          total: downloadHistory.length,
          types: uniqueDownloadTypes,
          lastDownload: downloadHistory.length > 0 ? downloadHistory[0].downloadedAt : null,
        },
        payments: {
          totalPayments: payments.length,
          totalSpent: totalSpent,
          successfulPayments: payments.filter(p => p.status === 'completed' || p.status === 'success').length,
          failedPayments: payments.filter(p => p.status === 'failed').length,
          lastPayment: payments.length > 0 ? payments[0] : null,
        },
      },
    }); 
  } catch (error) {
    console.error('Get user preview error:', error); 
    res.status(500).json({ message: error.message || 'Failed to get user preview' }); 
  }
}; 

// @desc    Reset user password (admin functionality)
// @route   POST /api/admin/users/:id/reset-password
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { newPassword } = req.body; 

    // Validation
    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide a new password' }); 
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' }); 
    }

    // Find user
    const user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Update password (pre-save hook will encrypt it)
    user.password = newPassword; 
    await user.save(); 

    console.log(`✅ Password reset for user ${id} (${user.email}) by admin`); 
    res.status(200).json({
      success: true,
      message: 'User password has been reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    }); 
  } catch (error) {
    console.error('Reset password error:', error); 
    res.status(500).json({ message: error.message || 'Failed to reset password' }); 
  }
}; 

// @desc    Update user information
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { name, email, isEmailVerified, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionPeriod, isPremium } = req.body; 

    // Find user
    let user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Update fields
    if (name) user.name = name; 
    if (email) user.email = email; 
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified; 
    
    // Update subscription if provided
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan; 
    if (subscriptionStartDate) user.subscriptionStartDate = new Date(subscriptionStartDate); 
    if (subscriptionEndDate) user.subscriptionEndDate = new Date(subscriptionEndDate); 
    if (subscriptionPeriod) user.subscriptionPeriod = subscriptionPeriod; 
    if (isPremium !== undefined) user.isPremium = isPremium; 

    await user.save(); 

    console.log(`✅ User ${id} updated`); 
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user.toObject({ getters: true, virtuals: false }),
    }); 
  } catch (error) {
    console.error('Update user error:', error); 
    res.status(500).json({ message: error.message || 'Failed to update user' }); 
  }
}; 

// @desc    Grant free access to a plan
// @route   POST /api/admin/users/:id/grant-plan
exports.grantPlan = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { planType, duration } = req.body;  // duration in days

    // Validation
    if (!planType || !duration) {
      return res.status(400).json({ message: 'Please provide planType and duration (in days)' }); 
    }

    // Validate plan type
    const validPlans = ['pro', 'ultimate']; 
    if (!validPlans.includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type. Must be pro or ultimate' }); 
    }

    // Find user
    const user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Calculate subscription dates
    const startDate = new Date(); 
    const endDate = new Date(); 
    endDate.setDate(endDate.getDate() + parseInt(duration)); 

    // Update user subscription with correct field names
    user.subscriptionPlan = planType; 
    user.subscriptionStartDate = startDate; 
    user.subscriptionEndDate = endDate; 
    user.subscriptionPurchaseDate = startDate;  // Track when subscription was purchased
    user.isPremium = true; 
    user.subscriptionPeriod = duration >= 30 ? 'yearly' : 'monthly'; 
    user.isEmailVerified = true;  // Ensure email is verified

    await user.save(); 

    // Send confirmation email
    try {
      const emailService = require('../services/emailService'); 
      const planName = planType === 'pro' ? 'Professional' : 'Ultimate'; 
      await emailService.sendSubscriptionConfirmationEmail(user.email, user.name, planName, endDate); 
    } catch (emailError) {
      console.error('Email sending error:', emailError); 
      // Don't fail the request if email fails
    }

    // Capitalize plan type for display
    const capitalizedPlanType = planType.charAt(0).toUpperCase() + planType.slice(1); 

    console.log(`✅ ${capitalizedPlanType} plan granted to user ${id} until ${endDate}`); 
    res.status(200).json({
      success: true,
      message: `${capitalizedPlanType} plan granted for ${duration} days. Confirmation email sent.`,
      user: user.toObject({ getters: true, virtuals: false }),
      subscriptionEndDate: endDate,
    }); 
  } catch (error) {
    console.error('Grant plan error:', error); 
    res.status(500).json({ message: error.message || 'Failed to grant plan' }); 
  }
}; 

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params; 

    // Find user and mark as deleted
    const user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Mark user as deleted instead of permanently deleting
    user.isDeleted = true; 
    user.deletedAt = new Date(); 
    user.wasDeleted = true; 
    await user.save(); 

    console.log(`✅ User ${id} (${user.email}) marked as deleted by admin at ${user.deletedAt}`); 
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        deletedAt: user.deletedAt,
      },
    }); 
  } catch (error) {
    console.error('Delete user error:', error); 
    res.status(500).json({ message: error.message || 'Failed to delete user' }); 
  }
}; 

// Block user account
exports.blockUser = async (req, res, next) => {
  try {
    const { userId, reason, duration } = req.body; 

    if (!userId || !reason) {
      return res.status(400).json({ message: 'User ID and reason are required' }); 
    }

    // Find user
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Don't allow blocking already deleted or blocked users
    if (user.isDeleted) {
      return res.status(400).json({ message: 'Cannot block a deleted user account' }); 
    }

    if (user.isBlocked) {
      return res.status(400).json({ message: 'User is already blocked' }); 
    }

    // Mark user as blocked
    user.isBlocked = true; 
    user.blockedAt = new Date(); 
    user.blockReason = reason; 
    user.isBlockedPermanently = duration === 'permanent'; 
    
    // Calculate block expiry date based on duration
    if (duration === 'permanent') {
      user.blockExpiryDate = null;  // null means permanent
    } else if (duration === '1d') {
      user.blockExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    } else if (duration === '7d') {
      user.blockExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    } else if (duration === '30d') {
      user.blockExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
    } else if (duration === '90d') {
      user.blockExpiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); 
    } else {
      // Default to 7 days if invalid duration
      user.blockExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    }
    
    await user.save(); 

    // Send block notification email
    const { sendAccountBlockedEmail } = require('../services/emailService'); 
    await sendAccountBlockedEmail(user.email, user.name, reason, duration, user.blockExpiryDate); 

    console.log(`🚫 User ${userId} (${user.email}) blocked by admin. Reason: ${reason}, Duration: ${duration}`); 
    res.status(200).json({
      success: true,
      message: 'User blocked successfully and notification sent',
      blockedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        blockedAt: user.blockedAt,
        blockReason: user.blockReason,
        blockExpiryDate: user.blockExpiryDate,
        isBlockedPermanently: user.isBlockedPermanently,
      },
    }); 
  } catch (error) {
    console.error('Block user error:', error); 
    res.status(500).json({ message: error.message || 'Failed to block user' }); 
  }
}; 

// Unblock user account
exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.body; 

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' }); 
    }

    // Find user
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    if (!user.isBlocked) {
      return res.status(400).json({ message: 'User is not blocked' }); 
    }

    // Unblock user
    user.isBlocked = false; 
    user.blockedAt = null; 
    user.blockReason = null; 
    await user.save(); 

    // Send unblock notification email
    const { sendAccountUnblockedEmail } = require('../services/emailService'); 
    await sendAccountUnblockedEmail(user.email, user.name); 

    console.log(`✅ User ${userId} (${user.email}) unblocked by admin`); 
    res.status(200).json({
      success: true,
      message: 'User unblocked successfully and notification sent',
      unblockedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    }); 
  } catch (error) {
    console.error('Unblock user error:', error); 
    res.status(500).json({ message: error.message || 'Failed to unblock user' }); 
  }
}; 

// @desc    Search users
// @route   GET /api/admin/users/search/:query
exports.searchUsers = async (req, res, next) => {
  try {
    const { query } = req.params; 

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('-password'); 

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    }); 
  } catch (error) {
    console.error('Search users error:', error); 
    res.status(500).json({ message: error.message || 'Failed to search users' }); 
  }
}; 

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments(); 
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true }); 
    const unverifiedUsers = await User.countDocuments({ isEmailVerified: false }); 
    const premiumUsers = await User.countDocuments({ isPremium: true }); 
    const freeUsers = await User.countDocuments({ isPremium: false }); 
    const deletedUsers = await User.countDocuments({ isDeleted: true }); 
    const blockedUsers = await User.countDocuments({ isBlocked: true }); 

    // Plans breakdown
    const planStats = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]); 

    // Active subscriptions (not expired)
    const now = new Date(); 
    const activeSubscriptions = await User.countDocuments({
      isPremium: true,
      subscriptionEndDate: { $gt: now },
    }); 

    // Expired subscriptions
    const expiredSubscriptions = await User.countDocuments({
      isPremium: true,
      subscriptionEndDate: { $lte: now },
    }); 

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        premiumUsers,
        freeUsers,
        deletedUsers,
        blockedUsers,
        activeSubscriptions,
        expiredSubscriptions,
        planStats: planStats.length > 0 ? planStats : [
          { _id: 'free', count: freeUsers },
          { _id: 'pro', count: 0 },
          { _id: 'ultimate', count: 0 },
        ],
      },
    }); 
  } catch (error) {
    console.error('Dashboard stats error:', error); 
    res.status(500).json({ message: error.message || 'Failed to fetch stats' }); 
  }
}; 

// @desc    Send notification to users
// @route   POST /api/admin/send-notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { mode, subject, message, userId } = req.body; 

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' }); 
    }

    const nodemailer = require('nodemailer'); 
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }); 

    let targetUsers = []; 

    if (mode === 'all') {
      // Send to all non-deleted users
      targetUsers = await User.find({ isDeleted: false }).select('email name'); 
    } else if (mode === 'specific' && userId) {
      // Send to specific user
      targetUsers = await User.findById(userId).select('email name isDeleted'); 
      if (!targetUsers) {
        return res.status(404).json({ message: 'User not found' }); 
      }
      if (targetUsers.isDeleted) {
        return res.status(400).json({ message: 'Cannot send notification to a deleted user account' }); 
      }
      targetUsers = [targetUsers]; 
    } else {
      return res.status(400).json({ message: 'Invalid mode or missing userId' }); 
    }

    // Helper function to generate email template
    const getEmailTemplate = (userName, messageContent, mailType = 'notification') => {
      const colorMap = {
        notification: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' }, // Blue
        promotion: { primary: '#10B981', secondary: '#047857', accent: '#6EE7B7' }, // Green
        announcement: { primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' }, // Amber
        alert: { primary: '#EF4444', secondary: '#991B1B', accent: '#FCA5A5' }, // Red
      }; 

      const colors = colorMap[mailType] || colorMap.notification; 

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;  background-color: #f5f5f5;  margin: 0;  padding: 0;  }
              .container { max-width: 600px;  margin: 0 auto;  background-color: #ffffff;  border-radius: 12px;  overflow: hidden;  box-shadow: 0 4px 6px rgba(0,0,0,0.1);  }
              .header { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);  padding: 40px 30px;  text-align: center;  color: white;  }
              .header h1 { margin: 0;  font-size: 28px;  font-weight: bold;  }
              .header p { margin: 5px 0 0 0;  font-size: 14px;  opacity: 0.9;  }
              .content { padding: 40px 30px;  }
              .message-box { background-color: ${colors.accent}15;  border-left: 4px solid ${colors.primary};  padding: 20px;  border-radius: 6px;  margin: 20px 0;  }
              .message-box p { margin: 0;  color: #333;  line-height: 1.6;  }
              .footer { background-color: #f9fafb;  padding: 25px 30px;  text-align: center;  border-top: 1px solid #e5e7eb;  }
              .footer p { margin: 5px 0;  font-size: 12px;  color: #6b7280;  }
              .logo { display: inline-block;  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);  color: white;  padding: 10px 20px;  border-radius: 6px;  font-weight: bold;  margin-bottom: 10px;  }
              .divider { height: 2px;  background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);  margin: 20px 0;  }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">✨ Self Ranker</div>
                <h1>${subject}</h1>
              </div>
              <div class="content">
                <p style="margin: 0 0 20px 0;  color: #333;  font-size: 16px; ">Hello <strong>${userName}</strong>,</p>
                <div class="message-box">
                  <p>${messageContent.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="divider"></div>
                <p style="margin: 20px 0 0 0;  color: #6b7280;  font-size: 14px;  line-height: 1.6; ">
                  If you have any questions or need further assistance, please don't hesitate to reach out to us.
                </p>
              </div>
              <div class="footer">
                <p><strong>Self Ranker</strong> - Your Learning Platform</p>
                <p>© 2025 Self Ranker. All rights reserved.</p>
                <p style="margin-top: 10px;  color: #999; ">This is an automated message, please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `; 
    }; 

    // Send emails
    let successCount = 0; 
    for (const user of targetUsers) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: subject,
          html: getEmailTemplate(user.name, message, 'notification'),
        }); 
        successCount++; 
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError); 
      }
    }

    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${successCount} user(s)`,
      count: successCount,
    }); 
  } catch (error) {
    console.error('Send notification error:', error); 
    res.status(500).json({ message: error.message || 'Failed to send notification' }); 
  }
}; 

// @desc    Grant bulk plan access to users
// @route   POST /api/admin/grant-bulk-access
exports.grantBulkAccess = async (req, res, next) => {
  try {
    const { mode, planType, duration, userType, userId } = req.body; 

    if (!planType || !duration) {
      return res.status(400).json({ message: 'Plan type and duration are required' }); 
    }

    const nodemailer = require('nodemailer'); 
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }); 

    let allUsers = []; 
    const durationDays = parseInt(duration); 
    const extensionDate = new Date(); 
    extensionDate.setDate(extensionDate.getDate() + durationDays); 

    if (mode === 'all') {
      // Get all non-deleted users
      allUsers = await User.find({ isDeleted: false }); 
    } else if (mode === 'userType' && userType) {
      // Get non-deleted users with specific plan type
      allUsers = await User.find({ subscriptionPlan: userType, isDeleted: false }); 
    } else if (mode === 'specific' && userId) {
      // Get specific user
      const user = await User.findById(userId); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' }); 
      }
      if (user.isDeleted) {
        return res.status(400).json({ message: 'Cannot grant access to a deleted user account' }); 
      }
      allUsers = [user]; 
    } else {
      return res.status(400).json({ message: 'Invalid mode or missing parameters' }); 
    }

    // Process users based on plan type hierarchy
    let successCount = 0; 
    const planHierarchy = { free: 0, pro: 1, ultimate: 2 }; 
    const giveawayLevel = planHierarchy[planType]; 

    for (const user of allUsers) {
      try {
        const userLevel = planHierarchy[user.subscriptionPlan] || 0; 
        let emailSubject = ''; 
        let emailMessage = ''; 
        let shouldUpdate = false; 

        if (planType === 'pro') {
          // Pro giveaway logic
          if (userLevel === 0) {
            // Free users: Grant Pro access
            user.subscriptionPlan = 'pro'; 
            user.isPremium = true; 
            user.subscriptionStartDate = new Date(); 
            user.subscriptionEndDate = extensionDate; 
            user.subscriptionPurchaseDate = new Date();  // Track purchase date
            emailSubject = '🎁 Congratulations! You\'ve Unlocked Pro Plan'; 
            emailMessage = `We're excited to grant you access to our premium <strong>Pro</strong> plan!\n\nYou now have access to all exclusive features and content for the next <strong>${durationDays} days</strong>.\n\nMake the most of your premium subscription and accelerate your learning journey with us.`; 
            shouldUpdate = true; 
          } else if (userLevel === 1) {
            // Pro users: Extend validity
            const currentEndDate = new Date(user.subscriptionEndDate); 
            currentEndDate.setDate(currentEndDate.getDate() + durationDays); 
            user.subscriptionEndDate = currentEndDate; 
            emailSubject = '⏰ Your Pro Plan Validity Extended!'; 
            emailMessage = `Great news! Your <strong>Pro</strong> plan validity has been extended!\n\nYour subscription is now valid until <strong>${currentEndDate.toLocaleDateString()}</strong> (extended by ${durationDays} days).\n\nContinue enjoying your premium features!`; 
            shouldUpdate = true; 
          } else if (userLevel === 2) {
            // Ultimate users: Extend their Ultimate plan validity (not downgrade)
            const currentEndDate = new Date(user.subscriptionEndDate); 
            currentEndDate.setDate(currentEndDate.getDate() + durationDays); 
            user.subscriptionEndDate = currentEndDate; 
            emailSubject = '⏰ Your Ultimate Plan Validity Extended!'; 
            emailMessage = `Excellent! Your <strong>Ultimate</strong> plan validity has been extended!\n\nYour subscription is now valid until <strong>${currentEndDate.toLocaleDateString()}</strong> (extended by ${durationDays} days).\n\nKeep enjoying all premium features!`; 
            shouldUpdate = true; 
          }
        } else if (planType === 'ultimate') {
          // Ultimate giveaway logic
          if (userLevel === 0 || userLevel === 1) {
            // Free & Pro users: Grant Ultimate access
            user.subscriptionPlan = 'ultimate'; 
            user.isPremium = true; 
            user.subscriptionStartDate = new Date(); 
            user.subscriptionEndDate = extensionDate; 
            user.subscriptionPurchaseDate = new Date();  // Track purchase date
            const fromPlan = userLevel === 0 ? 'Free' : 'Pro'; 
            emailSubject = '👑 Congratulations! You\'ve Unlocked Ultimate Plan'; 
            emailMessage = `We're thrilled to upgrade you from ${fromPlan} to our premium <strong>Ultimate</strong> plan!\n\nYou now have access to all exclusive features and content for the next <strong>${durationDays} days</strong>.\n\nExperience the full power of Self Ranker with your Ultimate subscription!`; 
            shouldUpdate = true; 
          } else if (userLevel === 2) {
            // Ultimate users: Extend validity
            const currentEndDate = new Date(user.subscriptionEndDate); 
            currentEndDate.setDate(currentEndDate.getDate() + durationDays); 
            user.subscriptionEndDate = currentEndDate; 
            emailSubject = '⏰ Your Ultimate Plan Validity Extended!'; 
            emailMessage = `Excellent! Your <strong>Ultimate</strong> plan validity has been extended!\n\nYour subscription is now valid until <strong>${currentEndDate.toLocaleDateString()}</strong> (extended by ${durationDays} days).\n\nContinue enjoying premium features!`; 
            shouldUpdate = true; 
          }
        }

        if (shouldUpdate) {
          await user.save(); 
          successCount++; 

          // Send email notification
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: user.email,
              subject: emailSubject,
              html: getEmailTemplate(user.name, emailMessage, 'planGrant'),
            }); 
          } catch (emailError) {
            console.error(`Failed to send plan grant email to ${user.email}:`, emailError); 
            // Don't fail the whole operation if email fails
          }
        }
      } catch (updateError) {
        console.error(`Failed to update user ${user._id}:`, updateError); 
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${planType} giveaway for ${successCount} user(s)`,
      count: successCount,
    }); 
  } catch (error) {
    console.error('Grant bulk access error:', error); 
    res.status(500).json({ message: error.message || 'Failed to grant bulk access' }); 
  }
}; 

// @desc    Cancel subscription for users
// @route   POST /api/admin/cancel-subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { mode, planType, userId } = req.body; 

    const nodemailer = require('nodemailer'); 
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }); 

    let targetUsers = []; 

    if (mode === 'all') {
      // Cancel for all non-deleted users with active subscriptions
      targetUsers = await User.find({ isPremium: true, isDeleted: false }); 
    } else if (mode === 'planType' && planType) {
      // Cancel for non-deleted users with specific plan type
      targetUsers = await User.find({ 
        subscriptionPlan: planType,
        isPremium: true,
        isDeleted: false
      }); 
    } else if (mode === 'specific' && userId) {
      // Cancel for specific user
      const user = await User.findById(userId); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' }); 
      }
      if (user.isDeleted) {
        return res.status(400).json({ message: 'Cannot cancel subscription for a deleted user account' }); 
      }
      targetUsers = [user]; 
    } else {
      return res.status(400).json({ message: 'Invalid mode or missing parameters' }); 
    }

    // Cancel subscriptions and send emails
    let successCount = 0; 
    for (const user of targetUsers) {
      try {
        const previousPlan = user.subscriptionPlan; 
        
        // Cancel subscription
        user.subscriptionPlan = 'free'; 
        user.isPremium = false; 
        user.subscriptionStartDate = null; 
        user.subscriptionEndDate = null; 
        await user.save(); 
        successCount++; 

        // Send cancellation email
        try {
          const emailSubject = `📢 Your Subscription Has Been Cancelled`; 
          const emailMessage = `Your <strong>${previousPlan.charAt(0).toUpperCase() + previousPlan.slice(1)}</strong> subscription has been cancelled.\n\nYou now have access to the <strong>Free Plan</strong> with basic features.\n\nIf you have any questions about this cancellation, please contact our support team.`; 

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: emailSubject,
            html: getEmailTemplate(user.name, emailMessage, 'cancellation'),
          }); 
        } catch (emailError) {
          console.error(`Failed to send cancellation email to ${user.email}:`, emailError); 
          // Don't fail the whole operation if email fails
        }
      } catch (updateError) {
        console.error(`Failed to cancel subscription for user ${user._id}:`, updateError); 
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully cancelled subscription for ${successCount} user(s)`,
      count: successCount,
    }); 
  } catch (error) {
    console.error('Cancel subscription error:', error); 
    res.status(500).json({ message: error.message || 'Failed to cancel subscriptions' }); 
  }
}; 

// @desc    Grant free quiz credits to a user
// @route   POST /api/admin/users/:id/grant-quiz-credits
exports.grantFreeQuizCredits = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { creditsToAdd } = req.body; 

    // Validation
    if (!creditsToAdd || isNaN(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of credits (greater than 0)',
      }); 
    }

    // Find user
    const user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7);  // YYYY-MM format

    // Grant extra credits for this month only
    user.extraQuizCreditsGranted = (user.extraQuizCreditsGranted || 0) + parseInt(creditsToAdd); 
    user.extraQuizCreditsGrantedMonth = currentMonth; 
    await user.save(); 

    // Calculate display values
    const totalCredits = 5 + user.extraQuizCreditsGranted; 
    const remainingCredits = totalCredits - user.quizzesPlayedThisMonth; 

    res.status(200).json({
      success: true,
      message: `Successfully granted ${creditsToAdd} quiz credits to ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        freeQuizCredits: totalCredits,
        extraQuizCreditsGranted: user.extraQuizCreditsGranted,
        quizzesPlayedThisMonth: user.quizzesPlayedThisMonth,
        quizzesRemaining: remainingCredits,
      },
    }); 
  } catch (error) {
    console.error('Grant quiz credits error:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to grant quiz credits',
    }); 
  }
}; 

// @desc    Trigger daily streak maintenance (Admin only)
// @route   POST /api/admin/streaks/maintenance
exports.triggerStreakMaintenance = async (req, res) => {
  try {
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log('[adminController] Triggering manual streak maintenance...'); 

    const result = await StreakMaintenanceService.processDailyStreakMaintenance(); 

    res.status(200).json({
      success: true,
      message: 'Streak maintenance triggered successfully',
      result,
    }); 
  } catch (error) {
    console.error('[adminController] Streak maintenance error:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger streak maintenance',
    }); 
  }
}; 

// @desc    Get streak statistics (Admin only)
// @route   GET /api/admin/streaks/statistics
exports.getStreakStatistics = async (req, res) => {
  try {
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log('[adminController] Getting streak statistics...'); 

    const stats = await StreakMaintenanceService.getStreakStatistics(); 

    res.status(200).json({
      success: true,
      message: 'Streak statistics retrieved successfully',
      statistics: stats,
    }); 
  } catch (error) {
    console.error('[adminController] Error getting streak statistics:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get streak statistics',
    }); 
  }
}; 

// @desc    Get all active users (Admin only)
// @route   GET /api/admin/streaks/active-users
exports.getActiveUsers = async (req, res) => {
  try {
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log('[adminController] Getting active users...'); 

    const activeUsers = await StreakMaintenanceService.getActiveUsers(); 

    res.status(200).json({
      success: true,
      message: 'Active users retrieved successfully',
      count: activeUsers.length,
      activeUsers,
    }); 
  } catch (error) {
    console.error('[adminController] Error getting active users:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get active users',
    }); 
  }
}; 

// @desc    Reset user streak (Admin only)
// @route   POST /api/admin/streaks/:userId/reset
exports.resetUserStreak = async (req, res) => {
  try {
    const { userId } = req.params; 
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log(`[adminController] Resetting streak for user: ${userId}`); 

    const streak = await StreakMaintenanceService.resetUserStreak(userId); 

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'User streak not found',
      }); 
    }

    res.status(200).json({
      success: true,
      message: 'User streak reset successfully',
      streak,
    }); 
  } catch (error) {
    console.error('[adminController] Error resetting user streak:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset user streak',
    }); 
  }
}; 

// @desc    Get user's streak info (Admin only)
// @route   GET /api/admin/streaks/:userId
exports.getUserStreak = async (req, res) => {
  try {
    const { userId } = req.params; 
    const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
    console.log(`[adminController] Getting streak for user: ${userId}`); 

    const streakInfo = await StreakMaintenanceService.getUserStreak(userId); 

    res.status(200).json({
      success: true,
      message: 'User streak information retrieved successfully',
      streakInfo,
    }); 
  } catch (error) {
    console.error('[adminController] Error getting user streak:', error); 
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user streak',
    }); 
  }
}; 