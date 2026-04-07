import React, { useEffect, useState } from 'react'; 
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'; 
import { TrendingUp, Calendar, Award, BookOpen, Zap, Star, Crown, Settings, Brain, Trophy, BarChart3, Compass } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
import { formatDateToDDMMYYYY } from '../utils/dateFormatter'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

export default function Dashboard({ onNavigate, userName }) {
  const { user } = useAuth(); 
  const [userSubscription, setUserSubscription] = useState(null); 
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null); 
  const [subscriptionPeriod, setSubscriptionPeriod] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [recentQuizzes, setRecentQuizzes] = useState([]); 
  const [quizzesLoading, setQuizzesLoading] = useState(true); 
  const [recentQATests, setRecentQATests] = useState([]); 
  const [qaTestsLoading, setQATestsLoading] = useState(true); 
  const [allQuizzes, setAllQuizzes] = useState([]);  // Store all quizzes for topic counting
  const [allQATests, setAllQATests] = useState([]);  // Store all QA tests for topic counting
  const [userNotes, setUserNotes] = useState([]); 
  const [notesLoading, setNotesLoading] = useState(true); 
  const [gamificationStats, setGamificationStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    totalXP: 0,
    totalBadges: 0
  }); 

  const fetchSubscriptionData = async () => {
    try {
      // console.log('Fetching subscription data...'); 
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }); 
      const data = await response.json(); 
      if (data.success) {
        // console.log('Dashboard subscription fetched:', data.user.subscriptionPlan); 
        setUserSubscription(data.user.subscriptionPlan || 'free'); 
        setSubscriptionEndDate(data.user.subscriptionEndDate || null); 
        setSubscriptionPeriod(data.user.subscriptionPeriod || null); 
      }
    } catch (error) {
      // console.error('Error fetching subscription:', error); 
      setUserSubscription('free'); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Fetch gamification stats
  const fetchGamificationStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }); 
      const data = await response.json(); 
      if (data.success && data.stats) {
        setGamificationStats({
          currentStreak: data.stats.currentStreak || 0,
          longestStreak: data.stats.longestStreak || 0,
          level: data.stats.level || 1,
          totalXP: data.stats.totalXP || 0,
          totalBadges: data.stats.totalBadges || 0
        }); 
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error); 
    }
  }; 

  // Fetch user subscription on component mount
  useEffect(() => {
    fetchSubscriptionData(); 
    fetchGamificationStats(); 
  }, []); 

  // Listen for storage changes and visibility changes
  useEffect(() => {
    const handleStorageChange = () => {
      // console.log('Storage changed, refreshing subscription...'); 
      fetchSubscriptionData(); 
    }; 

    // Listen for custom payment success event
    const handlePaymentSuccess = () => {
      // console.log('Payment success event received, refreshing subscription...'); 
      fetchSubscriptionData(); 
    }; 

    // Listen for visibility changes to refresh gamification
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Dashboard became visible, refreshing stats...'); 
        fetchGamificationStats(); 
      }
    }; 

    // Listen for focus event
    const handleFocus = () => {
      console.log('Dashboard window focused, refreshing stats...'); 
      fetchGamificationStats(); 
    }; 

    window.addEventListener('storage', handleStorageChange); 
    window.addEventListener('paymentSuccess', handlePaymentSuccess); 
    document.addEventListener('visibilitychange', handleVisibilityChange); 
    window.addEventListener('focus', handleFocus); 
    
    return () => {
      window.removeEventListener('storage', handleStorageChange); 
      window.removeEventListener('paymentSuccess', handlePaymentSuccess); 
      document.removeEventListener('visibilitychange', handleVisibilityChange); 
      window.removeEventListener('focus', handleFocus); 
    }; 
  }, []); 

  // Fetch all quizzes (for counting and recent display)
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setQuizzesLoading(true); 
        const response = await fetch(`${API_BASE_URL}/quizzes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        
        if (data.success && data.quizzes && data.quizzes.length > 0) {
          // Format quizzes for display
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

            // Calculate score percentage
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
          setAllQuizzes(formattedQuizzes);  // Store all quizzes for counting
          setRecentQuizzes(formattedQuizzes.slice(0, 3));  // Show top 3 recent quizzes
        } else {
          setRecentQuizzes([]); 
          setAllQuizzes([]); 
        }
      } catch (error) {
        // console.error('Error fetching quizzes:', error); 
        setRecentQuizzes([]); 
        setAllQuizzes([]); 
      } finally {
        setQuizzesLoading(false); 
      }
    }; 

    fetchAllQuizzes(); 
  }, []); 

  // Fetch all QA tests (for counting and recent display)
  useEffect(() => {
    const fetchAllQATests = async () => {
      try {
        setQATestsLoading(true); 
        const response = await fetch(`${API_BASE_URL}/qa-tests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        
        if (data.success && data.qaTests && data.qaTests.length > 0) {
          // Format QA tests for display
          const formattedTests = data.qaTests.map((test) => {
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
            }

            return {
              id: test._id || test.id,
              topic: test.topic || 'QA Test',
              subject: test.subject || '',
              score: scorePercentage,
              date: dateStr,
              difficulty: test.difficulty || 'Medium',
              examType: test.examType || 'Competitive',
            }; 
          }); 
          setAllQATests(formattedTests);  // Store all QA tests for counting
          setRecentQATests(formattedTests.slice(0, 3));  // Show top 3 recent QA tests
        } else {
          setRecentQATests([]); 
          setAllQATests([]); 
        }
      } catch (error) {
        // console.error('Error fetching QA tests:', error); 
        setRecentQATests([]); 
        setAllQATests([]); 
      } finally {
        setQATestsLoading(false); 
      }
    }; 

    fetchAllQATests(); 
  }, []); 

  // Fetch user notes to get unique topics
  useEffect(() => {
    const fetchUserNotes = async () => {
      try {
        setNotesLoading(true); 
        const response = await fetch(`${API_BASE_URL}/notes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        // console.log('User notes response:', data); 
        
        if (data.success && data.notes && data.notes.length > 0) {
          setUserNotes(data.notes); 
        } else {
          setUserNotes([]); 
        }
      } catch (error) {
        // console.error('Error fetching user notes:', error); 
        setUserNotes([]); 
      } finally {
        setNotesLoading(false); 
      }
    }; 

    fetchUserNotes(); 
  }, []); 

  const analyticsData = [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 88 },
    { day: 'Fri', score: 92 },
    { day: 'Sat', score: 85 },
    { day: 'Sun', score: 90 },
  ]; 

  const subjectStats = [
    { subject: 'Python', score: 85 },
    { subject: 'JavaScript', score: 88 },
    { subject: 'React', score: 92 },
    { subject: 'SQL', score: 78 },
  ]; 

  // Calculate 7-day score trend from quizzes and QA tests
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
          // Parse date from format like "Today", "Yesterday", "X days ago"
          let quizDate = new Date(); 
          if (quiz.date === 'Yesterday') {
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
      allQATests.forEach(qa => {
        if (qa.score && qa.date) {
          let qaDate = new Date(); 
          if (qa.date === 'Yesterday') {
            qaDate.setDate(qaDate.getDate() - 1); 
          } else if (qa.date.includes('days ago')) {
            const daysAgo = parseInt(qa.date); 
            qaDate.setDate(qaDate.getDate() - daysAgo); 
          }
          const dayKey = dayNames[qaDate.getDay()]; 
          if (trends[dayKey]) {
            trends[dayKey].scores.push(qa.score); 
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

  // Calculate subject-wise performance
  const calculateSubjectPerformance = () => {
    const subjects = {}; 

    // Add quiz data
    if (allQuizzes && allQuizzes.length > 0) {
      allQuizzes.forEach(quiz => {
        const subject = quiz.topic || 'Other'; 
        if (!subjects[subject]) {
          subjects[subject] = { scores: [] }; 
        }
        if (quiz.score) {
          subjects[subject].scores.push(quiz.score); 
        }
      }); 
    }

    // Add QA test data
    if (allQATests && allQATests.length > 0) {
      allQATests.forEach(qa => {
        const subject = qa.topic || 'Other'; 
        if (!subjects[subject]) {
          subjects[subject] = { scores: [] }; 
        }
        if (qa.score) {
          subjects[subject].scores.push(qa.score); 
        }
      }); 
    }

    // Calculate average for each subject and convert to array
    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      score: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b) / data.scores.length) : 0
    })).sort((a, b) => b.score - a.score); 
  }; 

  const scoreTrendData = calculateScoreTrend(); 
  const subjectPerformanceData = calculateSubjectPerformance(); 

  // Calculate average score from all quizzes and QA tests
  const calculateAverageScore = () => {
    let allScores = []; 
    
    // Add quiz scores
    if (recentQuizzes && recentQuizzes.length > 0) {
      allScores = allScores.concat(recentQuizzes.map(q => q.score)); 
    }
    
    // Add QA test scores
    if (recentQATests && recentQATests.length > 0) {
      allScores = allScores.concat(recentQATests.map(qa => qa.score)); 
    }
    
    // Calculate average
    if (allScores.length === 0) {
      return 0; 
    }
    
    const average = allScores.reduce((sum, score) => sum + score, 0) / allScores.length; 
    return Math.round(average); 
  }; 

  const averageScore = calculateAverageScore(); 

  // Calculate total tests attempted (all quizzes + all QA tests)
  const calculateTotalTestsAttempted = () => {
    const totalQuizzes = allQuizzes?.length || 0; 
    const totalQATests = allQATests?.length || 0; 
    return totalQuizzes + totalQATests; 
  }; 

  const totalTestsAttempted = calculateTotalTestsAttempted(); 

  // Calculate unique topics from all quizzes and QA tests
  const calculateUniqueTopics = () => {
    const topics = new Set(); 
    
    // Add topics from quizzes
    if (allQuizzes && allQuizzes.length > 0) {
      allQuizzes.forEach(q => {
        if (q.topic) topics.add(q.topic); 
      }); 
    }
    
    // Add topics from QA tests
    if (allQATests && allQATests.length > 0) {
      allQATests.forEach(qa => {
        if (qa.topic) topics.add(qa.topic); 
      }); 
    }
    
    return topics.size; 
  }; 

  const uniqueTopicsCount = calculateUniqueTopics(); 

  const stats = [
    {
      icon: TrendingUp,
      label: 'Avg Score',
      value: `${averageScore}%`,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-purple-600/5',
    },
    {
      icon: Calendar,
      label: 'Streak',
      value: `${gamificationStats.currentStreak} day${gamificationStats.currentStreak !== 1 ? 's' : ''}`,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/10 to-cyan-600/5',
    },
    {
      icon: Award,
      label: 'Tests Attempted',
      value: totalTestsAttempted,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/10 to-orange-600/5',
    },
    {
      icon: BookOpen,
      label: 'Topics',
      value: uniqueTopicsCount,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-green-600/5',
    },
  ]; 

  // Remove old hardcoded recentQuizzes data - now fetched from backend
  
  return (
    <div className={`min-h-screen py-8 pt-24 md:py-12 md:pt-32 relative overflow-hidden ${
      userSubscription === 'pro' 
        ? 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950' 
        : userSubscription === 'ultimate' 
        ? 'bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950'
        : 'bg-gradient-to-b from-black via-slate-950 to-black'
    }`} style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.08)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.08)'
                  : 'rgba(168, 85, 247, 0.08)'
              } 1px, transparent 1px),
              linear-gradient(to bottom, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.08)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.08)'
                  : 'rgba(168, 85, 247, 0.08)'
              } 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.03)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.03)'
                  : 'rgba(168, 85, 247, 0.03)'
              } 1px, transparent 1px),
              linear-gradient(to bottom, ${
                userSubscription === 'pro' 
                  ? 'rgba(168, 85, 247, 0.03)' 
                  : userSubscription === 'ultimate'
                  ? 'rgba(249, 115, 22, 0.03)'
                  : 'rgba(168, 85, 247, 0.03)'
              } 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {userSubscription === 'pro' ? (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-purple-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-purple-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          </>
        ) : userSubscription === 'ultimate' ? (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-orange-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-yellow-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-orange-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-cyan-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
          </>
        )}
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Welcome Header with Membership Badge */}
        <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          {/* Badges - Visible only on mobile (md:hidden) */}
          <div className="md:hidden mb-4 flex items-start justify-between">
            {/* Membership Badge - Left */}
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 relative ${
              userSubscription === 'pro' ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg shadow-purple-500/50' :
              userSubscription === 'ultimate' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/50' :
              'bg-slate-700/50 text-slate-300'
            }`} style={{
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                padding: '2px',
                background: userSubscription === 'ultimate' ? 
                  'conic-gradient(from 0deg, #fbbf24 0%, #f97316 50%, #fbbf24 100%)' :
                  userSubscription === 'pro' ?
                  'conic-gradient(from 0deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)' :
                  'conic-gradient(from 0deg, #64748b 0%, #94a3b8 50%, #64748b 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'rotateBorder 4s linear infinite',
              }}></div>
              {userSubscription === 'ultimate' && <Crown size={16} className="sm:w-4 sm:h-4 animate-pulse relative z-10" />}
              {userSubscription === 'pro' && <Star size={16} className="sm:w-4 sm:h-4 animate-pulse relative z-10" />}
              <span className="capitalize relative z-10 text-xs sm:text-sm">
                {userSubscription === 'pro' ? '⭐ Premium' :
                 userSubscription === 'ultimate' ? '👑 Ultimate' :
                 '📋 Free'}
              </span>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Plan Validity Badge - Right */}
              {subscriptionEndDate && userSubscription !== 'free' && (
                <div className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 text-blue-300">
                  <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{formatDateToDDMMYYYY(subscriptionEndDate)}</span>
                </div>
              )}
              
              {/* Settings Button - Mobile */}
              <button
                onClick={() => onNavigate('account-settings')}
                className="p-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
                title="Account Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Welcome Text and Desktop Badges */}
          <div className="flex items-start justify-between gap-4 relative">
            <div className="flex-1">
              {/* Desktop Membership Badge - Top Left Corner */}
              <div className="hidden md:flex mb-3 -ml-4">
                <div className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base flex items-center gap-2 relative ${
                  userSubscription === 'pro' ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg shadow-purple-500/50' :
                  userSubscription === 'ultimate' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/50' :
                  'bg-slate-700/50 text-slate-300'
                }`} style={{
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    padding: '2px',
                    background: userSubscription === 'ultimate' ? 
                      'conic-gradient(from 0deg, #fbbf24 0%, #f97316 50%, #fbbf24 100%)' :
                      userSubscription === 'pro' ?
                      'conic-gradient(from 0deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)' :
                      'conic-gradient(from 0deg, #64748b 0%, #94a3b8 50%, #64748b 100%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    animation: 'rotateBorder 4s linear infinite',
                  }}></div>
                  {userSubscription === 'ultimate' && <Crown size={18} className="animate-pulse relative z-10" />}
                  {userSubscription === 'pro' && <Star size={18} className="animate-pulse relative z-10" />}
                  <span className="capitalize relative z-10">
                    {userSubscription === 'pro' ? '⭐ Premium Member' :
                     userSubscription === 'ultimate' ? '👑 Ultimate Member' :
                     '📋 Free Member'}
                  </span>
                </div>
              </div>
              
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-purple-400">{userName || user?.name || 'User'}</span>!
              </h1>
              <p className="text-xs md:text-sm text-slate-400 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                Keep up the momentum! You're on a 7-day learning streak.
              </p>
            </div>

            {/* Desktop Badges and Settings - Top Right Corner */}
            <div className="hidden md:flex flex-col items-end gap-2 -mr-4">
              {/* Plan Validity Badge - Top Right */}
              {subscriptionEndDate && userSubscription !== 'free' && (
                <div className="px-4 md:px-6 py-1 md:py-2 rounded-full font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 text-blue-300">
                  <Calendar size={12} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Valid till {formatDateToDDMMYYYY(subscriptionEndDate)}</span>
                </div>
              )}
              
              {/* Settings Button - Desktop */}
              <button
                onClick={() => onNavigate('account-settings')}
                className="p-3 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
                title="Account Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon; 
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.bgColor} border border-purple-500/30 hover:border-purple-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-sm cursor-pointer group animate-in fade-in overflow-hidden`}
                style={{
                  animationDelay: `${idx * 100}ms`,
                  animationDuration: '800ms',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
                <div className="relative z-5">
                  <Icon className={`${stat.color} mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} size={18} />
                  <p className="text-slate-400 text-xs md:text-xs mb-1 group-hover:text-slate-300 transition-colors">{stat.label}</p>
                  <p className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{stat.value}</p>
                </div>
              </div>
            ); 
          })}
        </div>

        {/* CTA */}
        <div
          className="mb-8 md:mb-12"
        >
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            Explore Features
          </h2>
          <div
            className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000"
            style={{ animationDelay: '1000ms' }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {/* Generate Quiz Button */}
            <button
              onClick={() => {
                onNavigate('quiz-generator'); 
              }}
              className="bg-gradient-to-br from-purple-900/30 to-magenta-900/20 border border-purple-500/30 hover:border-purple-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '400ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <Zap className="text-purple-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-1">Generate Quiz</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Create custom quizzes</p>
              </div>
            </button>

            {/* Generate Notes Button */}
            <button
              onClick={() => {
                onNavigate('notes'); 
              }}
              className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 hover:border-blue-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '500ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <BookOpen className="text-blue-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1">Generate Notes</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">AI-powered study notes</p>
              </div>
            </button>

            {/* QA Test Button */}
            <button
              onClick={() => {
                onNavigate('qa-test'); 
              }}
              className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 hover:border-green-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '600ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <TrendingUp className="text-green-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-green-300 transition-colors mb-1">QA Test</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Test your knowledge</p>
              </div>
            </button>

            {/* Supreme Learning Button */}
            <button
              onClick={() => {
                onNavigate('supreme-learning'); 
              }}
              className="bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-orange-500/30 hover:border-orange-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '700ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <Star className="text-orange-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-orange-300 transition-colors mb-1">Supreme Learning</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Premium learning experience</p>
              </div>
            </button>
          </div>
        </div>
        </div>

        {/* Premium Features Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            Explore Premium Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {/* AI Tutor Card */}
            <button
              onClick={() => onNavigate('tutor')}
              className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 hover:border-blue-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '400ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <Brain className="text-blue-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1">AI Tutor</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Personalized AI-powered tutoring</p>
              </div>
            </button>

            {/* Gamification Card */}
            <button
              onClick={() => onNavigate('gamification')}
              className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 hover:border-yellow-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '500ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <Trophy className="text-yellow-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-yellow-300 transition-colors mb-1">Gamification</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Earn badges and climb leaderboards</p>
              </div>
            </button>

            {/* Analytics Card */}
            <button
              onClick={() => onNavigate('analytics')}
              className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 hover:border-green-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '600ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <BarChart3 className="text-green-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-green-300 transition-colors mb-1">Analytics</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Track your learning progress</p>
              </div>
            </button>

            {/* Learning Path Card */}
            <button
              onClick={() => onNavigate('learning-path')}
              className="bg-gradient-to-br from-pink-900/30 to-rose-900/20 border border-pink-500/30 hover:border-pink-500/60 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 backdrop-blur-sm group animate-in fade-in text-left"
              style={{ animationDelay: '700ms', animationDuration: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none rounded-xl md:rounded-2xl"></div>
              <div className="relative z-5">
                <Compass className="text-pink-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={24} />
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-pink-300 transition-colors mb-1">Learning Path</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Customized learning roadmap</p>
              </div>
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Score Trend */}
          <div
            className="lg:col-span-2 bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group animate-in fade-in overflow-hidden"
            style={{ animationDelay: '400ms', animationDuration: '800ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
            <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 group-hover:text-purple-300 transition-colors relative z-5">
              Score Trend (7 Days)
            </h3>
            <div className="transform group-hover:scale-[1.02] transition-transform duration-300 origin-top-left relative z-5">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #9333ea',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Performance */}
          <div
            className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group animate-in fade-in overflow-hidden"
            style={{ animationDelay: '500ms', animationDuration: '800ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
            <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 group-hover:text-purple-300 transition-colors relative z-5">Subjects</h3>
            <div className="transform group-hover:scale-[1.02] transition-transform duration-300 origin-top-left relative z-5">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="subject" stroke="#94a3b8" angle={-45} textAnchor="end" height={70} style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #9333ea', borderRadius: '8px', color: '#fff' }} formatter={(value) => [`${value}%`, 'Average Score']} />
                  <Bar dataKey="score" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Recent Quizzes */}
          <div
            className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-in fade-in overflow-hidden"
            style={{ animationDelay: '600ms', animationDuration: '800ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
            <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 relative z-5">Recent Quizzes</h3>
            <div className="space-y-2 md:space-y-3 relative z-5">
              {quizzesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">
                    <div className="h-8 w-8 border-4 border-purple-600 border-t-purple-300 rounded-full"></div>
                  </div>
                </div>
              ) : recentQuizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-slate-400 text-sm">You have not played any quiz yet</p>
                  <button
                    onClick={() => onNavigate?.('quiz-generator')}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Take a Quiz
                  </button>
                </div>
              ) : (
                recentQuizzes.map((quiz, idx) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-3 md:p-4 bg-slate-700/20 hover:bg-slate-700/40 rounded-lg transition-all duration-300 border border-slate-600/30 hover:border-purple-500/30 transform hover:scale-105 hover:translate-x-2 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: `${600 + idx * 100}ms`, animationDuration: '600ms' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-xs md:text-sm group-hover:text-purple-300 transition-colors truncate">{quiz.topic}</p>
                      <p className="text-xs md:text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {quiz.date} • {quiz.difficulty} • <span className="capitalize">{quiz.examType}</span>
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg md:text-xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">{quiz.score}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QA Test Results */}
          <div
            className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-in fade-in overflow-hidden"
            style={{ animationDelay: '700ms', animationDuration: '800ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
            <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 relative z-5">QA Test Results</h3>
            <div className="space-y-3 md:space-y-4 relative z-5">
              {qaTestsLoading ? (
                <div className="text-slate-400 text-sm">Loading...</div>
              ) : recentQATests && recentQATests.length > 0 ? (
                recentQATests.map((test, idx) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 md:p-4 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/20 hover:border-purple-500/50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:translate-x-2 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: `${700 + idx * 100}ms`, animationDuration: '600ms' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-xs md:text-sm group-hover:text-purple-300 transition-colors truncate">{test.topic}</p>
                      <p className="text-xs md:text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{test.date} • {test.difficulty} • {test.examType}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-bold text-lg md:text-xl text-purple-400 group-hover:text-purple-300">{test.score}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 md:py-8">
                  <p className="text-4xl md:text-5xl mb-3 md:mb-4">📝</p>
                  <p className="text-slate-400 text-xs md:text-sm mb-4">You have not attempted any QA tests yet</p>
                  <button
                    onClick={() => onNavigate('qa-test')}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg text-xs md:text-sm font-semibold transition-all transform hover:scale-105 active:scale-95"
                  >
                    Take a QA Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Tip */}
        <div
          className="bg-gradient-to-r from-purple-600/10 to-magenta-600/10 border border-purple-500/30 hover:border-purple-500/50 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-300 group animate-in fade-in overflow-hidden"
          style={{ animationDelay: '900ms', animationDuration: '800ms' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300 pointer-events-none"></div>
          <div className="flex items-start gap-3 md:gap-4 group-hover:gap-4 md:group-hover:gap-6 transition-all duration-300 relative z-5">
            <Zap className="text-purple-400 flex-shrink-0 mt-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" size={18} />
            <div>
              <h3 className="text-sm md:text-base font-bold text-white mb-1 md:mb-2 group-hover:text-purple-300 transition-colors">Study Tip</h3>
              <p className="text-xs md:text-xs text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                Consistency is key! Try to complete at least one quiz per day to maintain your streak and improve faster. Focus on weak areas to maximize your learning.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotateBorder {
          from {
            -webkit-mask-position: 0% 0%; 
            mask-position: 0% 0%; 
            background-position: 0deg; 
          }
          to {
            -webkit-mask-position: 0% 0%; 
            mask-position: 0% 0%; 
            background-position: 360deg; 
          }
        }
        
        .animated-badge-border::before {
          animation: rotateBorder 4s linear infinite !important; 
        }
      `}</style>
    </div>
  ); 
}