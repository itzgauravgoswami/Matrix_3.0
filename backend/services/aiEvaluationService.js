/**
 * AI Evaluation Service
 * Handles AI-powered question generation and answer evaluation using Google Gemini API
 * @module services/aiEvaluationService
 */

const fetch = require('node-fetch'); 

// ==================== CONSTANTS ====================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'; 

// Exam type to description mapping for contextual prompt generation
const EXAM_CONTEXT_MAP = {
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

const DEFAULT_EXAM_TYPE = 'competitive'; 
const MAX_QUESTIONS = 20; 
const MIN_QUESTIONS = 1; 
const DEFAULT_MARKS = 10; 
const MIN_MARKS = 2; 
const MAX_MARKS_PER_Q = 10; 
const API_TIMEOUT = 30000; 
const API_RETRIES = 3; 

// ==================== VALIDATION ====================

/**
 * Validates API key configuration
 * @throws {Error} If GEMINI_API_KEY is not set
 */
const validateApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not configured'); 
  }
}; 

/**
 * Validates question generation inputs
 * @throws {Error} If validation fails
 */
const validateQuestionInputs = (subject, topic, difficulty, numQuestions) => {
  if (!subject?.trim() || !topic?.trim()) {
    throw new Error('Subject and topic are required'); 
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new Error('Difficulty must be: easy, medium, or hard'); 
  }

  if (!Number.isInteger(numQuestions) || numQuestions < MIN_QUESTIONS || numQuestions > MAX_QUESTIONS) {
    throw new Error(`Number of questions must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`); 
  }
}; 

/**
 * Validates evaluation inputs
 * @throws {Error} If validation fails
 */
const validateEvaluationInputs = (question, userAnswer, subject, expectedKeyPoints) => {
  if (!question?.trim() || !userAnswer?.trim() || !subject?.trim()) {
    throw new Error('Question, answer, and subject are required'); 
  }

  if (!Array.isArray(expectedKeyPoints) || expectedKeyPoints.length === 0) {
    throw new Error('Expected key points must be a non-empty array'); 
  }
}; 

// ==================== HELPER FUNCTIONS ====================

/**
 * Builds question generation prompt
 */
const buildQuestionPrompt = (subject, topic, difficulty, numQuestions, examType) => {
  const examContext = EXAM_CONTEXT_MAP[examType] || EXAM_CONTEXT_MAP[DEFAULT_EXAM_TYPE]; 

  return `Generate exactly ${numQuestions} most frequently asked exam questions about "${subject} - ${topic}" at ${difficulty} level for ${examContext}.

Format response as VALID JSON array ONLY (no markdown):
[
  {
    "questionId": 1,
    "question": "Question text?",
    "questionType": "short-answer",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"],
    "examFrequency": "High",
    "difficulty": "${difficulty}",
    "marks": 10,
    "isPYQ": true,
    "pyqYears": [2023, 2022, 2021]
  }
]

REQUIREMENTS:
- Generate EXACTLY ${numQuestions} questions
- Each field MUST be valid JSON-safe string (escape quotes, newlines, backslashes)
- questionType must be one of: "short-answer", "descriptive", "conceptual"
- expectedKeyPoints must be an array of 3-5 strings
- examFrequency must be one of: "Very High", "High", "Medium"
- marks must be exactly 10 (each question is worth 10 marks)
- isPYQ must be boolean true or false
- pyqYears must be array of numbers or empty array if not PYQ
- Return ONLY valid JSON, NO markdown, NO extra text`; 
}; 

/**
 * Builds answer evaluation prompt
 */
const buildEvaluationPrompt = (question, userAnswer, subject, expectedKeyPoints) => {
  // Sanitize inputs to prevent JSON breaking
  const sanitize = (str) => String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n'); 
  
  return `Evaluate this student's answer:

Subject: ${sanitize(subject)}
Question: ${sanitize(question)}

Expected Key Points:
${expectedKeyPoints.map((kp, i) => `${i + 1}. ${sanitize(kp)}`).join('\n')}

Student's Answer:
${sanitize(userAnswer)}

Respond with ONLY this JSON (no markdown):
{
  "score": <0-100>,
  "scoredMarks": <marks earned out of 10>,
  "maxMarks": 10,
  "coveragePercentage": <0-100>,
  "keyPointsCovered": ["<point 1>", "<point 2>"],
  "keyPointsMissed": ["<missed point 1>", "<missed point 2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"],
  "modelAnswer": "<detailed model answer with formulas>",
  "feedback": "<feedback>"
}

RULES:
- Score based on key point coverage
- Model answer should include step-by-step explanations and formulas
- Use LaTeX for mathematical expressions: $inline$ for inline math
- Be constructive and encouraging
- Return ONLY valid JSON, no extra text`; 
}; 

/**
 * Extracts and parses JSON from response
 */
const extractJSON = (text) => {
  let clean = text.trim(); 

  // Remove markdown code blocks
  if (clean.includes('```')) {
    clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(); 
  }

  try {
    return JSON.parse(clean); 
  } catch (error) {
    throw new Error(`JSON parse failed: ${error.message}`); 
  }
}; 

/**
 * Calls Gemini API with retry logic
 */
