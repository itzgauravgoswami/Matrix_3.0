import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { aiTutorAPI } from '../api/api'

export default function AITutor() {
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'intermediate'
  })
  
  // Chat state
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStartSession = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    try {
      const response = await aiTutorAPI.startSession({
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty
      })

      if (response.data.success) {
        setSessionId(response.data.sessionId)
        setMessages([
          {
            id: 1,
            role: 'assistant',
            content: response.data.welcomeMessage,
            timestamp: new Date()
          }
        ])
        setSessionStarted(true)
        console.log('✅ Session started:', response.data.sessionId)
      }
    } catch (err) {
      console.error('❌ Error starting session:', err)
      setError(err.response?.data?.message || 'Failed to start tutoring session')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setError('')
    const userMessage = input.trim()
    setInput('')

    // Add user message to UI immediately
    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    setLoading(true)

    try {
      const response = await aiTutorAPI.sendMessage({
        sessionId,
        message: userMessage,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty
      })

      if (response.data.success) {
        const aiMsg = {
          id: messages.length + 2,
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMsg])
        console.log('✅ Message sent successfully')
      }
    } catch (err) {
      console.error('❌ Error sending message:', err)
      setError(err.response?.data?.message || 'Failed to send message')
      // Remove user message if there was an error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    try {
      await aiTutorAPI.endSession({ sessionId })
      setSessionStarted(false)
      setSessionId(null)
      setMessages([])
      setFormData({ subject: '', topic: '', difficulty: 'intermediate' })
      console.log('✅ Session ended')
    } catch (err) {
      console.error('❌ Error ending session:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto mt-16">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-robot text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Tutor</h1>
                <p className="text-gray-600 mt-1">Get personalized tutoring powered by artificial intelligence</p>
              </div>
            </div>
          </div>

          {!sessionStarted ? (
            // Form View
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Benefits */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Why AI Tutor?</h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      <i className="fas fa-clock text-orange-600 mr-2"></i>24/7 Available
                    </p>
                    <p className="text-xs text-gray-600">Learn whenever you want</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      <i className="fas fa-brain text-orange-600 mr-2"></i>Personalized
                    </p>
                    <p className="text-xs text-gray-600">Tailored to your pace</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      <i className="fas fa-star text-orange-600 mr-2"></i>Patient Guidance
                    </p>
                    <p className="text-xs text-gray-600">Clear explanations</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-pen mr-3 text-orange-600"></i>
                  Start Your Tutoring Session
                </h2>
                <form onSubmit={handleStartSession} className="space-y-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics, Physics, Chemistry, Biology"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      placeholder="e.g., Calculus, Newton's Laws, Photosynthesis"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Difficulty Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <i className="fas fa-spinner animate-spin"></i>
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-comments"></i>
                        Start Chat Session
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Chat View
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <i className="fas fa-comments"></i>
                      AI Tutor Chat
                    </h2>
                    <p className="text-orange-100 mt-1">
                      {formData.subject} - {formData.topic} ({formData.difficulty})
                    </p>
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
                  >
                    <i className="fas fa-times mr-2"></i>
                    End Session
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border-2 border-gray-200'
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 px-4 py-3 rounded-lg rounded-bl-none border-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-spinner animate-spin text-orange-500"></i>
                        <span className="text-sm">AI Tutor is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t-2 border-gray-200 p-6 bg-white">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your question..."
                    disabled={loading}
                    className="flex-grow px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-base disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <i className="fas fa-spinner animate-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
