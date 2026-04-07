const crypto = require('crypto'); 

/**
 * Generate a device fingerprint based on user agent and IP address
 * @param {string} userAgent - Browser user agent string
 * @param {string} ipAddress - Client IP address
 * @returns {string} - Device fingerprint hash
 */
const generateDeviceFingerprint = (userAgent, ipAddress) => {
  if (!userAgent && !ipAddress) {
    return crypto.randomBytes(16).toString('hex'); 
  }
  
  // Create a hash from user agent + IP address combination
  const combined = `${userAgent || 'unknown'}_${ipAddress || 'unknown'}`; 
  return crypto
    .createHash('sha256')
    .update(combined)
    .digest('hex')
    .substring(0, 16); 
}; 

/**
 * Extract device name from user agent
 * @param {string} userAgent - Browser user agent string
 * @returns {string} - Device name
 */
const extractDeviceName = (userAgent) => {
  if (!userAgent) return 'Unknown Device'; 

  // Check for common patterns
  if (/mobile|android/i.test(userAgent)) {
    if (/iPhone/.test(userAgent)) return 'iPhone'; 
    if (/iPad/.test(userAgent)) return 'iPad'; 
    if (/Android/.test(userAgent)) return 'Android Phone'; 
    return 'Mobile Device'; 
  }

  if (/windows/i.test(userAgent)) return 'Windows PC'; 
  if (/macintosh|mac os x/i.test(userAgent)) return 'Mac'; 
  if (/linux/i.test(userAgent)) return 'Linux'; 
  
  return 'Unknown Device'; 
}; 

module.exports = {
  generateDeviceFingerprint,
  extractDeviceName,
}; 
