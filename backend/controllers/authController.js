const User = require('../models/user'); 
const jwt = require('jsonwebtoken'); 
const { sendWelcomeEmail } = require('../services/emailService'); 
const { generateOTP, sendOTPEmail, verifyOTP } = require('../services/otpService'); 
const { generateDeviceFingerprint, extractDeviceName } = require('../utils/deviceUtils'); 
const { OAuth2Client } = require('google-auth-library'); 

// Generate JWT Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production'; 
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '7d' }); 
  console.log('Generated token - Secret from:', process.env.JWT_SECRET ? 'ENV' : 'FALLBACK'); 
  console.log('Generated token - First 50 chars:', token.substring(0, 50)); 
  return token; 
}; 
 
// @desc    Send OTP to email for registration
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { name, email, password } = req.body; 

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' }); 
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' }); 
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' }); 
    }

    // Check if user already exists and is verified
    let user = await User.findOne({ email }); 
    if (user && user.isEmailVerified && !user.isDeleted) {
      return res.status(400).json({ message: 'User already exists with that email' }); 
    }

    // Generate OTP
    const otp = generateOTP(); 
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);  // 10 minutes

    // If user exists (whether deleted or not verified), update;  otherwise create new
    if (user) {
      user.name = name; 
      user.password = password; 
      user.otp = otp; 
      user.otpExpiry = otpExpiry; 
      // If account was deleted, mark it for reactivation during OTP verification
      if (user.isDeleted) {
        user.wasDeleted = true; 
      }
      await user.save(); 
    } else {
      user = await User.create({
        name,
        email,
        password,
        otp,
        otpExpiry,
        isEmailVerified: false,
      }); 
    }

    // Send OTP email
    await sendOTPEmail(email, name, otp); 

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email,
      otpExpiryTime: '10 minutes',
    }); 
  } catch (error) {
    console.error('Send OTP error:', error); 
    res.status(500).json({ message: error.message || 'Failed to send OTP' }); 
  }
}; 

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
exports.verifyOTPAndSignup = async (req, res, next) => {
  try {
    const { email, otp } = req.body; 

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' }); 
    }

    // Find user
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' }); 
    }

    // Verify OTP
    const otpVerification = verifyOTP(user.otp, user.otpExpiry, otp); 
    if (!otpVerification.success) {
      return res.status(400).json({ message: otpVerification.message }); 
    }

    // Clear OTP and mark email as verified
    user.otp = null; 
    user.otpExpiry = null; 
    user.isEmailVerified = true; 
    
    // If user was previously deleted, reactivate the account
    if (user.isDeleted) {
      user.isDeleted = false; 
      user.deletedAt = null; 
    }
    
    await user.save(); 

    // Generate token
    const token = generateToken(user._id); 

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, user.name).catch((err) => {
      console.error('Failed to send welcome email:', err); 
    }); 

    res.status(201).json({
      success: true,
      message: 'Email verified successfully! Account created.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    }); 
  } catch (error) {
    console.error('Verify OTP error:', error); 
    res.status(500).json({ message: error.message || 'OTP verification failed' }); 
  }
}; 

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body; 

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' }); 
    }

    // Find user
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' }); 
    }

    // Check if email is already verified and not deleted
    if (user.isEmailVerified && !user.isDeleted) {
      return res.status(400).json({ message: 'Email is already verified' }); 
    }

    // Generate new OTP
    const otp = generateOTP(); 
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);  // 10 minutes

    user.otp = otp; 
    user.otpExpiry = otpExpiry; 
    await user.save(); 

    // Send OTP email
    await sendOTPEmail(email, user.name, otp); 

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully to your email',
      email,
      otpExpiryTime: '10 minutes',
    }); 
  } catch (error) {
    console.error('Resend OTP error:', error); 
    res.status(500).json({ message: error.message || 'Failed to resend OTP' }); 
  }
}; 

