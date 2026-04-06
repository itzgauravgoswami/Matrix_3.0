import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function LearningPath() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    goal: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Creating learning path:', formData)
    setTimeout(() => setLoading(false), 2000)
  }

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Economics'
  ]

  const pathExamples = [
    { name: 'Competitive Exams', duration: '6-12 months', icon: '🎯' },
    { name: 'Skill Development', duration: '3-6 months', icon: '🚀' },
    { name: 'Academic Excellence', duration: '1-2 years', icon: '🏆' },
    { name: 'Quick Learning', duration: '1-3 months', icon: '⚡' }
  ]

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
                <i className="fas fa-road text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Learning Path</h1>
                <p className="text-gray-600 mt-1">Follow curated learning paths tailored to your goals</p>
              </div>
            </div>
          </div>

          {/* Path Examples */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {pathExamples.map((path, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200 text-center">
                <div className="text-4xl mb-2">{path.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{path.name}</h4>
                <p className="text-sm text-gray-600">{path.duration}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-compass mr-3 text-orange-600"></i>
              Create Your Learning Path
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Goal */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  What exam or goal are you preparing for? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="e.g., JEE Main, NEET, Board Exam, GATE, Competitive Exam Preparation"
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base resize-none"
                />
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
                    Creating Path...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Create Learning Path
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="text-4xl mb-3 text-blue-600">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Structured Timeline</h3>
              <p className="text-gray-700">Clear milestones and deadlines to keep you on track</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="text-4xl mb-3 text-purple-600">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Path</h3>
              <p className="text-gray-700">Customized curriculum based on your goals and level</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-4xl mb-3 text-green-600">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-700">Monitor your progress and get adaptive recommendations</p>
            </div>
          </div>

          {/* Pre-made Paths */}
          <div className="mt-8 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <i className="fas fa-list text-orange-600 mr-2"></i>
              Popular Pre-made Paths
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-white rounded-lg hover:bg-orange-100 transition-all border-2 border-orange-200">
                📚 <strong>JEE Main Preparation</strong> - 6 months path for competitive exams
              </button>
              <button className="w-full p-3 text-left bg-white rounded-lg hover:bg-orange-100 transition-all border-2 border-orange-200">
                💻 <strong>Full Stack Development</strong> - 3 months path to master web development
              </button>
              <button className="w-full p-3 text-left bg-white rounded-lg hover:bg-orange-100 transition-all border-2 border-orange-200">
                🔬 <strong>NEET Preparation</strong> - 6 months path for medical entrance exams
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
