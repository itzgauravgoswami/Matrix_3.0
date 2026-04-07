import React, { useState } from 'react'; 
import { X, Eye, EyeOff } from 'lucide-react'; 
import api from '../services/api'; 

const GooglePasswordSetup = ({ user, onClose, onSuccess }) => {
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 

  const handleSetPassword = async (e) => {
    e.preventDefault(); 
    setError(''); 

    // Validation
    if (!password.trim()) {
      setError('Password is required'); 
      return; 
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters'); 
      return; 
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password'); 
      return; 
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match'); 
      return; 
    }

    setLoading(true); 
    try {
      const response = await api.setPassword(password, confirmPassword); 

      if (response.success) {
        // Store the new token and user data if account was created
        if (response.token && response.user) {
          localStorage.setItem('authToken', response.token); 
          localStorage.setItem('user', JSON.stringify(response.user)); 
        }
        
        // Show success message and close modal
        onSuccess?.(); 
        setTimeout(() => {
          onClose(); 
          // Redirect to dashboard if account was just created
          if (response.token) {
            window.location.href = '/dashboard'; 
          }
        }, 1500); 
      } else {
        setError(response.message || 'Failed to set password'); 
      }
    } catch (err) {
      setError(err.message || 'An error occurred'); 
    } finally {
      setLoading(false); 
    }
  }; 

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Set Your Password</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-purple-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Message */}
        <p className="text-slate-300 mb-6 text-sm">
          Welcome, <span className="font-semibold text-purple-400">{user?.name}</span>! 
          To complete your account setup, please create a password to secure your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSetPassword} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 mt-6"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-slate-500 text-xs mt-4 text-center">
          🔒 Your password will be securely encrypted and stored. Never share your password with anyone.
        </p>
      </div>
    </div>
  ); 
}; 

export default GooglePasswordSetup; 