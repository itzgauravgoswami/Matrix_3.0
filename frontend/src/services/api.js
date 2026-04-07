// API Service - Handles all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken'); 
}; 

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken(); 
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }; 

  if (token) {
    headers.Authorization = `Bearer ${token}`; 
  }

  const response = await fetch(url, {
    ...options,
    headers,
  }); 

  if (!response.ok) {
    const error = await response.json(); 
    // Only redirect on 401 if it's a JWT issue (not password verification)
    if (response.status === 401) {
      localStorage.removeItem('authToken'); 
      localStorage.removeItem('user'); 
      
      if (error.code === 'SESSION_INVALIDATED') {
        // Store a message to show on login page
        localStorage.setItem('sessionInvalidatedMessage', error.message); 
      }
      
      if (!url.includes('delete-account')) {
        window.location.href = '/login'; 
      }
    }
    throw new Error(error.message || `HTTP Error: ${response.status}`); 
  }

  return response.json(); 
}; 

// Authentication APIs
export const login = async (email, password, forceLogin = false) => {
  try {
    // console.log('Login attempt to:', `${API_BASE_URL}/auth/login`); 
    // console.log('Force login:', forceLogin); 
    
    // Get device info from user agent
    const userAgent = navigator.userAgent; 
    // console.log('User agent:', userAgent); 
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        userAgent,
        forceLogin,
      }),
      credentials: 'include',
    }); 

    // console.log('Response status:', response.status); 
    
    const data = await response.json(); 
    // console.log('Response data:', data); 

    if (!response.ok) {
      // console.error('Login failed with status', response.status, ':', data); 
      return { success: false, message: data.message || 'Login failed', ...data }; 
    }

    // console.log('Login successful'); 
    return {
      success: true,
      token: data.token,
      user: data.user,
    }; 
  } catch (error) {
    // console.error('Login error:', error); 
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { 
        success: false, 
        message: 'Failed to connect to server. Please ensure:\n1. Backend server is running on port 5000\n2. API URL is correct: ' + API_BASE_URL + '\n3. Check browser console for details'
      }; 
    }
    
    return { success: false, message: error.message || 'Login failed' }; 
  }
}; 

export const signup = async (name, email, password) => {
  try {
    // console.log('Signup attempt to:', `${API_BASE_URL}/auth/signup`); 
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    }); 

    // console.log('Response status:', response.status); 
    
    const data = await response.json(); 

    if (!response.ok) {
      // console.error('Signup failed:', data); 
      return { success: false, message: data.message || 'Signup failed' }; 
    }

    // console.log('Signup successful'); 
    return {
      success: true,
      token: data.token,
      user: data.user,
    }; 
  } catch (error) {
    // console.error('Signup error:', error); 
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { 
        success: false, 
        message: 'Failed to connect to server. Please ensure:\n1. Backend server is running on port 5000\n2. API URL is correct: ' + API_BASE_URL + '\n3. Check browser console for details'
      }; 
    }
    
    return { success: false, message: error.message || 'Signup failed' }; 
  }
}; 

// OTP Registration APIs
export const sendOTP = async (name, email, password) => {
  try {
    // console.log('Sending OTP to:', `${API_BASE_URL}/auth/send-otp`); 
    
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    }); 

    const data = await response.json(); 

    if (!response.ok) {
      // console.error('Send OTP failed:', data); 
      return { success: false, message: data.message || 'Failed to send OTP' }; 
    }

    // console.log('OTP sent successfully'); 
    return {
      success: true,
      message: data.message,
      email: data.email,
    }; 
  } catch (error) {
    // console.error('Send OTP error:', error); 
    return { success: false, message: error.message || 'Failed to send OTP' }; 
  }
}; 

