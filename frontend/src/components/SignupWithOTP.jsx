import React, { useState, useEffect } from 'react'; 
import { GoogleLogin } from '@react-oauth/google'; 
import api from '../services/api'; 
import GooglePasswordSetup from './GooglePasswordSetup'; 

const SignupWithOTP = ({ onNavigate }) => {
  const [step, setStep] = useState(1);  // Step 1: Signup form, Step 2: OTP verification
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [resendTimer, setResendTimer] = useState(0); 
  const [showPasswordSetup, setShowPasswordSetup] = useState(false); 
  const [googleUser, setGoogleUser] = useState(null); 

  // Step 1: Signup Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }); 

  // Step 2: OTP
  const [otp, setOtp] = useState(''); 
  const [email, setEmail] = useState(''); 

  // Google Sign-In Handler
  const handleGoogleSignIn = async (credentialResponse) => {
    setLoading(true); 
    try {
      if (!credentialResponse.credential) {
        setError('Failed to get Google credential'); 
        setLoading(false); 
        return; 
      }

      // Send the ID token (JWT) to backend for verification
      const response = await api.googleSignIn(credentialResponse.credential); 

      if (response.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.token); 
        localStorage.setItem('user', JSON.stringify(response.user)); 

        if (response.needsPasswordSetup) {
          // Show password setup modal for new Google users
          setGoogleUser(response.user); 
          setShowPasswordSetup(true); 
        } else {
          // Existing user, direct login
          setMessage('✅ Sign-in successful! Redirecting...'); 
          setTimeout(() => {
            if (onNavigate) {
              onNavigate('dashboard'); 
            } else {
              window.location.href = '/dashboard'; 
            }
            window.location.reload(); 
          }, 1000); 
        }
      } else {
        setError(response.message || 'Google sign-in failed'); 
      }
    } catch (err) {
      console.error('Google sign-in error:', err); 
      setError(err.message || 'Google sign-in failed'); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Check for session invalidated message on mount
  useEffect(() => {
    const sessionMessage = localStorage.getItem('sessionInvalidatedMessage'); 
    if (sessionMessage) {
      setError(sessionMessage); 
      localStorage.removeItem('sessionInvalidatedMessage'); 
    }
  }, []); 

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target; 
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    })); 
    setError(''); 
  }; 

  // Handle OTP input (only allow numbers, max 6 digits)
  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); 
    setOtp(value); 
    setError(''); 
  }; 

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setMessage(''); 

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required'); 
      return; 
    }
    if (!formData.email.trim()) {
      setError('Email is required'); 
      return; 
    }
    if (!formData.password) {
      setError('Password is required'); 
      return; 
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); 
      return; 
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); 
      return; 
    }

    setLoading(true); 
    try {
      const response = await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }); 

      if (response.data.success) {
        setEmail(formData.email); 
        setStep(2); 
        setMessage('OTP sent to your email. Please check your inbox.'); 
        startResendTimer(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP'); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setMessage(''); 

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP'); 
      return; 
    }

    setLoading(true); 
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
      }); 

      if (response.data.success) {
        // Store token and user data in localStorage with correct keys
        localStorage.setItem('token', response.data.token); 
        localStorage.setItem('authToken', response.data.token); 
        localStorage.setItem('user', JSON.stringify(response.data.user)); 

        setMessage('✅ Registration successful! Redirecting...'); 
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('dashboard'); 
          } else {
            window.location.href = '/dashboard'; 
          }
          // Refresh page to ensure context is updated
          window.location.reload(); 
        }, 1000); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed'); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Resend OTP
  const handleResendOTP = async () => {
    setError(''); 
    setMessage(''); 
    setLoading(true); 

    try {
      const response = await api.post('/auth/resend-otp', {
        email,
      }); 

      if (response.data.success) {
        setMessage('OTP resent successfully. Please check your email.'); 
        setOtp(''); 
        startResendTimer(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP'); 
    } finally {
      setLoading(false); 
    }
  }; 

  // Start resend timer (60 seconds)
  const startResendTimer = () => {
    setResendTimer(60); 
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval); 
          return 0; 
        }
        return prev - 1; 
      }); 
    }, 1000); 
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step 1: Signup Form */}
        {step === 1 ? (
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-purple-500/30">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Self Ranker</h1>
              <p className="text-gray-400">Create your account to get started</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">OR</span>
              </div>
            </div>

            {/* Google Sign-Up Button */}
            <div className="w-full mb-4 flex justify-center">
              <GoogleLogin 
                onSuccess={handleGoogleSignIn}
                onError={() => setError('Failed to authenticate with Google. Please try again.')}
                text="signup_with"
                size="large"
              />
            </div>

            <div className="text-center mt-4 text-gray-400 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-purple-400 hover:text-purple-300">
                Login
              </a>
            </div>
          </div>
        ) : (
          /* Step 2: OTP Verification */
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-purple-500/30">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-gray-400">
                Enter the 6-digit code sent to <br />
                <span className="text-purple-400 font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOTPChange}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-2">
                  ⏱️ Code expires in 10 minutes
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">{message}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              {/* Resend OTP */}
              <div className="text-center mt-4">
                {resendTimer > 0 ? (
                  <p className="text-gray-400 text-sm">
                    Resend code in <span className="text-purple-400 font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-purple-400 hover:text-purple-300 text-sm font-semibold disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </form>

            {/* Back Button */}
            <button
              onClick={() => {
                setStep(1); 
                setOtp(''); 
                setError(''); 
                setMessage(''); 
              }}
              className="w-full mt-4 text-gray-400 hover:text-gray-300 text-sm font-medium"
            >
              ← Back to Signup
            </button>
          </div>
        )}
      </div>

      {/* Google Password Setup Modal */}
      {showPasswordSetup && googleUser && (
        <GooglePasswordSetup
          user={googleUser}
          onClose={() => {
            setShowPasswordSetup(false); 
            // Navigate to dashboard after password setup
            if (onNavigate) {
              onNavigate('dashboard'); 
            } else {
              window.location.href = '/dashboard'; 
            }
            window.location.reload(); 
          }}
          onSuccess={() => {
            setMessage('✅ Password set successfully! Redirecting...'); 
          }}
        />
      )}
    </div>
  ); 
}; 

export default SignupWithOTP; 