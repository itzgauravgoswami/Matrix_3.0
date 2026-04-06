import { GoogleGenerativeAI } from '@google/generative-ai'

export const generateQuiz = async (req, res) => {
  try {
    const { subject, topic, numQuestions, difficulty, examPreparing } = req.body

    // Validate required fields
    if (!subject || !topic || !numQuestions || !difficulty || !examPreparing) {
      return res.status(400).json({ message: 'All fields are required' })
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

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build the prompt for Gemini API
    const prompt = `Generate exactly ${numQuestions} multiple choice quiz questions in JSON format for the following:

Subject: ${subject}
Topic: ${topic}
Exam: ${examPreparing}
Difficulty: ${difficulty}

For each question, generate exactly 4 options. Return ONLY valid JSON in this exact format with no additional text:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation in 30-40 words explaining why this is correct and the concept involved."
    }
  ]
}

Important:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index (0, 1, 2, or 3)
- explanation must be exactly 30-40 words
- Return ONLY the JSON object, no markdown, no code blocks
- Questions should be ${difficulty} level for ${examPreparing}`

    console.log('📝 Calling Gemini API to generate quiz...')

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    console.log('✅ Gemini API response received')

    // Parse the JSON response
    let quizData
    try {
      quizData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON')
      console.error('Response text:', responseText)
      throw new Error('Invalid JSON response from Gemini API')
    }

    res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: quizData.questions,
      metadata: {
        subject,
        topic,
        examPreparing,
        numQuestions,
        difficulty,
        generatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('❌ Error generating quiz:')
    console.error('Error message:', error.message)
    
    if (error.response) {
      console.error('API Response Status:', error.response.status)
      console.error('API Response Data:', error.response.data)
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message || 'Unknown error occurred'
    })
  }
}

export const getQuizExplanations = async (req, res) => {
  try {
    const { quizQuestions, userAnswers } = req.body

    // Validate required fields
    if (!quizQuestions || !userAnswers) {
      return res.status(400).json({ message: 'Quiz questions and user answers are required' })
    }

    // Check API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      console.error('❌ Gemini API key not found or empty')
      return res.status(500).json({
        success: false,
        message: 'API configuration error'
      })
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build results array
    const results = quizQuestions.map((q, index) => {
      const userAnswerIndex = userAnswers[index]
      const isCorrect = userAnswerIndex === q.correctAnswer
      
      return {
        questionId: q.id,
        question: q.question,
        userAnswer: q.options[userAnswerIndex] || 'No answer',
        correctAnswer: q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation || 'See above for explanation',
        userAnswerIndex,
        correctAnswerIndex: q.correctAnswer
      }
    })

    // Calculate score
    const score = results.filter(r => r.isCorrect).length
    const percentage = Math.round((score / quizQuestions.length) * 100)

    res.status(200).json({
      success: true,
      message: 'Quiz evaluated successfully',
      results,
      totalQuestions: quizQuestions.length,
      correctAnswers: score,
      percentage
    })
  } catch (error) {
    console.error('❌ Error evaluating quiz:')
    console.error('Error message:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to evaluate quiz',
      error: error.message || 'Unknown error occurred'
    })
  }
}
