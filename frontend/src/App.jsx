"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useAuth } from "./context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"
import { useRef } from "react"
import { sendOTP, verifyOTP, resendOTP, googleSignIn } from "./services/api"
import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import HowItWorks from "./components/HowItWorks"
import FeaturesSection from "./components/FeaturesSection"
import PricingSection from "./components/PricingSection"
import TestimonialsSection from "./components/TestimonialsSection"
import FAQSection from "./components/FAQSection"
import Footer from "./components/Footer"
import QuizGenerator from "./components/QuizGenerator"
import QuizInterface from "./components/QuizInterface"
import QATestInterface from "./components/QATestInterface"
import Dashboard from "./components/Dashboard"
import AccountSettings from "./components/AccountSettings"
import NotesInterface from "./components/NotesInterface"
import SupremeLearning from "./components/SupremeLearning"
import SignupWithOTP from "./components/SignupWithOTP"
import GooglePasswordSetup from "./components/GooglePasswordSetup"
import AdminLogin from "./components/AdminLogin"
import AdminDashboard from "./components/AdminDashboard"
import DeviceConfirmationModal from "./components/DeviceConfirmationModal"
import DeviceLogoutPopup from "./components/DeviceLogoutPopup"
import AITutor from "./components/AITutor"
import GamificationDashboard from "./components/GamificationDashboard"
import AnalyticsDashboard from "./components/AnalyticsDashboard"
import LearningPathComponent from "./components/LearningPathComponent"
import GoogleSignInButton from "./components/GoogleSignInButton"

const SectionSeparator = () => (
  <div className="relative py-8 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
    <div className="relative max-w-6xl mx-auto px-4">
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500/60 rounded-full blur-sm"></div>
    </div>
  </div>
)

