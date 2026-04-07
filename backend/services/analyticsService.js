const UserAnalytics = require('../models/UserAnalytics'); 
const Quiz = require('../models/Quiz'); 
const Note = require('../models/Note'); 
const QATest = require('../models/QATest'); 

class AnalyticsService {
  /**
   * Initialize or update user analytics
   */
  static async initializeAnalytics(userId) {
    try {
      let analytics = await UserAnalytics.findOne({ userId }); 

      if (!analytics) {
        analytics = new UserAnalytics({ userId }); 
        await analytics.save(); 
      }

      return analytics; 
    } catch (error) {
      console.error('Error initializing analytics:', error); 
      return null; 
    }
  }

  /**
   * Update analytics after quiz completion
   */
  static async updateQuizAnalytics(userId, quizData) {
    try {
      console.log('updateQuizAnalytics called with:', { userId, quizData }); 
      
      let analytics = await UserAnalytics.findOne({ userId }); 

      if (!analytics) {
        console.log('Creating new analytics for user:', userId); 
        analytics = new UserAnalytics({ userId }); 
      }

      // Update total quizzes
      analytics.totalQuizzesTaken += 1; 
      console.log('Total quizzes now:', analytics.totalQuizzesTaken); 

      // Update subject performance
      let subjectPerf = analytics.subjectPerformance.find(
        sp => sp.subject === quizData.subject
      ); 

      if (!subjectPerf) {
        console.log('Creating new subject performance for:', quizData.subject); 
        subjectPerf = {
          subject: quizData.subject,
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 100
        }; 
        analytics.subjectPerformance.push(subjectPerf); 
      }

      subjectPerf.totalAttempts += 1; 
      subjectPerf.lastAttempt = new Date(); 

      // Update best and worst scores
      if (quizData.score > subjectPerf.bestScore) {
        subjectPerf.bestScore = quizData.score; 
      }
      if (quizData.score < subjectPerf.worstScore) {
        subjectPerf.worstScore = quizData.score; 
      }

      // Update average (properly calculate running average)
      const oldSum = subjectPerf.averageScore * (subjectPerf.totalAttempts - 1); 
      subjectPerf.averageScore = (oldSum + quizData.score) / subjectPerf.totalAttempts; 
      
      console.log('Subject performance updated:', {
        subject: subjectPerf.subject,
        attempts: subjectPerf.totalAttempts,
        average: subjectPerf.averageScore,
        best: subjectPerf.bestScore,
        worst: subjectPerf.worstScore
      }); 

      // Update overall average - sum all scores from all subjects
      let totalScore = 0; 
      let totalAttempts = 0; 
      analytics.subjectPerformance.forEach(sp => {
        totalScore += sp.averageScore * sp.totalAttempts; 
        totalAttempts += sp.totalAttempts; 
      }); 
      analytics.overallAverageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0; 
      
      console.log('Overall average score updated:', analytics.overallAverageScore); 

      // Update daily stats
      const today = new Date(); 
      today.setHours(0, 0, 0, 0); 
      
      let dailyStat = analytics.dailyLearningStats.find(
        ds => new Date(ds.date).toDateString() === today.toDateString()
      ); 

      if (!dailyStat) {
        dailyStat = {
          date: today,
          studyTimeMinutes: 0,
          quizzesCompleted: 0,
          averageScore: 0,
          notesCreated: 0
        }; 
        analytics.dailyLearningStats.push(dailyStat); 
      }

      dailyStat.quizzesCompleted += 1; 
      dailyStat.averageScore = (dailyStat.averageScore * (dailyStat.quizzesCompleted - 1) + quizData.score) / dailyStat.quizzesCompleted; 

      analytics.updatedAt = new Date(); 
      
      // Mark as modified to ensure save works
      analytics.markModified('subjectPerformance'); 
      analytics.markModified('dailyLearningStats'); 
      analytics.markModified('overallAverageScore'); 
      analytics.markModified('totalQuizzesTaken'); 
      
      await analytics.save(); 
      console.log('Analytics saved successfully'); 

      return analytics; 
    } catch (error) {
      console.error('Error updating quiz analytics:', error.message); 
      console.error('Stack:', error.stack); 
      return null; 
    }
  }