export const verifyOTP = async (email, otp) => {
  try {
    // console.log('Verifying OTP to:', `${API_BASE_URL}/auth/verify-otp`); 
    
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
      credentials: 'include',
    }); 

    const data = await response.json(); 

    if (!response.ok) {
      // console.error('Verify OTP failed:', data); 
      return { success: false, message: data.message || 'Failed to verify OTP' }; 
    }

    // console.log('OTP verified successfully'); 
    return {
      success: true,
      token: data.token,
      user: data.user,
    }; 
  } catch (error) {
    // console.error('Verify OTP error:', error); 
    return { success: false, message: error.message || 'Failed to verify OTP' }; 
  }
}; 

export const resendOTP = async (email) => {
  try {
    // console.log('Resending OTP to:', `${API_BASE_URL}/auth/resend-otp`); 
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    }); 

    const data = await response.json(); 

    if (!response.ok) {
      // console.error('Resend OTP failed:', data); 
      return { success: false, message: data.message || 'Failed to resend OTP' }; 
    }

    // console.log('OTP resent successfully'); 
    return {
      success: true,
      message: data.message,
    }; 
  } catch (error) {
    // console.error('Resend OTP error:', error); 
    return { success: false, message: error.message || 'Failed to resend OTP' }; 
  }
}; 

// Google Authentication APIs
export const googleSignIn = async (googleToken) => {
  try {
    const userAgent = navigator.userAgent; 
    
    const response = await fetch(`${API_BASE_URL}/auth/google-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        googleToken,
        userAgent,
      }),
      credentials: 'include',
    }); 

    const data = await response.json(); 

    if (!response.ok) {
      return { success: false, message: data.message || 'Google sign-in failed', ...data }; 
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      isNewUser: data.isNewUser || false,
      needsPasswordSetup: data.needsPasswordSetup || false,
    }; 
  } catch (error) {
    console.error('Google sign-in error:', error); 
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { 
        success: false, 
        message: 'Failed to connect to server. Please check your connection.'
      }; 
    }
    
    return { success: false, message: error.message || 'Google sign-in failed' }; 
  }
}; 

export const setPassword = async (password, confirmPassword) => {
  try {
    const userAgent = navigator.userAgent; 
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword, userAgent }),
    }); 

    return {
      success: true,
      message: response.message || 'Password set successfully',
      token: response.token,
      user: response.user,
    }; 
  } catch (error) {
    console.error('Set password error:', error); 
    return { success: false, message: error.message || 'Failed to set password' }; 
  }
}; 

// Quiz APIs
export const getQuizzes = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/quizzes`); 
  } catch (error) {
    // console.error('Error fetching quizzes:', error); 
    throw error; 
  }
}; 

export const createQuiz = async (quizData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData),
    }); 
  } catch (error) {
    // console.error('Error creating quiz:', error); 
    throw error; 
  }
}; 

export const getQuizById = async (quizId) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}`); 
  } catch (error) {
    // console.error('Error fetching quiz:', error); 
    throw error; 
  }
}; 

export const submitQuiz = async (quizId, answers) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }); 
  } catch (error) {
    // console.error('Error submitting quiz:', error); 
    throw error; 
  }
}; 

// Notes APIs
export const getNotes = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/notes`); 
  } catch (error) {
    // console.error('Error fetching notes:', error); 
    throw error; 
  }
}; 

export const createNote = async (noteData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    }); 
  } catch (error) {
    // console.error('Error creating note:', error); 
    throw error; 
  }
}; 

export const updateNote = async (noteId, noteData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    }); 
  } catch (error) {
    // console.error('Error updating note:', error); 
    throw error; 
  }
}; 

export const deleteNote = async (noteId) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
    }); 
  } catch (error) {
    // console.error('Error deleting note:', error); 
    throw error; 
  }
}; 

// User APIs
export const getUserProfile = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/user/profile`); 
  } catch (error) {
    // console.error('Error fetching user profile:', error); 
    throw error; 
  }
}; 

export const updateUserProfile = async (userData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }); 
  } catch (error) {
    // console.error('Error updating user profile:', error); 
    throw error; 
  }
}; 

export const getProgress = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/user/progress`); 
  } catch (error) {
    // console.error('Error fetching progress:', error); 
    throw error; 
  }
}; 