const callGeminiAPI = async (requestBody, retries = API_RETRIES) => {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`; 

  for (let attempt = 1;  attempt <= retries;  attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        timeout: API_TIMEOUT
      }); 

      if (!response.ok) {
        const errorData = await response.json(); 
        const msg = errorData?.error?.message || response.statusText; 
        throw new Error(`API ${response.status}: ${msg}`); 
      }

      return await response.json(); 
    } catch (error) {
      if (attempt === retries) throw error; 
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)); 
    }
  }
}; 

/**
 * Normalizes question object
 */
const normalizeQuestion = (q, index, difficulty) => ({
  questionId: index + 1,
  question: q.question || '',
  questionType: q.questionType || 'short-answer',
  expectedKeyPoints: Array.isArray(q.expectedKeyPoints) ? q.expectedKeyPoints : [],
  examFrequency: q.examFrequency || 'High',
  difficulty: q.difficulty || difficulty,
  marks: Number.isInteger(q.marks) && q.marks >= MIN_MARKS && q.marks <= MAX_MARKS_PER_Q
    ? q.marks
    : DEFAULT_MARKS,
  isPYQ: q.isPYQ === true,
  pyqYears: Array.isArray(q.pyqYears) && q.pyqYears.length > 0 ? q.pyqYears : []
}); 

/**
 * Normalizes evaluation object
 */
const normalizeEvaluation = (evalResult) => ({
  score: Math.min(100, Math.max(0, evalResult.score || 0)),
  scoredMarks: evalResult.scoredMarks || 0,
  maxMarks: evalResult.maxMarks || 10,
  coveragePercentage: Math.min(100, Math.max(0, evalResult.coveragePercentage || 0)),
  keyPointsCovered: Array.isArray(evalResult.keyPointsCovered) ? evalResult.keyPointsCovered : [],
  keyPointsMissed: Array.isArray(evalResult.keyPointsMissed) ? evalResult.keyPointsMissed : [],
  strengths: Array.isArray(evalResult.strengths) ? evalResult.strengths : [],
  weaknesses: Array.isArray(evalResult.weaknesses) ? evalResult.weaknesses : [],
  improvementSuggestions: Array.isArray(evalResult.improvementSuggestions) ? evalResult.improvementSuggestions : [],
  modelAnswer: evalResult.modelAnswer || '',
  feedback: evalResult.feedback || ''
}); 

// ==================== MAIN FUNCTIONS ====================

/**
 * Generate exam questions using AI
 * 
 * @param {string} subject - Subject (e.g., "Physics")
 * @param {string} topic - Topic (e.g., "Thermodynamics")
 * @param {string} difficulty - Level ("easy"|"medium"|"hard")
 * @param {number} numQuestions - Questions count (1-20)
 * @param {string} examType - Exam type (default: "competitive")
 * @returns {Promise<Array>} Array of questions
 * @throws {Error} On API failure or validation error
 */
const generateExamQuestions = async (
  subject,
  topic,
  difficulty,
  numQuestions = 5,
  examType = DEFAULT_EXAM_TYPE
) => {
  try {
    validateApiKey(); 
    validateQuestionInputs(subject, topic, difficulty, numQuestions); 

    console.log(`[QA Service] Generating ${numQuestions} ${difficulty} questions for ${subject} - ${topic} (${examType})`); 

    const prompt = buildQuestionPrompt(subject, topic, difficulty, numQuestions, examType); 
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
    }; 

    const apiResponse = await callGeminiAPI(requestBody); 

    // Extract response text
    const responseText = apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text; 
    if (!responseText) {
      throw new Error('Unexpected API response format'); 
    }

    // Parse and validate
    const questions = extractJSON(responseText); 
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from API'); 
    }

    if (questions.length !== numQuestions) {
      console.warn(`[QA Service] Got ${questions.length} questions instead of ${numQuestions}`); 
    }

    // Normalize questions
    const normalized = questions.map((q, i) => normalizeQuestion(q, i, difficulty)); 

    console.log(`[QA Service] ✓ Generated ${normalized.length} questions`); 
    return normalized; 

  } catch (error) {
    console.error('[QA Service] Error generating questions:', error.message); 

    // User-friendly error messages
    if (error.message.includes('404')) {
      throw new Error('AI service unavailable. Please try again later.'); 
    }
    if (error.message.includes('429')) {
      throw new Error('Rate limited. Please wait and try again.'); 
    }

    throw error; 
  }
}; 

/**
 * Evaluate student answer with AI feedback
 * 
 * @param {string} question - The question text
 * @param {string} userAnswer - Student's answer
 * @param {string} subject - Subject area
 * @param {Array<string>} expectedKeyPoints - Expected key points
 * @returns {Promise<object>} Evaluation with score and feedback
 * @throws {Error} On API failure or validation error
 */
const evaluateAnswer = async (question, userAnswer, subject, expectedKeyPoints) => {
  try {
    validateApiKey(); 
    validateEvaluationInputs(question, userAnswer, subject, expectedKeyPoints); 

    console.log(`[QA Service] Evaluating answer for: ${question.substring(0, 50)}...`); 

    const prompt = buildEvaluationPrompt(question, userAnswer, subject, expectedKeyPoints); 
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
    }; 

    const apiResponse = await callGeminiAPI(requestBody); 

    // Extract response text
    const responseText = apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text; 
    if (!responseText) {
      throw new Error('Unexpected API response format'); 
    }

    // Parse and normalize
    const evaluation = extractJSON(responseText); 
    const normalized = normalizeEvaluation(evaluation); 

    console.log(`[QA Service] ✓ Evaluation complete - Score: ${normalized.score}%`); 
    return normalized; 

  } catch (error) {
    console.error('[QA Service] Error evaluating answer:', error.message); 

    // User-friendly error messages
    if (error.message.includes('404')) {
      throw new Error('AI service unavailable. Please try again later.'); 
    }
    if (error.message.includes('429')) {
      throw new Error('Rate limited. Please wait and try again.'); 
    }

    throw error; 
  }
}; 

// ==================== EXPORTS ====================

module.exports = {
  generateExamQuestions,
  evaluateAnswer
}; 
