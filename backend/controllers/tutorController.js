const TutorConversation = require('../models/TutorConversation'); 
const AITutorService = require('../services/aiTutorService'); 
const { v4: uuidv4 } = require('uuid'); 

/**
 * Start new tutor conversation
 */
exports.startConversation = async (req, res) => {
  try {
    const { subject, topic, initialMessage } = req.body; 
    const userId = req.user.id; 

    const conversationId = uuidv4(); 

    const newConversation = new TutorConversation({
      userId,
      conversationId,
      subject: subject || 'General',
      topic: topic || 'General Knowledge',
      messages: []
    }); 

    // Get initial response from AI
    if (initialMessage) {
      try {
        const aiResponse = await AITutorService.getTutorResponse(
          initialMessage,
          subject || 'General',
          topic || 'General Knowledge',
          []
        ); 

        if (aiResponse.success) {
          newConversation.messages.push({
            userId,
            conversationId,
            role: 'user',
            message: initialMessage,
            context: { subject, topic }
          }); 

          newConversation.messages.push({
            userId,
            conversationId,
            role: 'assistant',
            message: aiResponse.response,
            context: { subject, topic }
          }); 
        }
      } catch (aiError) {
        console.error('AI Service Error:', aiError.message); 
        return res.status(503).json({
          success: false,
          error: 'AI service unavailable: ' + aiError.message,
          message: 'The Gemini API is currently unavailable. Please try again later.'
        }); 
      }
    }

    await newConversation.save(); 
 
    res.status(201).json({
      success: true,
      conversationId,
      conversation: newConversation
    }); 
  } catch (error) {
    console.error('Error starting conversation:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Send message in conversation
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body; 
    const userId = req.user.id; 

    const conversation = await TutorConversation.findOne({
      conversationId,
      userId
    }); 

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      }); 
    }

    // Get AI response BEFORE adding the user message (so it uses the previous context)
    const conversationHistoryForAI = conversation.messages.map(m => ({
      role: m.role,
      message: m.message
    })); 

    try {
      const aiResponse = await AITutorService.getTutorResponse(
        message,
        conversation.subject,
        conversation.topic,
        conversationHistoryForAI
      ); 

      // Now add both user and AI messages to conversation
      conversation.messages.push({
        userId,
        conversationId,
        role: 'user',
        message,
        context: {
          subject: conversation.subject,
          topic: conversation.topic
        },
        timestamp: new Date()
      }); 

      if (aiResponse.success) {
        conversation.messages.push({
          userId,
          conversationId,
          role: 'assistant',
          message: aiResponse.response,
          context: {
            subject: conversation.subject,
            topic: conversation.topic
          },
          timestamp: new Date()
        }); 

        conversation.updatedAt = new Date(); 
        await conversation.save(); 

        res.json({
          success: true,
          response: aiResponse.response,
          conversation
        }); 
      } else {
        res.status(500).json({
          success: false,
          error: aiResponse.error
        }); 
      }
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message); 
      res.status(503).json({
        success: false,
        error: 'AI service unavailable: ' + aiError.message,
        message: 'The Gemini API is currently unavailable. Please try again later.'
      }); 
    }
  } catch (error) {
    console.error('Error sending message:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get conversation history
 */
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params; 
    const userId = req.user.id; 

    const conversation = await TutorConversation.findOne({
      conversationId,
      userId
    }); 

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      }); 
    }

    res.json({
      success: true,
      conversation
    }); 
  } catch (error) {
    console.error('Error getting conversation:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get all conversations for user
 */
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id; 

    const conversations = await TutorConversation.find({ userId })
      .select('-messages')
      .sort({ updatedAt: -1 }); 

    res.json({
      success: true,
      conversations
    }); 
  } catch (error) {
    console.error('Error getting conversations:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Delete conversation
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params; 
    const userId = req.user.id; 

    const result = await TutorConversation.deleteOne({
      conversationId,
      userId
    }); 

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      }); 
    }

    res.json({
      success: true,
      message: 'Conversation deleted'
    }); 
  } catch (error) {
    console.error('Error deleting conversation:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get question explanation
 */
exports.getQuestionExplanation = async (req, res) => {
  try {
    const { question, correctAnswer, userAnswer, subject } = req.body; 

    const explanation = await AITutorService.generateQuestionExplanation(
      question,
      correctAnswer,
      userAnswer,
      subject
    ); 

    if (explanation.success) {
      res.json({
        success: true,
        explanation: explanation.explanation
      }); 
    } else {
      res.status(500).json({
        success: false,
        error: explanation.error
      }); 
    }
  } catch (error) {
    console.error('Error getting explanation:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 

/**
 * Get learning recommendations
 */
exports.getLearningRecommendations = async (req, res) => {
  try {
    const { subject } = req.params; 
    const userId = req.user.id; 

    // Get user performance stats from your analytics
    // This is a simplified version - you'll need to fetch actual user data
    const userPerformance = {
      totalQuizzes: 10,
      averageScore: 75,
      weakTopics: ['Algebra', 'Trigonometry'],
      strongTopics: ['Geometry'],
      consistency: 60
    }; 

    const recommendations = await AITutorService.generateLearningRecommendations(
      userPerformance,
      subject
    ); 

    if (recommendations.success) {
      res.json({
        success: true,
        recommendations: recommendations.recommendations
      }); 
    } else {
      res.status(500).json({
        success: false,
        error: recommendations.error
      }); 
    }
  } catch (error) {
    console.error('Error getting recommendations:', error); 
    res.status(500).json({
      success: false,
      error: error.message
    }); 
  }
}; 