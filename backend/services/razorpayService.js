const crypto = require('crypto'); 
const Razorpay = require('razorpay'); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}); 

// Create Razorpay order
const createRazorpayOrder = async (amount, receipt) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
    }; 

    const order = await razorpay.orders.create(options); 
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }; 
  } catch (error) {
    console.error('Error creating Razorpay order:', error); 
    return {
      success: false,
      error: error.message,
    }; 
  }
}; 

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = `${orderId}|${paymentId}`; 
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex'); 

    return signature === expectedSignature; 
  } catch (error) {
    console.error('Error verifying signature:', error); 
    return false; 
  }
}; 

// Fetch payment details from Razorpay
const getPaymentDetails = async (paymentId) => {
  try {
    if (!paymentId) return null; 
    const payment = await razorpay.payments.fetch(paymentId); 
    return {
      method: payment.method, // 'card', 'upi', 'netbanking', 'wallet', etc.
      description: payment.description,
      email: payment.email,
      contact: payment.contact,
      vpa: payment.vpa, // For UPI
      card: payment.card, // Card details if available
    }; 
  } catch (error) {
    console.error('Error fetching payment details from Razorpay:', error); 
    return null; 
  }
}; 

// Get subscription plans
const getSubscriptionPlans = () => {
  return {
    free: {
      name: 'Free',
      price: 0,
      duration: null,
      features: ['5 Quizzes/month', 'Basic Progress Tracking', 'Community Support'],
    },
    pro_monthly: {
      name: 'Pro',
      price: 299,
      duration: 30, // 30 days
      period: 'monthly',
      features: ['Unlimited Quizzes', 'Daily AI Tests', 'Analytics Dashboard', 'Priority Support'],
    },
    pro_yearly: {
      name: 'Pro',
      price: 2999,
      duration: 365, // 365 days
      period: 'yearly',
      features: ['Unlimited Quizzes', 'Daily AI Tests', 'Analytics Dashboard', 'Priority Support'],
    },
    ultimate_monthly: {
      name: 'Ultimate',
      price: 999,
      duration: 30, // 30 days
      period: 'monthly',
      features: ['AI Tutoring', 'Custom Study Plans', 'Mock Exams', '1-on-1 Mentoring'],
    },
    ultimate_yearly: {
      name: 'Ultimate',
      price: 9999,
      duration: 365, // 365 days
      period: 'yearly',
      features: ['AI Tutoring', 'Custom Study Plans', 'Mock Exams', '1-on-1 Mentoring'],
    },
  }; 
}; 

// Get plan validation rules
const getPlanValidationRules = () => {
  return {
    // Can upgrade but not downgrade
    free: {
      canUpgradeTo: ['pro_monthly', 'pro_yearly', 'ultimate_monthly', 'ultimate_yearly'],
      canDowngradeTo: [],
    },
    pro_monthly: {
      // Pro Monthly users can upgrade to any plan except Free
      canUpgradeTo: ['pro_yearly', 'ultimate_monthly', 'ultimate_yearly'],
      canDowngradeTo: [],
    },
    pro_yearly: {
      // Pro Yearly users can only upgrade to Ultimate Yearly (cannot switch back to monthly)
      canUpgradeTo: ['ultimate_yearly'],
      canDowngradeTo: [],
    },
    ultimate_monthly: {
      // Ultimate Monthly can switch to Pro Yearly or upgrade to Ultimate Yearly
      canUpgradeTo: ['pro_yearly', 'ultimate_yearly'],
      canDowngradeTo: [],
    },
    ultimate_yearly: {
      // Ultimate Yearly is the highest tier
      canUpgradeTo: [],
      canDowngradeTo: [],
    },
  }; 
}; 

// Validate plan switch
const validatePlanSwitch = (currentPlan, newPlan) => {
  const rules = getPlanValidationRules(); 
  const currentRules = rules[currentPlan] || { canUpgradeTo: [], canDowngradeTo: [] }; 
  
  if (!currentRules.canUpgradeTo.includes(newPlan) && !currentRules.canDowngradeTo.includes(newPlan)) {
    return {
      allowed: false,
      reason: `Cannot switch from ${currentPlan} to ${newPlan}. You can only upgrade or maintain your current plan level.`
    }; 
  }
  
  return { allowed: true, reason: 'Plan switch allowed' }; 
}; 

// Calculate subscription validity date
const calculateValidityDate = (durationDays) => {
  if (!durationDays) return null; 
  const date = new Date(); 
  date.setDate(date.getDate() + durationDays); 
  return date; 
}; 

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  getSubscriptionPlans,
  getPlanValidationRules,
  validatePlanSwitch,
  calculateValidityDate,
}; 
