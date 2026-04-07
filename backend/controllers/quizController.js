const Quiz = require('../models/Quiz'); 
const User = require('../models/user'); 
const UserXP = require('../models/UserXP'); 
const Streak = require('../models/Streak'); 
const AnalyticsService = require('../services/analyticsService'); 
const StreakMaintenanceService = require('../services/streakMaintenanceService'); 
const { generateQuizFromGemini } = require('../services/geminiService'); 

// Get all quizzes for the authenticated user
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-answers');  // Don't send answers in list view

    res.json({
      success: true,
      quizzes,
    }); 
  } catch (error) {
    console.error('Error fetching quizzes:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
    }); 
  }
}; 

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    console.log('CREATE QUIZ - Starting quiz creation'); 
    const { title, examType, subject, difficulty, questions, duration } = req.body; 

    // Get user to check subscription plan
    const user = await User.findById(req.user.id); 
    console.log('User found:', { userId: user?._id, subscriptionPlan: user?.subscriptionPlan }); 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      }); 
    }

    // Validate examType
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (examType && !validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type',
      }); 
    }

    // Check quiz limits for free users
    if (user.subscriptionPlan === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7);  // YYYY-MM format
      
      // Reset quiz count if month changed
      if (user.quizAttemptMonth !== currentMonth) {
        user.quizAttemptMonth = currentMonth; 
        user.quizzesPlayedThisMonth = 0; 
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
      }

      // If extra credits were granted in a different month, clear them
      if (user.extraQuizCreditsGrantedMonth !== currentMonth) {
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
      }

      const totalAllowed = 5 + user.extraQuizCreditsGranted; 

      // Check if user has quiz credits remaining
      if (user.quizzesPlayedThisMonth >= totalAllowed) {
        return res.status(403).json({
          success: false,
          message: 'You have used all your free quizzes for this month. Please upgrade to a premium plan for unlimited quizzes.',
          quizLimits: {
            totalQuizzes: totalAllowed,
            quizzesUsed: user.quizzesPlayedThisMonth,
            quizzesRemaining: 0,
          },
        }); 
      }
    }

    // Validate required fields
    if (!title || !subject || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and questions are required',
      }); 
    }

    // Validate questions format
    for (let i = 0;  i < questions.length;  i++) {
      const q = questions[i]; 
      if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
        return res.status(400).json({
          success: false,
          message: `Invalid question format at index ${i}`,
        }); 
      }
    }

    const quiz = new Quiz({
      userId: req.user.id,
      title,
      examType: examType || 'competitive',
      subject,
      difficulty: difficulty || 'medium',
      questions,
      totalQuestions: questions.length,
      duration: duration || 30,
    }); 

    await quiz.save(); 

    // Increment quiz counter for free users
    if (user.subscriptionPlan === 'free') {
      console.log('Before increment - quizzesPlayedThisMonth:', user.quizzesPlayedThisMonth); 
      user.quizzesPlayedThisMonth = (user.quizzesPlayedThisMonth || 0) + 1; 
      console.log('After increment - quizzesPlayedThisMonth:', user.quizzesPlayedThisMonth); 
      console.log('freeQuizCredits:', user.freeQuizCredits); 
      await user.save(); 
      console.log('User saved'); 
    }

    // Don't send correct answers back (but send explanation for results)
    const quizResponse = quiz.toObject(); 
    quizResponse.questions = quizResponse.questions.map(q => ({
      question: q.question,
      options: q.options,
      _id: q._id,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })); 

    const responseData = {
      success: true,
      quiz: quizResponse,
      quizLimits: user.subscriptionPlan === 'free' ? {
        totalQuizzes: 5 + user.extraQuizCreditsGranted,
        quizzesUsed: user.quizzesPlayedThisMonth,
        quizzesRemaining: (5 + user.extraQuizCreditsGranted) - user.quizzesPlayedThisMonth,
      } : null,
    }; 

    console.log('Sending response:', JSON.stringify(responseData, null, 2)); 

    res.status(201).json(responseData); 
  } catch (error) {
    console.error('Error creating quiz:', error); 
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
    }); 
  }
}; 

// Get a specific quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user.id,
    }); 

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      }); 
    }

    // If quiz is not completed, don't send correct answers
    const quizResponse = quiz.toObject(); 
    if (!quiz.isCompleted) {
      quizResponse.questions = quizResponse.questions.map(q => ({
        question: q.question,
        options: q.options,
        _id: q._id,
      })); 
    }

    res.json({
      success: true,
      quiz: quizResponse,
    }); 
  } catch (error) {
    console.error('Error fetching quiz:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
    }); 
  }
}; 

