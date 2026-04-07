import React, { useState, useEffect, useRef } from 'react'; 
import { Send, Plus, MessageSquare, Trash2, Loader, Brain, ArrowLeft, Edit2 } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import remarkGfm from 'remark-gfm'; 
import 'katex/dist/katex.min.css'; 
import katex from 'katex'; 
import Navbar from './Navbar'; 

// Component to render LaTeX math expressions
const MathExpression = ({ content, inline = false }) => {
  try {
    const html = katex.renderToString(content, {
      throwOnError: false,
      displayMode: !inline,
    }); 
    
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        className={inline ? 'inline-math' : 'block-math'}
      />
    ); 
  } catch (error) {
    console.error('KaTeX error:', error); 
    return <span className="text-red-400">{content}</span>; 
  }
}; 

// Function to process text with both inline and display LaTeX
const renderMathAndText = (text) => {
  if (!text) return text; 
  
  // Handle display math ($$...$$)
  let result = text; 
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g; 
  result = result.replace(displayMathRegex, (match, content) => `<DISPLAY_MATH>${content}</DISPLAY_MATH>`); 
  
  // Handle inline math ($...$)
  const inlineMathRegex = /\$([^\$\n]+?)\$/g; 
  result = result.replace(inlineMathRegex, (match, content) => {
    // Don't match if it's part of DISPLAY_MATH tags
    if (result.includes('DISPLAY_MATH')) return match; 
    return `<INLINE_MATH>${content}</INLINE_MATH>`; 
  }); 
  
  return result; 
}; 