// @desc    Sign up a new user - NOW REQUIRES OTP VERIFICATION
// @route   POST /api/auth/signup
// NOTE: This endpoint now redirects users to use send-otp instead
exports.signup = async (req, res, next) => {
  try {
    // Reject direct signup - users must use OTP flow
    return res.status(400).json({
      success: false,
      message: 'Direct signup is no longer allowed. Please use email verification with OTP.',
      redirectTo: '/auth/send-otp',
      instructions: 'Use POST /api/auth/send-otp with name, email, and password to start the OTP verification process.'
    }); 
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
}; 

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, userAgent, forceLogin } = req.body; 
    
    // Get IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.ip ||
                     'unknown'; 

    console.log('🔐 === LOGIN ATTEMPT ==='); 
    console.log('Email:', email); 
    console.log('User Agent received:', userAgent ? 'YES' : 'NO'); 
    console.log('Force Login:', forceLogin); 
    console.log('IP Address:', ipAddress); 
    console.log('User Agent value:', userAgent || 'EMPTY/NULL'); 

    // Validation
    if (!email || !password) {
      console.log('Missing email or password'); 
      return res.status(400).json({ message: 'Please provide email and password' }); 
    }

    // Check for user
    const user = await User.findOne({ email }); 
    if (!user) {
      console.log('User not found for email:', email); 
      return res.status(401).json({ message: 'Invalid email or password' }); 
    }
    
    console.log('User found. Checking activeDevice:'); 
    console.log('  activeDevice exists:', !!user.activeDevice); 
    if (user.activeDevice) {
      console.log('  activeDevice data:', JSON.stringify(user.activeDevice, null, 2)); 
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('Email not verified for user:', email); 
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email first.',
        redirectTo: '/auth/verify-email',
        email: email,
      }); 
    }

    // Check if account is deleted
    if (user.isDeleted) {
      console.log('Account is deleted for user:', email); 
      return res.status(403).json({
        success: false,
        message: 'Your account has been deleted and is no longer active. Please create a new account to continue.',
        redirectTo: '/auth/signup',
      }); 
    }

    // Check if account is blocked
    if (user.isBlocked) {
      console.log('Account is blocked for user:', email); 
      return res.status(403).json({
        success: false,
        message: `Your account has been blocked. Reason: ${user.blockReason || 'Not specified'}. Please contact support for more information.`,
        redirectTo: '/contact-support',
      }); 
    }

    // Check password
    const isMatch = await user.matchPassword(password); 
    if (!isMatch) {
      console.log('Password mismatch for email:', email); 
      return res.status(401).json({ message: 'Invalid email or password' }); 
    }

    // Device check - only if user has logged in before (has activeDevice)
    if (user.activeDevice && user.activeDevice.deviceId) {
      // Generate current device ID from user agent + IP address
      const currentDeviceId = generateDeviceFingerprint(userAgent || '', ipAddress); 
      const previousDeviceId = user.activeDevice.deviceId; 

      console.log('🔄 Device check:'); 
      console.log('  Current device ID:', currentDeviceId); 
      console.log('  Previous device ID:', previousDeviceId); 
      console.log('  Current IP:', ipAddress); 
      console.log('  Previous IP:', user.activeDevice.ipAddress); 
      console.log('  Force login:', forceLogin); 
      console.log('  Device IDs match:', currentDeviceId === previousDeviceId); 

      // If device is different and forceLogin is not set, ask user for confirmation
      if (currentDeviceId !== previousDeviceId && !forceLogin) {
        console.log('❌ Device mismatch detected - sending 409'); 
        return res.status(409).json({
          success: false,
          message: 'You are trying to login from a different device',
          code: 'DEVICE_MISMATCH',
          currentDevice: {
            deviceName: extractDeviceName(userAgent || ''),
            userAgent: userAgent,
            ipAddress: ipAddress,
          },
          previousDevice: {
            deviceName: user.activeDevice.deviceName,
            ipAddress: user.activeDevice.ipAddress,
            lastLoginAt: user.activeDevice.lastLoginAt,
          },
          requiresConfirmation: true,
        }); 
      }
      console.log('✅ Device check passed (same device or forced)'); 
    } else {
      console.log('📱 No previous device found - first login or new device setup'); 
    }

    // Generate token
    const token = generateToken(user._id); 
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days

    // Update active device information
    const currentDeviceId = generateDeviceFingerprint(userAgent || '', ipAddress); 
    console.log('📱 Saving device info:'); 
    console.log('  Device ID:', currentDeviceId); 
    console.log('  Device Name:', extractDeviceName(userAgent || '')); 
    console.log('  User Agent provided:', !!userAgent); 
    console.log('  IP Address:', ipAddress); 
    
    // Get the OLD session token BEFORE we update it
    const oldSessionToken = user.validSessionToken; 
    
    // If switching devices, save previous device and mark that old token should show popup
    if (user.activeDevice && user.activeDevice.deviceId && currentDeviceId !== user.activeDevice.deviceId) {
      console.log('📱 Saving previous device info before switching:'); 
      user.previousDevice = {
        deviceId: user.activeDevice.deviceId,
        deviceName: user.activeDevice.deviceName,
        userAgent: user.activeDevice.userAgent,
        ipAddress: user.activeDevice.ipAddress,
        lastLoginAt: user.activeDevice.lastLoginAt,
      }; 
      // Mark the OLD token as needing the popup (not the new token!)
      user.showLogoutPopupForToken = oldSessionToken; 
      console.log('📱 Previous device saved - popup flag set for OLD token'); 
    }
    
    user.activeDevice = {
      deviceId: currentDeviceId,
      deviceName: extractDeviceName(userAgent || ''),
      userAgent: userAgent || '',
      ipAddress: ipAddress,
      lastLoginAt: new Date(),
    }; 
    
    // Save the current session token - this invalidates all other sessions
    user.validSessionToken = token; 
    user.sessionTokenExpiry = tokenExpiry; 
    
    await user.save(); 
    console.log('✅ Device saved successfully'); 
    console.log('✅ Session token stored - all previous sessions invalidated'); 

    console.log('Login successful for email:', email); 

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    }); 
  } catch (error) {
    console.error('Login error:', error.message); 
    res.status(500).json({ message: error.message || 'Internal server error' }); 
  }
}; 

