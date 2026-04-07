import React, { useState, useEffect } from 'react'; 
import { ChevronRight, Sparkles, Zap, Lightbulb } from 'lucide-react'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

export default function QuizGenerator({ onNavigate, onStartQuiz }) {
  const [quizTopic, setQuizTopic] = useState(''); 
  const [quizSubject, setQuizSubject] = useState(''); 
  const [quizExamType, setQuizExamType] = useState('competitive'); 
  const [quizDifficulty, setQuizDifficulty] = useState('medium'); 
  const [numQuestions, setNumQuestions] = useState(10); 
  const [isGenerating, setIsGenerating] = useState(false); 
  const [userSubscription, setUserSubscription] = useState('free'); 
  const [showLimitWarning, setShowLimitWarning] = useState(false); 
  const [limitError, setLimitError] = useState(null); 
  const [quizzesRemaining, setQuizzesRemaining] = useState(5); 

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        // console.log('Profile fetch response:', data); 
        if (data.success) {
          setUserSubscription(data.user.subscriptionPlan || 'free'); 
          if (data.user.quizLimits) {
            // console.log('Quiz limits received:', data.user.quizLimits); 
            localStorage.setItem('quizzesRemaining', data.user.quizLimits.quizzesRemaining); 
            setQuizzesRemaining(data.user.quizLimits.quizzesRemaining); 
            // console.log('State set to:', data.user.quizLimits.quizzesRemaining); 
          } else {
            // console.log('No quizLimits in response for user:', data.user.subscriptionPlan); 
          }
        }
      } catch (error) {
        // console.error('Error fetching subscription:', error); 
        setUserSubscription('free'); 
      }
    }; 

    fetchSubscriptionData(); 

    // Listen for quiz updates
    const handleQuizzesUpdated = () => {
      fetchSubscriptionData(); 
    }; 

    window.addEventListener('quizzesUpdated', handleQuizzesUpdated); 
    return () => {
      window.removeEventListener('quizzesUpdated', handleQuizzesUpdated); 
    }; 
  }, []); 

  // Debug: Log when quizzesRemaining changes
  useEffect(() => {
    // console.log('quizzesRemaining state changed to:', quizzesRemaining); 
  }, [quizzesRemaining]); 

  const handleGenerateQuiz = async (e) => {
    e.preventDefault(); 
    if (!quizTopic.trim()) return; 
    if (!quizSubject.trim()) {
      setLimitError('Please enter a subject'); 
      setShowLimitWarning(true); 
      return; 
    }

    // Check if free user has quizzes remaining
    if (userSubscription === 'free') {
      if (quizzesRemaining <= 0) {
        setLimitError('You have used all your free quizzes for this month. Please upgrade to continue.'); 
        setShowLimitWarning(true); 
        return; 
      }
    }

    setIsGenerating(true); 
    try {
      // Prepare quiz data for Gemini generation
      const quizData = {
        topic: quizTopic,
        subject: quizSubject,
        examType: quizExamType,
        difficulty: quizDifficulty,
        numQuestions: numQuestions,
      }; 

      // Call backend API to generate quiz with Gemini
      const response = await fetch(`${API_BASE_URL}/quizzes/generate/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(quizData),
      }); 

      const result = await response.json(); 

      // console.log('Full API Response:', {
      //   status: response.status,
      //   ok: response.ok,
      //   result: result
      // }); 

      if (!response.ok) {
        // Check if it's a quiz limit error
        if (response.status === 403) {
          setLimitError('You have used all your free quizzes for this month. Please upgrade to continue.'); 
          setShowLimitWarning(true); 
          // Update state with actual remaining quizzes from backend
          if (result.quizLimits) {
            localStorage.setItem('quizzesRemaining', result.quizLimits.quizzesRemaining); 
            setQuizzesRemaining(result.quizLimits.quizzesRemaining); 
          }
        } else {
          setLimitError(result.message || 'Failed to create quiz'); 
          setShowLimitWarning(true); 
        }
        return; 
      }

      // Quiz created successfully
      if (result.success) {
        // console.log('Quiz generated successfully, result:', result); 
        // Update quiz credits if it's a free user
        if (result.quizLimits) {
          // console.log('Updating quiz limits:', result.quizLimits); 
          localStorage.setItem('quizzesRemaining', result.quizLimits.quizzesRemaining); 
          setQuizzesRemaining(result.quizLimits.quizzesRemaining); 
          // console.log('Set quizzesRemaining to:', result.quizLimits.quizzesRemaining); 
          // Dispatch event to update QuizGenerator badge
          window.dispatchEvent(new Event('quizzesUpdated')); 
        } else {
          // console.log('No quizLimits in result, result.quizLimits:', result.quizLimits); 
        }

        // Start the quiz with the real quiz data from backend
        onStartQuiz?.(result.quiz); 
      }
    } catch (error) {
      // console.error('Error generating quiz:', error); 
      setLimitError('Error generating quiz. Please try again.'); 
      setShowLimitWarning(true); 
    } finally {
      setIsGenerating(false); 
    }
  }; 

  return (
    <>
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

      <div className="relative max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Quiz Limits Badge for Free Users */}
        {userSubscription === 'free' && (
          <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Show notification based on remaining quizzes */}
            <div className={`p-3 sm:p-4 rounded-lg border ${
              quizzesRemaining <= 0
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : quizzesRemaining <= 2
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-300'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <p className="font-semibold text-xs sm:text-sm md:text-base">
                    📊 Quiz Credits: <span className="text-lg">{quizzesRemaining}/5</span>
                  </p>
                  <p className="text-xs mt-1 opacity-90">
                    Free users get 5 quizzes per month
                  </p>
                </div>
                <button
                  onClick={() => onNavigate?.('pricing')}
                  className="px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white text-xs md:text-sm rounded-lg font-semibold transition-all transform hover:scale-105 whitespace-nowrap"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unlimited Quiz Badge for Pro/Ultimate Users */}
        {(userSubscription === 'pro' || userSubscription === 'ultimate') && (
          <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className={`p-3 sm:p-4 rounded-lg border ${
              userSubscription === 'ultimate'
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                : 'bg-purple-500/20 border-purple-500/50 text-purple-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {userSubscription === 'ultimate' ? '👑' : '⭐'}
                </span>
                <p className="font-semibold text-xs sm:text-sm md:text-base">
                  🎯 Unlimited Quizzes • {userSubscription === 'ultimate' ? 'Ultimate Member' : 'Premium Member'}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            // console.log('Navigate to dashboard'); 
            onNavigate('dashboard'); 
          }}
          className="mb-4 sm:mb-6 md:mb-8 text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-all duration-300 group transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-8 duration-1000 text-xs sm:text-sm md:text-base"
        >
          <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Left - Form */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-in fade-in slide-in-from-left-8 duration-1000 overflow-hidden">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 hover:text-purple-300 transition-colors">
              Generate Quiz
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-4 sm:mb-6 md:mb-8 hover:text-slate-300 transition-colors">
              Create personalized quizzes instantly
            </p>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Topic Input */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Topic</label>
                <input
                  type="text"
                  placeholder="e.g., React Hooks..."
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full bg-slate-700/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xs sm:text-sm md:text-base"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter any specific topic
                </p>
              </div>

              {/* Subject Input */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-160">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Physics, Mathematics..."
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full bg-slate-700/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-xs sm:text-sm md:text-base"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter the subject area
                </p>
              </div>

              {/* Exam Type */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-175">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Exam Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { key: 'cbse', label: '🏫 CBSE' },
                    { key: 'icse', label: '📚 ICSE' },
                    { key: 'state-board', label: '🎓 State' },
                    { key: 'jee', label: '🚀 JEE' },
                    { key: 'neet', label: '🔬 NEET' },
                    { key: 'upsc', label: '🏛️ UPSC' },
                    { key: 'gate', label: '⚙️ GATE' },
                    { key: 'college', label: '🎯 College' },
                    { key: 'competitive', label: '🏆 Other' },
                  ].map((exam) => (
                    <button
                      key={exam.key}
                      type="button"
                      onClick={() => setQuizExamType(exam.key)}
                      className={`py-2 md:py-3 px-2 rounded-lg font-medium transition-all text-xs sm:text-xs md:text-sm ${
                        quizExamType === exam.key
                          ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg border border-purple-400'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {exam.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'easy', label: 'Easy', bgColor: 'from-green-600 to-emerald-600', hoverColor: 'hover:from-green-700 hover:to-emerald-700', shadowColor: 'shadow-green-500/50' },
                    { key: 'medium', label: 'Medium', bgColor: 'from-yellow-600 to-orange-600', hoverColor: 'hover:from-yellow-700 hover:to-orange-700', shadowColor: 'shadow-yellow-500/50' },
                    { key: 'hard', label: 'Hard', bgColor: 'from-red-600 to-pink-600', hoverColor: 'hover:from-red-700 hover:to-pink-700', shadowColor: 'shadow-red-500/50' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setQuizDifficulty(item.key)}
                      className={`py-2 md:py-3 px-1 md:px-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 text-[7px] sm:text-[8px] md:text-xs flex items-center justify-center h-auto min-h-9 sm:min-h-10 md:min-h-11 leading-tight ${
                        quizDifficulty === item.key
                          ? `bg-gradient-to-r ${item.bgColor} ${item.hoverColor} text-white shadow-lg ${item.shadowColor}`
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      <span className="text-center whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </button>
                    ))}
                  </div>
              </div>

              {/* Number of Questions */}
              <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-250">
                <label className="block text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">
                  Number of Questions: <span className="text-purple-400">{numQuestions}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                    step="5"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500 transition-all"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateQuiz}
                disabled={!quizTopic.trim() || !quizSubject.trim() || isGenerating}
                className="w-full py-2 sm:py-3 md:py-4 mt-4 sm:mt-6 md:mt-8 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 animate-in fade-in slide-in-from-top-4 duration-700 delay-300 text-xs sm:text-sm md:text-base"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Generating Quiz...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Generate Quiz</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>

              {/* Preview */}
              <div className="bg-slate-700/30 border border-purple-500/20 hover:border-purple-500/40 rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-300 group/preview animate-in fade-in slide-in-from-top-4 duration-700 delay-350">
                <p className="text-xs sm:text-sm md:text-base text-slate-400 group-hover/preview:text-slate-300 transition-colors leading-relaxed">
                  <span className="font-semibold text-slate-300 group-hover/preview:text-white transition-colors">Preview:</span> Generate a
                  <span className="text-purple-400 font-semibold"> {quizDifficulty} </span>
                  quiz with{' '}
                  <span className="text-magenta-400 font-semibold">
                    {numQuestions}
                  </span>{' '}
                  questions on{' '}
                  <span className="text-cyan-400 font-semibold">
                    {quizTopic || 'your topic'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right - Benefits */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000">
            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group overflow-hidden">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 md:mb-6 group-hover:text-purple-300 transition-colors">
                Why Self Ranker?
              </h3>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {[
                  { emoji: '⚡', title: 'Lightning Fast', desc: 'Get quizzes in seconds', delay: 100 },
                  { emoji: '🤖', title: 'AI-Powered', desc: 'Smart, personalized content', delay: 200 },
                  { emoji: '📊', title: 'Detailed Feedback', desc: 'Understand your mistakes', delay: 300 },
                  { emoji: '🎯', title: 'Adaptive Learning', desc: 'Adjusts to your level', delay: 400 },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all border border-purple-500/10 hover:border-purple-500/30 transform hover:scale-105 hover:translate-x-2 cursor-pointer group/benefit animate-in fade-in"
                    style={{ animationDelay: `${benefit.delay}ms`, animationDuration: '600ms' }}
                  >
                    <span className="text-base sm:text-lg md:text-xl flex-shrink-0 group-hover/benefit:scale-125 transition-transform">
                      {benefit.emoji}
                    </span>
                    <div>
                      <p className="font-semibold text-white text-xs sm:text-sm md:text-base group-hover/benefit:text-purple-300 transition-colors">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-slate-400 group-hover/benefit:text-slate-300 transition-colors">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips Card */}
            <div className="bg-gradient-to-br from-purple-900/30 to-magenta-900/20 border border-purple-500/30 hover:border-purple-500/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group transform hover:scale-105 cursor-pointer animate-in fade-in delay-500 overflow-hidden">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3 md:mb-4 group-hover:text-purple-300 transition-colors flex items-center gap-2">
                <Lightbulb size={16} className="sm:w-5 md:w-5 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                Pro Tips
              </h3>
              <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-slate-300 text-xs sm:text-sm md:text-base">
                {[
                  'Be specific with your topic for better results',
                  'Start with medium difficulty and progress',
                  'Generate multiple quizzes on the same topic',
                  'Review explanations after each quiz',
                ].map((tip, idx) => (
                  <li
                    key={idx}
                    className="hover:text-purple-400 transition-colors hover:translate-x-1 transform duration-300"
                  >
                    ✓ {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Limit Warning Modal */}
      {showLimitWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-red-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl shadow-red-500/20">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl flex-shrink-0">🚫</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 mb-2">Quiz Limit Reached</h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-3 sm:mb-4">
                  {limitError}
                </p>
                <p className="text-xs text-slate-400 mb-4 sm:mb-6">
                  Your free quiz limit resets on the 1st of every month.
                </p>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowLimitWarning(false)}
                    className="w-full py-1.5 sm:py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLimitWarning(false); 
                      onNavigate?.('pricing'); 
                    }}
                    className="w-full py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 text-xs sm:text-sm md:text-base"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%;  }
          50% { background-position: 100% 50%;  }
        }
        .animate-gradient {
          background-size: 200% 200%; 
          animation: gradient 3s ease infinite; 
        }
      `}</style>
      </div>
    </>
  ); 
}