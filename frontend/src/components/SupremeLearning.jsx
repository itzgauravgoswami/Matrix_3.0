import React, { useState, useEffect } from 'react'; 
import { ChevronRight, Search, Loader, BookOpen, Video, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 
import { useAuth } from '../context/AuthContext'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

// Component to render LaTeX math expressions
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
  const mathRegex = /\$\$[\s\S]*?\$\$|\$[^\$\n]+\$/g; 
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

export default function SupremeLearning({ onNavigate, userName }) {
  const { user, isAuthenticated } = useAuth(); 
  const [userSubscription, setUserSubscription] = useState('free'); 
  const [topic, setTopic] = useState(''); 
  const [subject, setSubject] = useState(''); 
  const [examType, setExamType] = useState('competitive'); 
  const [videoLanguage, setVideoLanguage] = useState('english'); 
  const [notesLanguage, setNotesLanguage] = useState('english'); 
  const [learningMaterial, setLearningMaterial] = useState(null); 
  const [youtubeVideo, setYoutubeVideo] = useState(null); 
  const [notes, setNotes] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const [showLimitWarning, setShowLimitWarning] = useState(false); 
  const [limitError, setLimitError] = useState(null); 
  const [hasSearched, setHasSearched] = useState(false); 
  const [isFullscreen, setIsFullscreen] = useState(false); 

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // Enter fullscreen
      setIsFullscreen(true); 
      try {
        const elem = document.documentElement; 
        if (elem.requestFullscreen) {
          await elem.requestFullscreen(); 
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen(); 
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen(); 
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen(); 
        }
      } catch (err) {
        // console.warn('Fullscreen request failed:', err); 
        // Still show fullscreen UI even if browser fullscreen fails
      }
    } else {
      // Exit fullscreen
      setIsFullscreen(false); 
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen(); 
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen(); 
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen(); 
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen(); 
          }
        }
      } catch (err) {
        // console.warn('Exit fullscreen failed:', err); 
      }
    }
  }; 

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

  // Handle keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen(); 
      }
    }; 

    if (isFullscreen) {
      // Prevent scrolling when in fullscreen mode
      document.body.style.overflow = 'hidden'; 
      window.addEventListener('keydown', handleKeyPress); 
    }

    return () => {
      document.body.style.overflow = 'auto'; 
      window.removeEventListener('keydown', handleKeyPress); 
    }; 
  }, [isFullscreen]); 

  const extractYoutubeVideoId = (url) => {
    if (!url) return null; 
    
    // Handle direct watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/); 
    if (watchMatch) return watchMatch[1]; 
    
    // Handle short URLs: youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?#]+)/); 
    if (shortMatch) return shortMatch[1]; 
    
    // Handle embed URLs: youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?#]+)/); 
    if (embedMatch) return embedMatch[1]; 
    
    return null; 
  }; 

  const handleGenerateLearning = async (e) => {
    e.preventDefault(); 
    
    if (!topic.trim()) {
      setLimitError('Please enter a topic'); 
      setShowLimitWarning(true); 
      return; 
    }

    if (!subject.trim()) {
      setLimitError('Please enter a subject'); 
      setShowLimitWarning(true); 
      return; 
    }

    setIsLoading(true); 
    setShowLimitWarning(false); 
    setLimitError(null); 
    setHasSearched(true); 

    try {
      const learningData = {
        topic: topic,
        subject: subject,
        examType: examType,
        videoLanguage: videoLanguage,
        notesLanguage: notesLanguage,
      }; 

      const response = await fetch(`${API_BASE_URL}/learning/supreme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(learningData),
      }); 

      const result = await response.json(); 

      if (!response.ok) {
        setLimitError(result.message || 'Failed to generate learning material'); 
        setShowLimitWarning(true); 
        return; 
      }

      if (result.success) {
        // console.log('Learning material generated:', result); 
        // Use videoId directly if available, otherwise try to extract from videoUrl
        const videoId = result.videoId || extractYoutubeVideoId(result.videoUrl); 
        setYoutubeVideo(videoId); 
        setNotes(result.notes); 
        setLearningMaterial(result); 
      }
    } catch (error) {
      // console.error('Error generating learning material:', error); 
      setLimitError('Error generating learning material. Please try again.'); 
      setShowLimitWarning(true); 
    } finally {
      setIsLoading(false); 
    }
  }; 

  return (
    <>
      {isFullscreen ? (
        // Fullscreen Focus Mode with Custom Minimal Navbar
        <div className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen">
          {/* Custom Minimal Navbar for Fullscreen */}
          <div className="bg-black border-b border-purple-500/30 px-4 md:px-6 py-4 md:py-5 flex items-center justify-center relative">
            {/* Left: Logo */}
            <img 
              src="/pdf_mail.png" 
              alt="SelfRanker Logo" 
              className="h-12 md:h-14 rounded-lg object-contain absolute left-4 md:left-6"
            />

            {/* Center: Supreme Learning Title */}
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              Supreme Learning
            </h1>

            {/* Right: Topic Name and Exit Button */}
            <div className="absolute right-4 md:right-6 flex items-center gap-4">
              {/* Topic Name */}
              <span className="text-sm md:text-base text-slate-400 hidden md:inline truncate max-w-xs">
                {topic}
              </span>

              {/* Exit Focus Mode Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 md:p-3 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                title="Exit Focus Mode (ESC)"
              >
                <Minimize2 size={20} />
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-4">
            {/* Video - Takes more space in fullscreen */}
            <div className="w-full md:w-3/5 bg-black rounded-xl overflow-hidden">
              <div className="w-full h-full aspect-video md:aspect-auto">
                {youtubeVideo ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideo}?autoplay=1`}
                    title="Learning Video"
                    frameBorder="0"
                    allow="accelerometer;  autoplay;  clipboard-write;  encrypted-media;  gyroscope;  picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <p>Loading video...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes - Scrollable side panel */}
            <div className="w-full md:w-2/5 bg-slate-900/80 rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 md:p-4 border-b border-slate-700 bg-slate-950/50">
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-400" />
                  Notes
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {notes ? (
                  <div className="prose prose-invert max-w-none text-sm md:text-base">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-5 mb-2 sm:mb-3 text-purple-300 border-b border-purple-500/30 pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base sm:text-lg md:text-xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-3 text-blue-300" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm sm:text-base font-bold mt-2 mb-1 text-cyan-400" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-xs sm:text-sm font-bold mt-2 mb-1 text-cyan-300" {...props} />,
                        h5: ({node, ...props}) => <h5 className="text-xs sm:text-sm font-bold mt-2 mb-1 text-cyan-300" {...props} />,
                        h6: ({node, ...props}) => <h6 className="text-xs font-bold mt-2 mb-1 text-cyan-300" {...props} />,
                        p: ({node, children, ...props}) => <p className="mb-2 sm:mb-3 text-slate-200 text-xs sm:text-sm leading-relaxed"><MathText>{children}</MathText></p>,
                        ul: ({node, ...props}) => <ul className="list-none mb-2 sm:mb-3 space-y-0.5 sm:space-y-1 ml-2 sm:ml-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-none mb-2 sm:mb-3 space-y-0.5 sm:space-y-1 ml-2 sm:ml-4" {...props} />,
                        li: ({node, children, ...props}) => <li className="ml-2 sm:ml-4 pl-2 relative text-slate-200 text-xs sm:text-sm before:content-['▪'] before:absolute before:left-0 before:text-purple-400 before:text-xs"><MathText>{children}</MathText></li>,
                        strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                        em: ({node, ...props}) => <em className="text-slate-200 italic" {...props} />,
                        code: ({node, inline, children, ...props}) => inline ? (
                          <code className="bg-slate-800 px-2 py-1 rounded text-orange-300 font-mono text-xs">{children}</code>
                        ) : (
                          <code className="bg-slate-800 text-orange-300 p-2 rounded block text-xs overflow-x-auto">{children}</code>
                        ),
                        a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline text-xs sm:text-sm" {...props} />,
                      }}
                    >
                      {notes}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs md:text-sm">Loading notes...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Normal Mode
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

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="mb-4 sm:mb-6 md:mb-8 text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-all duration-300 group transform hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base"
          >
            <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BookOpen className={`w-8 h-8 md:w-10 md:h-10 ${
                userSubscription === 'ultimate' ? 'text-orange-400' : 'text-purple-400'
              }`} />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-magenta-400 to-orange-400 bg-clip-text text-transparent">
                Supreme Learning
              </h1>
            </div>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Master any topic with curated YouTube videos and comprehensive notes
            </p>
          </div>

          {/* Form Section */}
          {!hasSearched || !learningMaterial ? (
            <div className="mb-8 md:mb-12">
              <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden">
                <h2 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Search size={20} className="text-purple-400" />
                  What would you like to learn?
                </h2>

                <form onSubmit={handleGenerateLearning} className="space-y-4 md:space-y-6">
                  {/* Topic Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Topic <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Photosynthesis, Quantum Mechanics, etc."
                      className="w-full px-4 py-2 md:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Biology, Physics, Mathematics, etc."
                      className="w-full px-4 py-2 md:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Exam Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Exam Type
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-4 py-2 md:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="competitive">Competitive Exam</option>
                      <option value="board">Board Exam</option>
                      <option value="jee">JEE</option>
                      <option value="neet">NEET</option>
                      <option value="gate">GATE</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Video Language */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Video Language
                    </label>
                    <select
                      value={videoLanguage}
                      onChange={(e) => setVideoLanguage(e.target.value)}
                      className="w-full px-4 py-2 md:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                    </select>
                  </div>

                  {/* Notes Language */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Notes Language
                    </label>
                    <select
                      value={notesLanguage}
                      onChange={(e) => setNotesLanguage(e.target.value)}
                      className="w-full px-4 py-2 md:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    >
                      <option value="english">English</option>
                      <option value="hinglish">Hinglish</option>
                      <option value="brocode">BroCode</option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {showLimitWarning && (
                    <div className="p-3 md:p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                      {limitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-all duration-300 transform flex items-center justify-center gap-2 ${
                      isLoading
                        ? 'bg-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Generate Learning Material
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {/* Learning Material Display */}
          {hasSearched && learningMaterial && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={24} className="text-purple-400" />
                  Learning: {topic}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 md:p-3 rounded-lg bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                    title="Enter Focus Mode"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setHasSearched(false); 
                      setLearningMaterial(null); 
                      setYoutubeVideo(null); 
                      setNotes(null); 
                      setTopic(''); 
                      setSubject(''); 
                      setVideoLanguage('english'); 
                      setNotesLanguage('english'); 
                    }}
                    className="p-2 md:p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-purple-400 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    title="Start New Search"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left - YouTube Video */}
                <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="p-4 md:p-6 border-b border-slate-700">
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <Video size={20} className="text-red-400" />
                      YouTube Tutorial
                    </h3>
                  </div>

                  <div className="aspect-video bg-black">
                    {youtubeVideo ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeVideo}`}
                        title="Learning Video"
                        frameBorder="0"
                        allow="accelerometer;  autoplay;  clipboard-write;  encrypted-media;  gyroscope;  picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <p>Loading video...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right - Notes */}
                <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col">
                  <div className="p-4 md:p-6 border-b border-slate-700">
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen size={20} className="text-blue-400" />
                      Detailed Notes
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 max-h-96">
                    {notes ? (
                      <div className="prose prose-invert max-w-none text-sm md:text-base">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl md:text-2xl font-bold text-purple-300 mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg md:text-xl font-bold text-purple-300 mt-3 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base md:text-lg font-bold text-slate-200 mt-2 mb-1" {...props} />,
                            p: ({node, ...props}) => (
                              <p className="text-slate-300 mb-2 leading-relaxed">
                                <MathText>{props.children}</MathText>
                              </p>
                            ),
                            li: ({node, ...props}) => (
                              <li className="text-slate-300 ml-4 mb-1">
                                <MathText>{props.children}</MathText>
                              </li>
                            ),
                            code: ({node, inline, ...props}) => (
                              inline ? (
                                <code className="bg-slate-800 px-2 py-1 rounded text-purple-300 font-mono text-xs" {...props} />
                              ) : (
                                <code className="block bg-slate-800 p-3 rounded text-slate-300 font-mono text-xs overflow-x-auto mb-2" {...props} />
                              )
                            ),
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-2 text-slate-400 italic" {...props} />
                            ),
                          }}
                        >
                          {notes}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-400">Notes loading...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Topic Information */}
              {learningMaterial && (
                <div className="mt-6 md:mt-8 bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-slate-700 rounded-xl sm:rounded-2xl p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs md:text-sm text-slate-400 mb-1">Topic</p>
                      <p className="text-sm md:text-base font-semibold text-white">{learningMaterial.topic}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs md:text-sm text-slate-400 mb-1">Subject</p>
                      <p className="text-sm md:text-base font-semibold text-white">{learningMaterial.subject}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs md:text-sm text-slate-400 mb-1">Exam Type</p>
                      <p className="text-sm md:text-base font-semibold text-white capitalize">{learningMaterial.examType}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16">
              <Loader size={48} className="animate-spin text-purple-400 mb-4" />
              <p className="text-slate-400 text-sm md:text-base">Generating your learning material...</p>
            </div>
          )}
        </div>
        </div>
      )}
    </>
  ); 
}; 