// Submit quiz answers and calculate score
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;  // answers should be an object like { "0": 2, "1": 1, ... }

    console.log('SUBMIT QUIZ - Starting submission'); 
    console.log('Quiz ID:', req.params.quizId); 
    console.log('User ID:', req.user.id); 
    console.log('Answers received:', answers); 

    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user.id,
    }); 

    console.log('Quiz found:', quiz ? 'YES' : 'NO'); 
    if (quiz) {
      console.log('Quiz details:', {
        _id: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.totalQuestions,
        isCompleted: quiz.isCompleted,
      }); 
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      }); 
    }

    if (quiz.isCompleted) {
      console.log('Quiz already completed'); 
      return res.status(400).json({
        success: false,
        message: 'Quiz already completed',
      }); 
    }

    // Calculate score
    let correctCount = 0; 
    const results = []; 

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index.toString()]; 
      const isCorrect = userAnswer === question.correctAnswer; 
      
      if (isCorrect) {
        correctCount++; 
      }

      results.push({
        questionIndex: index,
        question: question.question,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      }); 
    }); 

    const score = Math.round((correctCount / quiz.questions.length) * 100); 

    console.log('Score calculated:', { correctCount, totalQuestions: quiz.questions.length, score }); 

    // Update quiz
    quiz.isCompleted = true; 
    quiz.score = score; 
    quiz.answers = answers; 
    quiz.completedAt = new Date(); 
    
    console.log('Saving quiz with:', {
      isCompleted: quiz.isCompleted,
      score: quiz.score,
      completedAt: quiz.completedAt,
      answers: Object.keys(answers).length,
    }); 

    const savedQuiz = await quiz.save(); 
    
    console.log('Quiz saved successfully'); 
    console.log('Saved quiz verification:', {
      _id: savedQuiz._id,
      isCompleted: savedQuiz.isCompleted,
      score: savedQuiz.score,
      completedAt: savedQuiz.completedAt,
    }); 

    // Update analytics and gamification
    try {
      console.log('Starting analytics and gamification update for user:', req.user.id); 
      
      // 1. Update analytics
      console.log('Updating analytics...'); 
      const analyticsData = {
        subject: quiz.subject || 'General',
        topic: quiz.topic || 'General',
        score: score,
        questionsCount: quiz.questions.length
      }; 
      await AnalyticsService.updateQuizAnalytics(req.user.id, analyticsData); 
      console.log('✓ Analytics updated'); 

      // 2. Award XP
      console.log('Adding XP...'); 
      const xpEarned = Math.max(1, Math.ceil(score / 10));  // At least 1 XP, max 10
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
        relatedId: savedQuiz._id
      }); 
      
      userXP.updatedAt = new Date(); 
      await userXP.save(); 
      
      console.log('✓ XP saved:', {
        totalXP: userXP.totalXP,
        level: userXP.level,
        xpToNextLevel: userXP.xpToNextLevel
      }); 

      // 3. Update streak using maintenance service
      console.log('Updating streak via StreakMaintenanceService...'); 
      try {
        await StreakMaintenanceService.markUserActive(req.user.id); 
        console.log('✓ User marked as active for streak tracking'); 
      } catch (streakError) {
        console.error('✗ Error marking user active for streak:', streakError.message); 
      }

      console.log('✓✓✓ All gamification updates completed successfully'); 
      
    } catch (gamificationError) {
      console.error('✗ Error updating gamification:', gamificationError.message); 
      console.error('Stack:', gamificationError.stack); 
    }

    res.json({
      success: true,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results,
    }); 
  } catch (error) {
    console.error('Error submitting quiz:', error); 
    console.error('Error details:', error.message); 
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
    }); 
  }
}; 

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.quizId,
      userId: req.user.id,
    }); 

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      }); 
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    }); 
  } catch (error) {
    console.error('Error deleting quiz:', error); 
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
    }); 
  }
}; 

