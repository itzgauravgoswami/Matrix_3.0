const { GoogleGenerativeAI } = require("@google/generative-ai"); 

// Initialize genAI lazily to ensure .env is loaded
let genAI = null; 

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
    console.log('✅ Gemini AI client initialized with API key'); 
  }
  return genAI; 
}; 

class AITutorService {
  /**
   * Generate tutoring response based on user query
   */
  static async getTutorResponse(userMessage, subject, topic, conversationHistory = []) {
    try {
      // Check if API key exists - MUST use Gemini API
      if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not set in .env file - Cannot proceed without API'); 
        throw new Error('GEMINI_API_KEY is required. Please set it in .env file'); 
      }

      const genAIClient = getGenAI(); 
      if (!genAIClient) {
        console.error('❌ Failed to initialize Gemini AI client'); 
        throw new Error('Failed to initialize Gemini AI client'); 
      }

      console.log(`[AITutor] Using Gemini API for "${topic}" question`); 

      const model = genAIClient.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an expert AI Tutor specializing in ${subject}${topic ? ` with focus on ${topic}` : ''}. 

SUBJECT: ${subject}
TOPIC: ${topic || 'General'}

Your responses MUST be:
1. Directly related to ${topic || subject}
2. Focused on the specific subject matter mentioned
3. Use real examples from ${subject}
4. Include practical applications in ${topic || subject}
5. Reference concepts specific to this field

Your role is to:
- Explain concepts clearly with examples
- Break down complex topics step-by-step
- Provide practice problems when asked
- Offer multiple approaches to problem-solving
- Encourage critical thinking
- Adapt explanations based on understanding level
- Use analogies and real-world examples
- Be patient and supportive

CRITICAL INSTRUCTION FOR VARIED RESPONSES:
- Your responses must be UNIQUE and VARIED
- Do NOT repeat previous explanations or examples
- If addressing similar topics, provide COMPLETELY DIFFERENT approaches
- Use different examples, analogies, and problem types each time
- Show varied problem-solving strategies
- Alternate between different explanation styles (narrative, step-by-step, visual descriptions, etc.)
- Add new insights or deeper analysis in follow-up questions
- Always reference what was discussed before to show you're building on prior knowledge

IMPORTANT: Every answer must directly relate to ${topic || subject}. If the question seems off-topic, gently redirect it back to ${subject}.

Keep responses concise but comprehensive. Use markdown formatting for better readability.`
      }); 

      // Convert history to proper format for multi-turn conversation
      const contents = []; 
      
      if (conversationHistory && conversationHistory.length > 0) {
        // Add last 8 messages to maintain reasonable context window
        const recentMessages = conversationHistory.slice(-8); 
        recentMessages.forEach(msg => {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.message }]
          }); 
        }); 
      }

      // Add the current user message with context
      const contextualMessage = `[${subject}${topic ? ` - ${topic}` : ''}]\n\n${userMessage}`; 
      contents.push({
        role: 'user',
        parts: [{ text: contextualMessage }]
      }); 

      console.log(`[AITutor] Subject: ${subject}, Topic: ${topic}`); 
      console.log(`[AITutor] Generating response with ${contents.length} messages in history`); 
      console.log(`[AITutor] User message: ${userMessage.substring(0, 100)}...`); 
      console.log(`[AITutor] Calling Gemini API with model: gemini-2.5-flash`); 
      
      const result = await model.generateContent({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ]
      }); 

      console.log(`[AITutor] ✅ Gemini API responded successfully`); 
      
      const response = result.response; 
      const responseText = response.text(); 
      
      console.log(`[AITutor] ✅ Generated response (${responseText.length} chars) from Gemini API for topic: ${topic}`); 
      
      return {
        success: true,
        response: responseText,
        timestamp: new Date(),
        source: 'gemini-api'
      }; 
    } catch (error) {
      console.error('❌ Error in AI Tutor Service:', error); 
      console.error('Error Message:', error.message); 
      console.error('Error Stack:', error.stack); 
      // Throw error instead of returning fallback - user must know API failed
      throw error; 
    }
  }

  /**
   * Generate explanation for a quiz question
   */
  static async generateQuestionExplanation(question, correctAnswer, userAnswer, subject) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required for AI explanations'); 
      }

      const genAIClient = getGenAI(); 
      if (!genAIClient) {
        throw new Error('Failed to initialize Gemini AI client'); 
      }

      const model = genAIClient.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      const prompt = `You are an expert tutor in ${subject}. A student got this question ${userAnswer === correctAnswer ? 'correct ✓' : 'incorrect ✗'}.

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Provide:
1. Detailed explanation of the correct answer
2. Why this is the right approach
3. Common mistakes students make
4. Tips for remembering this concept
5. Similar problems to practice`; 

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ]
      }); 
      const explanation = result.response.text(); 

      console.log(`[AITutor] Generated explanation from Gemini API for ${subject}`); 

      return {
        success: true,
        explanation: explanation
      }; 
    } catch (error) {
      console.error('Error generating explanation:', error.message); 
      throw error; 
    }
  }

  /**
   * Generate personalized learning recommendations
   */
  static async generateLearningRecommendations(userPerformance, subject) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required for AI recommendations'); 
      }

      const genAIClient = getGenAI(); 
      if (!genAIClient) {
        throw new Error('Failed to initialize Gemini AI client'); 
      }

      const model = genAIClient.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      const prompt = `You are an expert learning advisor. Based on the student's performance data, provide personalized recommendations:

Subject: ${subject}
Total Quizzes Taken: ${userPerformance.totalQuizzes}
Average Score: ${userPerformance.averageScore}%
Weak Topics: ${userPerformance.weakTopics.join(', ')}
Strong Topics: ${userPerformance.strongTopics.join(', ')}
Consistency Score: ${userPerformance.consistency}%

Provide:
1. Top 3 priority topics to focus on
2. Recommended study schedule
3. Specific practice techniques
4. How to leverage strong areas
5. Motivation and confidence building tips

Format as actionable items. Be specific and encouraging.`; 

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ]
      }); 
      
      return {
        success: true,
        recommendations: result.response.text(),
        timestamp: new Date()
      }; 
    } catch (error) {
      console.error('Error generating recommendations:', error.message); 
      throw error; 
    }
  }

  /**
   * Generate adaptive difficulty level based on performance
   */
  static async suggestDifficultyLevel(averageScore, recentPerformance) {
    try {
      if (averageScore >= 85) {
        return 'hard'; 
      } else if (averageScore >= 70) {
        return 'medium'; 
      } else {
        return 'easy'; 
      }
    } catch (error) {
      console.error('Error suggesting difficulty:', error); 
      return 'medium'; 
    }
  }
}

module.exports = AITutorService; 