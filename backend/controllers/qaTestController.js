const QATest = require('../models/QATest'); 
const User = require('../models/user'); 
const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
const { generateExamQuestions, evaluateAnswer } = require('../services/aiEvaluationService'); 

// Generate exam questions
exports.generateQuestions = async (req, res) => {
  try {
    console.log('GENERATE QA TEST QUESTIONS - Starting'); 
    const { examType, subject, topic, difficulty, numQuestions } = req.body; 

    // Validate required fields
    if (!examType || !subject || !topic || !difficulty || !numQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Exam type, subject, topic, difficulty, and numQuestions are required',
      }); 
    }

    // Validate exam type
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (!validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type',
      }); 
    }

    // Validate difficulty level
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard',
      }); 
    }

    // Validate numQuestions
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 20',
      }); 
    }

    // Get user to check subscription plan
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    // Check QA test limit for free users (10 per month)
    if (user.subscriptionPlan === 'free') {
      const now = new Date(); 
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); 

      // Count QA tests created in current month
      const testsThisMonth = await QATest.countDocuments({
        userId: req.user.id,
        startedAt: { $gte: currentMonth, $lt: nextMonth },
      }); 

      const FREE_PLAN_QA_LIMIT = 10; 
      if (testsThisMonth >= FREE_PLAN_QA_LIMIT) {
        return res.status(403).json({
          success: false,
          message: `Free plan QA test limit exceeded. You have used ${testsThisMonth}/${FREE_PLAN_QA_LIMIT} tests this month.`,
          errorCode: 'QA_LIMIT_EXCEEDED',
          remainingTests: 0,
          maxTests: FREE_PLAN_QA_LIMIT,
          resetDate: new Date(nextMonth),
          subscriptionPlan: user.subscriptionPlan,
        }); 
      }

      // Send remaining tests count
      const remainingTests = FREE_PLAN_QA_LIMIT - testsThisMonth; 
      console.log(`Free user has ${remainingTests} QA tests remaining this month`); 
    }

    console.log(`Generating ${numQuestions} questions for ${examType} - ${subject} - ${topic}`); 
    
    // Generate questions using AI (pass examType for context)
    const questions = await generateExamQuestions(subject, topic, difficulty, numQuestions, examType); 
    console.log('Questions generated:', questions.length); 

    // Calculate total marks (10 marks per question)
    const maxTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 10), 0); 

    // Create QA Test in database
    const qaTest = new QATest({
      userId: req.user.id,
      examType,
      subject,
      topic,
      difficulty,
      totalQuestions: questions.length,
      questions,
      maxTotalMarks,
      status: 'started',
    }); 

    await qaTest.save(); 
    console.log('QA Test saved to database:', qaTest._id); 

    // Get updated count after saving
    let remainingTests = null; 
    if (user.subscriptionPlan === 'free') {
      const now = new Date(); 
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); 
      const FREE_PLAN_QA_LIMIT = 10; 
      
      const updatedTestsCount = await QATest.countDocuments({
        userId: req.user.id,
        startedAt: { $gte: currentMonth, $lt: nextMonth },
      }); 
      
      remainingTests = FREE_PLAN_QA_LIMIT - updatedTestsCount; 
      console.log(`After saving: User has ${remainingTests} QA tests remaining (used ${updatedTestsCount}/${FREE_PLAN_QA_LIMIT})`); 
    }

    // Prepare response
    const responseData = {
      success: true,
      qaTest: {
        _id: qaTest._id,
        examType: qaTest.examType,
        subject: qaTest.subject,
        topic: qaTest.topic,
        difficulty: qaTest.difficulty,
        totalQuestions: qaTest.totalQuestions,
        maxTotalMarks: qaTest.maxTotalMarks,
        questions: qaTest.questions,
        status: qaTest.status,
        startedAt: qaTest.startedAt,
      },
      remainingTests,
    }; 

    res.status(201).json(responseData); 
  } catch (error) {
    console.error('Error generating questions:', error); 
    
    let statusCode = 500; 
    let message = error.message || 'Error generating questions'; 
    
    if (error.message && error.message.includes('temporarily unavailable')) {
      statusCode = 503; 
    } else if (error.message && error.message.includes('Rate limit')) {
      statusCode = 429; 
    }
    
    res.status(statusCode).json({
      success: false,
      message: message,
    }); 
  }
}; 

