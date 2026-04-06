import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/')
      return
    }

    setUser(JSON.parse(userData))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const features = [
    {
      id: 1,
      title: 'Generate Notes',
      description: 'AI-powered notes generation from any subject or topic',
      icon: 'fa-file-alt',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/generate-notes'
    },
    {
      id: 2,
      title: 'Generate Quiz',
      description: 'Create customized quizzes to test your knowledge',
      icon: 'fa-question-circle',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/generate-quiz'
    },
    {
      id: 3,
      title: 'Generate Q&A',
      description: 'Get instant answers to your subject questions',
      icon: 'fa-comments',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/generate-qa'
    },
    {
      id: 4,
      title: 'Supreme Learning',
      description: 'Access premium learning resources and courses',
      icon: 'fa-crown',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/supreme-learning'
    },
    {
      id: 5,
      title: 'AI Tutor',
      description: 'Get personalized tutoring powered by artificial intelligence',
      icon: 'fa-robot',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/ai-tutor'
    },
    {
      id: 6,
      title: 'Gamification',
      description: 'Learn through games and earn badges and streaks',
      icon: 'fa-gamepad',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/gamification'
    },
    {
      id: 7,
      title: 'Analytics',
      description: 'Track your learning progress with detailed analytics',
      icon: 'fa-chart-line',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/analytics'
    },
    {
      id: 8,
      title: 'Learning Path',
      description: 'Follow curated learning paths tailored to your goals',
      icon: 'fa-road',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/learning-path'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto mt-16">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Welcome, <span className="text-orange-500">{user?.name || 'Learner'}</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a tool to enhance your learning journey
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => navigate(feature.route)}
                className={`${feature.color} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-orange-100 hover:border-orange-500`}
              >
                {/* Icon */}
                <div className="mb-4">
                  <i
                    className={`fas ${feature.icon} ${feature.iconColor} text-4xl`}
                  ></i>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Action Button */}
                <button className="w-full py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2">
                  <span>Explore</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
              <p className="text-gray-600 text-sm">Total Sessions</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
              <p className="text-gray-600 text-sm">Current Streak</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
              <p className="text-gray-600 text-sm">Badges Earned</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500 shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-1">—</div>
              <p className="text-gray-600 text-sm">Global Rank</p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/analytics')}
                className="py-3 px-4 bg-white rounded-lg text-center font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 border-2 border-orange-200 hover:border-orange-500"
              >
                <i className="fas fa-chart-bar mr-2"></i>
                My Analytics
              </button>
              <button
                onClick={() => navigate('/gamification')}
                className="py-3 px-4 bg-white rounded-lg text-center font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 border-2 border-orange-200 hover:border-orange-500"
              >
                <i className="fas fa-trophy mr-2"></i>
                Leaderboard
              </button>
              <button
                onClick={() => navigate('/learning-path')}
                className="py-3 px-4 bg-white rounded-lg text-center font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 border-2 border-orange-200 hover:border-orange-500"
              >
                <i className="fas fa-user mr-2"></i>
                Learning Path
              </button>
              <button
                onClick={handleLogout}
                className="py-3 px-4 bg-white rounded-lg text-center font-semibold text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 border-2 border-red-200 hover:border-red-500"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
