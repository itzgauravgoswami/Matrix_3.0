const crypto = require('crypto'); 

// Use a secret key from environment or create a default one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-in-production-32chars'; 
const ALGORITHM = 'aes-256-cbc'; 

// Ensure key is 32 bytes for aes-256
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(); 

/**
 * Encrypt a string (like password)
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV
 */
const encryptPassword = (text) => {
  try {
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv); 
    let encrypted = cipher.update(text, 'utf-8', 'hex'); 
    encrypted += cipher.final('hex'); 
    // Return iv + encrypted text separated by ':'
    return iv.toString('hex') + ':' + encrypted; 
  } catch (error) {
    console.error('Encryption error:', error); 
    return null; 
  }
}; 

/**
 * Decrypt a string (like password)
 * @param {string} encryptedText - Encrypted text with IV
 * @returns {string} - Decrypted text
 */
const decryptPassword = (encryptedText) => {
  try {
    const parts = encryptedText.split(':'); 
    if (parts.length !== 2) {
      console.error('Invalid encrypted text format'); 
      return null; 
    }
    
    const iv = Buffer.from(parts[0], 'hex'); 
    const encrypted = parts[1]; 
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv); 
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8'); 
    decrypted += decipher.final('utf-8'); 
    return decrypted; 
  } catch (error) {
    console.error('Decryption error:', error); 
    return null; 
  }
}; 

module.exports = {
  encryptPassword,
  decryptPassword,
}; 