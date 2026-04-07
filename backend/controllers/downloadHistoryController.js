const DownloadHistory = require('../models/DownloadHistory'); 
const User = require('../models/user'); 

// Record a download
exports.recordDownload = async (req, res) => {
  try {
    const { type } = req.body; 

    // Validate type
    if (!type || !['notes', 'quiz', 'qa'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid download type',
      }); 
    }

    // Check if free user has exceeded limit
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    // Only check limits for free users
    if (user.subscriptionPlan === 'free') {
      const now = new Date(); 
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); 

      const FREE_PLAN_DOWNLOAD_LIMIT = 10; 

      const downloadsThisMonth = await DownloadHistory.countDocuments({
        userId: req.user.id,
        type: type,
        downloadedAt: { $gte: currentMonth, $lt: nextMonth },
      }); 

      if (downloadsThisMonth >= FREE_PLAN_DOWNLOAD_LIMIT) {
        return res.status(403).json({
          success: false,
          message: `Free plan download limit exceeded. You have used ${downloadsThisMonth}/${FREE_PLAN_DOWNLOAD_LIMIT} downloads this month.`,
          errorCode: 'DOWNLOAD_LIMIT_EXCEEDED',
          remainingDownloads: 0,
          maxDownloads: FREE_PLAN_DOWNLOAD_LIMIT,
        }); 
      }
    }

    // Record the download
    const downloadRecord = new DownloadHistory({
      userId: req.user.id,
      type: type,
    }); 

    await downloadRecord.save(); 

    res.json({
      success: true,
      message: 'Download recorded',
      downloadRecord,
    }); 
  } catch (error) {
    console.error('Error recording download:', error); 
    res.status(500).json({
      success: false,
      message: 'Error recording download',
    }); 
  }
}; 

// Get download history for user
exports.getDownloadHistory = async (req, res) => {
  try {
    const history = await DownloadHistory.find({ userId: req.user.id })
      .sort({ downloadedAt: -1 })
      .limit(100); 

    res.json({
      success: true,
      history,
    }); 
  } catch (error) {
    console.error('Error fetching download history:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching download history',
    }); 
  }
}; 
 