import React, { useState, useEffect } from 'react'; 
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; 
import { TrendingUp, Target, BookOpen, ArrowLeft, Sparkles, Loader, Trophy, Flame, Brain, RefreshCw } from 'lucide-react'; 
import Navbar from './Navbar'; 

const AnalyticsDashboard = ({ onNavigate }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'
  const [analytics, setAnalytics] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [allQuizzes, setAllQuizzes] = useState([]); 
  const [allQATests, setAllQATests] = useState([]); 

  useEffect(() => {
    loadAnalytics(); 

    // Reload analytics when page becomes visible (user returns from another page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing analytics...'); 
        loadAnalytics(); 
      }
    }; 

    // Also listen for focus event
    const handleFocus = () => {
      console.log('Window focused, refreshing analytics...'); 
      loadAnalytics(); 
    }; 

    document.addEventListener('visibilitychange', handleVisibilityChange); 
    window.addEventListener('focus', handleFocus); 

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange); 
      window.removeEventListener('focus', handleFocus); 
    }; 
  }, []); 

  const loadAnalytics = async () => {
    setError(''); 
    setLoading(true); 
    try {
      const token = localStorage.getItem('authToken'); 
      if (!token) {
        setError('Please login to view analytics'); 
        setAnalytics(null); 
        return; 
      }

      const response = await fetch(`${API_BASE_URL}/gamification/analytics/dashboard`, {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }); 

      if (response.ok) {
        const data = await response.json(); 
        console.log('Analytics response:', data); 
        
        if (data.analytics) {
          setAnalytics(data.analytics); 
        } else if (data.success) {
          // Backend returns success but analytics might be in root
          setAnalytics(data); 
        } else {
          throw new Error('Invalid analytics response'); 
        }
      } else if (response.status === 401) {
        setError('Session expired. Please login again.'); 
        setAnalytics(null); 
      } else {
        const errorData = await response.json().catch(() => ({})); 
        console.error('API Error:', errorData); 
        setError(errorData.error || 'Failed to load analytics'); 
        setAnalytics(null); 
      }
    } catch (error) {
      console.error('Error loading analytics:', error); 
      setError(error.message || 'Failed to load analytics'); 
      setAnalytics(null); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Fetch all quizzes from database
  const fetchAllQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }); 
      const data = await response.json(); 
      
      if (data.success && data.quizzes && data.quizzes.length > 0) {
        const formattedQuizzes = data.quizzes.map((quiz) => {
          const createdDate = new Date(quiz.completedAt || quiz.createdAt); 
          const today = new Date(); 
          const yesterday = new Date(today); 
          yesterday.setDate(yesterday.getDate() - 1); 

          let dateStr = ''; 
          if (createdDate.toDateString() === today.toDateString()) {
            dateStr = 'Today'; 
          } else if (createdDate.toDateString() === yesterday.toDateString()) {
            dateStr = 'Yesterday'; 
          } else {
            const daysAgo = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)); 
            dateStr = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`; 
          }

          let scorePercentage = 0; 
          if (quiz.score !== undefined && quiz.score !== null) {
            scorePercentage = Math.round(quiz.score); 
          } else if (quiz.scorePercentage !== undefined && quiz.scorePercentage !== null) {
            scorePercentage = Math.round(quiz.scorePercentage); 
          }

          return {
            id: quiz._id,
            topic: quiz.title || quiz.subject || 'Quiz',
            score: scorePercentage,
            date: dateStr,
            difficulty: quiz.difficulty || 'Medium',
            examType: quiz.examType || 'Competitive',
          }; 
        }); 
        setAllQuizzes(formattedQuizzes); 
      } else {
        setAllQuizzes([]); 
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error); 
      setAllQuizzes([]); 
    }
  }; 

  // Fetch all QA tests from database
  const fetchAllQATests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qa-tests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }); 
      const data = await response.json(); 
      
      if (data.success && data.tests && data.tests.length > 0) {
        const formattedTests = data.tests.map((test) => {
          const createdDate = new Date(test.completedAt || test.createdAt); 
          const today = new Date(); 
          const yesterday = new Date(today); 
          yesterday.setDate(yesterday.getDate() - 1); 

          let dateStr = ''; 
          if (createdDate.toDateString() === today.toDateString()) {
            dateStr = 'Today'; 
          } else if (createdDate.toDateString() === yesterday.toDateString()) {
            dateStr = 'Yesterday'; 
          } else {
            const daysAgo = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)); 
            dateStr = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`; 
          }

          let scorePercentage = 0; 
          if (test.score !== undefined && test.score !== null) {
            scorePercentage = Math.round(test.score); 
          } else if (test.scorePercentage !== undefined && test.scorePercentage !== null) {
            scorePercentage = Math.round(test.scorePercentage); 
          }

          return {
            id: test._id,
            topic: test.question || 'QA Test',
            score: scorePercentage,
            date: dateStr,
          }; 
        }); 
        setAllQATests(formattedTests); 
      } else {
        setAllQATests([]); 
      }
    } catch (error) {
      console.error('Error fetching QA tests:', error); 
      setAllQATests([]); 
    }
  }; 

  useEffect(() => {
    loadAnalytics(); 
    fetchAllQuizzes(); 
    fetchAllQATests(); 
  }, []); 

  // Calculate 7-day score trend from analytics data
  const calculateScoreTrend = () => {
    const today = new Date(); 
    const trends = {}; 
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 

    // Initialize last 7 days
    for (let i = 6;  i >= 0;  i--) {
      const date = new Date(today); 
      date.setDate(date.getDate() - i); 
      const dayKey = dayNames[date.getDay()]; 
      trends[dayKey] = { scores: [], day: dayKey }; 
    }

    // Add quiz scores
    if (allQuizzes && allQuizzes.length > 0) {
      allQuizzes.forEach(quiz => {
        if (quiz.score && quiz.date) {
          let quizDate = new Date(); 
          if (quiz.date === 'Today') {
            // Today - no change
          } else if (quiz.date === 'Yesterday') {
            quizDate.setDate(quizDate.getDate() - 1); 
          } else if (quiz.date.includes('days ago')) {
            const daysAgo = parseInt(quiz.date); 
            quizDate.setDate(quizDate.getDate() - daysAgo); 
          }
          const dayKey = dayNames[quizDate.getDay()]; 
          if (trends[dayKey]) {
            trends[dayKey].scores.push(quiz.score); 
          }
        }
      }); 
    }

    // Add QA test scores
    if (allQATests && allQATests.length > 0) {
      allQATests.forEach(test => {
        if (test.score && test.date) {
          let testDate = new Date(); 
          if (test.date === 'Today') {
            // Today - no change
          } else if (test.date === 'Yesterday') {
            testDate.setDate(testDate.getDate() - 1); 
          } else if (test.date.includes('days ago')) {
            const daysAgo = parseInt(test.date); 
            testDate.setDate(testDate.getDate() - daysAgo); 
          }
          const dayKey = dayNames[testDate.getDay()]; 
          if (trends[dayKey]) {
            trends[dayKey].scores.push(test.score); 
          }
        }
      }); 
    }

    // Calculate average for each day
    return Object.values(trends).map(item => ({
      day: item.day,
      score: item.scores.length > 0 ? Math.round(item.scores.reduce((a, b) => a + b) / item.scores.length) : 0
    })); 
  }; 

  const scoreTrendData = calculateScoreTrend(); 

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 relative">
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} isLoggedIn={true} />

      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-green-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-emerald-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header - Below Main Navbar */}
      <div className="pt-[70px] md:pt-[75px] bg-slate-950/50 backdrop-blur-xl border-b border-purple-500/20 relative z-40 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-green-400 hover:border hover:border-green-500/30"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg shadow-green-500/20">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Learning Analytics
                  </h1>
                  <p className="text-xs text-slate-400">Track your progress & insights</p>
                </div>
              </div>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh analytics"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                  <Loader className="animate-spin text-green-400" size={48} />
                </div>
                <p className="text-slate-300 font-medium">Loading analytics...</p>
                <p className="text-slate-500 text-sm mt-2">Please wait</p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Total Quizzes', value: analytics?.summary?.totalQuizzes || 0, icon: Target, bgGradient: 'from-cyan-600/20 to-blue-600/20', borderHover: 'hover:border-cyan-500/60', textColor: 'text-cyan-400' },
                  { label: 'Total Notes', value: analytics?.summary?.totalNotes || 0, icon: BookOpen, bgGradient: 'from-green-600/20 to-emerald-600/20', borderHover: 'hover:border-green-500/60', textColor: 'text-green-400' },
                  { label: 'Avg Score', value: `${analytics?.summary?.overallAverage || 0}%`, icon: TrendingUp, bgGradient: 'from-yellow-600/20 to-orange-600/20', borderHover: 'hover:border-yellow-500/60', textColor: 'text-yellow-400' },
                  { label: 'Trend', value: analytics?.summary?.improvementTrend === 'improving' ? '📈 Up' : analytics?.summary?.improvementTrend === 'declining' ? '📉 Down' : '➡️ Stable', icon: TrendingUp, bgGradient: 'from-purple-600/20 to-pink-600/20', borderHover: 'hover:border-purple-500/60', textColor: 'text-purple-400' },
                ].map((stat, i) => {
                  const Icon = stat.icon; 
                  return (
                    <div key={i} className={`group bg-gradient-to-br ${stat.bgGradient} border border-slate-700/50 ${stat.borderHover} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">{stat.label}</span>
                          <Icon size={24} className={stat.textColor} />
                        </div>
                        <div className="text-4xl font-bold text-white">{stat.value}</div>
                      </div>
                    </div>
                  ); 
                })}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                {/* Subject Performance */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl overflow-hidden">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-cyan-400" />
                    Subject Performance
                  </h2>
                  {analytics?.subjectPerformance?.length > 0 ? (
                    <div className="w-full h-48 overflow-hidden">
                      <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.subjectPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="subject" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Bar dataKey="averageScore" fill="#06b6d4" name="Avg Score" />
                        <Bar dataKey="bestScore" fill="#10b981" name="Best Score" />
                      </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-400">
                      No subject data yet
                    </div>
                  )}
                </div>

                {/* Weekly Activity - Score Trend (7 Days) */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl overflow-hidden">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    Score Trend (7 Days)
                  </h2>
                  {scoreTrendData && scoreTrendData.length > 0 ? (
                    <div className="w-full h-48 overflow-hidden">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={scoreTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                          <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid #06b6d4',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                            formatter={(value) => [`${value}%`, 'Average Score']}
                          />
                          <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-400">
                      No score data yet
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-green-400" />
                  Key Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/60 transition">
                    <p className="text-cyan-300 font-semibold mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-white">{analytics?.streak?.currentStreak ?? analytics?.summary?.currentStreak ?? 0} days</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 hover:border-green-500/60 transition">
                    <p className="text-green-300 font-semibold mb-1">Best Performing Subject</p>
                    <p className="text-xl font-bold text-white">{(() => {
                      if (!analytics?.subjectPerformance || analytics.subjectPerformance.length === 0) return 'N/A'; 
                      const best = analytics.subjectPerformance.reduce((max, subject) => 
                        (!max.subject || subject.averageScore > max.averageScore) ? subject : max
                      , {}); 
                      return best.subject || 'N/A'; 
                    })()}</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/60 transition">
                    <p className="text-orange-300 font-semibold mb-1">Study Recommendation</p>
                    <p className="text-sm text-white">{(() => {
                      if (!analytics?.subjectPerformance || analytics.subjectPerformance.length === 0) return 'Keep practicing!'; 
                      const worst = analytics.subjectPerformance.reduce((min, subject) => 
                        (!min.subject || subject.averageScore < min.averageScore) ? subject : min
                      , {}); 
                      if (worst.averageScore < 60) {
                        return `Focus on ${worst.subject || 'weak areas'}`; 
                      }
                      return 'Keep practicing!'; 
                    })()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  ); 
}; 

export default AnalyticsDashboard; 