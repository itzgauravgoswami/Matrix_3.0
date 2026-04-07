import React, { useState, useEffect } from 'react'; 
import { ChevronRight, Target, Zap, CheckCircle, Circle, ArrowLeft, Sparkles, BookOpen, ArrowRight, Loader } from 'lucide-react'; 

const LearningPath = ({ onNavigate }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'
  const [step, setStep] = useState('initial');  // 'initial', 'goal-input', 'plan-view'
  const [userGoal, setUserGoal] = useState(''); 
  const [learningPlan, setLearningPlan] = useState(null); 
  const [paths, setPaths] = useState([]); 
  const [selectedPath, setSelectedPath] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [generatingPlan, setGeneratingPlan] = useState(false); 
  const [completedPhases, setCompletedPhases] = useState({}); 

  useEffect(() => {
    loadLearningPaths(); 
  }, []); 

  const loadLearningPaths = async () => {
    setError(''); 
    try {
      const token = localStorage.getItem('authToken'); 
      const response = await fetch(`${API_BASE_URL}/gamification/learning-paths`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 

      if (response.ok) {
        const data = await response.json(); 
        console.log('[LearningPathComponent] Loaded paths:', data.paths); 
        setPaths(data.paths || []); 
        // Check if user has any existing goals
        if (data.paths && data.paths.length > 0 && data.paths[0].userGoal) {
          setStep('plan-view'); 
          setSelectedPath(data.paths[0]); 
        } else {
          setStep('initial'); 
        }
      } else if (response.status === 401) {
        setError('Session expired. Please login again.'); 
        setStep('initial'); 
      } else {
        setStep('initial'); 
      }
    } catch (error) {
      console.error('[LearningPathComponent] Error loading learning paths:', error); 
      setStep('initial'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const generateLearningPlan = async () => {
    if (!userGoal.trim()) {
      setError('Please enter your learning goal'); 
      return; 
    }

    setGeneratingPlan(true); 
    setError(''); 
    
    try {
      const token = localStorage.getItem('authToken'); 
      const response = await fetch(`${API_BASE_URL}/gamification/generate-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal: userGoal })
      }); 

      if (response.ok) {
        const data = await response.json(); 
        console.log('[LearningPathComponent] Generated plan:', data.plan); 
        setLearningPlan(data.plan); 
        setSelectedPath(data.plan); 
        
        // Initialize completed phases tracking for the new plan
        if (data.plan.learningPhases) {
          const phaseCompletionMap = {}; 
          data.plan.learningPhases.forEach((phase, idx) => {
            phaseCompletionMap[`${data.plan._id}-${idx}`] = phase.completed || false; 
          }); 
          setCompletedPhases(phaseCompletionMap); 
        }
        
        setUserGoal(''); 
        // Reload paths to include the newly created plan
        await loadLearningPaths(); 
        setStep('plan-view'); 
      } else {
        const errorData = await response.json(); 
        setError(errorData.error || 'Failed to generate learning plan'); 
      }
    } catch (error) {
      console.error('[LearningPathComponent] Error generating plan:', error); 
      setError('Failed to generate learning plan. Please try again.'); 
    } finally {
      setGeneratingPlan(false); 
    }
  }; 

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'text-green-400 bg-green-400/10',
      intermediate: 'text-blue-400 bg-blue-400/10',
      advanced: 'text-purple-400 bg-purple-400/10',
      master: 'text-yellow-400 bg-yellow-400/10'
    }; 
    return colors[level?.toLowerCase()] || colors.beginner; 
  }; 

  const getLevelIcon = (level) => {
    const icons = {
      beginner: '🌱',
      intermediate: '🌿',
      advanced: '🌳',
      master: '🏆'
    }; 
    return icons[level?.toLowerCase()] || '📚'; 
  }; 

  const togglePhaseCompletion = (phaseId) => {
    setCompletedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    })); 
  }; 

  // Calculate stats from learning path data
  const getPathStats = (path) => {
    if (!path) return { completed: 0, remaining: 0, progress: 0, total: 0 }; 
    
    // Use learningPhases if available, otherwise fall back to topicsCovered
    const phasesData = path.learningPhases || path.topicsCovered || []; 
    const total = phasesData.length; 
    
    if (total === 0) {
      return { completed: 0, remaining: 0, progress: 0, total: 0 }; 
    }
    
    // Count completed phases
    const completed = phasesData.filter(phase => {
      const phaseId = `${path._id}-${phasesData.indexOf(phase)}`; 
      return completedPhases[phaseId] || phase.completed; 
    }).length; 
    
    const remaining = total - completed; 
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0; 
    
    return { completed, remaining, progress, total }; 
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-slate-950 to-slate-950"></div>
        
        {/* Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        ></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 pt-[70px] md:pt-[75px] bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-transparent backdrop-blur-2xl border-b border-purple-500/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-all text-slate-400 hover:text-purple-400 hover:border hover:border-purple-500/30 group"
              >
                <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
                  <Target className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                    Learning Paths
                  </h1>
                  <p className="text-xs text-slate-400">AI-powered personalized learning roadmaps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-start gap-3 animate-in slide-in-from-top">
            <div className="p-2 bg-red-500/20 rounded-lg mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 1: INITIAL STATE - TWO COLUMN LAYOUT */}
        {step === 'initial' && (
          <div className="min-h-[80vh] flex items-center justify-center py-12">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl animate-in fade-in duration-700">
              
              {/* LEFT SECTION */}
              <div className="flex flex-col justify-center space-y-8">
                {/* Header */}
                <div className="space-y-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-purple-600/40 to-pink-600/30 border border-purple-500/30 rounded-2xl shadow-lg shadow-purple-500/20 w-fit">
                    <Sparkles className="text-purple-400 animate-bounce" size={48} />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                      Your AI<br />
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Learning Coach</span>
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                      Set your learning goal and receive a personalized, structured learning plan. Our AI will guide you step-by-step through your learning journey.
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {[
                    { icon: '🎯', title: 'Goal-Oriented', desc: 'Plans tailored to your specific objectives' },
                    { icon: '⏱️', title: 'Time-Based', desc: 'Realistic timelines for skill mastery' },
                    { icon: '📊', title: 'Progress Tracking', desc: 'Visual metrics of your advancement' }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 rounded-xl transition-all group">
                      <p className="text-3xl flex-shrink-0">{feature.icon}</p>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{feature.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col gap-6 justify-center">
                {/* Create New Plan Card */}
                <button
                  onClick={() => setStep('goal-input')}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/50 h-64 w-full"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/25 to-pink-600/15 border-2 border-purple-500/40 group-hover:border-purple-500/70 rounded-2xl transition-all"></div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/15 to-white/0 transition-all duration-300"></div>
                  
                  <div className="relative p-8 h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="inline-flex p-4 bg-purple-600/30 group-hover:bg-purple-600/40 rounded-2xl transition-all w-fit">
                        <Target className="text-purple-300 group-hover:text-purple-200 transition-colors" size={40} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">
                          Create New Plan
                        </h3>
                        <p className="text-slate-300 group-hover:text-slate-100 transition-colors">
                          Define your learning objective and let our AI create a customized roadmap with milestones and resources.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-sm font-semibold">Start Learning</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* View Existing Plans Card */}
                <button
                  onClick={async () => {
                    await loadLearningPaths(); 
                  }}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50 h-64 w-full"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/25 to-cyan-600/15 border-2 border-blue-500/40 group-hover:border-blue-500/70 rounded-2xl transition-all"></div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 group-hover:from-white/15 to-white/0 transition-all duration-300"></div>
                  
                  <div className="relative p-8 h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="inline-flex p-4 bg-blue-600/30 group-hover:bg-blue-600/40 rounded-2xl transition-all w-fit">
                        <Zap className="text-blue-300 group-hover:text-blue-200 transition-colors" size={40} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                          View My Plans
                        </h3>
                        <p className="text-slate-300 group-hover:text-slate-100 transition-colors">
                          Review your existing learning plans, track progress, and see how close you are to achieving your goals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span className="text-sm font-semibold">Continue Journey</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GOAL INPUT */}
        {step === 'goal-input' && (
          <div className="min-h-[75vh] flex items-center justify-center py-12">
            <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-700">
              {/* Header */}
              <div className="text-center space-y-4">
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent leading-tight">
                  What's Your Learning Goal?
                </h2>
                <p className="text-slate-400 text-lg">
                  The more specific you are, the better our AI can personalize your learning path. Include your timeline and any prerequisites you already know.
                </p>
              </div>

              <div className="space-y-6">
                {/* Suggested Goals */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 inline-flex items-center gap-2">
                    <span className="text-purple-400">💡</span> Quick Start Examples
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { icon: '📐', text: 'Master Advanced Algebra in 30 days' },
                      { icon: '🔬', text: 'Prepare for Physics competitive exam' },
                      { icon: '📝', text: 'Learn English Grammar & Writing skills' },
                      { icon: '🤖', text: 'Ace Data Science fundamentals' }
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserGoal(example.text)}
                        className="text-left p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 hover:border-slate-600/60 rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{example.icon}</span>
                          <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{example.text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 inline-flex items-center gap-2">
                    <span className="text-pink-400">✍️</span> Your Specific Goal
                  </label>
                  <div className="relative group">
                    <textarea
                      value={userGoal}
                      onChange={(e) => setUserGoal(e.target.value)}
                      placeholder="E.g., I want to master calculus in 60 days to prepare for my university entrance exam. I already know algebra and trigonometry basics..."
                      className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700/50 hover:border-slate-600/60 focus:border-purple-500/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                      rows={6}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                      {userGoal.length}/500 characters
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Include: What you want to learn • Your timeline • Your current knowledge level</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => {
                      setStep('initial'); 
                      setUserGoal(''); 
                      setError(''); 
                    }}
                    className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/60 hover:border-slate-600/80 rounded-xl font-semibold text-slate-300 hover:text-white transition-all duration-300 active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    onClick={generateLearningPlan}
                    disabled={generatingPlan || !userGoal.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95 disabled:shadow-none"
                  >
                    {generatingPlan ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span>Creating Your Plan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate Learning Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PLAN VIEW */}
        {step === 'plan-view' && selectedPath && (
          <div className="space-y-8 py-6 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="relative z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep('initial'); 
                  setLearningPlan(null); 
                  setUserGoal(''); 
                  setError(''); 
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/60 hover:border-slate-600/80 rounded-xl text-slate-300 hover:text-white font-semibold transition-all duration-300 active:scale-95"
              >
                <ArrowLeft size={18} />
                Back to Plans
              </button>
              <button
                type="button"
                onClick={() => setStep('goal-input')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95"
              >
                <Sparkles size={18} />
                Create New Plan
              </button>
            </div>

            {/* Goal Card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600/30 rounded-xl">
                    <Target className="text-purple-300" size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Learning Objective</h2>
                </div>
                <p className="text-slate-200 text-lg leading-relaxed pl-12">
                  {selectedPath.userGoal || selectedPath.goal || 'Master your chosen skill'}
                </p>
              </div>
            </div>

            {(() => {
              const stats = getPathStats(selectedPath); 
              return (
                <>
                  {/* Progress Card */}
                  <div className="group relative overflow-hidden rounded-2xl border-2 border-blue-500/30 hover:border-blue-500/60 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">Your Structured Plan</h2>
                          <p className="text-slate-400">Follow this roadmap to achieve your goals</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{stats.progress}%</p>
                          <p className="text-xs text-slate-400 mt-1">Complete</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Overall Progress</span>
                          <span className="text-slate-400">{stats.completed} of {stats.total} phases</span>
                        </div>
                        <div className="w-full h-4 bg-slate-900/60 rounded-full overflow-hidden border border-blue-500/20 shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transition-all duration-700 shadow-lg shadow-blue-500/50"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="p-4 bg-white/5 border border-blue-500/20 rounded-xl text-center hover:border-blue-500/40 transition-all">
                          <p className="text-2xl font-bold text-blue-300">{stats.total}</p>
                          <p className="text-xs text-slate-400 mt-1">Total Phases</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-green-500/20 rounded-xl text-center hover:border-green-500/40 transition-all">
                          <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
                          <p className="text-xs text-slate-400 mt-1">Completed</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-amber-500/20 rounded-xl text-center hover:border-amber-500/40 transition-all">
                          <p className="text-2xl font-bold text-amber-300">{stats.remaining}</p>
                          <p className="text-xs text-slate-400 mt-1">Remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Phases/Topics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-teal-600/30 to-cyan-600/20 rounded-xl">
                        <BookOpen className="text-teal-300" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Learning Phases</h3>
                    </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="group/stat bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 overflow-hidden">
                          <p className="text-slate-400 text-sm relative z-10">Total Phases</p>
                          <p className="text-2xl font-bold text-purple-400 relative z-10">{stats.total}</p>
                        </div>
                        <div className="group/stat bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-500/60 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 overflow-hidden">
                          <p className="text-slate-400 text-sm relative z-10">Completed</p>
                          <p className="text-2xl font-bold text-green-400 relative z-10">{stats.completed}</p>
                        </div>
                        <div className="group/stat bg-gradient-to-br from-orange-600/20 to-amber-600/20 border border-orange-500/30 hover:border-orange-500/60 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 overflow-hidden">
                          <p className="text-slate-400 text-sm relative z-10">Remaining</p>
                          <p className="text-2xl font-bold text-orange-400 relative z-10">{stats.remaining}</p>
                        </div>
                      </div>

                    {/* Phases List */}
                    <div className="space-y-3 pt-4">
                      {(() => {
                        const phases = selectedPath.learningPhases || []; 
                        
                        return phases.length > 0 ? (
                          phases.map((phase, idx) => {
                            const phaseId = `${selectedPath._id}-${idx}`; 
                            const isCompleted = completedPhases[phaseId] || phase.completed || false; 
                            
                            return (
                              <div
                                key={idx}
                                onClick={() => togglePhaseCompletion(phaseId)}
                                className={`group relative overflow-hidden p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-102 ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-500/60 opacity-75'
                                    : idx === 0
                                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-500/60'
                                    : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60'
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 group-hover:from-white/5 to-white/0 transition-all duration-300"></div>
                                <div className="relative z-10 flex items-start gap-4">
                                  <div className="flex-shrink-0 mt-1">
                                    <input
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() => togglePhaseCompletion(phaseId)}
                                      className="w-6 h-6 rounded-md cursor-pointer accent-emerald-500"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-lg transition-all ${
                                      isCompleted 
                                        ? 'text-slate-400 line-through' 
                                        : 'text-white'
                                    }`}>
                                      Phase {phase.phase}: {phase.name}
                                    </h4>
                                    {phase.description && (
                                      <p className={`text-sm mt-2 leading-relaxed transition-all ${
                                        isCompleted
                                          ? 'text-slate-500'
                                          : 'text-slate-300'
                                      }`}>
                                        {phase.description}
                                      </p>
                                    )}
                                    {phase.topics && phase.topics.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className="text-xs font-semibold text-slate-300 mb-2 uppercase">Topics:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {phase.topics.map((topic, topicIdx) => (
                                            <span 
                                              key={topicIdx}
                                              className={`text-xs px-3 py-1 rounded-full transition-all ${
                                                isCompleted
                                                  ? 'bg-slate-700/30 text-slate-400'
                                                  : 'bg-white/10 text-slate-200'
                                              }`}
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {phase.duration && (
                                      <div className={`flex items-center gap-2 text-xs mt-3 pt-2 border-t border-white/10 transition-all ${
                                        isCompleted
                                          ? 'text-slate-500'
                                          : 'text-slate-400'
                                      }`}>
                                        <span>⏱</span>
                                        <span>{phase.duration}</span>
                                      </div>
                                    )}
                                  </div>
                                  {isCompleted && (
                                    <span className="flex-shrink-0 text-xs font-semibold text-green-400 bg-green-600/20 px-3 py-1 rounded-full">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            ); 
                          })
                        ) : (
                          <div className="text-center py-12 text-slate-400">
                            <p>📚 No learning phases yet</p>
                            <p className="text-xs mt-2">Your plan will be populated once generated</p>
                          </div>
                        ); 
                      })()}
                    </div>
                  </div>

                  {/* Recommended Resources */}
                  {selectedPath.resources?.length > 0 && (
                    <div className="group relative overflow-hidden rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-br from-cyan-600/20 to-teal-600/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                      <div className="relative z-10 space-y-4">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 bg-cyan-600/30 rounded-lg">
                            <BookOpen size={24} className="text-cyan-300" />
                          </div>
                          Recommended Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {selectedPath.resources.map((resource, i) => (
                            <div key={i} className="p-4 bg-white/5 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all hover:bg-white/10">
                              <p className="text-sm text-slate-200">{resource}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ); 
            })()}
          </div>
        )}
      </div>
    </div>
  ); 
}; 

export default LearningPath; 