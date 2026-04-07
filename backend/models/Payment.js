const mongoose = require('mongoose'); 

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      default: null,
    },
    currentPlan: {
      type: String,
      default: 'free',
    },
    planType: {
      type: String,
      enum: ['free', 'pro', 'ultimate'],
      default: 'free',
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    planName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },
    customerDetails: {
      name: String,
      email: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      default: 'razorpay',
      enum: ['razorpay', 'debit_card', 'credit_card', 'upi', 'netbanking', 'wallet'],
    },
    paymentMethodDetails: {
      type: String,
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
); 

module.exports = mongoose.model('Payment', paymentSchema); 