// Submit answer and get evaluation
exports.submitAnswer = async (req, res) => {
  try {
    console.log('SUBMIT ANSWER - Starting'); 
    const { qaTestId, questionId, userAnswer } = req.body; 

    if (!qaTestId || questionId === undefined || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'qaTestId, questionId, and userAnswer are required',
      }); 
    }

    // Get the QA Test
    const qaTest = await QATest.findOne({
      _id: qaTestId,
      userId: req.user.id,
    }); 

    if (!qaTest) {
      return res.status(404).json({
        success: false,
        message: 'QA Test not found',
      }); 
    }

    // Find the question
    const question = qaTest.questions.find(q => q.questionId === questionId); 
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      }); 
    }

    console.log(`Evaluating answer for question ${questionId}`); 

    // Evaluate the answer
    const evaluation = await evaluateAnswer(
      question.question,
      userAnswer,
      qaTest.subject,
      question.expectedKeyPoints
    ); 

    // Calculate marks earned from percentage and maxMarks
    const marksEarned = Math.round((evaluation.score / 100) * evaluation.maxMarks); 

    // Store the answer
    const answer = {
      questionId,
      userAnswer,
      score: marksEarned,
      scorePercentage: evaluation.score,
      maxMarks: evaluation.maxMarks,
      feedback: evaluation.feedback,
      keyPointsCovered: evaluation.keyPointsCovered,
      keyPointsMissed: evaluation.keyPointsMissed,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      improvementSuggestions: evaluation.improvementSuggestions,
      modelAnswer: evaluation.modelAnswer,
      evaluatedAt: new Date(),
    }; 

    // Check if answer already exists and update it
    const existingAnswerIndex = qaTest.answers.findIndex(a => a.questionId === questionId); 
    if (existingAnswerIndex !== -1) {
      qaTest.answers[existingAnswerIndex] = answer; 
    } else {
      qaTest.answers.push(answer); 
    }

    // Update test status and scores
    qaTest.status = 'in-progress'; 
    
    // Calculate total score
    qaTest.totalScore = qaTest.answers.reduce((sum, a) => sum + (a.score || 0), 0); 
    qaTest.scorePercentage = qaTest.maxTotalMarks > 0 
      ? Math.round((qaTest.totalScore / qaTest.maxTotalMarks) * 100) 
      : 0; 

    // If all questions answered, mark as completed
    if (qaTest.answers.length === qaTest.totalQuestions) {
      qaTest.status = 'completed'; 
      qaTest.completedAt = new Date(); 
      qaTest.duration = Math.round((qaTest.completedAt - qaTest.startedAt) / 1000);  // in seconds
    }

    await qaTest.save(); 
    console.log('Answer saved and evaluated'); 

    // Update analytics and gamification when QA test is completed
    if (qaTest.status === 'completed') {
      try {
        console.log('QA Test completed! Starting analytics and gamification update for user:', req.user.id); 
        
        const AnalyticsService = require('../services/analyticsService'); 
        const UserXP = require('../models/UserXP'); 
        const Streak = require('../models/Streak'); 

        // Convert score percentage to 0-100 scale
        const scoreValue = qaTest.scorePercentage || 0; 

        // 1. Update analytics
        console.log('Updating analytics for QA test...'); 
        const analyticsData = {
          subject: qaTest.subject || 'General',
          topic: qaTest.topic || 'General',
          score: scoreValue,
          questionsCount: qaTest.totalQuestions
        }; 
        await AnalyticsService.updateQuizAnalytics(req.user.id, analyticsData); 
        console.log('✓ Analytics updated'); 

        // 2. Award XP
        console.log('Adding XP for QA test...'); 
        const xpEarned = Math.max(1, Math.ceil(scoreValue / 10)); 
        console.log(`XP to award: ${xpEarned}`); 
        
        let userXP = await UserXP.findOne({ userId: req.user.id }); 
        console.log('Current XP record:', userXP ? { totalXP: userXP.totalXP, level: userXP.level } : 'None'); 
        
        if (!userXP) {
          console.log('Creating new UserXP record'); 
          userXP = new UserXP({
            userId: req.user.id,
            totalXP: xpEarned,
            currentLevelXP: xpEarned,
            level: 1,
            xpToNextLevel: 100 - xpEarned
          }); 
        } else {
          userXP.totalXP += xpEarned; 
          userXP.currentLevelXP += xpEarned; 
          
          const xpPerLevel = 100; 
          const newLevel = Math.floor(userXP.totalXP / xpPerLevel) + 1; 
          if (newLevel > userXP.level) {
            console.log(`🎉 Level up! ${userXP.level} → ${newLevel}`); 
            userXP.level = newLevel; 
            userXP.currentLevelXP = userXP.totalXP % xpPerLevel; 
          }
          userXP.xpToNextLevel = (xpPerLevel * userXP.level) - userXP.totalXP; 
        }
        
        if (!userXP.xpHistory) {
          userXP.xpHistory = []; 
        }
        
        userXP.xpHistory.push({
          source: 'quiz_completion',
          xpAmount: xpEarned,
          earnedAt: new Date(),
          relatedId: qaTest._id
        }); 
        
        userXP.updatedAt = new Date(); 
        await userXP.save(); 
        
        console.log('✓ XP saved:', {
          totalXP: userXP.totalXP,
          level: userXP.level,
          xpToNextLevel: userXP.xpToNextLevel
        }); 

        // 3. Update streak using maintenance service
        console.log('Updating streak for QA test via StreakMaintenanceService...'); 
        try {
          await StreakMaintenanceService.markUserActive(req.user.id); 
          console.log('✓ User marked as active for streak tracking (QA test)'); 
        } catch (streakError) {
          console.error('✗ Error marking user active for streak (QA test):', streakError.message); 
        }

        console.log('✓✓✓ All gamification updates completed successfully for QA test'); 
        
      } catch (gamificationError) {
        console.error('✗ Error updating gamification for QA test:', gamificationError.message); 
        console.error('Stack:', gamificationError.stack); 
      }
    }

    const responseData = {
      success: true,
      evaluation: {
        questionId,
        ...evaluation,
      },
      testProgress: {
        answeredQuestions: qaTest.answers.length,
        totalQuestions: qaTest.totalQuestions,
        status: qaTest.status,
        totalScore: qaTest.totalScore,
        maxTotalMarks: qaTest.maxTotalMarks,
        scorePercentage: qaTest.scorePercentage,
      },
    }; 

    res.status(200).json(responseData); 
  } catch (error) {
    console.error('Error submitting answer:', error); 
    
    let statusCode = 500; 
    let message = error.message || 'Error evaluating answer'; 
    
    if (error.message && error.message.includes('temporarily unavailable')) {
      statusCode = 503; 
    } else if (error.message && error.message.includes('Rate limit')) {
      statusCode = 429; 
    }
    
    res.status(statusCode).json({
      success: false,
      message: message,
    }); 
  }
}; 

