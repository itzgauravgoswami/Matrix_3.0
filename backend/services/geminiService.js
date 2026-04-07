const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const fetch = require('node-fetch'); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const generateQuizFromGemini = async (subject, difficulty, numQuestions, examType = 'competitive') => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured'); 
    }

    // Exam context mapping
    const examContextMap = {
      'cbse': 'CBSE Board Exams (Class 10 & 12)',
      'icse': 'ICSE Board Exams (Class 10 & 12)',
      'state-board': 'State Board Exams',
      'jee': 'JEE Mains and Advanced Entrance Exam',
      'neet': 'NEET Medical Entrance Exam',
      'upsc': 'UPSC Civil Services Exam',
      'gate': 'GATE (Graduate Aptitude Test in Engineering)',
      'college': 'College University Exams',
      'competitive': 'General Competitive Exams'
    }; 

    const examContext = examContextMap[examType] || examContextMap['competitive']; 

    // Use the REST API directly for better control over API version
    const modelName = 'gemini-2.5-flash'; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`; 
    
    console.log(`Using model: ${modelName} (v1 API) for exam: ${examContext}`); 

    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${subject}" for ${examContext} with ${difficulty} difficulty level.

Focus on:
1. Previous year examination questions (most frequently asked)
2. Most important and high-scoring topics
3. Conceptually challenging questions that test deep understanding

Format your response as a valid JSON array with no markdown, no code blocks, just raw JSON:
[
  {
    "question": "What is...?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer with context from ${examContext}"
  },
  ... (${numQuestions - 1} more questions)
]

Requirements:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index (0, 1, 2, or 3) of the correct option
- Questions should be ${difficulty} level and relevant to ${examContext}
- Base questions on previous year papers and important exam topics
- Provide detailed explanations mentioning exam-specific tips
- Ensure variety in the options and avoid obvious patterns
- Valid JSON only, no additional text`; 

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    }; 

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }); 

    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('API Error:', errorData); 
      throw new Error(`API Error ${response.status}: ${errorData?.error?.message || response.statusText}`); 
    }

    const data = await response.json(); 
    
    // Extract text from response
    let responseText = ''; 
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      responseText = data.candidates[0].content.parts[0].text; 
    } else {
      throw new Error('Unexpected response format from Gemini API'); 
    }
    
    // Extract JSON from response (handle cases where it might be wrapped in markdown)
    let jsonText = responseText; 
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, ''); 
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\n?/g, ''); 
    }
    
    jsonText = jsonText.trim(); 
    
    // Parse the JSON
    const questions = JSON.parse(jsonText); 
    
    // Validate the response
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from Gemini API'); 
    }

    // Validate each question
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
        throw new Error(`Question ${index + 1} has invalid format`); 
      }
      
      // Ensure correctAnswer is a valid index
      if (![0, 1, 2, 3].includes(q.correctAnswer)) {
        throw new Error(`Question ${index + 1} has invalid correctAnswer index`); 
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'No explanation provided',
      }; 
    }); 

    return validatedQuestions; 
  } catch (error) {
    console.error('Error generating quiz from Gemini:', error); 
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to generate quiz'; 
    
    if (error.message.includes('404')) {
      userMessage = 'Model not found. Please try again later.'; 
    } else if (error.message.includes('429')) {
      userMessage = 'Rate limit exceeded. Please try again in a moment.'; 
    } else if (error.message.includes('401') || error.message.includes('403')) {
      userMessage = 'API authentication failed. Please check configuration.'; 
    } else if (error.message.includes('Invalid response format')) {
      userMessage = 'Failed to parse quiz questions. Please try again.'; 
    } else if (error.message.includes('has invalid format')) {
      userMessage = 'Generated questions had formatting issues. Please try again.'; 
    }
    
    throw new Error(userMessage); 
  }
}; 

/**
 * Generate general content using Gemini
 * Used for creating study notes, summaries, etc.
 */
const generateContent = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured'); 
    }

    // Use REST API directly for better control
    const modelName = 'gemini-2.5-flash'; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`; 

    console.log('Calling Gemini API for content generation...'); 

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 16000,
      },
    }; 

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }); 

    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('Gemini API error:', errorData); 
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`); 
    }

    const data = await response.json(); 

    // Extract text from response
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content; 
      if (content.parts && content.parts.length > 0) {
        return content.parts[0].text; 
      }
    }

    throw new Error('Unexpected response format from Gemini API'); 
  } catch (error) {
    console.error('Error generating content with Gemini:', error); 
    throw error; 
  }
}; 

