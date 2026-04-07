import React, { useState } from 'react'; 
import { ChevronRight, Loader, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

// ==================== MATH RENDERING ====================

/**
 * Component to render mathematical equations using KaTeX
 * Supports both inline ($...$) and block ($$...$$) math
 */
const MathText = ({ children }) => {
  // Helper to extract text from children (handles arrays, strings, elements)
  const extractText = (child) => {
    if (typeof child === 'string') {
      return child; 
    }
    if (typeof child === 'number') {
      return String(child); 
    }
    if (Array.isArray(child)) {
      return child.map(extractText).join(''); 
    }
    if (child && typeof child === 'object' && child.props && child.props.children) {
      return extractText(child.props.children); 
    }
    return ''; 
  }; 

  const text = typeof children === 'string' ? children : extractText(children); 
  const parts = []; 
  let lastIndex = 0; 
  
  // Match both inline ($...$) and block ($$...$$) math
  const mathRegex = /\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g; 
  let match; 
  
  while ((match = mathRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      }); 
    }
    
    // Add math
    const mathContent = match[0]; 
    const isBlock = mathContent.startsWith('$$'); 
    const latexStr = mathContent.slice(isBlock ? 2 : 1, -(isBlock ? 2 : 1)); 
    
    parts.push({
      type: 'math',
      content: latexStr,
      block: isBlock
    }); 
    
    lastIndex = match.index + match[0].length; 
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    }); 
  }
  
  // If no math found, return original text
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return <>{text}</>; 
  }
  
  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <span key={idx}>{part.content}</span>; 
        } else {
          try {
            const html = katex.renderToString(part.content, {
              throwOnError: false,
              strict: false,
              displayMode: part.block
            }); 
            return (
              <span
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ display: part.block ? 'block' : 'inline', margin: part.block ? '0.5em 0' : '0' }}
                className={part.block ? 'text-center my-2' : ''}
              />
            ); 
          } catch (e) {
            // console.warn('KaTeX render error:', e); 
            return <span key={idx}>{part.content}</span>; 
          }
        }
      })}
    </>
  ); 
}; 

// ==================== MAIN COMPONENT ====================

