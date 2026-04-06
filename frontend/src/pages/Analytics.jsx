import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Analytics() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    period: '30days',
    reportType: 'comprehensive'
  })
  const [loading, setLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Generating analytics:', formData)
    setTimeout(() => {
      setShowReport(true)
      setLoading(false)
    }, 2000)
  }

  const stats = [
    { label: 'Study Hours', value: '0h', icon: 'fa-clock' },
    { label: 'Topics Covered', value: '0', icon: 'fa-book' },
    { label: 'Avg. Score', value: '—', icon: 'fa-star' },
    { label: 'Improvement', value: '—%', icon: 'fa-arrow-up' }
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
                <i className="fas fa-chart-line text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track your learning progress with detailed analytics</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
                <div className="text-3xl text-orange-600 mb-2">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-fire mr-3 text-orange-600"></i>
              Streak & Performance
            </h2>
            
            {/* Streak Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🔥 Current Streak</h3>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Days of Consecutive Learning</p>
                    <p className="text-4xl font-bold text-red-600">0 days</p>
                  </div>
                  <div className="text-6xl">🔥</div>
                </div>
                <p className="text-sm text-gray-600 mt-4">Keep learning daily to maintain your streak!</p>
              </div>
            </div>

            {/* Score Trend Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Score Trend</h3>
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">This Week</span>
                    <span className="text-2xl font-bold text-blue-600">— %</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: '0%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Take more quizzes to build your score trend</p>
                </div>
              </div>
            </div>

            {/* Learning Overview Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Learning Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <span className="text-gray-700 font-semibold">Total Topics Studied</span>
                  <span className="text-2xl font-bold text-purple-600">0</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                  <span className="text-gray-700 font-semibold">Study Time (Hours)</span>
                  <span className="text-2xl font-bold text-green-600">0h</span>
                </div>
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <span className="text-gray-700 font-semibold">Quizzes Completed</span>
                  <span className="text-2xl font-bold text-indigo-600">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-file-pdf text-orange-600 mr-2"></i>
              Detailed Insights
            </h2>

            {/* Report Sections */}
            <div className="space-y-6">
              {/* Learning Patterns */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📊 Learning Patterns
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  <p>Your most active learning period: Not enough data yet</p>
                  <p>Most studied subject: Not enough data yet</p>
                  <p>Average session duration: Not enough data yet</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎯 Performance Metrics
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  <p>Average score: — Weak</p>
                  <p>Quiz attempts: 0</p>
                  <p>Success rate: — %</p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  💪 Strengths & Weaknesses
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  <p><strong>Strongest Areas:</strong> Not enough data</p>
                  <p><strong>Areas to Improve:</strong> Not enough data</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ✨ Personalized Recommendations
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Focus on consistent daily learning habit</li>
                  <li>✓ Start with topics you find challenging</li>
                  <li>✓ Take more quizzes to assess your knowledge</li>
                  <li>✓ Join study groups for collaborative learning</li>
                </ul>
              </div>
            </div>

            {/* Export and Share */}
            <div className="mt-6 flex gap-4">
              <button className="px-6 py-3 bg-orange-50 text-orange-600 rounded-lg font-semibold hover:bg-orange-100 transition-all border-2 border-orange-500">
                <i className="fas fa-download mr-2"></i>
                Download PDF
              </button>
              <button className="px-6 py-3 bg-orange-50 text-orange-600 rounded-lg font-semibold hover:bg-orange-100 transition-all border-2 border-orange-500">
                <i className="fas fa-share-alt mr-2"></i>
                Share Report
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
