import { GoogleGenerativeAI } from '@google/generative-ai'

export const generateNotes = async (req, res) => {
  try {
    const { subject, topic, format, examPreparing, language } = req.body

    // Validate required fields
    if (!subject || !topic || !examPreparing) {
      return res.status(400).json({ message: 'Subject, topic, and exam are required' })
    }

    // Check API key - read from process.env at runtime
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    
    console.log('🔑 Checking Gemini API key...')
    console.log('API Key exists:', !!GEMINI_API_KEY)
    console.log('API Key length:', GEMINI_API_KEY?.length || 0)
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      console.error('❌ Gemini API key not found or empty in environment variables')
      console.error('Environment variables:', Object.keys(process.env).filter(k => k.includes('GEMINI')))
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
    const prompt = `Generate comprehensive ${format} study notes for the following:

Subject: ${subject}
Topic: ${topic}
Exam: ${examPreparing}
Language: ${language === 'hinglish' ? 'Hinglish (mix of English and Hindi)' : 'English'}
Format: ${format === 'detailed' ? 'Detailed and comprehensive with examples' : 'Short and concise key points'}

Please provide well-structured notes in markdown format with:
- Clear headings and subheadings
- Key concepts and definitions
- Important formulas or facts (if applicable)
- Examples and explanations
- Summary or conclusion

Start with a brief overview and organize content logically.`

    console.log('📝 Calling Gemini API...')
    
    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    console.log('✅ Gemini API response received')

    res.status(200).json({
      success: true,
      message: 'Notes generated successfully',
      notes: generatedText,
      metadata: {
        subject,
        topic,
        examPreparing,
        format,
        language,
        generatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('❌ Error generating notes:')
    console.error('Error message:', error.message)
    
    if (error.response) {
      console.error('API Response Status:', error.response.status)
      console.error('API Response Data:', error.response.data)
    }
    
    console.error('Full error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to generate notes',
      error: error.message || 'Unknown error occurred'
    })
  }
}
