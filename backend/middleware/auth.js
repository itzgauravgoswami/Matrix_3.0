const jwt = require('jsonwebtoken'); 
const User = require('../models/user'); 

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; 
    console.log('Authorization Header:', authHeader ? 'PROVIDED' : 'MISSING'); 
    console.log('Path:', req.path, 'Method:', req.method); 
    
    const token = authHeader?.split(' ')[1]; 

    if (!token) {
      console.log('No token extracted from header'); 
      return res.status(401).json({ message: 'No token provided' }); 
    }

    console.log('Token length:', token.length); 
    console.log('Token first 50 chars:', token.substring(0, 50)); 
    console.log('Token found, verifying...'); 
    const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production'; 
    console.log('Using secret:', process.env.JWT_SECRET ? 'FROM ENV' : 'FALLBACK SECRET'); 
    console.log('Secret length:', secret.length); 
    
    const decoded = jwt.verify(token, secret); 
    console.log('Token verified, decoded:', JSON.stringify(decoded)); 
    
    // Check if this is a setup token (for new Google users)
    if (decoded.isSetupToken) {
      console.log('Setup token detected for:', decoded.email); 
      // For setup tokens, allow the request without checking database
      req.user = decoded; 
      next(); 
      return; 
    }
    
    // Fetch user details from database
    console.log('Fetching user with ID:', decoded.id); 
    const user = await User.findById(decoded.id); 
    
    if (!user) {
      console.log('User not found in database for ID:', decoded.id); 
      return res.status(401).json({ message: 'User not found' }); 
    }

    // Check if this token is still valid (not invalidated by new login)
    // BUT: Allow requests if this token has a pending logout popup (old device)
    if (user.validSessionToken && user.validSessionToken !== token) {
      // Check if this old token should see the logout popup
      const hasLogoutPopupPending = user.showLogoutPopupForToken === token; 
      
      if (hasLogoutPopupPending) {
        // Old device with pending logout popup - ALLOW request so popup can be shown
        console.log('📱 Old session detected - has pending logout popup - allowing request'); 
        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
        }; 
        next(); 
        return; 
      }
      
      // Token is invalid and no pending popup - logout immediately
      console.log('Session invalidated - user logged in from another device'); 
      return res.status(401).json({ 
        message: 'Your session has been invalidated. You logged in from another device.',
        code: 'SESSION_INVALIDATED'
      }); 
    }

    // Check if session token has expired
    if (user.sessionTokenExpiry && new Date() > user.sessionTokenExpiry) {
      console.log('Session token expired'); 
      return res.status(401).json({ message: 'Session expired' }); 
    }

    console.log('User found:', user.email); 
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    }; 
    next(); 
  } catch (error) {
    console.error('Auth middleware error:', error.message, error.stack); 
    res.status(401).json({ message: 'Invalid or expired token', error: error.message }); 
  }
}; 

module.exports = auth; 