  /**
   * Update weak and strong topics
   */
  static async updateTopicPerformance(userId) {
    try {
      let analytics = await UserAnalytics.findOne({ userId }); 

      if (!analytics) {
        return null; 
      }

      // Reset topics
      analytics.weakTopics = []; 
      analytics.strongTopics = []; 

      // Get all quiz attempts
      const quizzes = await Quiz.find({ userId }); 

      // Aggregate by topic
      const topicMap = {}; 
      quizzes.forEach(quiz => {
        if (!topicMap[quiz.subject]) {
          topicMap[quiz.subject] = {
            scores: [],
            attempts: 0,
            successes: 0,
            failures: 0
          }; 
        }
        topicMap[quiz.subject].scores.push(quiz.score); 
        topicMap[quiz.subject].attempts += 1; 
        if (quiz.score >= 70) {
          topicMap[quiz.subject].successes += 1; 
        } else {
          topicMap[quiz.subject].failures += 1; 
        }
      }); 

      // Classify topics
      Object.entries(topicMap).forEach(([topic, data]) => {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length; 

        if (avgScore < 60) {
          analytics.weakTopics.push({
            topic,
            averageScore: Math.round(avgScore),
            failureCount: data.failures,
            totalAttempts: data.attempts
          }); 
        } else if (avgScore >= 80) {
          analytics.strongTopics.push({
            topic,
            averageScore: Math.round(avgScore),
            successCount: data.successes,
            totalAttempts: data.attempts
          }); 
        }
      }); 

      analytics.weakTopics.sort((a, b) => a.averageScore - b.averageScore); 
      analytics.strongTopics.sort((a, b) => b.averageScore - a.averageScore); 

      analytics.updatedAt = new Date(); 
      await analytics.save(); 

      return analytics; 
    } catch (error) {
      console.error('Error updating topic performance:', error); 
      return null; 
    }
  }

  /**
   * Calculate learning heatmap
   */
  static async generateLearningHeatmap(userId) {
    try {
      let analytics = await UserAnalytics.findOne({ userId }); 

      if (!analytics) {
        return null; 
      }

      const heatmap = []; 
      const today = new Date(); 

      // Last 365 days
      for (let i = 365;  i >= 0;  i--) {
        const date = new Date(today); 
        date.setDate(date.getDate() - i); 
        date.setHours(0, 0, 0, 0); 

        const dailyStat = analytics.dailyLearningStats.find(
          ds => new Date(ds.date).toDateString() === date.toDateString()
        ); 

        const intensity = dailyStat 
          ? Math.min(5, Math.ceil((dailyStat.quizzesCompleted + dailyStat.notesCreated) / 5))
          : 0; 

        heatmap.push({
          date,
          intensity
        }); 
      }

      analytics.learningHeatmap = heatmap; 
      analytics.updatedAt = new Date(); 
      await analytics.save(); 

      return heatmap; 
    } catch (error) {
      console.error('Error generating heatmap:', error); 
      return null; 
    }
  }

  /**
   * Get comprehensive analytics for user
   */
  static async getUserAnalytics(userId) {
    try {
      let analytics = await UserAnalytics.findOne({ userId }); 

      if (!analytics) {
        analytics = await this.initializeAnalytics(userId); 
      }

      // Update analytics
      await this.updateTopicPerformance(userId); 
      await this.generateLearningHeatmap(userId); 

      // Recalculate predictive metrics
      if (analytics.subjectPerformance.length > 0) {
        const avgScore = analytics.overallAverageScore; 
        const trend = this.calculateTrend(analytics.dailyLearningStats); 
        
        analytics.predictedPerformance = {
          estimatedNextExamScore: avgScore,
          improvementTrend: trend,
          recommendedFocusAreas: analytics.weakTopics.map(t => t.topic).slice(0, 3)
        }; 

        analytics.updatedAt = new Date(); 
        await analytics.save(); 
      }

      return analytics; 
    } catch (error) {
      console.error('Error getting user analytics:', error); 
      return null; 
    }
  }

