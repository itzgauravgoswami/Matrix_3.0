import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AITutor() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    topic: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Booking AI tutor session:', formData)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto mt-16">
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

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="text-3xl text-orange-600 mb-2">
                <i className="fas fa-clock"></i>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">24/7 Available</h4>
              <p className="text-sm text-gray-600">Learn whenever you want, no scheduling conflicts</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="text-3xl text-orange-600 mb-2">
                <i className="fas fa-brain"></i>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Personalized</h4>
              <p className="text-sm text-gray-600">Tailored learning approach based on your pace</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="text-3xl text-orange-600 mb-2">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Progress Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your learning improvements in real-time</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-calendar-alt mr-3 text-orange-600"></i>
              Schedule Your Tutoring Session
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject and Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics, Physics, Chemistry"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., Calculus, Newton's Laws, Organic Chemistry"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    Scheduling Session...
                  </>
                ) : (
                  <>
                    <i className="fas fa-book"></i>
                    Start Tutoring Session
                  </>
                )}
              </button>
            </form>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <i className="fas fa-graduation-cap text-purple-600 mr-2"></i>
              How AI Tutoring Works
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>✓ <strong>Assess:</strong> AI analyzes your current knowledge level</p>
              <p>✓ <strong>Customize:</strong> Personalized learning path created for you</p>
              <p>✓ <strong>Teach:</strong> Interactive explanations with examples</p>
              <p>✓ <strong>Practice:</strong> Guided problem-solving sessions</p>
              <p>✓ <strong>Improve:</strong> Get detailed feedback and improvement tips</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
