const express = require('express'); 
const { signup, login, sendOTP, verifyOTPAndSignup, resendOTP, checkDeviceStatus, clearDeviceLogoutPopup, googleSignIn, setPassword } = require('../controllers/authController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// New OTP-based registration flow
router.post('/send-otp', sendOTP); 
router.post('/verify-otp', verifyOTPAndSignup); 
router.post('/resend-otp', resendOTP); 

// Legacy endpoints (kept for backward compatibility)
router.post('/signup', signup); 
router.post('/login', login); 

// Google OAuth endpoints
router.post('/google-signin', googleSignIn); 
router.post('/set-password', auth, setPassword); 

// Device-related endpoints
router.get('/check-device-status', auth, checkDeviceStatus); 
router.post('/clear-device-logout-popup', auth, clearDeviceLogoutPopup); 

module.exports = router; 