export const deleteAccount = async (password) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/user/delete-account`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }); 
    return response; 
  } catch (error) {
    // console.error('Error deleting account:', error); 
    // Return error response instead of throwing
    return { 
      success: false, 
      message: error.message || 'Failed to delete account'
    }; 
  }
}; 

// Payment APIs
export const createPaymentOrder = async (planData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      body: JSON.stringify(planData),
    }); 
  } catch (error) {
    // console.error('Error creating payment order:', error); 
    throw error; 
  }
}; 

export const verifyPayment = async (paymentData) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/payments/verify-payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }); 
  } catch (error) {
    // console.error('Error verifying payment:', error); 
    throw error; 
  }
}; 

export const getPaymentHistory = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/payments/history`); 
  } catch (error) {
    // console.error('Error fetching payment history:', error); 
    throw error; 
  }
}; 

export const getCurrentSubscription = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/payments/current-subscription`); 
  } catch (error) {
    // console.error('Error fetching current subscription:', error); 
    throw error; 
  }
}; 

export const getPaymentReceipt = async (orderId) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/payments/receipt/${orderId}`); 
  } catch (error) {
    // console.error('Error fetching receipt:', error); 
    throw error; 
  }
}; 

// Check if current device has been logged out on another device
export const checkDeviceStatus = async () => {
  try {
    // console.log('Checking device status...'); 
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/check-device-status`, {
      method: 'GET',
    }); 
    
    // console.log('Device status response:', response); 
    return response; 
  } catch (error) {
    // console.error('Check device status error:', error); 
    return { 
      success: false, 
      hasLogoutPopup: false,
      error: error.message 
    }; 
  }
}; 

// Clear device logout popup after user acknowledges it
export const clearDeviceLogoutPopup = async () => {
  try {
    // console.log('Clearing device logout popup...'); 
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/clear-device-logout-popup`, {
      method: 'POST',
    }); 
    
    // console.log('Clear popup response:', response); 
    return response; 
  } catch (error) {
    // console.error('Clear device logout popup error:', error); 
    return { 
      success: false,
      error: error.message 
    }; 
  }
}; 

// Coupon APIs - Define before default export to avoid reference errors
const getAvailableCoupons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/available`); 
    return await response.json(); 
  } catch (error) {
    console.error('Error fetching available coupons:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const validateCoupon = async (code, planType, purchaseAmount) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      body: JSON.stringify({ code, planType, purchaseAmount }),
    }); 
    return response; 
  } catch (error) {
    console.error('Error validating coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const redeemCoupon = async (code) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/coupons/redeem`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }); 
    return response; 
  } catch (error) {
    console.error('Error redeeming coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const getCouponByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/${code}`); 
    return await response.json(); 
  } catch (error) {
    console.error('Error fetching coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const createCoupon = async (couponData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      body: JSON.stringify(couponData),
    }); 
    return response; 
  } catch (error) {
    console.error('Error creating coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const getAllCoupons = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/coupons`); 
  } catch (error) {
    console.error('Error fetching coupons:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const updateCoupon = async (couponId, updates) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }); 
    return response; 
  } catch (error) {
    console.error('Error updating coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

const deleteCoupon = async (couponId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/coupons/${couponId}`, {
      method: 'DELETE',
    }); 
    return response; 
  } catch (error) {
    console.error('Error deleting coupon:', error); 
    return { success: false, message: error.message }; 
  }
}; 

// Default export for destructuring
export default {
  login,
  signup,
  googleSignIn,
  setPassword,
  getQuizzes,
  createQuiz,
  getQuizById,
  submitQuiz,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getUserProfile,
  updateUserProfile,
  getProgress,
  deleteAccount,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getCurrentSubscription,
  getPaymentReceipt,
  checkDeviceStatus,
  clearDeviceLogoutPopup,
  // Coupon functions
  getAvailableCoupons,
  validateCoupon,
  redeemCoupon,
  getCouponByCode,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
}; 