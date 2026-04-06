import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [branch, setBranch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isSignUp) {
        response = await authAPI.register({
          name,
          email,
          password,
          college,
          branch
        })
      } else {
        response = await authAPI.login({
          email,
          password
        })
      }

      // Save token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Clear form
      setEmail('')
      setPassword('')
      setName('')
      setCollege('')
      setBranch('')

      onClose()
      navigate('/dashboard')
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-all"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isSignUp
              ? 'Join thousands of learners'
              : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Enter your college name"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Remember Me / Forgot Password */}
          {!isSignUp && (
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 accent-orange-500" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-orange-600 hover:text-orange-700 font-semibold">
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-xs">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmail('')
                setPassword('')
                setName('')
                setCollege('')
                setBranch('')
                setError('')
              }}
              className="text-orange-600 hover:text-orange-700 font-bold transition-all"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Social Login */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-600 mb-3">Or continue with</p>
          <div className="flex gap-3">
            <button type="button" className="flex-1 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-1 text-xs">
              <i className="fab fa-google text-lg text-orange-600"></i>
              <span className="font-semibold text-gray-700 hidden sm:inline">Google</span>
            </button>
            <button type="button" className="flex-1 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-1 text-xs">
              <i className="fab fa-github text-lg text-gray-700"></i>
              <span className="font-semibold text-gray-700 hidden sm:inline">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
