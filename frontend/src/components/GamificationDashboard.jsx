import React, { useState, useEffect } from 'react'; 
import { Award, Flame, TrendingUp, Users, Star, Zap, Trophy, ArrowLeft, Sparkles } from 'lucide-react'; 

const GamificationDashboard = ({ onNavigate }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'
  const [stats, setStats] = useState(null); 
  const [leaderboard, setLeaderboard] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [filterBy, setFilterBy] = useState('level'); 
  const [error, setError] = useState(''); 

  useEffect(() => {
    loadData(); 

    // Reload data when page becomes visible (user returns from another page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing gamification data...'); 
        loadData(); 
      }
    }; 

    // Also listen for focus event
    const handleFocus = () => {
      console.log('Window focused, refreshing gamification data...'); 
      loadData(); 
    }; 

    document.addEventListener('visibilitychange', handleVisibilityChange); 
    window.addEventListener('focus', handleFocus); 

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange); 
      window.removeEventListener('focus', handleFocus); 
    }; 
  }, [filterBy]); 

  const loadData = async () => {
    setLoading(true); 
    setError(''); 
    try {
      const token = localStorage.getItem('authToken'); 
      
      const [statsRes, leaderboardRes] = await Promise.all([
        fetch(`${API_BASE_URL}/gamification/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/gamification/leaderboard?filterBy=${filterBy}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]); 

      if (statsRes.ok) {
        const data = await statsRes.json(); 
        setStats(data.stats || data); 
      } else if (statsRes.status === 401) {
        setError('Session expired. Please login again.'); 
      } else {
        setStats({ userLevel: 1, totalXP: 0, totalBadges: 0, currentStreak: 0, longestStreak: 0, xpToNextLevel: 100 }); 
      }

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json(); 
        setLeaderboard(data.leaderboard || []); 
      } else {
        setLeaderboard([]); 
      }
    } catch (error) {
      console.error('Error loading data:', error); 
      setError('Failed to load gamification data'); 
      setStats({ userLevel: 1, totalXP: 0, totalBadges: 0, currentStreak: 0, longestStreak: 0, xpToNextLevel: 100 }); 
      setLeaderboard([]); 
    } finally {
      setLoading(false); 
    }
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Background */}
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
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-orange-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-yellow-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header/Navbar */}
      <div className="sticky top-0 z-40 pt-[70px] md:pt-[75px] bg-slate-950/50 backdrop-blur-xl border-b border-purple-500/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-yellow-400 hover:border hover:border-yellow-500/30"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg shadow-yellow-500/20">
                  <Trophy className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Gamification Hub
                  </h1>
                  <p className="text-xs text-slate-400">Track your progress and compete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-3 mb-6">
                <Sparkles className="text-yellow-400 animate-spin" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Loading your stats...</h2>
              <p className="text-slate-400">Please wait while we fetch your gamification data</p>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {/* Level Card */}
              <div className="group bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Your Level</h3>
                    <Star className="text-yellow-400" size={24} />
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{stats.userLevel || 1}</div>
                  <div className="text-blue-200 mb-4">Total XP: <span className="font-bold text-cyan-400">{(stats.totalXP || 0).toLocaleString()}</span></div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress to next level</span>
                      <span>{Math.min((stats.totalXP % 100) || 0, 100)}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.totalXP % 100) || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges Card */}
              <div className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Badges</h3>
                    <Award className="text-purple-400" size={24} />
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{stats.totalBadges || 0}</div>
                  <p className="text-purple-200 mb-4">Achievements Unlocked</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Array(8).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center"
                      >
                        {i < (stats.totalBadges || 0) ? (
                          <span className="text-lg">⭐</span>
                        ) : (
                          <span className="text-slate-600">?</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="group bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 hover:border-orange-500/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-orange-300 uppercase tracking-wider">Current Streak</h3>
                    <Flame className="text-orange-400 animate-bounce" size={24} />
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{stats.currentStreak || 0}</div>
                  <p className="text-orange-200 mb-4">Best: {stats.longestStreak || 0} days</p>
                  <p className="text-sm text-slate-400">Keep learning daily to maintain your streak!</p>
                </div>
              </div>

              {/* Total Stats Card */}
              <div className="group bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-500/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wider">Summary</h3>
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Level</span>
                      <span className="text-xl font-bold text-white">{stats.userLevel || 1}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Badges</span>
                      <span className="text-xl font-bold text-white">{stats.totalBadges || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Streak</span>
                      <span className="text-xl font-bold text-white">{stats.currentStreak || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950 border border-purple-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl overflow-hidden">
              {/* Gradient orbs for background */}
              <div className="absolute top-1/3 -right-40 w-48 h-48 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-32 w-56 h-56 bg-pink-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/80 to-pink-500/80 rounded-lg shadow-lg shadow-purple-500/20">
                    <Users className="text-white shadow-lg shadow-purple-500/20" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Global Leaderboard</h2>
                    <p className="text-sm text-slate-400">Top performers and champions</p>
                  </div>
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-slate-800/60 text-white px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500 outline-none transition duration-200"
                >
                  <option value="level">Sort by Level</option>
                  <option value="streak">Sort by Streak</option>
                  <option value="badges">Sort by Badges</option>
                </select>
              </div>

              <div className="relative z-10 space-y-2">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="text-slate-600 mx-auto mb-3" size={48} />
                    <p className="text-slate-400">No leaderboard data available yet</p>
                  </div>
                ) : (
                  leaderboard.slice(0, 10).map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-gradient-to-r from-slate-800/40 to-slate-900/40 hover:from-slate-800/60 hover:to-slate-900/60 border border-slate-700/30 hover:border-purple-500/40 rounded-xl p-4 transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-yellow-500/30' :
                          idx === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-500 shadow-slate-300/30' :
                          idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-orange-500/30' :
                          'bg-slate-700/60 shadow-slate-600/20'
                        }`}>
                          {idx < 3 ? (
                            <Trophy size={18} />
                          ) : (
                            `#${idx + 1}`
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate group-hover:text-purple-300 transition">{typeof entry.name === 'string' ? entry.name : (typeof entry.userName === 'string' ? entry.userName : (entry.name?.name || 'Anonymous'))}</div>
                        <div className="text-sm text-slate-500">User ID: {typeof entry.userId === 'string' ? entry.userId : (entry.userId?._id || 'Unknown')}</div>
                      </div>
                      <div className="flex gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Level</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">{typeof entry.userLevel === 'number' ? entry.userLevel : 1}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Streak</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{typeof entry.currentStreak === 'number' ? entry.currentStreak : 0}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Badges</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{typeof entry.totalBadges === 'number' ? entry.totalBadges : 0}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Tips Section */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} />
                  Tips to Earn XP & Badges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: '📚 Complete Quizzes', desc: 'Earn XP by taking and passing quizzes' },
                    { title: '🔥 Daily Streaks', desc: 'Login daily to build streaks and unlock streak badges' },
                    { title: '⭐ Achievements', desc: 'Unlock special badges for reaching milestones' }
                  ].map((tip, i) => (
                    <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-1">{tip.title}</h4>
                      <p className="text-sm text-slate-400">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  ); 
}; 

export default GamificationDashboard; 