// Component to render markdown with code highlighting
const MarkdownContent = ({ content }) => {
  const processedContent = renderMathAndText(content); 
  const [copiedCode, setCopiedCode] = useState(null); 
  
  const copyToClipboard = (text, blockId) => {
    navigator.clipboard.writeText(text); 
    setCopiedCode(blockId); 
    setTimeout(() => setCopiedCode(null), 2000); 
  }; 
  
  return (
    <div className="text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || ''); 
            const language = match ? match[1] : 'text'; 
            const codeString = String(children).replace(/\n$/, ''); 
            const blockId = `code-${Math.random()}`; 
            
            if (inline) {
              return (
                <code className="bg-slate-900/80 text-cyan-300 px-2.5 py-1.5 rounded text-xs font-mono border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                  {children}
                </code>
              ); 
            }
            
            return (
              <div className="my-4 rounded-xl overflow-hidden border border-purple-500/20 bg-slate-900/40 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
                {/* Code header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-purple-500/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{language}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{codeString.split('\n').length} lines</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(codeString, blockId)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-purple-100 transition-all duration-200 font-medium"
                  >
                    {copiedCode === blockId ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                
                {/* Code content */}
                <div className="overflow-x-auto p-0">
                  <SyntaxHighlighter
                    language={language}
                    style={atomDark}
                    className="!bg-transparent !m-0 !p-4 !rounded-none"
                    customStyle={{
                      background: 'transparent',
                      fontSize: '13px',
                      lineHeight: '1.6',
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            ); 
          },
          text: ({ children }) => {
            // Handle math expressions in text
            if (typeof children === 'string') {
              const parts = children.split(/(<DISPLAY_MATH>.*?<\/DISPLAY_MATH>|<INLINE_MATH>.*?<\/INLINE_MATH>)/); 
              
              return (
                <>
                  {parts.map((part, idx) => {
                    if (part.startsWith('<DISPLAY_MATH>')) {
                      const mathContent = part.replace(/<DISPLAY_MATH>|<\/DISPLAY_MATH>/g, ''); 
                      return (
                        <div key={idx} className="my-2 flex justify-center">
                          <MathExpression content={mathContent} inline={false} />
                        </div>
                      ); 
                    } else if (part.startsWith('<INLINE_MATH>')) {
                      const mathContent = part.replace(/<INLINE_MATH>|<\/INLINE_MATH>/g, ''); 
                      return <MathExpression key={idx} content={mathContent} inline={true} />; 
                    } else {
                      return part; 
                    }
                  })}
                </>
              ); 
            }
            return children; 
          },
          p: ({ children }) => <p className="mb-3 leading-relaxed text-slate-100">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3 text-purple-300 border-l-4 border-purple-500 pl-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2 text-cyan-300">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-100">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-100">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500/50 pl-4 py-2 my-3 bg-slate-800/30 rounded-r-lg text-slate-300 italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-bold text-purple-300">{children}</strong>,
          em: ({ children }) => <em className="italic text-cyan-300">{children}</em>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-purple-500/20">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="text-slate-100">{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-purple-500/10 hover:bg-slate-800/30 transition">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2.5 text-left font-semibold text-purple-300">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 text-slate-200">{children}</td>,
          hr: () => <hr className="my-6 border-t border-purple-500/20" />,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  ); 
}; 

const AITutor = ({ onNavigate }) => {
  const [conversations, setConversations] = useState([]); 
  const [activeConversation, setActiveConversation] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [inputMessage, setInputMessage] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [subject, setSubject] = useState(''); 
  const [topic, setTopic] = useState(''); 
  const [showNewConversation, setShowNewConversation] = useState(false); 
  const [error, setError] = useState(''); 
  const [currentSubject, setCurrentSubject] = useState(''); 
  const [currentTopic, setCurrentTopic] = useState(''); 
  const [editingId, setEditingId] = useState(null); 
  const [editingSubject, setEditingSubject] = useState(''); 
  const [editingTopic, setEditingTopic] = useState(''); 
  const messagesEndRef = useRef(null); 
  const messageContainerRef = useRef(null); 
  const lastMessageCountRef = useRef(0); 
  const isLoadingConversationRef = useRef(false); 
  const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

  // Auto scroll to bottom only when NEW messages arrive (not when loading existing conversations)
  useEffect(() => {
    // Only scroll if message count increased AND we're not loading a previous conversation
    if (messages.length > lastMessageCountRef.current && !isLoadingConversationRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
      }, 50); 
    }
    lastMessageCountRef.current = messages.length; 
  }, [messages.length]); 

  // Load conversations
  useEffect(() => {
    loadConversations(); 
  }, []); 

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      }); 

      if (response.ok) {
        const data = await response.json(); 
        setConversations(data.conversations || []); 
      }
    } catch (error) {
      console.error('Error loading conversations:', error); 
    }
  }; 

  const startNewConversation = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject'); 
      return; 
    }

    setLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/conversations/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subject,
          topic: topic || 'General',
          initialMessage: `I want to learn about ${topic || subject}`
        })
      }); 

      if (response.ok) {
        const data = await response.json(); 
        setActiveConversation(data.conversationId); 
        setMessages(data.conversation.messages || []); 
        setCurrentSubject(subject); 
        setCurrentTopic(topic || 'General'); 
        setShowNewConversation(false); 
        setSubject(''); 
        setTopic(''); 
        loadConversations(); 
      } else {
        const errorData = await response.json().catch(() => ({})); 
        console.error('Error starting conversation:', errorData); 
        alert(`Failed to start conversation: ${errorData.error || response.statusText}`); 
      }
    } catch (error) {
      console.error('Error starting conversation:', error); 
      alert('Failed to start conversation'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const loadConversation = async (conversationId) => {
    try {
      // Set loading state to show loading indicator
      setLoading(true); 
      
      // Set flag to prevent auto-scroll to bottom when loading
      isLoadingConversationRef.current = true; 
      
      const response = await fetch(`${API_BASE_URL}/tutor/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      }); 

      if (response.ok) {
        const data = await response.json(); 
        setActiveConversation(conversationId); 
        setMessages(data.conversation.messages || []); 
        setCurrentSubject(data.conversation.subject || ''); 
        setCurrentTopic(data.conversation.topic || ''); 
        
        // Reset the last message count after loading
        lastMessageCountRef.current = data.conversation.messages?.length || 0; 
        
        // Scroll to top to show the conversation from the beginning
        setTimeout(() => {
          messageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); 
        }, 100); 
      } else {
        console.error(`Error loading conversation: ${response.status} ${response.statusText}`); 
        const errorData = await response.json().catch(() => ({})); 
        console.error('Error details:', errorData); 
        alert(`Failed to load conversation: ${errorData.error || response.statusText}`); 
      }
    } catch (error) {
      console.error('Error loading conversation:', error); 
      alert('Failed to load conversation: ' + error.message); 
    } finally {
      // Always clear the flag after loading
      isLoadingConversationRef.current = false; 
      setLoading(false); 
    }
  }; 

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation) return; 

    const userMessage = inputMessage; 
    setInputMessage(''); 
    
    // Add user message immediately to the UI
    setMessages(prev => [...prev, {
      role: 'user',
      message: userMessage,
      timestamp: new Date()
    }]); 
    
    setLoading(true); 

    try {
      const response = await fetch(`${API_BASE_URL}/tutor/conversations/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          message: userMessage
        })
      }); 

      if (response.ok) {
        const data = await response.json(); 
        setMessages(data.conversation.messages || []); 
      }
    } catch (error) {
      console.error('Error sending message:', error); 
      alert('Failed to send message'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const deleteConversation = async (conversationId) => {
    if (!window.confirm('Delete this conversation?')) return; 

    try {
      const response = await fetch(`${API_BASE_URL}/tutor/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      }); 

      if (response.ok) {
        if (activeConversation === conversationId) {
          setActiveConversation(null); 
          setMessages([]); 
        }
        loadConversations(); 
      }
    } catch (error) {
      console.error('Error deleting conversation:', error); 
    }
  }; 

  const startEditing = (e, conv) => {
    e.stopPropagation(); 
    setEditingId(conv.conversationId || conv._id); 
    setEditingSubject(conv.subject || ''); 
    setEditingTopic(conv.topic || ''); 
  }; 

  const saveEdit = async (e, conversationId) => {
    e.stopPropagation(); 
    
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subject: editingSubject,
          topic: editingTopic
        })
      }); 

      if (response.ok) {
        // Update the conversations list
        setConversations(prev => prev.map(conv => 
          (conv.conversationId || conv._id) === conversationId 
            ? { ...conv, subject: editingSubject, topic: editingTopic }
            : conv
        )); 
        
        // Update current display if this is the active conversation
        if (activeConversation === conversationId) {
          setCurrentSubject(editingSubject); 
          setCurrentTopic(editingTopic); 
        }
        
        setEditingId(null); 
      }
    } catch (error) {
      console.error('Error updating conversation:', error); 
      alert('Failed to update conversation name'); 
    }
  }; 

  const cancelEdit = (e) => {
    e.stopPropagation(); 
    setEditingId(null); 
  }; 

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
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
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-purple-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-blue-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header/Navbar - Below Main Navbar */}
      <div className="pt-[70px] md:pt-[75px] bg-slate-950/50 backdrop-blur-xl border-b border-purple-500/20 relative z-40 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-purple-400 hover:border hover:border-purple-500/30"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-500/20">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    AI Tutor
                  </h1>
                  <p className="text-xs text-slate-400">
                    {currentSubject ? `${currentSubject}${currentTopic && currentTopic !== 'General' ? ` • ${currentTopic}` : ''}` : 'Your personalized learning companion'}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                {messages.length} messages
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-80 bg-slate-900/30 border-r border-purple-500/20 flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-purple-500/20 flex-shrink-0">
            <button
              onClick={() => setShowNewConversation(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition font-semibold shadow-lg shadow-purple-500/30"
            >
              <Plus size={20} />
              New Chat
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const convId = conv.conversationId || conv._id; 
                const isEditing = editingId === convId; 
                
                return (
                  <div
                    key={convId}
                    className={`p-4 rounded-xl cursor-pointer transition-all transform group ${
                      activeConversation === convId
                        ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/30 border border-purple-500/60 shadow-lg shadow-purple-500/30 scale-[1.02] hover:scale-[1.03]'
                        : 'bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/40 hover:border-purple-500/30 hover:shadow-md hover:shadow-purple-500/10'
                    }`}
                    onClick={() => {
                      if (!isEditing) {
                        loadConversation(convId); 
                      }
                    }}
                  >
                    {isEditing ? (
                      // Edit Mode
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingSubject}
                          onChange={(e) => setEditingSubject(e.target.value)}
                          placeholder="Subject"
                          className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 outline-none text-sm font-bold"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editingTopic}
                          onChange={(e) => setEditingTopic(e.target.value)}
                          placeholder="Topic"
                          className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 outline-none text-sm"
                        />
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => saveEdit(e, convId)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                              {conv.topic}
                            </div>
                            <div className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 bg-purple-400/60 rounded-full"></span>
                              {conv.subject}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            <button
                              onClick={(e) => startEditing(e, conv)}
                              className="text-slate-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-all"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); 
                                deleteConversation(convId); 
                              }}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-700/30">
                          <div className="w-1 h-1 bg-purple-400/40 rounded-full"></div>
                          <span>Chat</span>
                        </div>
                      </>
                    )}
                  </div>
                ); 
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showNewConversation ? (
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Start New Chat</h2>
                <p className="text-slate-400 text-sm mb-6">Choose a subject to learn about</p>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Subject (e.g., Mathematics, Physics)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-700/30 text-white px-4 py-3 rounded-lg mb-3 border border-purple-500/30 focus:border-purple-500 outline-none transition placeholder-slate-400"
                />
                <input
                  type="text"
                  placeholder="Topic (e.g., Algebra)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-700/30 text-white px-4 py-3 rounded-lg mb-6 border border-purple-500/30 focus:border-purple-500 outline-none transition placeholder-slate-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewConversation(false); 
                      setError(''); 
                    }}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-3 rounded-lg transition font-semibold border border-slate-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startNewConversation}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Starting...
                      </>
                    ) : (
                      'Start Chat'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : activeConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex-shrink-1 min-h-0 relative">
                {loading ? (
                  // Show full-screen loading overlay while loading
                  <div className="flex items-center justify-center h-full absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 rounded-lg flex-col gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <Loader className="animate-spin text-purple-400" size={40} />
                      </div>
                      <p className="text-slate-200 font-semibold text-lg">Loading conversation...</p>
                      <p className="text-slate-400 text-sm mt-3">Please wait while we fetch your chat history</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Brain size={48} className="text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400">Start asking your questions...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              msg.role === 'user' ? 'justify-end' : 'justify-start'
                            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                          >
                            <div
                              className={`max-w-2xl px-5 py-3.5 rounded-xl transition-all duration-200 ${
                                msg.role === 'user'
                                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60'
                                  : 'bg-gradient-to-br from-slate-800/80 to-slate-900/50 border border-purple-500/25 text-slate-50 rounded-bl-none backdrop-blur-md hover:border-purple-500/40 hover:bg-slate-800/90'
                              }`}
                            >
                              {msg.role === 'assistant' ? (
                                <div className="text-sm prose prose-invert max-w-none prose-p:m-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1.5">
                                  <MarkdownContent content={msg.message} />
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Show "AI is thinking" when waiting for AI response after conversation is loaded */}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800/50 border border-purple-500/20 px-4 py-3 rounded-lg rounded-bl-none backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <Loader className="animate-spin text-purple-400" size={18} />
                                <span className="text-sm text-slate-200">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-purple-500/20 bg-gradient-to-t from-slate-950 to-slate-950/70 backdrop-blur-xl p-4 md:p-6 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="Ask your question..."
                    className="flex-1 bg-gradient-to-r from-slate-800/40 to-slate-800/20 text-white px-4 py-3.5 rounded-xl border border-purple-500/30 focus:border-purple-500/60 outline-none transition placeholder-slate-500 hover:border-purple-500/40 focus:bg-slate-800/50 shadow-lg shadow-purple-500/10"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !inputMessage.trim()}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white p-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 flex-shrink-0 hover:scale-105 active:scale-95 transform"
                  >
                    <Send size={20} className={loading ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center relative">
              <div className="text-center z-10">
                <Brain size={64} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-200 text-lg mb-2 font-semibold">Welcome to AI Tutor</p>
                <p className="text-slate-400 text-sm mb-6">Select a conversation or create a new one</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition font-semibold shadow-lg shadow-purple-500/30"
                >
                  Start Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ); 
}; 

export default AITutor; 