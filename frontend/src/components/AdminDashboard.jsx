import { useState, useEffect } from "react"
import { X, Edit2, Trash2, Plus, Search, LogOut } from "lucide-react"
import AdminCouponManagement from './AdminCouponManagement'

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

export default function AdminDashboard({ adminToken, onLogout }) {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [planModal, setPlanModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [planFormData, setPlanFormData] = useState({ planType: 'pro', duration: 30 })
  const [actionLoading, setActionLoading] = useState(false)
  const [couponModal, setCouponModal] = useState(false)
  
  // New features state
  const [notificationModal, setNotificationModal] = useState(false)
  const [bulkPlanModal, setBulkPlanModal] = useState(false)
  const [cancelSubscriptionModal, setCancelSubscriptionModal] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [quizCreditsModal, setQuizCreditsModal] = useState(false)
  const [quizCreditsData, setQuizCreditsData] = useState({
    selectedUserId: null,
    creditsToGrant: ''
  })
  const [notificationData, setNotificationData] = useState({ 
    mode: 'all', // 'all' or 'specific'
    subject: '', 
    message: '',
    selectedUserId: null 
  })
  const [bulkPlanData, setBulkPlanData] = useState({
    mode: 'all', // 'all' or 'specific'
    planType: 'pro',
    duration: 30,
    userType: 'free', // 'free', 'pro', 'ultimate'
    selectedUserId: null
  })
  const [cancelData, setCancelData] = useState({
    mode: 'all', // 'all', 'planType', or 'specific'
    planType: 'pro', // 'pro' or 'ultimate'
    selectedUserId: null
  })
  const [blockData, setBlockData] = useState({
    selectedUserId: null,
    reason: 'Violation of terms and conditions',
    duration: '7d' // '1d', '7d', '30d', '90d', 'permanent'
  })
  const [previewModal, setPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [resetPasswordModal, setResetPasswordModal] = useState(false)
  const [resetPasswordData, setResetPasswordData] = useState({
    selectedUserId: null,
    newPassword: '',
    confirmPassword: ''
  })

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'verified', 'unverified'
    plan: 'all', // 'all', 'free', 'pro', 'ultimate'
    accountStatus: 'all', // 'all', 'active', 'reactivated', 'blocked', 'deleted'
    subscriptionStatus: 'all', // 'all', 'active', 'expired', 'none'
  })

  // Fetch all data on mount
  useEffect(() => {
    if (!adminToken) {
      onLogout()
      return
    }
    fetchAllData()
  }, [adminToken])

  // Search and filter users
  useEffect(() => {
    let filtered = users

    // Apply search
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status === 'verified') {
      filtered = filtered.filter((user) => user.isEmailVerified === true)
    } else if (filters.status === 'unverified') {
      filtered = filtered.filter((user) => user.isEmailVerified === false)
    }

    // Apply plan filter
    if (filters.plan !== 'all') {
      filtered = filtered.filter((user) => user.subscriptionPlan === filters.plan)
    }

    // Apply account status filter
    if (filters.accountStatus === 'active') {
      filtered = filtered.filter((user) => user.isDeleted === false && !user.wasDeleted && !user.isBlocked)
    } else if (filters.accountStatus === 'reactivated') {
      filtered = filtered.filter((user) => user.isDeleted === false && user.wasDeleted && !user.isBlocked)
    } else if (filters.accountStatus === 'blocked') {
      filtered = filtered.filter((user) => user.isBlocked === true)
    } else if (filters.accountStatus === 'deleted') {
      filtered = filtered.filter((user) => user.isDeleted === true)
    }

    // Apply subscription status filter
    if (filters.subscriptionStatus !== 'all') {
      const now = new Date()
      if (filters.subscriptionStatus === 'active') {
        filtered = filtered.filter((user) => 
          user.isPremium && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now
        )
      } else if (filters.subscriptionStatus === 'expired') {
        filtered = filtered.filter((user) => 
          user.isPremium && user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now
        )
      } else if (filters.subscriptionStatus === 'none') {
        filtered = filtered.filter((user) => !user.isPremium)
      }
    }

    setFilteredUsers(filtered)
  }, [searchQuery, users, filters])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${adminToken}` }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers })
      const usersData = await usersRes.json()

      if (usersData.success) {
        setUsers(usersData.users)
        setFilteredUsers(usersData.users)
      }

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers })
      const statsData = await statsRes.json()

      if (statsData.success) {
        setStats(statsData.stats)
      }

      setError("")
    } catch (err) {
      setError("Failed to load data: " + err.message)
      // console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    })
    setEditModal(true)
  }

  const handlePlanModal = (user) => {
    if (user.isDeleted) {
      setError("Cannot grant plan to a deleted user account")
      return
    }
    setSelectedUser(user)
    setPlanFormData({ planType: 'pro', duration: 30 })
    setPlanModal(true)
  }

  const openUserPreview = async (user) => {
    try {
      setPreviewLoading(true)
      const headers = { Authorization: `Bearer ${adminToken}` }
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/preview`, { headers })
      const data = await response.json()

      if (data.success) {
        setSelectedUser(user)
        setPreviewData(data.preview)
        setPreviewModal(true)
        setError("")
      } else {
        setError(data.message || "Failed to load user preview")
      }
    } catch (err) {
      setError("Error loading user preview: " + err.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const openResetPasswordModal = (user) => {
    setSelectedUser(user)
    setResetPasswordData({
      selectedUserId: user._id,
      newPassword: '',
      confirmPassword: ''
    })
    setResetPasswordModal(true)
  }

  const resetUserPassword = async () => {
    if (!resetPasswordData.newPassword) {
      setError("Please enter a new password")
      return
    }
    if (resetPasswordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${resetPasswordData.selectedUserId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            newPassword: resetPasswordData.newPassword,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setResetPasswordModal(false)
        setError("")
        alert("Password has been reset successfully!")
        // Refresh preview data
        openUserPreview(selectedUser)
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch (err) {
      setError("Error resetting password: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const saveUserEdit = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(editFormData),
        }
      )

      const data = await response.json()

      if (data.success) {
        setUsers(users.map((u) => (u._id === selectedUser._id ? data.user : u)))
        setFilteredUsers(filteredUsers.map((u) => (u._id === selectedUser._id ? data.user : u)))
        setEditModal(false)
        setError("")
      } else {
        setError(data.message || "Failed to update user")
      }
    } catch (err) {
      setError("Error updating user: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const grantPlan = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${selectedUser._id}/grant-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(planFormData),
        }
      )

      const data = await response.json()

      if (data.success) {
        setUsers(users.map((u) => (u._id === selectedUser._id ? data.user : u)))
        setFilteredUsers(filteredUsers.map((u) => (u._id === selectedUser._id ? data.user : u)))
        setPlanModal(false)
        setError("")
      } else {
        setError(data.message || "Failed to grant plan")
      }
    } catch (err) {
      setError("Error granting plan: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const deleteUserAccount = async (userId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return

    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      )

      const data = await response.json()

      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId))
        setFilteredUsers(filteredUsers.filter((u) => u._id !== userId))
        setError("")
      } else {
        setError(data.message || "Failed to delete user")
      }
    } catch (err) {
      setError("Error deleting user: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const openQuizCreditsModal = async (user) => {
    try {
      setActionLoading(true)
      // Fetch fresh user data to ensure we have latest freeQuizCredits
      const headers = { Authorization: `Bearer ${adminToken}` }
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, { headers })
      const data = await response.json()

      if (data.success) {
        setSelectedUser(data.user)
        setQuizCreditsData({ selectedUserId: user._id, creditsToGrant: '' })
        setQuizCreditsModal(true)
        setError("")
      } else {
        setError(data.message || "Failed to load user details")
      }
    } catch (err) {
      setError("Error loading user: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const grantQuizCredits = async () => {
    if (!quizCreditsData.selectedUserId) {
      setError("Please select a user")
      return
    }

    if (!quizCreditsData.creditsToGrant || quizCreditsData.creditsToGrant === '') {
      setError("Please enter a number of credits")
      return
    }

    const creditsToGrant = Number(quizCreditsData.creditsToGrant)
    
    if (!Number.isInteger(creditsToGrant) || creditsToGrant <= 0) {
      setError("Please enter a valid positive number")
      return
    }

    const selectedUser = users.find(u => u._id === quizCreditsData.selectedUserId)
    if (!selectedUser) {
      setError("User not found")
      return
    }

    if (selectedUser.subscriptionPlan !== 'free') {
      setError("Quiz credits can only be granted to free users. Premium users have unlimited quiz access.")
      return
    }

    if (selectedUser.isDeleted) {
      setError("Cannot grant credits to a deleted user account")
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${quizCreditsData.selectedUserId}/grant-quiz-credits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            creditsToAdd: creditsToGrant
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        // Refresh user list
        fetchAllData()
        setQuizCreditsModal(false)
        setQuizCreditsData({
          selectedUserId: null,
          creditsToGrant: ''
        })
        setError("")
        alert(`Successfully granted ${creditsToGrant} quiz credits to ${selectedUser.name}!`)
      } else {
        setError(data.message || "Failed to grant quiz credits")
      }
    } catch (err) {
      setError("Error granting quiz credits: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const blockUserAccount = async () => {
    if (!blockData.selectedUserId) {
      setError("Please select a user")
      return
    }
    
    if (!blockData.reason.trim()) {
      setError("Please provide a reason for blocking")
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/block`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            userId: blockData.selectedUserId,
            reason: blockData.reason,
            duration: blockData.duration
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setUsers(users.map((u) => (u._id === blockData.selectedUserId ? { ...u, isBlocked: true, blockedAt: new Date(), blockReason: blockData.reason, blockExpiryDate: data.blockedUser.blockExpiryDate, isBlockedPermanently: data.blockedUser.isBlockedPermanently } : u)))
        setFilteredUsers(filteredUsers.map((u) => (u._id === blockData.selectedUserId ? { ...u, isBlocked: true, blockedAt: new Date(), blockReason: blockData.reason, blockExpiryDate: data.blockedUser.blockExpiryDate, isBlockedPermanently: data.blockedUser.isBlockedPermanently } : u)))
        setBlockModal(false)
        setBlockData({ selectedUserId: null, reason: 'Violation of terms and conditions', duration: '7d' })
        setError("")
        alert(data.message || "User blocked successfully!")
      } else {
        setError(data.message || "Failed to block user")
      }
    } catch (err) {
      setError("Error blocking user: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const unblockUserAccount = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return

    try {
      setActionLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/unblock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ userId }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, isBlocked: false, blockedAt: null, blockReason: null } : u)))
        setFilteredUsers(filteredUsers.map((u) => (u._id === userId ? { ...u, isBlocked: false, blockedAt: null, blockReason: null } : u)))
        setError("")
        alert(data.message || "User unblocked successfully!")
      } else {
        setError(data.message || "Failed to unblock user")
      }
    } catch (err) {
      setError("Error unblocking user: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!notificationData.subject || !notificationData.message) {
      setError("Subject and message are required")
      return
    }

    if (notificationData.mode === 'specific' && !notificationData.selectedUserId) {
      setError("Please select a user")
      return
    }

    // Check if selected user is deleted
    if (notificationData.mode === 'specific') {
      const selectedUser = users.find(u => u._id === notificationData.selectedUserId)
      if (selectedUser && selectedUser.isDeleted) {
        setError("Cannot send notification to a deleted user account")
        return
      }
    }

    try {
      setActionLoading(true)
      const payload = {
        subject: notificationData.subject,
        message: notificationData.message,
        mode: notificationData.mode,
        userId: notificationData.selectedUserId || null
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data.success) {
        setNotificationModal(false)
        setNotificationData({ mode: 'all', subject: '', message: '', selectedUserId: null })
        setError("")
        alert(data.message || "Notification sent successfully!")
      } else {
        setError(data.message || "Failed to send notification")
      }
    } catch (err) {
      setError("Error sending notification: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const grantBulkAccess = async () => {
    if (bulkPlanData.mode === 'specific' && !bulkPlanData.selectedUserId) {
      setError("Please select a user")
      return
    }

    // Check if selected user is deleted
    if (bulkPlanData.mode === 'specific') {
      const selectedUser = users.find(u => u._id === bulkPlanData.selectedUserId)
      if (selectedUser && selectedUser.isDeleted) {
        setError("Cannot grant access to a deleted user account")
        return
      }
    }

    try {
      setActionLoading(true)
      const payload = {
        mode: bulkPlanData.mode, // 'all', 'userType', or 'specific'
        planType: bulkPlanData.planType,
        duration: bulkPlanData.duration,
        userType: bulkPlanData.userType || null,
        userId: bulkPlanData.selectedUserId || null
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/grant-bulk-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data.success) {
        // Refresh user list
        fetchAllData()
        setBulkPlanModal(false)
        setBulkPlanData({
          mode: 'all',
          planType: 'pro',
          duration: 30,
          userType: 'free',
          selectedUserId: null
        })
        setError("")
        alert(data.message || `Successfully granted access to ${data.count || 'users'}!`)
      } else {
        setError(data.message || "Failed to grant access")
      }
    } catch (err) {
      setError("Error granting access: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const cancelSubscriptions = async () => {
    if (cancelData.mode === 'planType' && !cancelData.planType) {
      setError("Please select a plan type")
      return
    }
    if (cancelData.mode === 'specific' && !cancelData.selectedUserId) {
      setError("Please select a user")
      return
    }

    // Check if selected user is deleted
    if (cancelData.mode === 'specific') {
      const selectedUser = users.find(u => u._id === cancelData.selectedUserId)
      if (selectedUser && selectedUser.isDeleted) {
        setError("Cannot cancel subscription for a deleted user account")
        return
      }
    }

    try {
      setActionLoading(true)
      const payload = {
        mode: cancelData.mode, // 'all', 'planType', or 'specific'
        planType: cancelData.planType || null,
        userId: cancelData.selectedUserId || null
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data.success) {
        // Refresh user list
        fetchAllData()
        setCancelSubscriptionModal(false)
        setCancelData({
          mode: 'all',
          planType: 'pro',
          selectedUserId: null
        })
        setError("")
        alert(data.message || `Successfully cancelled subscription for ${data.count || 'users'}!`)
      } else {
        setError(data.message || "Failed to cancel subscriptions")
      }
    } catch (err) {
      setError("Error cancelling subscriptions: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-8 overflow-hidden">
      {/* Golden Diagonal Rays Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Smooth diagonal golden gradient rays */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ray1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(217, 119, 6, 0)" />
              <stop offset="30%" stopColor="rgba(217, 119, 6, 0.3)" />
              <stop offset="50%" stopColor="rgba(217, 119, 6, 0.25)" />
              <stop offset="70%" stopColor="rgba(217, 119, 6, 0.15)" />
              <stop offset="100%" stopColor="rgba(217, 119, 6, 0)" />
            </linearGradient>
            <linearGradient id="ray2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(180, 83, 9, 0)" />
              <stop offset="25%" stopColor="rgba(180, 83, 9, 0.25)" />
              <stop offset="50%" stopColor="rgba(180, 83, 9, 0.2)" />
              <stop offset="75%" stopColor="rgba(180, 83, 9, 0.1)" />
              <stop offset="100%" stopColor="rgba(180, 83, 9, 0)" />
            </linearGradient>
          </defs>
          {/* First set of rays */}
          <rect x="-50%" y="-50%" width="150%" height="150%" fill="url(#ray1)" transform="rotate(35)" opacity="0.6" />
          <rect x="-50%" y="-50%" width="150%" height="150%" fill="url(#ray2)" transform="rotate(25)" opacity="0.4" />
          {/* Second set of rays */}
          <rect x="-50%" y="-50%" width="150%" height="150%" fill="url(#ray1)" transform="rotate(45)" opacity="0.5" />
          <rect x="-50%" y="-50%" width="150%" height="150%" fill="url(#ray2)" transform="rotate(55)" opacity="0.3" />
        </svg>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-amber-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-orange-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Content */}
      <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-16">
        <h1 className="text-4xl font-bold text-purple-400">
          Admin Dashboard
        </h1>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setNotificationModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
        >
          📧 Send Notification
        </button>
        <button
          onClick={() => setBulkPlanModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2"
        >
          🎁 Grant Free Access
        </button>
        <button
          onClick={() => setCancelSubscriptionModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2"
        >
          ❌ Cancel Subscription
        </button>
        <button
          onClick={() => setCouponModal(true)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition flex items-center gap-2"
        >
          🎟️ Manage Coupons
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="space-y-4 mb-8">
          {/* Top Row - Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 border border-purple-500/30 rounded-lg p-4">
              <div className="text-purple-400 text-sm font-semibold">👥 Total Users</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-green-950/50 border border-green-500/30 rounded-lg p-4">
              <div className="text-green-400 text-sm font-semibold">✅ Verified Users</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.verifiedUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-950/50 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-400 text-sm font-semibold">⚠️ Unverified</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.unverifiedUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-red-900/50 to-red-950/50 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 text-sm font-semibold">🔒 Blocked Users</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.blockedUsers || 0}</div>
            </div>
          </div>

          {/* Bottom Row - Plan Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-950/50 border border-indigo-500/30 rounded-lg p-4">
              <div className="text-indigo-400 text-sm font-semibold">📚 Free Plans</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.freeUsers || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-500/30 rounded-lg p-4">
              <div className="text-blue-400 text-sm font-semibold">💜 Pro Users</div>
              <div className="text-3xl font-bold text-white mt-2">
                {stats.planStats?.find(p => p._id === 'pro')?.count || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="text-yellow-400 text-sm font-semibold">⭐ Ultimate Users</div>
              <div className="text-3xl font-bold text-white mt-2">
                {stats.planStats?.find(p => p._id === 'ultimate')?.count || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-500/30 rounded-lg p-4">
              <div className="text-slate-400 text-sm font-semibold">🗑️ Deleted Users</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.deletedUsers || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-purple-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Email Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-purple-400 mb-2">Email Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div>
          <label className="block text-sm font-semibold text-green-400 mb-2">Subscription Plan</label>
          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="ultimate">Ultimate</option>
          </select>
        </div>

        {/* Account Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-blue-400 mb-2">Account Status</label>
          <select
            value={filters.accountStatus}
            onChange={(e) => setFilters({ ...filters, accountStatus: e.target.value })}
            className="w-full bg-slate-800/50 border border-blue-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="reactivated">Reactivated</option>
            <option value="blocked">Blocked</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {/* Subscription Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-yellow-400 mb-2">Subscription Status</label>
          <select
            value={filters.subscriptionStatus}
            onChange={(e) => setFilters({ ...filters, subscriptionStatus: e.target.value })}
            className="w-full bg-slate-800/50 border border-yellow-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          >
            <option value="all">All</option>
            <option value="active">Active Subscription</option>
            <option value="expired">Expired Subscription</option>
            <option value="none">No Subscription</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-purple-500/30">
        <table className="w-full text-sm">
          <thead className="bg-purple-950/50 border-b border-purple-500/30">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Purchased</th>
              <th className="px-4 py-3 text-left">Validity</th>
              <th className="px-4 py-3 text-left">Deleted</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-purple-500/20 hover:bg-purple-900/20 transition"
              >
                <td className="px-4 py-3 font-semibold">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isEmailVerified
                        ? "bg-green-900/50 text-green-300"
                        : "bg-red-900/50 text-red-300"
                    }`}
                  >
                    {user.isEmailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isPremium
                        ? user.subscriptionPlan === "pro"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-yellow-900/50 text-yellow-300"
                        : "bg-slate-900/50 text-slate-300"
                    }`}
                  >
                    {user.isPremium
                      ? user.subscriptionPlan
                        ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)
                        : "Pro"
                      : "Free"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {user.subscriptionPurchaseDate
                    ? new Date(user.subscriptionPurchaseDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {user.subscriptionEndDate
                    ? (() => {
                        const endDate = new Date(user.subscriptionEndDate)
                        const now = new Date()
                        const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
                        return `${endDate.toLocaleDateString()} (${daysLeft}d)`
                      })()
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  {user.isBlocked ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 font-semibold text-xs">
                        {user.isBlockedPermanently ? "🔒 Blocked (Permanent)" : "⏱️ Blocked (Temporary)"}
                      </span>
                      <span className="text-gray-300 text-xs text-xs" title={user.blockReason}>
                        {user.blockReason ? user.blockReason.substring(0, 20) + '...' : "No reason"}
                      </span>
                      {user.blockExpiryDate && !user.isBlockedPermanently && (
                        <span className="text-gray-400 text-xs">
                          Expires: {new Date(user.blockExpiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : user.isDeleted ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-red-400 font-semibold text-xs">Deleted</span>
                      <span className="text-red-300 text-xs">
                        {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  ) : user.wasDeleted ? (
                    <span className="text-orange-400 font-semibold text-xs">Reactivated</span>
                  ) : (
                    <span className="text-green-400 font-semibold text-xs">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => openUserPreview(user)}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded transition"
                    title="Preview user details"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                    title="Edit user"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handlePlanModal(user)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded transition"
                    title="Grant plan"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => openQuizCreditsModal(user)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded transition"
                    title="Grant quiz credits"
                  >
                    📊
                  </button>
                  <button
                    onClick={() => {
                      if (user.isBlocked) {
                        unblockUserAccount(user._id)
                      } else {
                        setBlockData({ selectedUserId: user._id, reason: 'Violation of terms and conditions', duration: '7d' })
                        setBlockModal(true)
                      }
                    }}
                    className={`p-2 rounded transition ${user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    title={user.isBlocked ? "Unblock user" : "Block user"}
                  >
                    {user.isBlocked ? '✓' : '🚫'}
                  </button>
                  <button
                    onClick={() => deleteUserAccount(user._id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition"
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-purple-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editFormData.name || ""}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editFormData.email || ""}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isEmailVerified || false}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, isEmailVerified: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-white">Email Verified</span>
              </label>
            </div>

            <button
              onClick={saveUserEdit}
              disabled={actionLoading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Grant Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Grant Free Plan</h2>
              <button
                onClick={() => setPlanModal(false)}
                className="text-slate-400 hover:text-purple-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-2">
                  Plan Type
                </label>
                <select
                  value={planFormData.planType}
                  onChange={(e) => setPlanFormData({ ...planFormData, planType: e.target.value })}
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="pro">Pro Plan</option>
                  <option value="ultimate">Ultimate Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={planFormData.duration}
                  onChange={(e) =>
                    setPlanFormData({ ...planFormData, duration: parseInt(e.target.value) })
                  }
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={grantPlan}
              disabled={actionLoading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {actionLoading ? "Granting..." : "Grant Plan"}
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-blue-500/30 rounded-2xl p-8 max-w-2xl w-full backdrop-blur-xl shadow-2xl shadow-blue-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-blue-400">Send Notification</h3>
              <button
                onClick={() => setNotificationModal(false)}
                className="text-slate-400 hover:text-blue-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-blue-400 mb-2">
                  Recipient
                </label>
                <select
                  value={notificationData.mode}
                  onChange={(e) => setNotificationData({ ...notificationData, mode: e.target.value, selectedUserId: null })}
                  className="w-full bg-slate-800/50 border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              {notificationData.mode === 'specific' && (
                <div>
                  <label className="block text-sm font-semibold text-blue-400 mb-2">
                    Select User
                  </label>
                  <select
                    value={notificationData.selectedUserId || ''}
                    onChange={(e) => setNotificationData({ ...notificationData, selectedUserId: e.target.value })}
                    className="w-full bg-slate-800/50 border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .filter(user => !user.isDeleted)
                      .map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-blue-400 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Notification subject"
                  value={notificationData.subject}
                  onChange={(e) => setNotificationData({ ...notificationData, subject: e.target.value })}
                  className="w-full bg-slate-800/50 border border-blue-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-400 mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Enter your message..."
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  rows="5"
                  className="w-full bg-slate-800/50 border border-blue-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setNotificationModal(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={actionLoading || !notificationData.subject || !notificationData.message}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {actionLoading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Plan Modal */}
      {bulkPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-green-500/30 rounded-2xl p-8 max-w-2xl w-full backdrop-blur-xl shadow-2xl shadow-green-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-400">Grant Free Plan Access</h3>
              <button
                onClick={() => setBulkPlanModal(false)}
                className="text-slate-400 hover:text-green-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-green-400 mb-2">
                  Apply To
                </label>
                <select
                  value={bulkPlanData.mode}
                  onChange={(e) => setBulkPlanData({ ...bulkPlanData, mode: e.target.value, selectedUserId: null })}
                  className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="all">All Users</option>
                  <option value="userType">Users with Specific Plan</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              {bulkPlanData.mode === 'userType' && (
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Current Plan Type
                  </label>
                  <select
                    value={bulkPlanData.userType}
                    onChange={(e) => setBulkPlanData({ ...bulkPlanData, userType: e.target.value })}
                    className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="free">Free Users</option>
                    <option value="pro">Pro Users</option>
                    <option value="ultimate">Ultimate Users</option>
                  </select>
                </div>
              )}

              {bulkPlanData.mode === 'specific' && (
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2">
                    Select User
                  </label>
                  <select
                    value={bulkPlanData.selectedUserId || ''}
                    onChange={(e) => setBulkPlanData({ ...bulkPlanData, selectedUserId: e.target.value })}
                    className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .filter(user => !user.isDeleted)
                      .map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-green-400 mb-2">
                  Plan Type to Grant
                </label>
                <select
                  value={bulkPlanData.planType}
                  onChange={(e) => setBulkPlanData({ ...bulkPlanData, planType: e.target.value })}
                  className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="pro">Pro Plan</option>
                  <option value="ultimate">Ultimate Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-400 mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkPlanData.duration}
                  onChange={(e) => setBulkPlanData({ ...bulkPlanData, duration: parseInt(e.target.value) })}
                  className="w-full bg-slate-800/50 border border-green-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setBulkPlanModal(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={grantBulkAccess}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {actionLoading ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {cancelSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full backdrop-blur-xl shadow-2xl shadow-red-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-400">Cancel Subscription</h3>
              <button
                onClick={() => setCancelSubscriptionModal(false)}
                className="text-slate-400 hover:text-red-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Cancel For
                </label>
                <select
                  value={cancelData.mode}
                  onChange={(e) => setCancelData({ ...cancelData, mode: e.target.value, selectedUserId: null })}
                  className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Users with Active Subscriptions</option>
                  <option value="planType">Users with Specific Plan Type</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              {cancelData.mode === 'planType' && (
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Plan Type to Cancel
                  </label>
                  <select
                    value={cancelData.planType}
                    onChange={(e) => setCancelData({ ...cancelData, planType: e.target.value })}
                    className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="pro">Pro Plan</option>
                    <option value="ultimate">Ultimate Plan</option>
                  </select>
                </div>
              )}

              {cancelData.mode === 'specific' && (
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Select User
                  </label>
                  <select
                    value={cancelData.selectedUserId || ''}
                    onChange={(e) => setCancelData({ ...cancelData, selectedUserId: e.target.value })}
                    className="w-full bg-slate-800/50 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .filter(user => !user.isDeleted)
                      .map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300">
                  ⚠️ Users will be reverted to the Free Plan and will receive a cancellation email.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCancelSubscriptionModal(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={cancelSubscriptions}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 transition"
                >
                  {actionLoading ? "Cancelling..." : "Cancel Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-orange-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Block User Account</h2>
              <button
                onClick={() => setBlockModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Select User
                </label>
                <select
                  value={blockData.selectedUserId || ''}
                  onChange={(e) => setBlockData({ ...blockData, selectedUserId: e.target.value })}
                  className="w-full bg-slate-800/50 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(user => !user.isDeleted && !user.isBlocked)
                    .map(user => (
                      <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Reason for Blocking
                </label>
                <select
                  value={blockData.reason}
                  onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                  className="w-full bg-slate-800/50 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Violation of terms and conditions">Violation of terms and conditions</option>
                  <option value="Spamming or harassment">Spamming or harassment</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Suspicious activity">Suspicious activity</option>
                  <option value="Payment fraud">Payment fraud</option>
                  <option value="Duplicate account">Duplicate account</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Custom Reason (Optional)
                </label>
                <textarea
                  value={blockData.reason}
                  onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                  placeholder="You can type a custom reason here..."
                  className="w-full bg-slate-800/50 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Block Duration
                </label>
                <select
                  value={blockData.duration}
                  onChange={(e) => setBlockData({ ...blockData, duration: e.target.value })}
                  className="w-full bg-slate-800/50 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="1d">1 Day</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days (1 Month)</option>
                  <option value="90d">90 Days (3 Months)</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-sm text-orange-300">
                  ⚠️ The user will receive an email notification about the block with the specified reason and duration. They will not be able to login to their account.

                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setBlockModal(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={blockUserAccount}
                disabled={actionLoading || !blockData.selectedUserId}
                className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {actionLoading ? "Blocking..." : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Quiz Credits Modal */}
      {quizCreditsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Grant Quiz Credits</h2>
              <button
                onClick={() => setQuizCreditsModal(false)}
                className="text-slate-400 hover:text-indigo-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">User</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedUser ? selectedUser.name : ""}
                    disabled
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300"
                  />
                  {selectedUser?.subscriptionPlan === 'pro' && (
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 text-xs font-semibold whitespace-nowrap">Pro</span>
                  )}
                  {selectedUser?.subscriptionPlan === 'ultimate' && (
                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-orange-300 text-xs font-semibold whitespace-nowrap">👑 Ultimate</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Subscription Plan</label>
                <input
                  type="text"
                  value={selectedUser?.subscriptionPlan ? selectedUser.subscriptionPlan.charAt(0).toUpperCase() + selectedUser.subscriptionPlan.slice(1) : 'Free'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300"
                />
              </div>

              {selectedUser?.subscriptionPlan === 'free' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Current Credits Remaining</label>
                  <input
                    type="number"
                    value={selectedUser?.quizLimits?.quizzesRemaining ?? 5}
                    disabled
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300"
                  />
                </div>
              )}

              {selectedUser?.subscriptionPlan !== 'free' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    ℹ️ This user has a <strong>{selectedUser?.subscriptionPlan?.toUpperCase()}</strong> plan with unlimited quiz access. Quiz credits only apply to free users.
                  </p>
                </div>
              )}

              {selectedUser?.subscriptionPlan === 'free' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Credits to Add</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quizCreditsData.creditsToGrant}
                      onChange={(e) => setQuizCreditsData({
                        ...quizCreditsData,
                        creditsToGrant: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-indigo-500/50 rounded-lg text-white placeholder-slate-500"
                      placeholder="Enter number of credits"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">New Total</label>
                    <input
                      type="number"
                      value={(selectedUser?.quizLimits?.quizzesRemaining ?? 5) + parseInt(quizCreditsData.creditsToGrant || 0)}
                      disabled
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-indigo-300 font-semibold"
                    />
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <p className="text-sm text-indigo-300">
                      ℹ️ This will add the specified number of quiz credits to the user's account. Free users can use these credits to take more quizzes.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setQuizCreditsModal(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={grantQuizCredits}
                disabled={actionLoading || !quizCreditsData.creditsToGrant || selectedUser?.subscriptionPlan !== 'free'}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {selectedUser?.subscriptionPlan !== 'free' ? 'Premium User (Unlimited)' : actionLoading ? "Granting..." : "Grant Credits"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Preview Modal */}
      {previewModal && previewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-cyan-500/30 rounded-2xl p-8 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-cyan-400">👁️ User Preview</h2>
              <button
                onClick={() => setPreviewModal(false)}
                className="text-slate-400 hover:text-cyan-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            {previewLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-cyan-300">Loading preview...</div>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                {/* Basic User Info */}
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">👤 User Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Name</p>
                      <p className="text-white font-semibold">{previewData.user.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="text-white font-semibold break-all">{previewData.user.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Phone</p>
                      <p className="text-white font-semibold">{previewData.user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Joined</p>
                      <p className="text-white font-semibold">{new Date(previewData.user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Days Active</p>
                      <p className="text-white font-semibold">{previewData.user.daysActive} days</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email Verified</p>
                      <p className={`font-semibold ${previewData.user.isEmailVerified ? 'text-green-400' : 'text-red-400'}`}>
                        {previewData.user.isEmailVerified ? '✓ Yes' : '✗ No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-amber-400 mb-3">📊 Account Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <p className="text-white font-semibold">{previewData.accountStatus.status}</p>
                    </div>
                    {previewData.accountStatus.isBlocked && (
                      <>
                        <div>
                          <p className="text-slate-400 text-sm">Blocked At</p>
                          <p className="text-white font-semibold">{previewData.accountStatus.blockedAt ? new Date(previewData.accountStatus.blockedAt).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Block Type</p>
                          <p className="text-white font-semibold">{previewData.accountStatus.isBlockedPermanently ? '🔒 Permanent' : '⏱️ Temporary'}</p>
                        </div>
                        {!previewData.accountStatus.isBlockedPermanently && previewData.accountStatus.blockExpiryDate && (
                          <div>
                            <p className="text-slate-400 text-sm">Expires</p>
                            <p className="text-white font-semibold">{new Date(previewData.accountStatus.blockExpiryDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-slate-400 text-sm">Block Reason</p>
                          <p className="text-white font-semibold">{previewData.accountStatus.blockReason || 'No reason provided'}</p>
                        </div>
                      </>
                    )}
                    {previewData.accountStatus.isDeleted && (
                      <div>
                        <p className="text-slate-400 text-sm">Deleted At</p>
                        <p className="text-white font-semibold">{previewData.accountStatus.deletedAt ? new Date(previewData.accountStatus.deletedAt).toLocaleString() : '-'}</p>
                      </div>
                    )}
                    {previewData.accountStatus.wasDeleted && (
                      <div>
                        <p className="text-slate-400 text-sm">Account History</p>
                        <p className="text-white font-semibold">♻️ Reactivated</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">💎 Subscription</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Plan</p>
                      <p className={`font-semibold ${previewData.subscription.plan === 'pro' ? 'text-purple-300' : previewData.subscription.plan === 'ultimate' ? 'text-yellow-300' : 'text-slate-300'}`}>
                        {previewData.subscription.plan.charAt(0).toUpperCase() + previewData.subscription.plan.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Premium Status</p>
                      <p className={`font-semibold ${previewData.subscription.isPremium ? 'text-green-400' : 'text-slate-400'}`}>
                        {previewData.subscription.isPremium ? '✓ Yes' : '✗ No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Period</p>
                      <p className="text-white font-semibold">{previewData.subscription.period ? previewData.subscription.period.charAt(0).toUpperCase() + previewData.subscription.period.slice(1) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Purchase Date</p>
                      <p className="text-white font-semibold">{previewData.subscription.purchaseDate ? new Date(previewData.subscription.purchaseDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Expiry Date</p>
                      <p className="text-white font-semibold">{previewData.subscription.endDate ? new Date(previewData.subscription.endDate).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Security & Devices */}
                <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-orange-400 mb-3">🔐 Security & Devices</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Password Set</p>
                      <p className={`font-semibold ${previewData.security.hasPassword ? 'text-green-400' : 'text-red-400'}`}>
                        {previewData.security.hasPassword ? '✓ Yes' : '✗ No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Devices Logged In</p>
                      <p className="text-white font-semibold text-lg">{previewData.devices.count}</p>
                    </div>
                  </div>

                  {previewData.security.password && (
                    <div className="bg-slate-700/50 rounded p-3 mb-3 border border-green-500/50">
                      <p className="text-green-400 font-semibold text-sm mb-2">🔑 User Password</p>
                      <div className="bg-slate-900/50 rounded p-3 font-mono text-sm text-green-300 break-all">
                        {previewData.security.password}
                      </div>
                      <p className="text-slate-400 text-xs mt-2">✓ Decrypted plain text password</p>
                    </div>
                  )}
                  
                  {previewData.devices.active && (
                    <div className="bg-slate-700/50 rounded p-3 mb-2">
                      <p className="text-green-400 font-semibold text-sm mb-2">📱 Active Device</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">Device: {previewData.devices.active.deviceName || 'Unknown'}</p>
                        <p className="text-slate-300">Device ID: {previewData.devices.active.deviceId?.substring(0, 20)}...</p>
                        <p className="text-slate-300">IP: {previewData.devices.active.ipAddress || 'Unknown'}</p>
                        <p className="text-slate-300">Last Login: {previewData.devices.active.lastLoginAt ? new Date(previewData.devices.active.lastLoginAt).toLocaleString() : '-'}</p>
                      </div>
                    </div>
                  )}
                  
                  {previewData.devices.previous && (
                    <div className="bg-slate-700/50 rounded p-3">
                      <p className="text-amber-400 font-semibold text-sm mb-2">📱 Previous Device</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">Device: {previewData.devices.previous.deviceName || 'Unknown'}</p>
                        <p className="text-slate-300">Device ID: {previewData.devices.previous.deviceId?.substring(0, 20)}...</p>
                        <p className="text-slate-300">IP: {previewData.devices.previous.ipAddress || 'Unknown'}</p>
                        <p className="text-slate-300">Last Login: {previewData.devices.previous.lastLoginAt ? new Date(previewData.devices.previous.lastLoginAt).toLocaleString() : '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Info */}
                <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-400 mb-3">📝 Notes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total Created</p>
                      <p className="text-white font-semibold text-2xl">{previewData.notes.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Pinned</p>
                      <p className="text-white font-semibold text-2xl">{previewData.notes.pinned}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Topics</p>
                      <p className="text-white font-semibold text-2xl">{previewData.notes.topics.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Updated</p>
                      <p className="text-white font-semibold text-sm">{previewData.notes.lastUpdated ? new Date(previewData.notes.lastUpdated).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  {previewData.notes.examTypes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm mb-2">Exam Types</p>
                      <div className="flex flex-wrap gap-2">
                        {previewData.notes.examTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewData.notes.topics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm mb-2">Topics Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {previewData.notes.topics.slice(0, 5).map((topic, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                        {previewData.notes.topics.length > 5 && (
                          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs rounded-full">
                            +{previewData.notes.topics.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quizzes Info */}
                <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-400 mb-3">🎯 Quizzes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total Taken</p>
                      <p className="text-white font-semibold text-2xl">{previewData.quizzes.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Average Score</p>
                      <p className="text-white font-semibold text-2xl">{previewData.quizzes.averageScore}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Best Score</p>
                      <p className="text-green-400 font-semibold text-2xl">{previewData.quizzes.bestScore}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Attempt</p>
                      <p className="text-white font-semibold text-sm">{previewData.quizzes.lastAttempt ? new Date(previewData.quizzes.lastAttempt).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  {previewData.quizzes.examTypes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm mb-2">Exam Types</p>
                      <div className="flex flex-wrap gap-2">
                        {previewData.quizzes.examTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-300 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewData.quizzes.topics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm mb-2">Topics Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {previewData.quizzes.topics.slice(0, 5).map((topic, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                        {previewData.quizzes.topics.length > 5 && (
                          <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 text-xs rounded-full">
                            +{previewData.quizzes.topics.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quiz Credits Info */}
                <div className="bg-slate-800/50 border border-indigo-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-indigo-400 mb-3">💳 Quiz Credits</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Available Credits</p>
                      <p className="text-white font-semibold text-2xl">{typeof previewData.credits.freeQuizCredits === 'number' ? previewData.credits.freeQuizCredits : previewData.credits.freeQuizCredits}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Used This Month</p>
                      <p className="text-white font-semibold text-2xl">{previewData.credits.quizzesPlayedThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Extra Credits Granted</p>
                      <p className="text-white font-semibold text-2xl">{previewData.credits.extraCreditsGranted}</p>
                    </div>
                  </div>
                </div>

                {/* Downloads Info */}
                <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-pink-400 mb-3">⬇️ Downloads</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total Downloads</p>
                      <p className="text-white font-semibold text-2xl">{previewData.downloads.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Resource Types</p>
                      <p className="text-white font-semibold">{previewData.downloads.types.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Download</p>
                      <p className="text-white font-semibold text-sm">{previewData.downloads.lastDownload ? new Date(previewData.downloads.lastDownload).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  {previewData.downloads.types.length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm mb-2">Downloaded Types</p>
                      <div className="flex flex-wrap gap-2">
                        {previewData.downloads.types.map((type, idx) => (
                          <span key={idx} className="px-3 py-1 bg-pink-500/20 border border-pink-500/50 text-pink-300 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payments Info */}
                <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">💳 Payments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total Payments</p>
                      <p className="text-white font-semibold text-2xl">{previewData.payments.totalPayments}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Spent</p>
                      <p className="text-white font-semibold text-2xl">₹{previewData.payments.totalSpent}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Successful</p>
                      <p className="text-green-400 font-semibold text-2xl">{previewData.payments.successfulPayments}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Failed</p>
                      <p className="text-red-400 font-semibold text-2xl">{previewData.payments.failedPayments}</p>
                    </div>
                  </div>
                  {previewData.payments.lastPayment && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <p className="text-slate-400 text-sm mb-2">Latest Payment</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-500">Plan</p>
                          <p className="text-white font-semibold">{previewData.payments.lastPayment.planType}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Amount</p>
                          <p className="text-white font-semibold">₹{previewData.payments.lastPayment.amount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className={`font-semibold ${previewData.payments.lastPayment.status === 'success' || previewData.payments.lastPayment.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                            {previewData.payments.lastPayment.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Date</p>
                          <p className="text-white font-semibold">{new Date(previewData.payments.lastPayment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => openResetPasswordModal(selectedUser)}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
              >
                🔑 Reset Password
              </button>
              <button
                onClick={() => setPreviewModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-orange-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-400">🔑 Reset Password</h2>
              <button
                onClick={() => setResetPasswordModal(false)}
                className="text-slate-400 hover:text-orange-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  User
                </label>
                <input
                  type="text"
                  value={selectedUser?.name || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({
                    ...resetPasswordData,
                    newPassword: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-orange-500/50 rounded-lg text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({
                    ...resetPasswordData,
                    confirmPassword: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-orange-500/50 rounded-lg text-white placeholder-slate-500"
                />
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-sm text-orange-300">
                  ℹ️ This will set a new password for the user's account. The password will be encrypted and stored securely. You can view the plain text password in the preview modal after reset.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setResetPasswordModal(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={resetUserPassword}
                disabled={actionLoading || !resetPasswordData.newPassword}
                className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {actionLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Management Modal */}
      {couponModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-yellow-500/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">🎟️ Manage Coupons</h2>
              <button
                onClick={() => setCouponModal(false)}
                className="text-slate-400 hover:text-yellow-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Coupon Management Component */}
            <AdminCouponManagement adminToken={adminToken} />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}