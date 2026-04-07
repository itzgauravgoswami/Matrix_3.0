import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../context/AuthContext'; 
import * as api from '../services/api'; 
import DeleteAccountModal from './DeleteAccountModal'; 

const AccountSettings = ({ onNavigate }) => {
  const { user, logout } = useAuth(); 
  const [subscription, setSubscription] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true); 
        const response = await api.getUserProfile(); 
        if (response.success) {
          setSubscription(response.user); 
        }
      } catch (error) {
        // console.error('Error fetching subscription:', error); 
      } finally {
        setLoading(false); 
      }
    }; 

    if (user) {
      fetchSubscription(); 
    }
  }, [user]); 

  const handleDeleteAccount = async (password) => {
    try {
      const response = await api.deleteAccount(password); 
      
      // Check if response has error (wrong password, etc.)
      if (response.success === false || !response.success) {
        throw new Error(response.message || 'Failed to delete account. Invalid password or server error.'); 
      }
      
      // Only proceed with logout if deletion was actually successful
      if (response.success) {
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('user'); 
        logout(); 
        alert('Account deleted successfully. Redirecting to home page...'); 
        onNavigate('home'); 
      }
    } catch (error) {
      // console.error('Delete account error:', error); 
      throw new Error(error.message || 'Failed to delete account. Please try again.'); 
    }
  }; 

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 pt-24 relative overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
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
          <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="text-center relative z-10">
          <p className="text-slate-300 mb-4 text-sm md:text-base">Please log in to access account settings</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 pt-24 relative overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
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
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your account and subscription</p>
        </div>

        {/* Account Information Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg hover:border-purple-500/30 transition-all duration-300">
                <p className="text-white">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg hover:border-purple-500/30 transition-all duration-300">
                <p className="text-white">{user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Information Card */}
        {loading ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <p className="text-slate-400">Loading subscription information...</p>
          </div>
        ) : subscription ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-4">Subscription Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Plan</label>
                <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg flex items-center justify-between hover:border-purple-500/30 transition-all duration-300">
                  <p className="text-white capitalize">{subscription.subscriptionPlan || 'Free'}</p>
                  {subscription.isPremium && (
                    <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-medium">
                      Active Premium
                    </span>
                  )}
                </div>
              </div>

              {subscription.subscriptionEndDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valid Until</label>
                  <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg hover:border-purple-500/30 transition-all duration-300">
                    <p className="text-white">
                      {new Date(subscription.subscriptionEndDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {subscription.subscriptionStartDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Started</label>
                  <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg hover:border-purple-500/30 transition-all duration-300">
                    <p className="text-white">
                      {new Date(subscription.subscriptionStartDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Danger Zone - Delete Account */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-slate-300 mb-4 text-sm">
            Deleting your account is a permanent action. All your data and subscriptions will be permanently removed.
          </p>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Delete Account
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          subscription={subscription}
        />
      )}
    </div>
  ); 
}; 

export default AccountSettings; 