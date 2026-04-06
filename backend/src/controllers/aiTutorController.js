import { GoogleGenerativeAI } from '@google/generative-ai'

// Store chat sessions in memory (in production, use MongoDB)
const chatSessions = new Map()

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, subject, topic, difficulty } = req.body
    const userId = req.user?.id || req.body.userId

    // Validate required fields
    if (!message || !sessionId) {
      return res.status(400).json({ message: 'Message and sessionId are required' })
    }

    // Check API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    console.log('🔑 Checking Gemini API key...')
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      console.error('❌ Gemini API key not found or empty')
      return res.status(500).json({
        success: false,
        message: 'API configuration error',
        error: 'Gemini API key is not configured'
      })
    }

    // Initialize or retrieve chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, {
        subject,
        topic,
        difficulty,
        messages: [],
        context: `You are an expert AI tutor specializing in ${subject}. The student is learning about "${topic}" at ${difficulty} level. Provide clear, concise, and helpful explanations. Use examples when appropriate. Be encouraging and patient.`
      })
    }

    const session = chatSessions.get(sessionId)
    
    // Add user message to history
    session.messages.push({
      role: 'user',
      content: message
    })

    // Build conversation history for Gemini
    const conversationHistory = session.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    console.log('💬 Sending message to Gemini API...')

    // Build system instruction
    const systemInstruction = `${session.context}

Current conversation:
- Student Query: ${message}

Guidelines:
1. Keep responses focused and easy to understand
2. Use clear language and avoid jargon when possible
3. Provide step-by-step explanations for complex topics
4. Include relevant examples or analogies
5. Encourage the student and offer to clarify any part
6. Keep responses concise but comprehensive (2-4 paragraphs)`

    // Call Gemini API with conversation history
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }]
        },
        ...conversationHistory
      ]
    })

    const response = await result.response
    const responseText = response.text()

    console.log('✅ Gemini response received')

    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: responseText
    })

    // Keep only last 10 messages in memory to prevent bloat
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20)
    }

    res.json({
      success: true,
      reply: responseText,
      messageCount: session.messages.length
    })

  } catch (error) {
    console.error('❌ AI Tutor Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error processing your question',
      error: error.message
    })
  }
}

export const startSession = async (req, res) => {
  try {
    const { subject, topic, difficulty } = req.body

    // Validate required fields
    if (!subject || !topic || !difficulty) {
      return res.status(400).json({ message: 'Subject, topic, and difficulty are required' })
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize chat session
    chatSessions.set(sessionId, {
      subject,
      topic,
      difficulty,
      messages: [],
      startTime: new Date(),
      context: `You are an expert AI tutor specializing in ${subject}. The student is learning about "${topic}" at ${difficulty} level. Provide clear, concise, and helpful explanations. Use examples when appropriate. Be encouraging and patient.`
    })

    console.log(`✅ Chat session started: ${sessionId}`)

    // Generate welcome message
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const welcomePrompt = `You are an AI tutor. The student just started a tutoring session on "${topic}" in ${subject} at ${difficulty} level. 
    
Generate a warm, encouraging welcome message (2-3 sentences) that:
1. Welcomes them to the session
2. Briefly introduces your role as their tutor
3. Invites them to ask questions about the topic
4. Sets a supportive tone

Keep it concise and friendly.`

    const welcomeResult = await model.generateContent(welcomePrompt)
    const welcomeText = await welcomeResult.response.text()

    res.json({
      success: true,
      sessionId,
      welcomeMessage: welcomeText,
      sessionInfo: {
        subject,
        topic,
        difficulty
      }
    })

  } catch (error) {
    console.error('❌ Session Start Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error starting tutoring session',
      error: error.message
    })
  }
}

export const getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessionId || !chatSessions.has(sessionId)) {
      return res.status(404).json({ message: 'Session not found' })
    }

    const session = chatSessions.get(sessionId)

    res.json({
      success: true,
      session: {
        subject: session.subject,
        topic: session.topic,
        difficulty: session.difficulty,
        messages: session.messages,
        startTime: session.startTime
      }
    })

  } catch (error) {
    console.error('❌ Get History Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving session history',
      error: error.message
    })
  }
}

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId || !chatSessions.has(sessionId)) {
      return res.status(404).json({ message: 'Session not found' })
    }

    const session = chatSessions.get(sessionId)
    const messageCount = session.messages.length

    // Clear session
    chatSessions.delete(sessionId)

    console.log(`✅ Chat session ended: ${sessionId}`)

    res.json({
      success: true,
      message: 'Session ended successfully',
      sessionStats: {
        totalMessages: messageCount,
        duration: new Date() - new Date(session.startTime)
      }
    })

  } catch (error) {
    console.error('❌ End Session Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message
    })
  }
}