export default function App() {
  const { isAuthenticated, user, logout, login, signup, deviceMismatchData, confirmDeviceLogin, deviceLogoutData, handleDeviceLogout, dismissDeviceLogout } = useAuth()
  
  // Initialize currentPage from URL hash if available
  const getInitialPage = () => {
    try {
      // Get page from URL hash (e.g., #dashboard, #ai-tutor, #quiz)
      const hash = window.location.hash.slice(1) // Remove the '#'
      if (hash && hash !== 'login' && hash !== 'signup' && hash !== 'admin-login') {
        return hash
      }
    } catch (e) {
      console.error('Error reading from URL:', e)
    }
    return "home"
  }
  
  const [currentPage, setCurrentPage] = useState(getInitialPage())
  const [pageRestored, setPageRestored] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [authModal, setAuthModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpStep, setOtpStep] = useState(null) // null, "sent", "verify"
  const [otpEmail, setOtpEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpFormData, setOtpFormData] = useState({ name: "", email: "", password: "", confirm: "" })
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'))
  const [adminLoginEmail, setAdminLoginEmail] = useState("")
  const [adminLoginPassword, setAdminLoginPassword] = useState("")
  const [deviceConfirmationLoading, setDeviceConfirmationLoading] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [googleUser, setGoogleUser] = useState(null)
  
  // Navigation history management
  const navigationHistoryRef = useRef([])
  const isNavigatingBackRef = useRef(false)

  // Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true)
    try {
      const jwtToken = credentialResponse.credential

      // Now send to backend with the JWT token for verification
      const response = await googleSignIn(jwtToken)

      if (response.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        if (response.needsPasswordSetup) {
          // Show password setup modal for new Google users
          setGoogleUser(response.user)
          setShowPasswordSetup(true)
          setAuthModal(null)
        } else {
          // Existing user, direct login
          setError("")
          setAuthModal(null)
          window.location.reload()
        }
      } else {
        setError(response.message || 'Google sign-in failed')
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  // Mark that page has been restored on mount
  useEffect(() => {
    setPageRestored(true)
  }, [])

  // Handle hash changes (back button, direct URL navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = window.location.hash.slice(1) || "home"
      if (newPage && newPage !== currentPage && newPage !== "login" && newPage !== "signup" && newPage !== "admin-login") {
        setCurrentPage(newPage)
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [currentPage])

  // Watch for authentication changes and redirect ONLY if on home page and after page is restored
  useEffect(() => {
    if (isAuthenticated && currentPage === "home" && pageRestored) {
      setCurrentPage("dashboard")
      window.location.hash = "dashboard"
      setAuthModal(null)
    }
  }, [isAuthenticated, pageRestored])

  // Redirect to home ONLY if trying to access protected pages without authentication
  useEffect(() => {
    const protectedPages = ["qa-test", "dashboard", "account-settings", "notes", "supreme-learning", "tutor", "gamification", "analytics", "learning-path"]
    if (protectedPages.includes(currentPage) && !isAuthenticated && pageRestored) {
      // Only redirect if not authenticated AND page has been restored
      setCurrentPage("home")
      window.location.hash = "home"
    }
  }, [isAuthenticated, currentPage, pageRestored])

  // Initialize admin session on page load
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setAdminToken(token)
    }
  }, [])

  // Restore admin session when admin token changes
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token && !adminToken) {
      setAdminToken(token)
    }
  }, [adminToken])

  const handleNavigate = (page) => {
    // Handle section navigation (when on home page)
    const sectionPages = ["home", "howitworks", "features", "testimonials", "pricing", "faq"]
    
    if (sectionPages.includes(page)) {
      // If not on home page, navigate to home first
      if (currentPage !== "home" && page !== "home") {
        setCurrentPage("home")
        window.location.hash = "home"
        // Don't push to history yet, wait for scroll
      }
      
      // Close auth modal if open
      setAuthModal(null)
      
      // Use setTimeout to allow state to update before scrolling
      setTimeout(() => {
        const element = document.getElementById(page)
        if (element) {
          // Smooth scroll to the section
          element.scrollIntoView({ behavior: "smooth", block: "start" })
          // Update URL hash for the section
          window.location.hash = page
        }
      }, 50)
    } else if (page === "login" || page === "signup") {
      // Auth pages - just show modal
      setError("")
      setAuthModal(page)
      // Don't change current page for auth modals
    } else {
      // Full page navigation (dashboard, admin, etc.)
      setAuthModal(null)
      setCurrentPage(page)
      // Update URL hash with the new page
      window.location.hash = page
      // Prevent default scroll to top - let component handle it
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleLogout = () => {
    logout()
    setCurrentPage("home")
    window.location.hash = "home"
    navigationHistoryRef.current = ["home"]
    // Scroll to top when logging out
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz)
    setCurrentPage("quiz")
    window.location.hash = "quiz"
    navigationHistoryRef.current.push("quiz")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

  const API_URL = "http://localhost:5000/api/admin/login"; 
    try {
      if (authModal === "admin-login") {
        // Admin login
        if (!adminLoginEmail || !adminLoginPassword) {
          setError("Please enter email and password")
          setLoading(false)
          return
        }

        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: adminLoginEmail, password: adminLoginPassword }),
          })

          const data = await response.json()

          if (response.ok && data.token) {
            localStorage.setItem('adminToken', data.token)
            setAdminToken(data.token)
            setAuthModal(null)
            setAdminLoginEmail("")
            setAdminLoginPassword("")
            setError("")
            setCurrentPage("admin")
          } else {
            setError(data.message || "Admin login failed")
          }
        } catch (err) {
          setError("Failed to connect to server")
          // console.error(err)
        }
      } else if (authModal === "login") {
        const formData = new FormData(e.target)
        const email = formData.get("email")
        const password = formData.get("password")

        // Validate login inputs
        if (!email || !password) {
          setError("Please enter email and password")
          setLoading(false)
          return
        }

        // Use AuthContext login method
        const result = await login(email, password)
        // console.log('Login result:', result); 
        
        if (result.code === 'DEVICE_MISMATCH' && result.requiresConfirmation) {
          // console.log('Device mismatch detected - waiting for user confirmation'); 
          // Device mismatch - modal will be shown by DeviceConfirmationModal
          // Don't set error, just wait for user to make a choice
          setLoading(false); 
        } else if (!result.success) {
          setError(result.error || "Login failed")
          setLoading(false); 
        } else {
          // Successfully logged in
          setLoading(false); 
        }
        // The useEffect will handle redirect to dashboard
      } else if (authModal === "signup") {
        // Step 2: Verify OTP - only needs OTP code
        if (otpStep === "sent") {
          if (!otpCode || otpCode.length !== 6) {
            setError("Please enter a 6-digit OTP")
            setLoading(false)
            return
          }

          const result = await verifyOTP(otpEmail, otpCode)
          
          if (result.success) {
            // Store token and redirect
            localStorage.setItem('token', result.token)
            localStorage.setItem('authToken', result.token)
            localStorage.setItem('user', JSON.stringify(result.user))
            setAuthModal(null)
            setOtpStep(null)
            setOtpCode("")
            // Trigger re-render of auth context
            window.location.reload()
          } else {
            setError(result.message || "OTP verification failed")
          }
        }
        // Step 1: Send OTP
        else if (otpStep === null) {
          const formData = new FormData(e.target)
          const email = formData.get("email")
          const password = formData.get("password")
          const name = formData.get("name")
          const confirmPassword = formData.get("confirm")

          // Validate signup inputs
          if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields")
            setLoading(false)
            return
          }

          if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
          }

          if (password.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
          }

          const result = await sendOTP(name, email, password)
          
          if (result.success) {
            setOtpStep("sent")
            setOtpEmail(email)
            setOtpFormData({ name, email, password, confirm: confirmPassword })
            setError("")
          } else {
            setError(result.message || "Failed to send OTP")
          }
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      // console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await resendOTP(otpEmail)
    
    if (result.success) {
      setError("")
      setOtpCode("")
      // Could add a timer here
    } else {
      setError(result.message || "Failed to resend OTP")
    }
    
    setLoading(false)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <HowItWorks />
            <SectionSeparator />
            <FeaturesSection />
            <SectionSeparator />
            <TestimonialsSection />
            <SectionSeparator />
            <PricingSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <FAQSection />
          </>
        )
      case "signup-otp":
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <SignupWithOTP onNavigate={handleNavigate} />
          </div>
        )
      case "quiz-generator":
        return <QuizGenerator onNavigate={handleNavigate} onStartQuiz={handleStartQuiz} />
      case "quiz":
        return <QuizInterface quiz={activeQuiz} onNavigate={handleNavigate} />
      case "qa-test":
        return (
          <QATestInterface onNavigate={handleNavigate} />
        )
      case "dashboard":
        return (
          <Dashboard onNavigate={handleNavigate} userName={user?.name} userEmail={user?.email} />
        )
      case "account-settings":
        return (
          <AccountSettings onNavigate={handleNavigate} />
        )
      case "notes":
        return (
          <NotesInterface onNavigate={handleNavigate} />
        )
      case "supreme-learning":
        return (
          <SupremeLearning onNavigate={handleNavigate} userName={user?.name} />
        )
      case "admin-login":
        return <AdminLogin onLoginSuccess={(token) => {
          localStorage.setItem('adminToken', token)
          setAdminToken(token)
          setCurrentPage("admin")
        }} />
      case "admin":
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem('adminToken')
        const activeAdminToken = adminToken || storedToken
        
        return activeAdminToken ? (
          <AdminDashboard 
            adminToken={activeAdminToken}
            onLogout={() => {
              localStorage.removeItem('adminToken')
              setAdminToken(null)
              setCurrentPage("home")
            }} 
          />
        ) : (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <HowItWorks />
            <SectionSeparator />
            <FeaturesSection />
            <SectionSeparator />
            <TestimonialsSection />
            <SectionSeparator />
            <PricingSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <FAQSection />
          </>
        )
      case "tutor":
        return (
          <AITutor onNavigate={handleNavigate} />
        )
      case "gamification":
        return (
          <GamificationDashboard onNavigate={handleNavigate} />
        )
      case "analytics":
        return (
          <AnalyticsDashboard onNavigate={handleNavigate} />
        )
      case "learning-path":
        return (
          <LearningPathComponent onNavigate={handleNavigate} />
        )
      default:
        // Fallback to home page if unknown page
        return (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <HowItWorks />
            <SectionSeparator />
            <FeaturesSection />
            <SectionSeparator />
            <TestimonialsSection />
            <SectionSeparator />
            <PricingSection onNavigate={handleNavigate} />
            <SectionSeparator />
            <FAQSection />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar onNavigate={handleNavigate} isLoggedIn={isAuthenticated} onLogout={handleLogout} isAdminLoggedIn={!!adminToken} />
      {renderPage()}
      <Footer />

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl shadow-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {authModal === "login" ? "Sign In" : authModal === "admin-login" ? "🔐 Admin Login" : "Create Account"}
              </h2>
              <button
                onClick={() => {
                  setAuthModal(null)
                  setError("")
                  setOtpStep(null)
                  setOtpCode("")
                  setOtpEmail("")
                  setAdminLoginEmail("")
                  setAdminLoginPassword("")
                }}
                className="text-slate-400 hover:text-purple-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authModal === "signup" && otpStep === null && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm Password"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                </>
              )}

              {authModal === "signup" && otpStep === "sent" && (
                <>
                  <p className="text-slate-300 text-sm">
                    Enter the 6-digit code sent to <span className="text-purple-400 font-semibold">{otpEmail}</span>
                  </p>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold tracking-widest placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                </>
              )}

              {authModal === "login" && (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                </>
              )}

              {authModal === "admin-login" && (
                <>
                  <input
                    type="email"
                    placeholder="Admin Email"
                    value={adminLoginEmail}
                    onChange={(e) => setAdminLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
                  />
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={adminLoginPassword}
                    onChange={(e) => setAdminLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={loading || (authModal === "signup" && otpStep === "sent" && (!otpCode || otpCode.length !== 6))}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : authModal === "login" ? "Sign In" : authModal === "admin-login" ? "Login as Admin" : otpStep === "sent" ? "Verify OTP" : "Send OTP"}
              </button>

              {/* Google Sign-In Button - only for login and signup */}
              {(authModal === "login" || (authModal === "signup" && otpStep === null)) && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-slate-400">OR</span>
                    </div>
                  </div>

                  <GoogleSignInButton
                    onSuccess={handleGoogleLogin}
                    onError={() => setError('Failed to authenticate with Google. Please try again.')}
                    isSignup={authModal === "signup"}
                    loading={loading}
                  />
                </>
              )}
            </form>

            {authModal === "signup" && otpStep === "sent" && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold disabled:opacity-50"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            )}

            {authModal === "signup" && otpStep === "sent" && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setOtpStep(null)
                    setOtpCode("")
                    setError("")
                  }}
                  className="w-full text-slate-400 hover:text-slate-300 text-sm font-semibold py-2"
                >
                  ← Back to signup
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-purple-500/20">
              {authModal === "admin-login" ? (
                <p className="text-slate-400 text-sm text-center">
                  User Login? 
                  <button
                    onClick={() => {
                      setAuthModal("login")
                      setError("")
                      setAdminLoginEmail("")
                      setAdminLoginPassword("")
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors ml-1"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm text-center">
                    {authModal === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setAuthModal(authModal === "login" ? "signup" : "login")
                        setError("")
                        setOtpStep(null)
                        setOtpCode("")
                        setOtpEmail("")
                      }}
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      disabled={loading}
                    >
                      {authModal === "login" ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                  
                  {authModal === "login" && (
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-slate-400 text-sm text-center">
                        Admin Access? 
                        <button
                          onClick={() => {
                            setAuthModal("admin-login")
                            setError("")
                            setAdminLoginEmail("")
                            setAdminLoginPassword("")
                          }}
                          className="text-red-400 hover:text-red-300 font-semibold transition-colors ml-1"
                          disabled={loading}
                        >
                          🔐 Login as Admin
                        </button>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Password Setup Modal */}
      {showPasswordSetup && googleUser && (
        <GooglePasswordSetup
          user={googleUser}
          onClose={() => {
            setShowPasswordSetup(false)
            setGoogleUser(null)
          }}
          onSuccess={() => {
            setTimeout(() => {
              setShowPasswordSetup(false)
              setGoogleUser(null)
              window.location.reload()
            }, 1000)
          }}
        />
      )}

      {/* Device Confirmation Modal */}
      <DeviceConfirmationModal 
        isOpen={!!deviceMismatchData}
        currentDevice={deviceMismatchData?.currentDevice}
        previousDevice={deviceMismatchData?.previousDevice}
        isLoading={deviceConfirmationLoading}
        onConfirm={async (forceLogin) => {
          setDeviceConfirmationLoading(true)
          try {
            const result = await confirmDeviceLogin(forceLogin)
            if (result.success) {
              // Close modal and auth modal on successful login
              setAuthModal(null)
              setError("")
            } else {
              setError(result.error || "Login failed")
            }
          } finally {
            setDeviceConfirmationLoading(false)
          }
        }}
        onCancel={() => {
          // Cancel device login and close modal
          confirmDeviceLogin(false)
          setError("Login cancelled. Please try again.")
        }}
      />

      {/* Device Logout Popup - Shows on old device when new device logs in */}
      <DeviceLogoutPopup
        isOpen={!!deviceLogoutData}
        currentDevice={deviceLogoutData?.currentDevice}
        newDevice={deviceLogoutData?.newDevice}
        onLogout={() => {
          handleDeviceLogout()
          setCurrentPage("home")
        }}
        onCancel={() => {
          dismissDeviceLogout()
        }}
      />
    </div>
  )
}