// Get QA Test details
exports.getQATestDetails = async (req, res) => {
  try {
    const { qaTestId } = req.params; 

    const qaTest = await QATest.findOne({
      _id: qaTestId,
      userId: req.user.id,
    }); 

    if (!qaTest) {
      return res.status(404).json({
        success: false,
        message: 'QA Test not found',
      }); 
    }

    res.json({
      success: true,
      qaTest,
    }); 
  } catch (error) {
    console.error('Error fetching QA Test:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching QA Test',
    }); 
  }
}; 

// Get all QA Tests for user
exports.getAllQATests = async (req, res) => {
  try {
    const qaTests = await QATest.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('subject topic difficulty totalQuestions status totalScore maxTotalMarks scorePercentage startedAt completedAt'); 

    res.json({
      success: true,
      qaTests,
    }); 
  } catch (error) {
    console.error('Error fetching QA Tests:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching QA Tests',
    }); 
  }
}; 

// Delete QA Test
exports.deleteQATest = async (req, res) => {
  try {
    const { qaTestId } = req.params; 

    const qaTest = await QATest.findOneAndDelete({
      _id: qaTestId,
      userId: req.user.id,
    }); 

    if (!qaTest) {
      return res.status(404).json({
        success: false,
        message: 'QA Test not found',
      }); 
    }

    res.json({
      success: true,
      message: 'QA Test deleted successfully',
    }); 
  } catch (error) {
    console.error('Error deleting QA Test:', error); 
    res.status(500).json({
      success: false,
      message: 'Error deleting QA Test',
    }); 
  }
}; 

