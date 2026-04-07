const jwt = require('jsonwebtoken'); 

// Verify admin token
const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    console.log('🔐 AdminAuth - Token provided:', !!token); 

    if (!token) {
      console.log('🔐 AdminAuth - No token in header'); 
      return res.status(401).json({ message: 'No token provided. Please login as admin.' }); 
    }

    const secret = process.env.JWT_ADMIN_SECRET || 'admin-secret-key-change-in-production'; 
    console.log('🔐 AdminAuth - Using secret from:', process.env.JWT_ADMIN_SECRET ? 'ENV (JWT_ADMIN_SECRET)' : 'FALLBACK'); 
    console.log('🔐 AdminAuth - Token first 50 chars:', token.substring(0, 50)); 
    
    const decoded = jwt.verify(token, secret); 
    console.log('🔐 AdminAuth - Token decoded successfully:', decoded); 

    if (!decoded.role || decoded.role !== 'admin') {
      console.log('🔐 AdminAuth - Invalid role:', decoded.role); 
      return res.status(403).json({ message: 'Not authorized as admin' }); 
    }

    console.log('🔐 AdminAuth - Admin verification successful for:', decoded.admin); 
    req.admin = decoded; 
    next(); 
  } catch (error) {
    console.error('🔐 AdminAuth - Error:', error.name, error.message); 
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Admin token expired. Please login again.' }); 
    }
    if (error.name === 'JsonWebTokenError') {
      console.error('🔐 AdminAuth - Token verification failed. Possible causes:'); 
      console.error('  - JWT_ADMIN_SECRET mismatch'); 
      console.error('  - Token was signed with different secret'); 
      console.error('  - Token is malformed'); 
      return res.status(401).json({ message: 'Invalid admin token' }); 
    }
    res.status(500).json({ message: 'Token verification failed' }); 
  }
}; 

module.exports = { verifyAdminToken }; 