const nodemailer = require('nodemailer'); 
const { getEmailTemplate } = require('../utils/emailTemplate'); 

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}); 

// Log email configuration
console.log('📧 OTP Service Initializing...'); 
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ NOT SET'); 
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ NOT SET'); 

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}; 

// Send OTP email
const sendOTPEmail = async (userEmail, userName, otp) => {
  try {
    console.log(`📧 Sending OTP to ${userEmail}...`); 
    
    const otpMessage = `Your email verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes. Please enter this code in the verification field to complete your registration.\n\nIf you didn't request this code, you can safely ignore this email.`; 
    
    const htmlContent = getEmailTemplate(
      userName,
      '🔐 Email Verification Code',
      otpMessage,
      'verification'
    ); 

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🔐 Your Self Ranker Email Verification Code',
      html: htmlContent,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('✅ OTP email sent successfully:', info.messageId); 
    return true; 
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message); 
    throw new Error(`Email send failed: ${error.message}`); 
  }
}; 

// Verify OTP
const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  if (!storedOTP || !storedExpiry) {
    return { success: false, message: 'No OTP found' }; 
  }

  if (new Date() > storedExpiry) {
    return { success: false, message: 'OTP has expired' }; 
  }

  if (storedOTP !== providedOTP) {
    return { success: false, message: 'Invalid OTP' }; 
  }

  return { success: true, message: 'OTP verified successfully' }; 
}; 

module.exports = {
  generateOTP,
  sendOTPEmail,
  verifyOTP,
}; 