// @desc    Check if device has been logged out and needs to show popup
// @route   GET /api/auth/check-device-status
// @access  Protected
exports.checkDeviceStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Get the token from the request
    const authHeader = req.headers.authorization; 
    const currentToken = authHeader?.split(' ')[1]; 

    // Check if this specific token should show logout popup
    // Only show popup if:
    // 1. There's a logout popup token set
    // 2. The current token matches the logout popup token
    // 3. There's previous device info
    if (user.showLogoutPopupForToken && user.showLogoutPopupForToken === currentToken && user.previousDevice) {
      console.log('📱 This session (OLD token) should see logout popup - returning popup data'); 
      return res.status(200).json({
        success: true,
        hasLogoutPopup: true,
        previousDevice: user.previousDevice,
        newDevice: user.activeDevice,
        message: 'Another device logged in with your account'
      }); 
    }

    // No popup needed for this token
    if (user.showLogoutPopupForToken && user.showLogoutPopupForToken !== currentToken) {
      console.log('📱 This is a NEW session - no logout popup needed'); 
    }

    return res.status(200).json({
      success: true,
      hasLogoutPopup: false,
      message: 'No device changes detected'
    }); 
  } catch (error) {
    console.error('Check device status error:', error.message); 
    res.status(500).json({ message: error.message || 'Internal server error' }); 
  }
}; 

// @desc    Clear device logout popup after user sees it
// @route   POST /api/auth/clear-device-logout-popup
// @access  Protected
exports.clearDeviceLogoutPopup = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Get the token from the request
    const authHeader = req.headers.authorization; 
    const currentToken = authHeader?.split(' ')[1]; 

    // Only clear if this token is the one that should show the popup
    if (user.showLogoutPopupForToken === currentToken) {
      // Clear the popup flag and previous device info
      user.showLogoutPopupForToken = null; 
      user.previousDevice = {
        deviceId: null,
        deviceName: null,
        userAgent: null,
        ipAddress: null,
        lastLoginAt: null,
      }; 

      await user.save(); 
      console.log('📱 Device logout popup cleared for this token'); 

      return res.status(200).json({
        success: true,
        message: 'Popup cleared successfully'
      }); 
    }

    // This token doesn't have a popup to clear
    return res.status(200).json({
      success: true,
      message: 'No popup to clear for this token'
    }); 
  } catch (error) {
    console.error('Clear device logout popup error:', error.message); 
    res.status(500).json({ message: error.message || 'Internal server error' }); 
  }
}; 

