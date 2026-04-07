import React, { useState, useEffect } from 'react'; 
import { ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react'; 
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

export default function QuizInterface({ quiz, onNavigate }) {
  const [currentQuestion, setCurrentQuestion] = useState(0); 
  const [userAnswers, setUserAnswers] = useState({}); 
  const [showResults, setShowResults] = useState(false); 
  const [userSubscription, setUserSubscription] = useState('free'); 

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
        if (data.success) {
          setUserSubscription(data.user.subscriptionPlan || 'free'); 
        }
      } catch (error) {
        // console.error('Error fetching subscription:', error); 
        setUserSubscription('free'); 
      }
    }; 

    fetchSubscriptionData(); 
  }, []); 

  if (!quiz) return null; 

  // console.log('Quiz data:', quiz); 
  // console.log('First question:', quiz.questions[0]); 

  // Extract quiz metadata
  const examType = quiz.examType || 'competitive'; 
  const subject = quiz.subject || 'Quiz'; 
  const difficulty = quiz.difficulty || 'medium'; 
  const question = quiz.questions[currentQuestion]; 
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100; 

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = { ...userAnswers }; 
    newAnswers[currentQuestion] = answerIndex; 
    setUserAnswers(newAnswers); 
  }; 

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1); 
    } else {
      setShowResults(true); 
    }
  }; 

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1); 
    }
  }; 

  const calculateScore = () => {
    let correct = 0; 
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correct++; 
      }
    }); 
    return Math.round((correct / quiz.questions.length) * 100); 
  }; 

  const handleRestart = () => {
    // Navigate to quiz generator to create a new quiz
    onNavigate?.('quiz-generator'); 
  }; 

  // Submit quiz to backend when results are shown
  React.useEffect(() => {
    if (showResults && quiz && Object.keys(userAnswers).length > 0) {
      const submitQuizToBackend = async () => {
        try {
          console.log('Submitting quiz to backend...', { quizId: quiz._id, answers: userAnswers }); 
          const response = await fetch(`${API_BASE_URL}/quizzes/${quiz._id}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ answers: userAnswers }),
          }); 

          const data = await response.json(); 
          console.log('Quiz submitted successfully:', data); 
          if (data.success) {
            console.log('✅ Quiz submission confirmed by backend'); 
          }
        } catch (error) {
          console.error('Error submitting quiz:', error); 
        }
      }; 

      submitQuizToBackend(); 
    }
  }, [showResults, quiz, userAnswers]); 

  // Results View
  if (showResults) {
    const score = calculateScore(); 
    const totalQuestions = quiz.questions.length; 
    const correctAnswers = Object.keys(userAnswers).filter(
      (idx) => userAnswers[idx] === quiz.questions[idx].correctAnswer
    ).length; 

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

        <div className="relative max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Results Card */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-2xl p-6 md:p-8 text-center mb-6 md:mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden">
            {/* Score Card */}
            <div className="relative mb-8 md:mb-10 animate-in zoom-in duration-700" style={{ animationDelay: '200ms' }}>
              <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 backdrop-blur-sm ${
                score >= 70 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/50 shadow-2xl shadow-green-500/20' 
                  : score >= 50 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-500/50 shadow-2xl shadow-yellow-500/20'
                  : 'bg-gradient-to-br from-red-500/20 to-rose-500/10 border-red-500/50 shadow-2xl shadow-red-500/20'
              }`}>
                {/* Animated background elements */}
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 animate-pulse ${
                  score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse ${
                  score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`} style={{ animationDelay: '1s' }}></div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r ${
                      score >= 70 
                        ? 'from-green-400 to-emerald-400' 
                        : score >= 50 
                        ? 'from-yellow-400 to-amber-400'
                        : 'from-red-400 to-rose-400'
                    } bg-clip-text text-transparent drop-shadow-lg">
                      {score}%
                    </span>
                  </div>
                  
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${
                    score >= 70 
                      ? 'text-green-300' 
                      : score >= 50 
                      ? 'text-yellow-300'
                      : 'text-red-300'
                  }`}>
                    {score >= 70 ? '🎉 Excellent Performance!' : score >= 50 ? '👍 Good Effort!' : '💪 Keep Practicing!'}
                  </h3>
                  
                  <p className="text-sm md:text-base text-slate-300 mb-4">
                    {score >= 70 
                      ? 'You nailed this quiz! Great understanding of the material.' 
                      : score >= 50 
                      ? 'You\'re on the right track! Review the material and try again.'
                      : 'Don\'t worry! Review the concepts and give it another shot.'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-500/30">
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-bold text-green-400">{correctAnswers}</p>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">Correct</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-bold text-red-400">{totalQuestions - correctAnswers}</p>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">Incorrect</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl md:text-4xl font-bold text-blue-400">{totalQuestions}</p>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '400ms' }}>
              Quiz Complete!
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mb-2 animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '500ms' }}>
              You got <span className="text-green-400 font-semibold">{correctAnswers}</span> out of <span className="text-blue-400 font-semibold">{totalQuestions}</span> correct
            </p>

            {/* Performance Badge */}
            <div className="inline-block mt-3 md:mt-4 animate-in fade-in zoom-in duration-700" style={{ animationDelay: '600ms' }}>
              {score >= 80 ? (
                <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                  🎉 Excellent! Keep it up!
                </div>
              ) : score >= 60 ? (
                <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                  👍 Good work! Review weak areas.
                </div>
              ) : (
                <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                  📚 Keep practicing! You'll improve.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Review */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 animate-in fade-in slide-in-from-left-8 duration-700" style={{ animationDelay: '700ms' }}>
              Review Answers
            </h3>
            {quiz.questions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctAnswer; 
              return (
                <div
                  key={idx}
                  className={`p-4 md:p-6 rounded-lg border transition-all duration-300 animate-in fade-in ${
                    isCorrect
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/60'
                      : 'bg-red-500/10 border-red-500/30 hover:border-red-500/60'
                  } transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10`}
                  style={{ animationDelay: `${800 + idx * 100}ms`, animationDuration: '600ms' }}
                >
                  <div className="flex items-start gap-3 md:gap-4 mb-3">
                    <span className="text-lg md:text-xl font-bold flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="text-green-400" size={18} />
                      ) : (
                        <XCircle className="text-red-400" size={18} />
                      )}
                    </span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-white mb-1 md:mb-2 text-xs md:text-sm break-words">
                        Q{idx + 1}: <MathText>{q.question}</MathText>
                      </p>
                      <p className={`text-xs md:text-xs font-semibold mb-1 md:mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                      </p>
                      <p className="text-xs md:text-xs text-slate-300 mb-1 md:mb-2 break-words">
                        Your answer: <span className="text-yellow-400"><MathText>{q.options[userAnswers[idx]]}</MathText></span>
                      </p>
                      <p className="text-xs md:text-xs text-green-400 break-words">
                        Correct answer: <MathText>{q.options[q.correctAnswer]}</MathText>
                      </p>
                      <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 font-semibold uppercase tracking-wider">Explanation:</p>
                      <div className="text-xs md:text-sm text-slate-300 bg-slate-900/30 rounded-lg p-3 md:p-4 border border-slate-700/50">
                        <ReactMarkdown
                          components={{
                            p: ({ ...props }) => <p className="text-slate-300 mb-2 last:mb-0"><MathText>{props.children}</MathText></p>,
                            strong: ({ ...props }) => <strong className="text-cyan-300 font-bold">{props.children}</strong>,
                            em: ({ ...props }) => <em className="text-purple-300 italic">{props.children}</em>,
                            code: ({ inline, ...props }) => 
                              inline ? (
                                <code className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs">{props.children}</code>
                              ) : (
                                <pre className="bg-slate-800 text-cyan-300 p-2 rounded mb-2 overflow-x-auto text-xs"><code>{props.children}</code></pre>
                              ),
                            ul: ({ ...props }) => <ul className="list-none pl-0 mb-2 space-y-1">{props.children}</ul>,
                            li: ({ ...props }) => <li className="text-slate-300 mb-1 before:content-['▪'] before:mr-2 before:text-purple-400"><MathText>{props.children}</MathText></li>,
                          }}
                        >
                          {q.explanation || 'No explanation available.'}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ); 
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '1000ms' }}>
            <button
              onClick={handleRestart}
              className="flex-1 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/50 text-sm md:text-base"
            >
              <RotateCcw size={18} />
              Retake Quiz
            </button>
            <button
              onClick={() => {
                // console.log('Navigate to dashboard'); 
                onNavigate('dashboard'); 
              }}
              className="flex-1 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              Back to Dashboard
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    ); 
  }

  // Quiz View
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

      <div className="relative max-w-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <button
          onClick={() => {
            // console.log('Navigate to quiz-generator'); 
            onNavigate('quiz-generator'); 
          }}
          className="mb-6 md:mb-8 text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-all duration-300 group transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-8 duration-1000 text-sm md:text-base"
        >
          <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
          Back to Quiz Generator
        </button>

        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden">
          {/* Header */}
          <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <div>
                <p className="text-xs md:text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
                <p className="text-sm md:text-base text-white font-semibold group-hover:text-purple-300 transition-colors">
                  {quiz.topic}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-purple-400">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-magenta-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-6 md:mb-8 leading-relaxed break-words">
              <MathText>{question.question}</MathText>
            </h2>

            {/* Options */}
            <div className="space-y-2 md:space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 group/option animate-in fade-in ${
                    userAnswers[currentQuestion] === idx
                      ? 'bg-purple-600/20 border-purple-500 text-purple-100'
                      : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                  style={{
                    animationDelay: `${200 + idx * 100}ms`,
                    animationDuration: '600ms',
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5 ${
                        userAnswers[currentQuestion] === idx
                          ? 'border-purple-400 bg-purple-600 group-hover/option:scale-110'
                          : 'border-slate-500 group-hover/option:border-purple-400'
                      }`}
                    >
                      {userAnswers[currentQuestion] === idx && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="group-hover/option:text-white transition-colors text-sm md:text-base break-words">
                      <MathText>{option}</MathText>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="flex-1 py-2.5 md:py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 text-sm md:text-base"
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={userAnswers[currentQuestion] === undefined}
              className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg shadow-purple-500/50 text-sm md:text-base"
            >
              {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ); 
}