// Generate quiz with Gemini AI
exports.generateQuizWithGemini = async (req, res) => {
  try {
    console.log('GENERATE QUIZ WITH GEMINI - Starting'); 
    const { topic, subject, difficulty, numQuestions, examType } = req.body; 

    // Validate required fields - now need both topic and subject
    if (!topic || !subject || !difficulty || !numQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Topic, subject, difficulty, and numQuestions are required',
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
    if (numQuestions < 1 || numQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 50',
      }); 
    }

    // Validate examType if provided
    const validExamTypes = ['cbse', 'icse', 'state-board', 'jee', 'neet', 'upsc', 'gate', 'college', 'competitive']; 
    if (examType && !validExamTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type provided',
      }); 
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API is not configured',
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

    // Check quiz limits for free users
    if (user.subscriptionPlan === 'free') {
      const currentMonth = new Date().toISOString().slice(0, 7); 
      
      if (user.quizAttemptMonth !== currentMonth) {
        user.quizAttemptMonth = currentMonth; 
        user.quizzesPlayedThisMonth = 0; 
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
      }

      if (user.extraQuizCreditsGrantedMonth !== currentMonth) {
        user.extraQuizCreditsGranted = 0; 
        user.extraQuizCreditsGrantedMonth = null; 
      }

      const totalAllowed = 5 + user.extraQuizCreditsGranted; 

      if (user.quizzesPlayedThisMonth >= totalAllowed) {
        return res.status(403).json({
          success: false,
          message: 'You have used all your free quizzes for this month. Please upgrade to a premium plan for unlimited quizzes.',
          quizLimits: {
            totalQuizzes: totalAllowed,
            quizzesUsed: user.quizzesPlayedThisMonth,
            quizzesRemaining: 0,
          },
        }); 
      }
    }

    console.log('Generating questions from Gemini...'); 
    console.log(`Parameters: topic="${topic}", subject="${subject}", examType="${examType}", difficulty="${difficulty}", numQuestions=${numQuestions}`); 
    
    // Generate questions using Gemini with exam context
    const questions = await generateQuizFromGemini(topic, difficulty, numQuestions, examType); 
    console.log('Questions generated:', questions.length); 

    // Create quiz in database
    const quiz = new Quiz({
      userId: req.user.id,
      title: topic,
      examType: examType || 'competitive',
      subject: subject,
      difficulty: difficulty,
      questions: questions,
      totalQuestions: questions.length,
      duration: 30,
    }); 

    await quiz.save(); 
    console.log('Quiz saved to database:', quiz._id); 

    // Increment quiz counter for free users
    if (user.subscriptionPlan === 'free') {
      user.quizzesPlayedThisMonth = (user.quizzesPlayedThisMonth || 0) + 1; 
      await user.save(); 
    }

    // Prepare response without correct answers
    const quizResponse = quiz.toObject(); 
    quizResponse.questions = quizResponse.questions.map(q => ({
      question: q.question,
      options: q.options,
      _id: q._id,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })); 

    const responseData = {
      success: true,
      quiz: quizResponse,
      quizLimits: user.subscriptionPlan === 'free' ? {
        totalQuizzes: 5 + user.extraQuizCreditsGranted,
        quizzesUsed: user.quizzesPlayedThisMonth,
        quizzesRemaining: (5 + user.extraQuizCreditsGranted) - user.quizzesPlayedThisMonth,
      } : null,
    }; 

    res.status(201).json(responseData); 
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error); 
    
    // Provide helpful error messages
    let statusCode = 500; 
    let message = error.message || 'Error generating quiz with Gemini'; 
    
    // Handle specific Gemini errors
    if (error.message && error.message.includes('models/gemini')) {
      message = 'The AI model is temporarily unavailable. Please try again in a moment.'; 
      statusCode = 503; 
    } else if (error.message && error.message.includes('404')) {
      message = 'AI service temporarily unavailable. Please try again later.'; 
      statusCode = 503; 
    } else if (error.message && error.message.includes('429')) {
      message = 'Rate limit exceeded. Please wait a moment and try again.'; 
      statusCode = 429; 
    } else if (error.message && error.message.includes('401')) {
      message = 'API authentication error. Please contact support.'; 
      statusCode = 500; 
    }
    
    res.status(statusCode).json({
      success: false,
      message: message,
    }); 
  }
}; 

// Get recent quizzes for dashboard
exports.getRecentQuizzes = async (req, res) => {
  try {
    console.log('Fetching recent quizzes for user:', req.user.id); 
    
    const quizzes = await Quiz.find({ userId: req.user.id })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(20); 

    console.log('Total quizzes found for user:', quizzes.length); 
    console.log('All quiz details:', quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      isCompleted: q.isCompleted,
      score: q.score,
      completedAt: q.completedAt,
      createdAt: q.createdAt,
    }))); 
    
    // Filter for quizzes that have been completed
    const attemptedQuizzes = quizzes.filter(q => {
      return q.isCompleted === true; 
    }); 

    console.log('Completed quizzes found:', attemptedQuizzes.length); 
    console.log('Completed quiz data:', attemptedQuizzes.slice(0, 3).map(q => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      isCompleted: q.isCompleted,
      completedAt: q.completedAt,
      score: q.score,
      totalQuestions: q.totalQuestions,
      createdAt: q.createdAt,
    }))); 

    res.json({
      success: true,
      quizzes: attemptedQuizzes.slice(0, 3), // Return top 3 recent attempted quizzes
    }); 
  } catch (error) {
    console.error('Error fetching recent quizzes:', error); 
    res.status(500).json({
      success: false,
      message: 'Error fetching recent quizzes',
    }); 
  }
};  