// @desc    Google Sign-In / Sign-Up
// @desc    Google Sign-In
// @route   POST /api/auth/google-signin
// @access  Public
exports.googleSignIn = async (req, res, next) => {
  try {
    const { googleToken, userAgent } = req.body; 

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' }); 
    }

    // Verify Google JWT ID token
    let payload; 
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      }); 
      payload = ticket.getPayload(); 
    } catch (error) {
      console.error('Google token verification error:', error.message); 
      return res.status(400).json({ message: 'Invalid Google token' }); 
    }

    const googleId = payload.sub;  // 'sub' is the unique Google user ID
    const email = payload.email; 
    const name = payload.name; 

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Invalid Google user information' }); 
    }

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    }); 

    if (user) {
      // Existing user - sign them in
      // Update googleId if not already set
      if (!user.googleId) {
        user.googleId = googleId; 
        user.authProvider = 'google'; 
      }
      
      // Update last login device info
      const deviceFingerprint = generateDeviceFingerprint(userAgent); 
      const deviceName = extractDeviceName(userAgent); 

      // Generate valid session token for this device
      user.validSessionToken = generateToken(user._id); 
      user.sessionTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days

      user.activeDevice = {
        deviceId: deviceFingerprint.deviceId,
        deviceName,
        userAgent,
        ipAddress: req.ip || req.connection.remoteAddress,
        lastLoginAt: new Date(),
      }; 

      await user.save(); 

      return res.status(200).json({
        success: true,
        message: 'Google sign-in successful',
        token: user.validSessionToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionPlan: user.subscriptionPlan,
          isPremium: user.isPremium,
        },
      }); 
    }

    // New user - prepare for account creation
    // Don't create the user yet - wait for password setup first
    // Generate a temporary setup token (valid for 24 hours) to allow password creation
    const setupTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);  // 24 hours
    const setupSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production'; 
    const setupToken = jwt.sign(
      { 
        googleId, 
        email, 
        name,
        isSetupToken: true 
      }, 
      setupSecret,
      { expiresIn: '24h' }
    ); 
    console.log('Generated setupToken - Secret from:', process.env.JWT_SECRET ? 'ENV' : 'FALLBACK'); 
    console.log('Generated setupToken - First 50 chars:', setupToken.substring(0, 50)); 

    return res.status(201).json({
      success: true,
      message: 'Please set a password to complete your account setup.',
      token: setupToken,
      isNewUser: true,
      needsPasswordSetup: true,
      user: {
        name,
        email,
        subscriptionPlan: 'free',
        isPremium: false,
      },
    }); 
  } catch (error) {
    console.error('Google sign-in error:', error); 
    res.status(500).json({ message: error.message || 'Failed to process Google sign-in' }); 
  }
}; 

// @desc    Set Password for Google Users
// @route   POST /api/auth/set-password
// @access  Protected (with setup token)
exports.setPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword, userAgent } = req.body; 
    const user = req.user;  // From JWT token

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmation are required' }); 
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' }); 
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' }); 
    }

    // Check if this is a setup token (new user)
    if (user.isSetupToken) {
      // This is a new Google user - create the account now
      const { googleId, email, name } = user; 

      // Check if user already exists
      let existingUser = await User.findOne({
        $or: [{ googleId }, { email }]
      }); 

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' }); 
      }

      // Create new user
      const newUser = await User.create({
        name,
        email,
        googleId,
        googleEmail: email,
        password,
        isEmailVerified: true, // Google emails are verified
        authProvider: 'google',
        isPasswordSet: true,
        subscriptionPlan: 'free',
        isPremium: false,
      }); 

      // Generate device fingerprint and session token
      const deviceFingerprint = generateDeviceFingerprint(userAgent); 
      const deviceName = extractDeviceName(userAgent); 

      newUser.validSessionToken = generateToken(newUser._id); 
      newUser.sessionTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

      newUser.activeDevice = {
        deviceId: deviceFingerprint.deviceId,
        deviceName,
        userAgent,
        ipAddress: req.ip || req.connection.remoteAddress,
        lastLoginAt: new Date(),
      }; 

      await newUser.save(); 

      // Send welcome email
      await sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
        console.error('Failed to send welcome email:', err); 
      }); 

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token: newUser.validSessionToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          subscriptionPlan: newUser.subscriptionPlan,
          isPremium: newUser.isPremium,
        },
      }); 
    } else {
      // This is an existing user updating password
      const userId = user.id || user._id; 

      // Find user
      const existingUser = await User.findById(userId); 
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' }); 
      }

      // Check if user is from Google auth
      if (existingUser.authProvider !== 'google') {
        return res.status(400).json({ message: 'This endpoint is only for Google sign-up users' }); 
      }

      // Set password
      existingUser.password = password; 
      existingUser.isPasswordSet = true; 
      await existingUser.save(); 

      // Send confirmation email
      await sendWelcomeEmail(existingUser.email, existingUser.name).catch((err) => {
        console.error('Failed to send email:', err); 
      }); 

      return res.status(200).json({
        success: true,
        message: 'Password set successfully',
      }); 
    }
  } catch (error) {
    console.error('Set password error:', error); 
    res.status(500).json({ message: error.message || 'Failed to set password' }); 
  }
}; 