// Check remaining QA tests for current month
exports.checkQATestsRemaining = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    const now = new Date(); 
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); 

    const FREE_PLAN_QA_LIMIT = 10; 
    
    // For pro and ultimate users, unlimited
    if (user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'ultimate') {
      return res.json({
        success: true,
        subscriptionPlan: user.subscriptionPlan,
        isUnlimited: true,
        remainingTests: Infinity,
        maxTests: Infinity,
        usedTests: 0,
        resetDate: null,
        message: `${user.subscriptionPlan.toUpperCase()} users have unlimited QA tests`,
      }); 
    }

    // Count QA tests for free users
    const testsThisMonth = await QATest.countDocuments({
      userId: req.user.id,
      startedAt: { $gte: currentMonth, $lt: nextMonth },
    }); 

    const remainingTests = Math.max(0, FREE_PLAN_QA_LIMIT - testsThisMonth); 

    res.json({
      success: true,
      subscriptionPlan: user.subscriptionPlan,
      isUnlimited: false,
      remainingTests,
      maxTests: FREE_PLAN_QA_LIMIT,
      usedTests: testsThisMonth,
      resetDate: nextMonth,
      limitExceeded: remainingTests === 0,
    }); 
  } catch (error) {
    console.error('Error checking QA tests remaining:', error); 
    res.status(500).json({
      success: false,
      message: 'Error checking QA tests remaining',
    }); 
  }
}; 

// Get recent QA tests for dashboard
exports.getRecentQATests = async (req, res) => {
  try {
    console.log('GET RECENT QA TESTS - Starting'); 
    
    const userId = req.user.id; 
    
    // Find recent QA tests that have been completed or have answers (limit to 3)
    const recentTests = await QATest.find({
      userId: userId,
      $or: [
        { status: 'completed', completedAt: { $exists: true } },
        { answers: { $exists: true, $ne: [] } } // Tests with at least one answer
      ]
    })
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(3)
      .select('topic subject difficulty examType totalScore maxTotalMarks scorePercentage completedAt updatedAt status answers')
      .lean(); 

    console.log('Recent QA tests found:', recentTests.length); 

    // Format data for frontend
    const formattedTests = recentTests.map((test) => {
      // Use completedAt if available, otherwise use updatedAt
      const testDate = test.completedAt || test.updatedAt || new Date(); 
      const completedDate = new Date(testDate); 
      const today = new Date(); 
      const yesterday = new Date(today); 
      yesterday.setDate(yesterday.getDate() - 1); 

      let dateString; 
      if (completedDate.toDateString() === today.toDateString()) {
        dateString = 'Today'; 
      } else if (completedDate.toDateString() === yesterday.toDateString()) {
        dateString = 'Yesterday'; 
      } else {
        const daysAgo = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24)); 
        dateString = `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`; 
      }

      // Always recalculate score percentage based on totalScore and maxTotalMarks
      // For old tests where score was stored as percentage, recalculate from answers
      let totalScore = test.totalScore || 0; 
      
      // If we have answers, recalculate totalScore properly
      if (test.answers && test.answers.length > 0) {
        totalScore = test.answers.reduce((sum, answer) => {
          // Use scorePercentage if available (new format) to convert to marks
          if (answer.scorePercentage !== undefined && answer.scorePercentage !== null) {
            // New format: scorePercentage is stored, convert to marks
            const marks = Math.round((answer.scorePercentage / 100) * (answer.maxMarks || 10)); 
            return sum + marks; 
          }
          // Otherwise use score as-is (should be marks in new format, or percentage in old format)
          // If score > 100, it's likely an old percentage, convert it
          if (answer.score > 100) {
            const converted = Math.round((answer.score / 100) * (answer.maxMarks || 10)); 
            console.log(`Converting old format: ${answer.score}% → ${converted} marks`); 
            return sum + converted; 
          }
          // Otherwise it's already in marks (new format)
          return sum + (answer.score || 0); 
        }, 0); 
      }
      
      let scorePercentage = 0; 
      if (totalScore !== undefined && test.maxTotalMarks && test.maxTotalMarks > 0) {
        scorePercentage = Math.round((totalScore / test.maxTotalMarks) * 100); 
      }
      console.log(`Test ${test._id}: totalScore=${totalScore}, maxTotalMarks=${test.maxTotalMarks}, percentage=${scorePercentage}%`); 

      return {
        id: test._id.toString(),
        topic: test.topic,
        subject: test.subject,
        difficulty: test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1),
        examType: test.examType,
        score: scorePercentage,
        date: dateString,
      }; 
    }); 

    res.json({
      success: true,
      data: formattedTests,
    }); 
  } catch (error) {
    console.error('Error fetching recent QA tests:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching recent QA tests',
    }); 
  }
};  