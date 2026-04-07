import React, { createContext, useContext, useState, useEffect } from 'react'; 
import { login as loginAPI, signup as signupAPI, getUserProfile, checkDeviceStatus, clearDeviceLogoutPopup } from '../services/api'; 

const AuthContext = createContext(); 

export const useAuth = () => {
  const context = useContext(AuthContext); 
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); 
  }
  return context; 
}; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [deviceMismatchData, setDeviceMismatchData] = useState(null); 
  const [loginCredentials, setLoginCredentials] = useState(null); 
  const [deviceLogoutData, setDeviceLogoutData] = useState(null);  // For showing logout popup on old device

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken'); 
    const userData = localStorage.getItem('user'); 
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData)); 
        setIsAuthenticated(true); 
      } catch (err) {
        // console.error('Error parsing user data:', err); 
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('user'); 
      }
    }
    setLoading(false); 
  }, []); 

  // Poll for device logout status when authenticated
  useEffect(() => {
    if (!isAuthenticated) return; 

    const pollDeviceStatus = async () => {
      try {
        const response = await checkDeviceStatus(); 
        if (response.success && response.hasLogoutPopup) {
          // console.log('📱 Device logout detected - showing popup'); 
          setDeviceLogoutData({
            currentDevice: response.previousDevice, // This device being logged out
            newDevice: response.newDevice,          // New device logged in
          }); 
        }
      } catch (error) {
        // console.error('Error checking device status:', error); 
      }
    }; 

    // Poll every 3 seconds while authenticated
    const interval = setInterval(pollDeviceStatus, 3000); 

    return () => clearInterval(interval); 
  }, [isAuthenticated]); 

  const login = async (email, password, forceLogin = false) => {
    try {
      setLoading(true); 
      // console.log('AuthContext.login called with forceLogin:', forceLogin); 
      const response = await loginAPI(email, password, forceLogin); 
      
      // console.log('Login Response in AuthContext:', response); 
      // console.log('Response code:', response.code); 
      // console.log('Response requiresConfirmation:', response.requiresConfirmation); 
      
      // Handle device mismatch
      if (response.code === 'DEVICE_MISMATCH' && response.requiresConfirmation) {
        // console.log('Detected device mismatch - showing confirmation modal'); 
        // Save login credentials and show device confirmation modal
        setLoginCredentials({ email, password }); 
        setDeviceMismatchData({
          currentDevice: response.currentDevice,
          previousDevice: response.previousDevice,
        }); 
        return { 
          success: false, 
          code: 'DEVICE_MISMATCH',
          currentDevice: response.currentDevice,
          previousDevice: response.previousDevice,
          requiresConfirmation: true,
        }; 
      }
      
      if (response.success) {
        const userData = {
          id: response.user?.id,
          name: response.user?.name,
          email: response.user?.email,
          avatar: response.user?.avatar,
        }; 
        
        // console.log('Token received:', response.token); 
        localStorage.setItem('authToken', response.token); 
        localStorage.setItem('user', JSON.stringify(userData)); 
        
        setUser(userData); 
        setIsAuthenticated(true); 
        setDeviceMismatchData(null); 
        setLoginCredentials(null); 
        return { success: true }; 
      } else {
        return { success: false, error: response.message || 'Login failed' }; 
      }
    } catch (error) {
      // console.error('Login error:', error); 
      return { success: false, error: error.message || 'An error occurred during login' }; 
    } finally {
      setLoading(false); 
    }
  }; 

  const confirmDeviceLogin = async (forceLogin) => {
    if (forceLogin && loginCredentials) {
      // Retry login with forceLogin = true
      return login(loginCredentials.email, loginCredentials.password, true); 
    } else {
      // Clear the device mismatch data to cancel login
      setDeviceMismatchData(null); 
      setLoginCredentials(null); 
      return { success: false }; 
    }
  }; 

  const handleDeviceLogout = async () => {
    try {
      // Clear the logout popup flag on backend
      await clearDeviceLogoutPopup(); 
      // console.log('📱 Device logout popup cleared on backend'); 
    } catch (error) {
      // console.error('Error clearing logout popup:', error); 
    }
    
    // Logout the current user
    logout(); 
  }; 

  const dismissDeviceLogout = async () => {
    try {
      // Clear the logout popup flag on backend without logging out
      await clearDeviceLogoutPopup(); 
      // console.log('📱 Device logout popup dismissed'); 
    } catch (error) {
      // console.error('Error dismissing logout popup:', error); 
    }
    
    // Just close the popup without logging out
    setDeviceLogoutData(null); 
  }; 

  const signup = async (name, email, password) => {
    try {
      setLoading(true); 
      const response = await signupAPI(name, email, password); 
      
      // console.log('Signup Response:', response); 
      
      if (response.success) {
        const userData = {
          id: response.user?.id,
          name: response.user?.name,
          email: response.user?.email,
          avatar: response.user?.avatar,
        }; 
        
        // console.log('Token received:', response.token); 
        localStorage.setItem('authToken', response.token); 
        localStorage.setItem('user', JSON.stringify(userData)); 
        
        setUser(userData); 
        setIsAuthenticated(true); 
        return { success: true }; 
      } else {
        return { success: false, error: response.message || 'Signup failed' }; 
      }
    } catch (error) {
      // console.error('Signup error:', error); 
      return { success: false, error: error.message || 'An error occurred during signup' }; 
    } finally {
      setLoading(false); 
    }
  }; 

  const logout = () => {
    // console.log('Logging out...'); 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
    setUser(null); 
    setIsAuthenticated(false); 
    setDeviceLogoutData(null); 
    // console.log('Logout complete'); 
  }; 

  const updateProfile = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData }; 
      localStorage.setItem('user', JSON.stringify(updatedUser)); 
      setUser(updatedUser); 
      return { success: true }; 
    } catch (error) {
      // console.error('Update profile error:', error); 
      return { success: false, error: error.message }; 
    }
  }; 

  // Refresh user subscription status from backend
  const refreshUserData = async () => {
    try {
      const response = await getUserProfile(); 
      if (response.success) {
        const updatedUser = {
          ...user,
          subscriptionPlan: response.user?.subscriptionPlan || 'free',
          subscriptionPeriod: response.user?.subscriptionPeriod,
          subscriptionStartDate: response.user?.subscriptionStartDate,
          subscriptionEndDate: response.user?.subscriptionEndDate,
          isPremium: response.user?.isPremium || false,
        }; 
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
        setUser(updatedUser); 
        return { success: true, user: updatedUser }; 
      }
      return { success: false, error: 'Failed to fetch profile' }; 
    } catch (error) {
      // console.error('Refresh user data error:', error); 
      return { success: false, error: error.message }; 
    }
  }; 

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    refreshUserData,
    deviceMismatchData,
    confirmDeviceLogin,
    deviceLogoutData,
    handleDeviceLogout,
    dismissDeviceLogout,
  }; 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  ); 
}; 