  /**
   * Calculate improvement trend
   */
  static calculateTrend(dailyStats) {
    if (dailyStats.length < 2) return 'stable'; 

    const recentWeek = dailyStats.slice(-7); 
    const previousWeek = dailyStats.slice(-14, -7); 

    if (recentWeek.length === 0 || previousWeek.length === 0) {
      return 'stable'; 
    }

    const recentAvg = recentWeek.reduce((sum, d) => sum + d.averageScore, 0) / recentWeek.length; 
    const prevAvg = previousWeek.reduce((sum, d) => sum + d.averageScore, 0) / previousWeek.length; 

    if (recentAvg > prevAvg + 5) return 'improving'; 
    if (recentAvg < prevAvg - 5) return 'declining'; 
    return 'stable'; 
  }

  /**
   * Recalculate analytics from fresh quiz data (Real-time update)
   */
  static async recalculateAnalyticsFromQuizzes(userId) {
    try {
      console.log('Recalculating analytics from quizzes for user:', userId); 
      
      let analytics = await UserAnalytics.findOne({ userId }); 
      if (!analytics) {
        analytics = new UserAnalytics({ userId }); 
      }

      // Get all completed quizzes
      const quizzes = await Quiz.find({ userId, isCompleted: true }); 
      console.log('Found', quizzes.length, 'completed quizzes'); 

      // Reset calculated fields
      analytics.totalQuizzesTaken = quizzes.length; 
      analytics.subjectPerformance = []; 
      analytics.dailyLearningStats = []; 
      analytics.overallAverageScore = 0; 

      if (quizzes.length === 0) {
        analytics.updatedAt = new Date(); 
        await analytics.save(); 
        console.log('No quizzes found, returning empty analytics'); 
        return analytics; 
      }

      // Aggregate by subject
      const subjectMap = {}; 
      const dailyMap = {}; 
      let totalScore = 0; 

      quizzes.forEach(quiz => {
        // Subject performance
        if (!subjectMap[quiz.subject]) {
          subjectMap[quiz.subject] = {
            subject: quiz.subject,
            scores: [],
            bestScore: 0,
            worstScore: 100,
            lastAttempt: null
          }; 
        }

        subjectMap[quiz.subject].scores.push(quiz.score); 
        subjectMap[quiz.subject].bestScore = Math.max(subjectMap[quiz.subject].bestScore, quiz.score); 
        subjectMap[quiz.subject].worstScore = Math.min(subjectMap[quiz.subject].worstScore, quiz.score); 
        subjectMap[quiz.subject].lastAttempt = new Date(quiz.completedAt); 

        // Daily stats
        const quizDate = new Date(quiz.completedAt); 
        quizDate.setHours(0, 0, 0, 0); 
        const dateKey = quizDate.toISOString(); 

        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            date: quizDate,
            quizzesCompleted: 0,
            scores: [],
            studyTimeMinutes: 0,
            notesCreated: 0
          }; 
        }

        dailyMap[dateKey].quizzesCompleted += 1; 
        dailyMap[dateKey].scores.push(quiz.score); 

        totalScore += quiz.score; 
      }); 

      // Build subject performance
      Object.values(subjectMap).forEach(subj => {
        const avgScore = subj.scores.reduce((a, b) => a + b, 0) / subj.scores.length; 
        analytics.subjectPerformance.push({
          subject: subj.subject,
          totalAttempts: subj.scores.length,
          averageScore: Math.round(avgScore * 100) / 100,
          bestScore: subj.bestScore,
          worstScore: subj.worstScore,
          lastAttempt: subj.lastAttempt
        }); 
      }); 