export default function QATestInterface({ onNavigate }) {
  
  // State management
  const [step, setStep] = useState('input');  // input, loading, test, evaluation, results
  const [examType, setExamType] = useState(''); 
  const [subject, setSubject] = useState(''); 
  const [topic, setTopic] = useState(''); 
  const [difficulty, setDifficulty] = useState('medium'); 
  const [numQuestions, setNumQuestions] = useState(5); 
  
  const [currentTest, setCurrentTest] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [userAnswers, setUserAnswers] = useState({}); 
  const [userMarks, setUserMarks] = useState({}); 
  const [currentAnswer, setCurrentAnswer] = useState(''); 
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false); 
  const [evaluation, setEvaluation] = useState(null); 
  const [showingEvaluation, setShowingEvaluation] = useState(false); 
  
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); 
  
  // QA Test limit tracking
  const [qaLimitInfo, setQaLimitInfo] = useState(null); 
  const [showLimitWarning, setShowLimitWarning] = useState(false); 

  // Fetch QA tests remaining on component mount
  React.useEffect(() => {
    const fetchQALimitInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/qa-tests/check/remaining`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        if (data.success) {
          setQaLimitInfo(data); 
          if (data.limitExceeded) {
            setShowLimitWarning(true); 
          }
        }
      } catch (err) {
        // console.error('Error fetching QA limit info:', err); 
      }
    }; 
    fetchQALimitInfo(); 
  }, []); 

  // Generate questions
  const handleGenerateQuestions = async (e) => {
    e.preventDefault(); 
    if (!examType.trim() || !subject.trim() || !topic.trim()) {
      setError('Please fill in all fields'); 
      return; 
    }

    setLoading(true); 
    setError(null); 

    try {
      const response = await fetch(`${API_BASE_URL}/qa-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          examType,
          subject,
          topic,
          difficulty,
          numQuestions,
        }),
      }); 

      const data = await response.json(); 

      if (!response.ok) {
        if (data.errorCode === 'QA_LIMIT_EXCEEDED') {
          setShowLimitWarning(true); 
          setQaLimitInfo({
            limitExceeded: true,
            remainingTests: 0,
            maxTests: data.maxTests,
            usedTests: data.usedTests || data.maxTests,
            resetDate: data.resetDate,
            subscriptionPlan: data.subscriptionPlan,
          }); 
        }
        throw new Error(data.message || 'Failed to generate questions'); 
      }

      setCurrentTest(data.qaTest); 
      setStep('test'); 
      setCurrentQuestionIndex(0); 
      setCurrentAnswer(''); 
      setUserAnswers({}); 
      setUserMarks({}); 
      
      // Update QA limit info from response
      if (data.remainingTests !== undefined) {
        setQaLimitInfo(prev => ({
          ...prev,
          remainingTests: data.remainingTests,
          usedTests: (prev?.maxTests || 10) - data.remainingTests,
          limitExceeded: data.remainingTests === 0,
        })); 
        // console.log('Updated remaining tests from response:', data.remainingTests); 
        // console.log('Updated remaining tests from response:', data.remainingTests); 
      } else {
        // Refetch QA limit info if not provided in response
        try {
          const limitResponse = await fetch(`${API_BASE_URL}/qa-tests/check/remaining`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          }); 
          const limitData = await limitResponse.json(); 
          if (limitData.success) {
            setQaLimitInfo(limitData); 
            // console.log('Updated QA limit info:', limitData); 
          }
        } catch (err) {
          // console.error('Error updating QA limit info:', err); 
        }
      }
    } catch (err) {
      // console.error('Error:', err); 
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please enter an answer'); 
      return; 
    }

    setIsSubmittingAnswer(true); 
    setError(null); 

    try {
      const response = await fetch(
        `${API_BASE_URL}/qa-tests/${currentTest._id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            qaTestId: currentTest._id,
            questionId: currentTest.questions[currentQuestionIndex].questionId,
            userAnswer: currentAnswer,
          }),
        }
      ); 

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.message || 'Failed to evaluate answer'); 
      }

      // Store the evaluation and user answer
      setUserAnswers({
        ...userAnswers,
        [currentQuestionIndex]: currentAnswer,
      }); 
      
      // Store the marks from evaluation
      setUserMarks({
        ...userMarks,
        [currentQuestionIndex]: data.evaluation?.scoredMarks || 0,
      }); 
      
      setEvaluation(data.evaluation); 
      setShowingEvaluation(true); 
    } catch (err) {
      // console.error('Error:', err); 
      setError(err.message); 
    } finally {
      setIsSubmittingAnswer(false); 
    }
  }; 

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); 
      setCurrentAnswer(userAnswers[currentQuestionIndex + 1] || ''); 
      setShowingEvaluation(false); 
      setEvaluation(null); 
    } else {
      // Calculate total marks from all answers
      let totalMarks = 0; 
      let maxMarks = 0; 

      if (currentTest.questions && userMarks) {
        currentTest.questions.forEach((q, idx) => {
          maxMarks += q.marks || 0; 
          totalMarks += userMarks[idx] || 0; 
        }); 
      }

      // Calculate percentage
      const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0; 

      // Update currentTest with totals
      setCurrentTest({
        ...currentTest,
        totalScore: totalMarks,
        maxTotalMarks: maxMarks,
        scorePercentage: percentage,
      }); 

      setStep('results'); 
    }
  }; 

  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1); 
      setCurrentAnswer(userAnswers[currentQuestionIndex - 1] || ''); 
      setShowingEvaluation(false); 
      setEvaluation(null); 
    }
  }; 

  // Input form view
  if (step === 'input') {
    // Determine background based on subscription plan
    let bgGradient = 'from-slate-900 via-blue-950 to-slate-900';  // pro blue for free plan
    let gridColor = 'rgba(59, 130, 246, 0.08)';  // blue for free

    if (qaLimitInfo?.subscriptionPlan === 'pro') {
      bgGradient = 'from-slate-900 via-blue-950 to-slate-900'; 
      gridColor = 'rgba(59, 130, 246, 0.08)';  // blue for pro
    } else if (qaLimitInfo?.subscriptionPlan === 'ultimate') {
      bgGradient = 'from-slate-900 via-amber-950 to-slate-900'; 
      gridColor = 'rgba(217, 119, 6, 0.08)';  // amber for ultimate
    }

    return (
      <div className={`min-h-screen py-8 pt-24 md:py-12 md:pt-32 relative overflow-hidden bg-gradient-to-b ${bgGradient}`} style={{ fontFamily: "'Lato', sans-serif" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        <div className="relative max-w-2xl mx-auto px-4">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="mb-6 text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-all"
          >
            <ChevronRight className="rotate-180" size={16} />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              📝 Quick QA Test
            </h1>
            <p className="text-slate-400 mb-8">
              Answer frequently asked exam questions. Get AI-powered feedback and improvement suggestions.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {showLimitWarning && qaLimitInfo && qaLimitInfo.subscriptionPlan === 'free' && (
              <div className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">⚠️</span>
                  <div className="flex-1">
                    <h3 className="text-yellow-200 font-bold mb-2">QA Test Limit Reached</h3>
                    <p className="text-yellow-100 text-sm mb-3">
                      You have used <span className="font-bold">{qaLimitInfo.usedTests || qaLimitInfo.maxTests}/{qaLimitInfo.maxTests}</span> free QA tests this month. Your limit will reset on <span className="font-bold">{new Date(qaLimitInfo.resetDate).toLocaleDateString()}</span>.
                    </p>
                    <button
                      onClick={() => onNavigate?.('pricing')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                    >
                      Upgrade to Pro → Unlimited Tests
                    </button>
                  </div>
                </div>
              </div>
            )}

            {qaLimitInfo && qaLimitInfo.subscriptionPlan === 'free' && !qaLimitInfo.limitExceeded && (
              <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm flex items-center gap-2">
                <span>ℹ️</span>
                <span>Free plan: <span className="font-bold">{qaLimitInfo.remainingTests}/10</span> QA tests remaining this month</span>
              </div>
            )}

            {qaLimitInfo && (qaLimitInfo.subscriptionPlan === 'pro' || qaLimitInfo.subscriptionPlan === 'ultimate') && (
              <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
                <span>✨</span>
                <span>Your <span className="font-bold capitalize">{qaLimitInfo.subscriptionPlan}</span> plan includes <span className="font-bold">Unlimited QA Tests</span> every month!</span>
              </div>
            )}

            <form onSubmit={handleGenerateQuestions} className="space-y-6">
              {/* Exam Type */}
              <div>
                <label className="block text-white font-semibold mb-3">Exam Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'cbse', label: '🏫 CBSE Board' },
                    { key: 'icse', label: '📚 ICSE Board' },
                    { key: 'state-board', label: '🎓 State Board' },
                    { key: 'jee', label: '🚀 JEE Mains/Advanced' },
                    { key: 'neet', label: '🔬 NEET' },
                    { key: 'upsc', label: '🏛️ UPSC' },
                    { key: 'gate', label: '⚙️ GATE' },
                    { key: 'college', label: '🎯 College Exams' },
                    { key: 'competitive', label: '🏆 Other Competitive' },
                  ].map((exam) => (
                    <button
                      key={exam.key}
                      type="button"
                      onClick={() => setExamType(exam.key)}
                      className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
                        examType === exam.key
                          ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg border border-purple-400'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {exam.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Physics, History, Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-700/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-white font-semibold mb-2">Topic</label>
                <input
                  type="text"
                  placeholder="e.g., Thermodynamics, World War II"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-700/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-white font-semibold mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'easy', label: 'Easy', color: 'from-green-600 to-emerald-600' },
                    { key: 'medium', label: 'Medium', color: 'from-yellow-600 to-orange-600' },
                    { key: 'hard', label: 'Hard', color: 'from-red-600 to-pink-600' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDifficulty(item.key)}
                      className={`py-3 px-2 rounded-lg font-medium transition-all ${
                        difficulty === item.key
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Number of Questions: <span className="text-purple-400">{numQuestions}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-8 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <TrendingUp size={20} />
                    Start QA Test
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    ); 
  }

  // Test view
  if (step === 'test' && currentTest) {
    const currentQuestion = currentTest.questions[currentQuestionIndex]; 
    const progress = ((currentQuestionIndex + 1) / currentTest.totalQuestions) * 100; 

    // Determine background based on subscription plan
    let bgGradient = 'from-slate-900 via-blue-950 to-slate-900';  // pro blue for free plan
    let borderColor = 'border-blue-500/30';  // blue for free
    let progressColor = 'from-blue-600 to-cyan-600';  // blue gradient

    if (qaLimitInfo?.subscriptionPlan === 'pro') {
      bgGradient = 'from-slate-900 via-blue-950 to-slate-900'; 
      borderColor = 'border-blue-500/30'; 
      progressColor = 'from-blue-600 to-cyan-600'; 
    } else if (qaLimitInfo?.subscriptionPlan === 'ultimate') {
      bgGradient = 'from-slate-900 via-amber-950 to-slate-900'; 
      borderColor = 'border-amber-500/30'; 
      progressColor = 'from-amber-600 to-orange-600'; 
    }

    return (
      <div className={`min-h-screen py-8 pt-24 md:py-12 md:pt-32 relative overflow-hidden bg-gradient-to-b ${bgGradient}`} style={{ fontFamily: "'Lato', sans-serif" }}>
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {currentTest.totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className={`bg-gradient-to-br from-slate-900/40 to-slate-950/40 ${borderColor} rounded-2xl p-8 backdrop-blur-sm shadow-2xl mb-8`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <span className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-magenta-600 text-white text-sm font-bold shadow-lg">
                  {currentQuestionIndex + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-4 text-white text-lg leading-relaxed break-words">
                  <MathText>{currentQuestion.question}</MathText>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                    {currentQuestion.questionType}
                  </span>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                    {currentQuestion.marks} marks
                  </span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium border border-orange-500/30">
                    {currentQuestion.examFrequency}
                  </span>
                  {currentQuestion.isPYQ && currentQuestion.pyqYears && currentQuestion.pyqYears.length > 0 && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1">
                      <span>📚 PYQ</span>
                      <span className="font-semibold">{currentQuestion.pyqYears.sort((a, b) => b - a).join(', ')}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key points hint */}
            <div className="mt-6 p-4 bg-slate-700/20 border border-slate-600/50 rounded-xl">
              <p className="text-sm text-slate-300 font-semibold mb-3">💡 Key Points to Cover:</p>
              <ul className="space-y-2">
                {currentQuestion.expectedKeyPoints.map((kp, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400 font-bold flex-shrink-0">•</span>
                    <span className="pt-0.5"><MathText>{kp}</MathText></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Answer input / Evaluation */}
          {!showingEvaluation ? (
            <div className={`bg-gradient-to-br from-slate-900/40 to-slate-950/40 ${borderColor} rounded-2xl p-8 backdrop-blur-sm shadow-2xl mb-8`}>
              <label className="block text-white font-semibold mb-3">Your Answer:</label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here. Try to cover all key points mentioned above..."
                rows="6"
                className={`w-full bg-slate-700/50 ${borderColor} rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 resize-none`}
                style={{
                  '--tw-ring-color': qaLimitInfo?.subscriptionPlan === 'pro' ? 'rgba(59, 130, 246, 0.2)' : qaLimitInfo?.subscriptionPlan === 'ultimate' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(168, 85, 247, 0.2)'
                }}
              />

              {error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmittingAnswer}
                className={`mt-6 w-full py-3 bg-gradient-to-r ${progressColor} hover:shadow-lg disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
              >
                {isSubmittingAnswer ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Submit & Get Feedback
                  </>
                )}
              </button>
            </div>
          ) : evaluation && (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-950/40 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-6xl font-bold text-green-400">{evaluation.score}%</div>
                  <div className="flex-1">
                    <p className="text-xl text-white font-bold mb-2">Score: {evaluation.scoredMarks}/{evaluation.maxMarks} marks</p>
                    <p className="text-slate-300">Key Points Coverage: <span className="text-green-300 font-semibold">{evaluation.coveragePercentage}%</span></p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-950/40 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                    <CheckCircle size={22} className="text-blue-400" /> What You Did Well
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((strength, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-3">
                        <span className="text-blue-400 font-bold text-lg flex-shrink-0">✓</span>
                        <span className="pt-1">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                <div className="bg-gradient-to-br from-red-900/40 to-slate-950/40 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                    <AlertCircle size={22} className="text-red-400" /> Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-3">
                        <span className="text-red-400 font-bold text-lg flex-shrink-0">!</span>
                        <span className="pt-1">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Suggestions */}
              {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/40 to-slate-950/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <TrendingUp size={22} className="text-purple-400" /> Tips to Score Better
                  </h3>
                  <ol className="space-y-3">
                    {evaluation.improvementSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-3">
                        <span className="text-purple-400 font-bold text-lg bg-purple-500/20 w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">{idx + 1}</span>
                        <span className="pt-1">{suggestion}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Model Answer */}
              {evaluation.modelAnswer && (
                <div className="bg-gradient-to-br from-cyan-900/40 to-slate-950/40 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                  <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
                    <span className="text-2xl">📚</span> Model Answer
                  </h3>
                  <div className="text-slate-200 leading-relaxed space-y-4 bg-slate-900/30 rounded-lg p-6 border border-slate-700/50">
                    <ReactMarkdown
                      components={{
                        p: ({ ...props }) => <p className="text-slate-200 mb-3 leading-relaxed"><MathText>{props.children}</MathText></p>,
                        h1: ({ ...props }) => <h1 className="text-lg font-bold text-cyan-300 mt-4 mb-3"><MathText>{props.children}</MathText></h1>,
                        h2: ({ ...props }) => <h2 className="text-base font-bold text-purple-300 mt-4 mb-2"><MathText>{props.children}</MathText></h2>,
                        h3: ({ ...props }) => <h3 className="text-sm font-bold text-purple-300 mt-3 mb-2"><MathText>{props.children}</MathText></h3>,
                        li: ({ ...props }) => <li className="ml-2 pl-2 text-slate-300 mb-1 before:content-['▪'] before:mr-2 before:text-purple-400"><MathText>{props.children}</MathText></li>,
                        ul: ({ ...props }) => <ul className="list-none pl-0 mb-3 space-y-1">{props.children}</ul>,
                        ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1">{props.children}</ol>,
                        strong: ({ ...props }) => <strong className="text-cyan-300 font-bold">{props.children}</strong>,
                        em: ({ ...props }) => <em className="text-purple-300 italic">{props.children}</em>,
                        code: ({ inline, ...props }) => 
                          inline ? (
                            <code className="bg-slate-800 text-cyan-300 px-2 py-1 rounded font-mono text-sm">{props.children}</code>
                          ) : (
                            <pre className="bg-slate-800 text-cyan-300 p-3 rounded mb-3 overflow-x-auto"><code>{props.children}</code></pre>
                          ),
                      }}
                    >
                      {evaluation.modelAnswer}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  className={`flex-1 py-3 bg-gradient-to-r ${progressColor} hover:shadow-lg text-white rounded-lg font-semibold transition-all`}
                >
                  {currentQuestionIndex === currentTest.totalQuestions - 1 ? 'Finish Test' : 'Next Question'} →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ); 
  }

  // Results view
  if (step === 'results' && currentTest) {
    return (
      <div className="min-h-screen py-8 pt-24 md:py-12 md:pt-32 relative overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black" style={{ fontFamily: "'Lato', sans-serif" }}>
        <div className="relative max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            ✅ Test Completed!
          </h1>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-950/40 border border-green-500/30 rounded-2xl p-12 text-center mb-8">
            <div className="text-6xl font-bold text-green-400 mb-4">
              {currentTest.scorePercentage}%
            </div>
            <p className="text-2xl text-white font-semibold">
              {currentTest.totalScore} / {currentTest.maxTotalMarks} marks
            </p>
            <p className="text-slate-300 mt-4">
              {currentTest.totalQuestions} questions completed
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setStep('input'); 
                setSubject(''); 
                setTopic(''); 
                setCurrentTest(null); 
                setUserAnswers({}); 
                setUserMarks({}); 
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg font-semibold transition-all"
            >
              Take Another Test
            </button>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="px-8 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    ); 
  }

  return null; 
}