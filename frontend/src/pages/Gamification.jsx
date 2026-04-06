import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Gamification() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    challengeType: 'daily',
    subject: '',
    difficulty: 'intermediate',
    category: 'general'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Starting challenge:', formData)
    setTimeout(() => setLoading(false), 2000)
  }

  const badges = [
    { name: 'Rising Star', icon: '⭐', points: '100' },
    { name: 'Scholar', icon: '📚', points: '500' },
    { name: 'Master', icon: '🏆', points: '1000' },
    { name: 'Genius', icon: '💡', points: '2000' },
    { name: 'Streak King', icon: '🔥', points: '30 day streak' },
    { name: 'All-Rounder', icon: '🎯', points: 'All subjects' }
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
                <i className="fas fa-gamepad text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Gamification</h1>
                <p className="text-gray-600 mt-1">Learn through games and earn badges and streaks</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-1">0</div>
              <p className="font-semibold">Total Points</p>
            </div>
            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-1">0</div>
              <p className="font-semibold">Current Streak</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-1">0</div>
              <p className="font-semibold">Badges</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold mb-1">—</div>
              <p className="font-semibold">Global Rank</p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-medal text-orange-600 mr-3"></i>
              Available Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200 hover:border-orange-500 transition-all cursor-pointer">
                  <div className="text-5xl mb-2">{badge.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.points}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-crown mr-3 text-orange-600"></i>
              Your Rankings
            </h2>
            
            {/* Global Rank Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <div>
                  <p className="text-gray-700 font-semibold">Global Rank</p>
                  <p className="text-sm text-gray-600">Your position among all users</p>
                </div>
                <div className="text-3xl font-bold text-orange-600">—</div>
              </div>
              
              <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                <div>
                  <p className="text-gray-700 font-semibold">Total Points</p>
                  <p className="text-sm text-gray-600">Accumulated points from all activities</p>
                </div>
                <div className="text-3xl font-bold text-yellow-600">0</div>
              </div>
              
              <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <div>
                  <p className="text-gray-700 font-semibold">Current Streak</p>
                  <p className="text-sm text-gray-600">Days of consecutive activity</p>
                </div>
                <div className="text-3xl font-bold text-red-600">0 days</div>
              </div>
            </div>

            {/* View Leaderboard Button */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full mt-6 py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-list-ol"></i>
              View Global Leaderboard
            </button>
          </div>

          {/* Leaderboard Preview */}
          <div className="mt-8 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <i className="fas fa-trophy text-yellow-600 mr-2"></i>
              Compete & Rank
            </h3>
            <p className="text-gray-700 mb-4">
              Join the global leaderboard and compete with learners from around the world. Earn rewards and recognition as you climb the ranks!
            </p>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all"
            >
              <i className="fas fa-crown mr-2"></i>
              View Leaderboard
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