      // Build daily learning stats
      Object.values(dailyMap).forEach(daily => {
        const avgScore = daily.scores.reduce((a, b) => a + b, 0) / daily.scores.length; 
        analytics.dailyLearningStats.push({
          date: daily.date,
          quizzesCompleted: daily.quizzesCompleted,
          averageScore: Math.round(avgScore * 100) / 100,
          studyTimeMinutes: daily.studyTimeMinutes,
          notesCreated: daily.notesCreated
        }); 
      }); 

      // Calculate overall average
      analytics.overallAverageScore = Math.round((totalScore / quizzes.length) * 100) / 100; 

      console.log('Analytics recalculated:', {
        totalQuizzes: analytics.totalQuizzesTaken,
        overallAverage: analytics.overallAverageScore,
        subjects: analytics.subjectPerformance.length
      }); 

      analytics.updatedAt = new Date(); 
      analytics.markModified('subjectPerformance'); 
      analytics.markModified('dailyLearningStats'); 
      analytics.markModified('totalQuizzesTaken'); 
      analytics.markModified('overallAverageScore'); 
      
      await analytics.save(); 
      console.log('Analytics recalculation saved successfully'); 

      return analytics; 
    } catch (error) {
      console.error('Error recalculating analytics:', error.message); 
      return null; 
    }
  }

  /**
   * Recalculate analytics from actual database records (real-time)
   */
  static async recalculateAnalyticsFromQuizzes(userId) {
    try {
      console.log('Recalculating analytics from quizzes for user:', userId); 
      
      // Get all completed quizzes
      const quizzes = await Quiz.find({ userId, isCompleted: true }); 
      const qaTests = await QATest.find({ userId, status: 'completed' }); 
      const notes = await Note.find({ userId }); 

      console.log(`Found ${quizzes.length} quizzes, ${qaTests.length} QA tests, ${notes.length} notes`); 

      let analytics = await UserAnalytics.findOne({ userId }); 
      if (!analytics) {
        analytics = new UserAnalytics({ userId }); 
      }

      // Reset subject performance
      analytics.subjectPerformance = []; 
      
      // Process quizzes
      const subjectMap = {}; 
      
      // Add quiz data
      quizzes.forEach(quiz => {
        const subject = quiz.subject || 'General'; 
        if (!subjectMap[subject]) {
          subjectMap[subject] = {
            attempts: 0,
            scores: [],
            bestScore: 0,
            worstScore: 100,
            lastAttempt: null
          }; 
        }
        subjectMap[subject].attempts += 1; 
        subjectMap[subject].scores.push(quiz.score || 0); 
        if (quiz.score > subjectMap[subject].bestScore) {
          subjectMap[subject].bestScore = quiz.score; 
        }
        if (quiz.score < subjectMap[subject].worstScore) {
          subjectMap[subject].worstScore = quiz.score; 
        }
        if (!subjectMap[subject].lastAttempt || quiz.completedAt > subjectMap[subject].lastAttempt) {
          subjectMap[subject].lastAttempt = quiz.completedAt; 
        }
      }); 

      // Add QA test data
      qaTests.forEach(qaTest => {
        const subject = qaTest.subject || 'General'; 
        if (!subjectMap[subject]) {
          subjectMap[subject] = {
            attempts: 0,
            scores: [],
            bestScore: 0,
            worstScore: 100,
            lastAttempt: null
          }; 
        }
        subjectMap[subject].attempts += 1; 
        const score = qaTest.scorePercentage || 0; 
        subjectMap[subject].scores.push(score); 
        if (score > subjectMap[subject].bestScore) {
          subjectMap[subject].bestScore = score; 
        }
        if (score < subjectMap[subject].worstScore) {
          subjectMap[subject].worstScore = score; 
        }
        if (!subjectMap[subject].lastAttempt || qaTest.completedAt > subjectMap[subject].lastAttempt) {
          subjectMap[subject].lastAttempt = qaTest.completedAt; 
        }
      }); 

      // Convert to array and calculate averages
      let totalScore = 0; 
      let totalAttempts = 0; 
      
      Object.entries(subjectMap).forEach(([subject, data]) => {
        const avgScore = data.scores.length > 0 
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length 
          : 0; 
        
        analytics.subjectPerformance.push({
          subject,
          totalAttempts: data.attempts,
          averageScore: avgScore,
          bestScore: data.bestScore,
          worstScore: data.worstScore,
          lastAttempt: data.lastAttempt
        }); 
        
        totalScore += avgScore * data.attempts; 
        totalAttempts += data.attempts; 
      }); 

      // Update overall stats
      analytics.totalQuizzesTaken = quizzes.length; 
      analytics.totalTestsAttempted = qaTests.length; 
      analytics.totalNotesCrated = notes.length; 
      analytics.overallAverageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0; 

      // Update daily stats
      analytics.dailyLearningStats = []; 
      const dailyMap = {}; 
      
      // Aggregate by day
      quizzes.forEach(quiz => {
        if (quiz.completedAt) {
          const date = new Date(quiz.completedAt); 
          date.setHours(0, 0, 0, 0); 
          const dateStr = date.toISOString().split('T')[0]; 
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date, quizzes: [], qaTests: [] }; 
          }
          dailyMap[dateStr].quizzes.push(quiz.score || 0); 
        }
      }); 

      qaTests.forEach(qaTest => {
        if (qaTest.completedAt) {
          const date = new Date(qaTest.completedAt); 
          date.setHours(0, 0, 0, 0); 
          const dateStr = date.toISOString().split('T')[0]; 
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date, quizzes: [], qaTests: [] }; 
          }
          dailyMap[dateStr].qaTests.push(qaTest.scorePercentage || 0); 
        }
      }); 

      Object.entries(dailyMap).forEach(([dateStr, data]) => {
        const allScores = [...data.quizzes, ...data.qaTests]; 
        const avgScore = allScores.length > 0 
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
          : 0; 
        
        analytics.dailyLearningStats.push({
          date: data.date,
          quizzesCompleted: data.quizzes.length + data.qaTests.length,
          averageScore: avgScore,
          notesCreated: 0
        }); 
      }); 

      // Sort daily stats by date
      analytics.dailyLearningStats.sort((a, b) => new Date(a.date) - new Date(b.date)); 

      analytics.updatedAt = new Date(); 
      analytics.markModified('subjectPerformance'); 
      analytics.markModified('dailyLearningStats'); 
      
      await analytics.save(); 
      
      console.log('Analytics recalculated:', {
        totalQuizzes: analytics.totalQuizzesTaken,
        totalTests: analytics.totalTestsAttempted,
        overallAverage: analytics.overallAverageScore,
        subjects: analytics.subjectPerformance.length
      }); 

      return analytics; 
    } catch (error) {
      console.error('Error recalculating analytics:', error.message); 
      console.error('Stack:', error.stack); 
      return null; 
    }
  }

  /**
   * Get analytics for dashboard display
   */
  static async getDashboardAnalytics(userId) {
    try {
      // Recalculate from fresh data
      const analytics = await this.recalculateAnalyticsFromQuizzes(userId); 

      if (!analytics) {
        return null; 
      }

      return {
        summary: {
          totalQuizzes: analytics.totalQuizzesTaken,
          totalNotes: analytics.totalNotesCrated,
          totalTests: analytics.totalTestsAttempted,
          overallAverage: Math.round(analytics.overallAverageScore),
          improvementTrend: analytics.predictedPerformance?.improvementTrend || 'stable'
        },
        subjectPerformance: analytics.subjectPerformance,
        weakTopics: analytics.weakTopics?.slice(0, 5) || [],
        strongTopics: analytics.strongTopics?.slice(0, 5) || [],
        recentActivity: analytics.dailyLearningStats?.slice(-7).reverse() || [],
        learningHeatmap: analytics.learningHeatmap || [],
        predictedPerformance: analytics.predictedPerformance || { improvementTrend: 'stable' }
      }; 
    } catch (error) {
      console.error('Error getting dashboard analytics:', error); 
      return null; 
    }
  }
}

module.exports = AnalyticsService; 