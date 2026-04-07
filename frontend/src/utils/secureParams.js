/**
 * Secure Parameter Handling Utility
 * 
 * This module provides secure methods for handling URL parameters and sensitive data
 * to prevent unauthorized access to user or admin information.
 * 
 * Security Principles:
 * 1. Never expose sensitive IDs (userIds, quizIds, noteIds) in URLs
 * 2. Use opaque tokens/sessions instead of exposed parameters
 * 3. Always validate on the backend before returning data
 * 4. Keep sensitive operations in request body (POST/PUT) not URL
 * 5. Use JWT tokens for authentication instead of passing IDs
 */

// In-memory store for temporary session data (cleared on page refresh)
const sessionStore = new Map(); 
const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes

/**
 * Generates a secure session token for storing temporary data
 * @returns {string} - Secure random token
 */
const generateSessionToken = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; 
}; 

/**
 * Stores data securely in session store with automatic cleanup
 * @param {*} data - Data to store
 * @param {number} timeout - Optional timeout in ms (default: SESSION_TIMEOUT)
 * @returns {string} - Session token to retrieve the data
 */
export const storeInSession = (data, timeout = SESSION_TIMEOUT) => {
  const token = generateSessionToken(); 
  
  sessionStore.set(token, {
    data,
    createdAt: Date.now(),
  }); 

  // Auto cleanup
  setTimeout(() => {
    sessionStore.delete(token); 
  }, timeout); 

  return token; 
}; 

/**
 * Retrieves and immediately removes data from session store
 * This ensures data is only used once and can't be accessed again
 * @param {string} token - Session token
 * @returns {*} - Stored data or null if expired/invalid
 */
export const retrieveFromSession = (token) => {
  const session = sessionStore.get(token); 
  
  if (!session) {
    // console.warn('Invalid or expired session token'); 
    return null; 
  }

  // Check if session has expired
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessionStore.delete(token); 
    // console.warn('Session token has expired'); 
    return null; 
  }

  // Remove after retrieval (single-use)
  const data = session.data; 
  sessionStore.delete(token); 
  
  return data; 
}; 

/**
 * Clears all session data (call on logout)
 */
export const clearAllSessions = () => {
  sessionStore.clear(); 
}; 

/**
 * Safe parameter passer for navigation with sensitive data
 * Stores data in session and returns opaque reference
 * 
 * Usage:
 *   const ref = SafeParams.create({ quizId, userId }); 
 *   handleNavigate('quiz', ref);  // Pass ref in navigation
 *   
 *   // In quiz component:
 *   const data = SafeParams.retrieve(paramsRef);  // Get original data
 */
export const SafeParams = {
  /**
   * Create safe params reference
   * @param {Object} params - Parameters to store safely
   * @returns {string} - Safe reference token
   */
  create: (params) => storeInSession(params),

  /**
   * Retrieve safe params
   * @param {string} reference - Reference token from SafeParams.create
   * @returns {Object} - Original parameters or null if invalid
   */
  retrieve: (reference) => retrieveFromSession(reference),

  /**
   * Clear all stored parameters
   */
  clearAll: clearAllSessions,
}; 

/**
 * URL Query Parameter Validator
 * Validates and sanitizes query parameters to prevent injection attacks
 */
export const validateQueryParams = (params) => {
  const validated = {}; 
  const allowedParams = ['sort', 'filter', 'page', 'limit', 'search']; 

  for (const key in params) {
    if (!allowedParams.includes(key)) {
      // console.warn(`Parameter "${key}" is not allowed and has been removed`); 
      continue; 
    }

    // Sanitize string values
    let value = params[key]; 
    if (typeof value === 'string') {
      // Remove potential XSS attacks
      value = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim(); 
    }

    validated[key] = value; 
  }

  return validated; 
}; 

/**
 * Secure navigation helper that prevents sensitive data in URLs
 * Use this instead of passing IDs in URL parameters
 * 
 * @param {Function} onNavigate - Navigation callback
 * @param {string} page - Page to navigate to
 * @param {Object} params - Optional sensitive parameters to pass safely
 */
export const navigateSecurely = (onNavigate, page, params = {}) => {
  // If params provided, store them securely
  if (Object.keys(params).length > 0) {
    const ref = SafeParams.create(params); 
    // Pass params object with reference instead of URL
    onNavigate(page, { _paramsRef: ref }); 
  } else {
    onNavigate(page); 
  }
}; 

/**
 * Extract secure params from navigation params
 * 
 * @param {Object} navigationParams - Params passed to component
 * @returns {Object} - Original sensitive data or empty object
 */
export const extractSecureParams = (navigationParams = {}) => {
  if (navigationParams._paramsRef) {
    const data = SafeParams.retrieve(navigationParams._paramsRef); 
    return data || {}; 
  }
  return navigationParams; 
}; 

/**
 * Security Best Practices Documentation
 * 
 * DON'T:
 * ❌ window.location.href = `/quiz?quizId=${quizId}`
 * ❌ Pass userId, adminId, or payment IDs in URLs
 * ❌ Store session tokens in localStorage for sensitive operations
 * ❌ Pass passwords or tokens as query parameters
 * ❌ Use URL params for sensitive data like payment amounts
 * 
 * DO:
 * ✅ Use SafeParams.create() to store sensitive data
 * ✅ Keep sensitive data in component state or context
 * ✅ Pass IDs in request body (POST/PUT)
 * ✅ Use authentication tokens in Authorization header
 * ✅ Validate all data on the backend
 * ✅ Use HTTPS in production
 * ✅ Set secure cookie flags (HttpOnly, Secure, SameSite)
 * 
 * Implementation Examples:
 * 
 * 1. Navigate to Quiz with ID:
 *    Before (INSECURE):
 *      window.location.href = `/quiz?quizId=${quiz._id}`
 *    
 *    After (SECURE):
 *      navigateSecurely(onNavigate, 'quiz', { quizId: quiz._id })
 * 
 * 2. In Quiz Component:
 *    Before (INSECURE):
 *      const quizId = new URLSearchParams(window.location.search).get('quizId')
 *    
 *    After (SECURE):
 *      const { quizId } = extractSecureParams(navigationParams)
 * 
 * 3. API Requests:
 *    Before (INSECURE):
 *      fetch(`/api/quiz/${quizId}`)
 *    
 *    After (SECURE):
 *      fetch('/api/quiz/get', {
 *        method: 'POST',
 *        headers: { 'Authorization': `Bearer ${token}` },
 *        body: JSON.stringify({ quizId })
 *      })
 */

export default {
  storeInSession,
  retrieveFromSession,
  clearAllSessions,
  SafeParams,
  validateQueryParams,
  navigateSecurely,
  extractSecureParams,
}; 
