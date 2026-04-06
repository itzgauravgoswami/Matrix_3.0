import { GoogleGenerativeAI } from '@google/generative-ai'

export const generateQA = async (req, res) => {
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
    const prompt = `Generate exactly ${numQuestions} short-answer questions in JSON format for the following:

Subject: ${subject}
Topic: ${topic}
Exam: ${examPreparing}
Difficulty: ${difficulty}

For each question, provide a well-structured question and a comprehensive model answer.
Return ONLY valid JSON in this exact format with no additional text:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "modelAnswer": "Comprehensive answer explaining the concept in detail (100-150 words)"
    }
  ]
}

Important:
- Each question should be ${difficulty} level for ${examPreparing}
- Model answers should be comprehensive yet concise (100-150 words)
- Return ONLY the JSON object, no markdown, no code blocks`

    console.log('📝 Calling Gemini API to generate QA...')

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    console.log('✅ Gemini API response received')

    // Parse the JSON response
    let qaData
    try {
      qaData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON')
      console.error('Response text:', responseText)
      throw new Error('Invalid JSON response from Gemini API')
    }

    res.status(200).json({
      success: true,
      message: 'QA test generated successfully',
      questions: qaData.questions,
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
    console.error('❌ Error generating QA:')
    console.error('Error message:', error.message)
    
    if (error.response) {
      console.error('API Response Status:', error.response.status)
      console.error('API Response Data:', error.response.data)
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate QA test',
      error: error.message || 'Unknown error occurred'
    })
  }
}

export const evaluateQA = async (req, res) => {
  try {
    const { questions, userAnswers } = req.body

    // Validate required fields
    if (!questions || !userAnswers) {
      return res.status(400).json({ message: 'Questions and user answers are required' })
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

    // Evaluate each answer
    const results = await Promise.all(
      questions.map(async (q, index) => {
        const userAnswer = userAnswers[index] || ''

        // Build evaluation prompt
        const evaluationPrompt = `You are an expert exam evaluator. Evaluate the following student answer to the question.

Question: ${q.question}

Model Answer: ${q.modelAnswer}

Student's Answer: ${userAnswer}

Provide evaluation in JSON format ONLY:
{
  "score": <0-100>,
  "tips": ["tip1", "tip2", "tip3"],
  "areasToImprove": ["area1", "area2"],
  "feedback": "Brief overall feedback (2-3 sentences)"
}

Important:
- Score should be out of 100 based on how close the student answer is to the model answer
- Provide 2-3 specific tips for better answering
- List 2-3 specific areas where the student can improve
- Keep feedback constructive and helpful
- Return ONLY valid JSON, no markdown, no code blocks`

        try {
          const evalResult = await model.generateContent(evaluationPrompt)
          const evalResponse = await evalResult.response
          const evalText = evalResponse.text()

          let evaluation
          try {
            evaluation = JSON.parse(evalText)
          } catch (parseError) {
            console.error('Failed to parse evaluation JSON:', evalText)
            evaluation = {
              score: 50,
              tips: ['Review the model answer'],
              areasToImprove: ['Understanding of the concept'],
              feedback: 'Please review the model answer for better understanding'
            }
          }

          return {
            questionId: q.id,
            question: q.question,
            userAnswer,
            modelAnswer: q.modelAnswer,
            score: evaluation.score || 0,
            tips: evaluation.tips || [],
            areasToImprove: evaluation.areasToImprove || [],
            feedback: evaluation.feedback || '',
            maxScore: 100
          }
        } catch (evalError) {
          console.error('Error evaluating question:', evalError.message)
          return {
            questionId: q.id,
            question: q.question,
            userAnswer,
            modelAnswer: q.modelAnswer,
            score: 0,
            tips: ['Could not evaluate'],
            areasToImprove: ['All areas'],
            feedback: 'Evaluation error occurred',
            maxScore: 100
          }
        }
      })
    )

    // Calculate overall score
    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0)
    const averageScore = Math.round(totalScore / results.length)

    res.status(200).json({
      success: true,
      message: 'QA test evaluated successfully',
      results,
      totalQuestions: questions.length,
      averageScore,
      totalScore
    })
  } catch (error) {
    console.error('❌ Error evaluating QA:')
    console.error('Error message:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to evaluate QA test',
      error: error.message || 'Unknown error occurred'
    })
  }
}