/**
 * Generate AI-powered structured learning plan based on user's goal
 */
const generateLearningPlan = async (goal, userId) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured'); 
    }

    console.log('[GeminiService] Generating learning plan for goal:', goal); 

    const modelName = 'gemini-2.5-flash'; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`; 

    const prompt = `Based on the user's learning goal: "${goal}"

Create a comprehensive, structured learning plan in valid JSON format. The user might be studying for:
- Entrance exams (JEE, NEET, UPSC, GATE)
- Board exams (CBSE, ICSE, State Board)
- College subjects
- Competitive exams
- Skill development

Generate a detailed plan with learning phases. Return ONLY valid JSON, no markdown or code blocks:

{
  "_id": "${userId}-${Date.now()}",
  "userId": "${userId}",
  "userGoal": "${goal}",
  "goal": "${goal}",
  "subject": "Derived subject from goal",
  "currentLevel": "beginner",
  "progressPercentage": 0,
  "estimatedDurationDays": (estimate based on goal),
  "learningPhases": [
    {
      "phase": 1,
      "name": "Phase name",
      "description": "What will be covered in this phase",
      "duration": "X days",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "objectives": ["Objective 1", "Objective 2"],
      "resources": ["Resource 1", "Resource 2"],
      "completed": false
    },
    {
      "phase": 2,
      "name": "Next phase",
      "description": "What builds on the previous phase",
      "duration": "Y days",
      "topics": ["Topic 4", "Topic 5"],
      "objectives": ["Objective 3"],
      "resources": ["Resource 3"],
      "completed": false
    },
    {
      "phase": 3,
      "name": "Advanced phase",
      "description": "Master the subject with practice",
      "duration": "Z days",
      "topics": ["Practice", "Mock tests", "Revision"],
      "objectives": ["Achieve mastery", "Solve complex problems"],
      "resources": ["Practice papers", "Previous year questions"],
      "completed": false
    }
  ],
  "topicsCovered": [],
  "recommendedTopics": [],
  "focusAreas": [],
  "resources": ["Resource 1", "Resource 2", "Resource 3", "Resource 4"],
  "milestones": [
    {"phase": 1, "milestone": "Understand fundamentals"},
    {"phase": 2, "milestone": "Apply concepts"},
    {"phase": 3, "milestone": "Master and practice"}
  ],
  "dailyTargets": {
    "readingTime": "X hours per day",
    "practiceProblems": "Y problems per day",
    "reviewTime": "Z minutes per day"
  }
}

Important:
- Create 3-5 phases based on complexity of the goal
- Make each phase realistic and achievable
- Include specific topics for each phase
- Provide practical resources
- Return ONLY valid JSON, no explanation`; 

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }); 

    if (!response.ok) {
      const errorData = await response.json(); 
      console.error('[GeminiService] API Error:', errorData); 
      throw new Error(`Gemini API error: ${response.status}`); 
    }

    const data = await response.json(); 
    console.log('[GeminiService] Raw response:', JSON.stringify(data, null, 2)); 

    // Extract text from response
    let planText = ''; 
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content; 
      if (content.parts && content.parts[0]) {
        planText = content.parts[0].text; 
      }
    }

    if (!planText) {
      throw new Error('No content in Gemini response'); 
    }

    console.log('[GeminiService] Plan text:', planText); 

    // Parse JSON from response
    let plan = JSON.parse(planText); 
    
    // Add metadata
    plan._id = `${userId}-${Date.now()}`; 
    plan.userId = userId; 
    plan.createdAt = new Date(); 
    plan.lastUpdated = new Date(); 

    console.log('[GeminiService] Parsed plan:', JSON.stringify(plan, null, 2)); 

    return plan; 
  } catch (error) {
    console.error('[GeminiService] Error generating learning plan:', error); 
    throw error; 
  }
}; 

module.exports = {
  generateQuizFromGemini,
  generateContent,
  generateLearningPlan,
}; 