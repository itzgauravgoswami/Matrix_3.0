const mongoose = require('mongoose'); 

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxRedemptions: {
      type: Number,
      default: 1, // By default, each coupon can be used only once
    },
    currentRedemptions: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    applicablePlans: {
      type: [String], // e.g., ['basic', 'pro', 'premium']
      default: ['basic', 'pro', 'premium'],
    },
    premiumDays: {
      type: Number,
      description: 'Number of premium days to grant with this coupon (0 means use plan default)',
      default: 0,
    },
    redeemedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: String, // Admin email
      default: 'system-admin',
    },
  },
  { timestamps: true }
); 

// Index for faster queries
couponSchema.index({ code: 1 }); 
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 }); 

module.exports = mongoose.model('Coupon', couponSchema); 