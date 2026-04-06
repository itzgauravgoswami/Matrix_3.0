import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
}

// Notes API calls
export const notesAPI = {
  generateNotes: (data) => api.post('/notes/generate', data)
}

// Quiz API calls
export const quizAPI = {
  generateQuiz: (data) => api.post('/quiz/generate', data),
  submitQuiz: (data) => api.post('/quiz/submit', data)
}

// QA API calls
export const qaAPI = {
  generateQA: (data) => api.post('/qa/generate', data),
  evaluateQA: (data) => api.post('/qa/evaluate', data)
}

// Supreme Learning API calls
export const supremeLearningAPI = {
  generate: (data) => api.post('/supreme-learning/generate', data)
}

// AI Tutor API calls
export const aiTutorAPI = {
  startSession: (data) => api.post('/ai-tutor/start-session', data),
  sendMessage: (data) => api.post('/ai-tutor/send-message', data),
  getHistory: (sessionId) => api.get(`/ai-tutor/history/${sessionId}`),
  endSession: (data) => api.post('/ai-tutor/end-session', data)
}

export default api
