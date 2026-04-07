const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); 

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'ultimate'],
    default: 'free',
  },
  subscriptionPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: null,
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  wasDeleted: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockedAt: {
    type: Date,
    default: null,
  },
  blockReason: {
    type: String,
    default: null,
  },
  blockExpiryDate: {
    type: Date,
    default: null,
  },
  isBlockedPermanently: {
    type: Boolean,
    default: false,
  },
  subscriptionPurchaseDate: {
    type: Date,
    default: null,
  },
  freeQuizCredits: {
    type: Number,
    default: 5, // Free users get 5 quizzes per month
  },
  extraQuizCreditsGranted: {
    type: Number,
    default: 0, // Extra credits granted by admin (per month)
  },
  extraQuizCreditsGrantedMonth: {
    type: String,
    default: null, // YYYY-MM format - month when extra credits were granted
  },
  quizAttemptMonth: {
    type: String,
    default: null, // YYYY-MM format to track monthly resets
  },
  quizzesPlayedThisMonth: {
    type: Number,
    default: 0,
  },
  activeDevice: {
    deviceId: {
      type: String,
      default: null,
    },
    deviceName: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  validSessionToken: {
    type: String,
    default: null,
  },
  sessionTokenExpiry: {
    type: Date,
    default: null,
  },
  // Track previous device for showing "logged out from another device" popup
  previousDevice: {
    deviceId: {
      type: String,
      default: null,
    },
    deviceName: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  // Token of the old session that should show logout popup
  // Only that session token will receive the popup, not new sessions
  showLogoutPopupForToken: {
    type: String,
    default: null,
  },
  encryptedPassword: {
    type: String,
    default: null, // Stores encrypted plain text password for admin view
  },
  // Google OAuth fields
  googleId: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
  },
  googleEmail: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  isPasswordSet: {
    type: Boolean,
    default: true, // True for email auth, false until user sets password for Google auth
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}); 

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  
  try {
    // Store the plain password encrypted for admin view (before hashing)
    const { encryptPassword } = require('../utils/encryptionUtils'); 
    this.encryptedPassword = encryptPassword(this.password); 
    
    // Hash the password for authentication
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt); 
    next(); 
  } catch (error) {
    next(error); 
  }
}); 

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); 
}; 

module.exports = mongoose.model('User', UserSchema); 