import React, { useState } from 'react'; 
import { X } from 'lucide-react'; 

const DeleteAccountModal = ({ onConfirm, onCancel, subscription }) => {
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [agreedToWarning, setAgreedToWarning] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 

    if (!password) {
      setError('Please enter your password'); 
      return; 
    }

    if (!agreedToWarning) {
      setError('Please confirm that you understand the consequences'); 
      return; 
    }

    setLoading(true); 

    try {
      await onConfirm?.(password); 
      // If we reach here, deletion was successful (parent will handle navigation)
    } catch (err) {
      // console.error('Error in handleSubmit:', err); 
      // Show the error but keep the modal open so user can try again
      setError(err.message || 'Failed to delete account. Please try again.'); 
      setLoading(false); 
      // Keep the password field filled so user doesn't have to re-enter it
    }
  }; 

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50" style={{ fontFamily: "'Lato', sans-serif" }}>
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

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-red-700/50 rounded-xl shadow-2xl max-w-sm w-full p-4 relative backdrop-blur-sm overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3 right-3 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="relative z-10 pr-8 mb-4">
          <h2 className="text-lg font-bold text-red-400 mb-1">Delete Account</h2>
          <p className="text-xs text-slate-300">This action cannot be undone.</p>
        </div>

        {/* Warnings */}
        <div className="space-y-2 mb-4 relative z-10">
          {/* Subscription Warning */}
          {subscription?.isPremium && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-2 hover:bg-red-900/30 transition-all duration-300">
              <p className="text-red-300 text-xs leading-relaxed">
                <strong>⚠️ Active Subscription:</strong> Your {subscription.subscriptionPlan} plan will be cancelled.
              </p>
            </div>
          )}

          {/* General Warning */}
          <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-2 hover:bg-red-900/30 transition-all duration-300">
            <p className="text-red-300 text-xs leading-relaxed">
              <strong>⚠️ All data deleted:</strong> Quizzes, notes, and personal information will be permanently removed.
            </p>
          </div>

          {/* Account Recovery Warning */}
          <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-2 hover:bg-red-900/30 transition-all duration-300">
            <p className="text-red-300 text-xs leading-relaxed">
              <strong>⚠️ No recovery:</strong> You cannot recover your account once deleted.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3 relative z-10">
          {/* Password Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 hover:border-slate-500 focus:border-red-500 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500/20 disabled:opacity-50 transition-all duration-300"
            />
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToWarning}
              onChange={(e) => setAgreedToWarning(e.target.checked)}
              disabled={loading}
              className="mt-0.5 w-4 h-4 accent-red-600 disabled:opacity-50 cursor-pointer flex-shrink-0"
            />
            <span className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed">
              I understand this will permanently remove all my data and subscriptions. This action cannot be undone.
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2 animate-in fade-in">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-all duration-300 disabled:opacity-50 font-medium transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !agreedToWarning || !password}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-xs text-slate-400 text-center mt-3 relative z-10 leading-relaxed">
          Contact support for help before deleting your account.
        </p>
      </div>

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
  ); 
}; 

export default DeleteAccountModal; 