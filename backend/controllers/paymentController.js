const Payment = require('../models/Payment'); 
const User = require('../models/user'); 
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  getSubscriptionPlans,
  validatePlanSwitch,
  calculateValidityDate,
  getPaymentDetails,
} = require('../services/razorpayService'); 
const { sendSubscriptionConfirmationEmail, sendPaymentReceiptEmail } = require('../services/emailService'); 

// Helper function to format payment method descriptions
const getPaymentMethodDescription = (method, details) => {
  const methodMap = {
    card: `${details?.card?.type ? details.card.type.toUpperCase() : 'Debit'} Card (**** ${details?.card?.last4 || 'XXXX'})`,
    upi: `UPI (${details?.vpa || 'UPI Transfer'})`,
    netbanking: 'Net Banking',
    wallet: `${details?.description || 'Digital Wallet'}`,
    emandate: 'E-Mandate',
    emi: 'EMI',
  }; 
  return methodMap[method] || `Razorpay (${method || 'Online Payment'})`; 
}; 

// Create payment order
const createPaymentOrder = async (req, res) => {
  try {
    const { planType, planName, planPrice, originalPrice, currentPlan, period, couponCode } = req.body; 
    const userId = req.user.id || req.user._id; 

    if (!planType || !planName || planPrice === undefined || !period) {
      return res.status(400).json({ message: 'Invalid plan details. Period is required.' }); 
    }

    // Get current user
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Build full plan IDs
    const fullPlanId = planType === 'free' ? 'free' : `${planType}_${period}`; 
    const currentPlanId = user.subscriptionPlan === 'free' ? 'free' : `${user.subscriptionPlan}_${user.subscriptionPeriod || 'monthly'}`; 

    // Validate plan switch
    if (currentPlanId !== fullPlanId) {
      const validation = validatePlanSwitch(currentPlanId, fullPlanId); 
      if (!validation.allowed) {
        return res.status(400).json({ 
          success: false, 
          message: validation.reason 
        }); 
      }
    }

    // Validate coupon if provided
    if (couponCode) {
      const Coupon = require('../models/Coupon'); 
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }); 

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' }); 
      }

      if (!coupon.isActive) {
        return res.status(400).json({ message: 'Coupon is no longer active' }); 
      }

      const now = new Date(); 
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return res.status(400).json({ message: 'Coupon is not yet active' }); 
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ message: 'Coupon has expired' }); 
      }

      // Check if user already redeemed this coupon
      const alreadyRedeemed = coupon.redeemedBy.some(
        (redemption) => redemption.userId.toString() === userId
      ); 

      if (alreadyRedeemed) {
        return res.status(400).json({ message: 'You have already redeemed this coupon' }); 
      }

      // Check if coupon reached max redemptions
      if (coupon.currentRedemptions >= coupon.maxRedemptions) {
        return res.status(400).json({ message: 'Coupon has reached maximum redemptions' }); 
      }

      // Check if this coupon is applicable to the selected plan
      if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
        const planLower = planType.toLowerCase(); 
        if (!coupon.applicablePlans.some(plan => plan.toLowerCase() === planLower)) {
          return res.status(400).json({ message: `This coupon is only applicable for: ${coupon.applicablePlans.join(', ')}` }); 
        }
      }

      console.log('✅ Coupon validated:', {
        couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        finalPrice: planPrice,
        applicablePlans: coupon.applicablePlans
      }); 
    }

    // Handle free plan or 100% discount
    if (planPrice <= 0) {
      console.log('Free plan change - no payment needed:', {
        planType,
        planName,
        currentPlan: currentPlanId,
        couponCode,
        userId
      }); 

      // Get coupon details to determine premium days
      let premiumDays = 30;  // Default to 30 days
      if (couponCode) {
        const Coupon = require('../models/Coupon'); 
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }); 
        if (coupon && coupon.premiumDays) {
          premiumDays = coupon.premiumDays; 
          console.log('Using coupon premiumDays:', premiumDays); 
        }
      }

      // Mark coupon as redeemed if applied
      if (couponCode) {
        const Coupon = require('../models/Coupon'); 
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }); 
        if (coupon) {
          coupon.redeemedBy.push({
            userId,
            redeemedAt: new Date(),
          }); 
          coupon.currentRedemptions += 1; 
          await coupon.save(); 
        }
      }

      // Update subscription
      user.subscriptionPlan = planType; 
      user.subscriptionPeriod = period || null; 
      user.subscriptionEndDate = calculateValidityDate(planType === 'free' ? null : premiumDays); 
      user.isPremium = planType !== 'free' && planType !== 'starter'; 
      await user.save(); 

      return res.json({
        success: true,
        message: 'Plan changed successfully - no payment required',
        freeUpgrade: true,
        planType,
        subscriptionEndDate: user.subscriptionEndDate
      }); 
    }

    // Create Razorpay order with shortened receipt (max 40 chars)
    const receipt = `order_${Date.now()}`.substring(0, 40); 
    console.log('Creating order with receipt:', receipt, 'length:', receipt.length); 
    console.log('Plan Switch:', {
      planType,
      period,
      planName,
      originalPrice: originalPrice || planPrice,
      proratedAmount: planPrice,
      currentPlan: currentPlanId,
      userId
    }); 

    const orderResult = await createRazorpayOrder(planPrice, receipt); 

    if (!orderResult.success) {
      return res.status(400).json({ message: 'Failed to create payment order' }); 
    }

    // Save payment record
    const payment = new Payment({
      userId,
      orderId: orderResult.orderId,
      amount: planPrice,
      originalAmount: originalPrice || planPrice,
      planType,
      period,
      planName,
      status: 'pending',
      currentPlan: currentPlanId,
      couponCode: couponCode || null,
      customerDetails: {
        name: user.name,
        email: user.email,
      },
    }); 

    await payment.save(); 

    res.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      proratedAmount: planPrice,
    }); 
  } catch (error) {
    console.error('Error creating payment order:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body; 
    const userId = req.user.id || req.user._id; 

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Missing payment details' }); 
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature); 

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' }); 
    }

    // Fetch payment details from Razorpay to get payment method
    const paymentDetails = await getPaymentDetails(paymentId); 
    const paymentMethod = paymentDetails?.method || 'razorpay'; 
    const paymentMethodDetails = getPaymentMethodDescription(paymentMethod, paymentDetails); 

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { paymentId, signature, status: 'success', paymentMethod, paymentMethodDetails },
      { new: true }
    ); 

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' }); 
    }

    // Get current user to check if they have existing subscription
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    // Update user subscription
    const plans = getSubscriptionPlans(); 
    const fullPlanId = `${payment.planType}_${payment.period}`; 
    const planDetails = plans[fullPlanId] || plans[payment.planType]; 
    const planDuration = planDetails?.duration; 

    // Calculate new subscription end date - Always start from today
    // New validity starts from the upgrade day (today), not extended from previous end date
    const subscriptionEndDate = calculateValidityDate(planDuration); 

    // Update user with new subscription details
    user.subscriptionPlan = payment.planType; 
    user.subscriptionPeriod = payment.period; 
    user.subscriptionStartDate = user.subscriptionStartDate || new Date(); 
    user.subscriptionEndDate = subscriptionEndDate; 
    user.isPremium = payment.planType !== 'free'; 
    await user.save(); 

    // Redeem coupon if used in this payment
    if (payment.couponCode) {
      const Coupon = require('../models/Coupon'); 
      const coupon = await Coupon.findOne({ code: payment.couponCode.toUpperCase() }); 
      if (coupon) {
        // Check if not already redeemed
        const alreadyRedeemed = coupon.redeemedBy.some(
          (redemption) => redemption.userId.toString() === userId
        ); 

        if (!alreadyRedeemed) {
          coupon.redeemedBy.push({
            userId,
            redeemedAt: new Date(),
          }); 
          coupon.currentRedemptions += 1; 
          await coupon.save(); 
          console.log('✅ Coupon redeemed:', { couponCode: payment.couponCode, userId }); 
        }
      }
    }

    // Send subscription confirmation email (non-blocking)
    sendSubscriptionConfirmationEmail(
      user.email,
      user.name,
      payment.planType,
      payment.planName,
      payment.amount,
      subscriptionEndDate
    ).catch((err) => {
      console.error('Failed to send subscription confirmation email:', err); 
      // Don't fail the payment verification if email fails
    }); 

    // Send payment receipt email (non-blocking)
    sendPaymentReceiptEmail(
      user.email,
      user.name,
      payment
    ).catch((err) => {
      console.error('Failed to send payment receipt email:', err); 
      // Don't fail the payment verification if email fails
    }); 

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment,
      subscriptionEndDate,
    }); 
  } catch (error) {
    console.error('Error verifying payment:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 }); 

    res.json({
      success: true,
      payments,
    }); 
  } catch (error) {
    console.error('Error fetching payment history:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

// Get subscription plans
const getPlans = async (req, res) => {
  try {
    const plans = getSubscriptionPlans(); 
    res.json({
      success: true,
      plans,
    }); 
  } catch (error) {
    console.error('Error fetching plans:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

// Get current subscription
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 

    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    res.json({
      success: true,
      planType: user.subscriptionPlan || 'free',
      subscriptionPeriod: user.subscriptionPeriod || 'monthly',
      isPremium: user.isPremium,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
    }); 
  } catch (error) {
    console.error('Error fetching subscription:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

// Get payment receipt
const getPaymentReceipt = async (req, res) => {
  try {
    const { orderId } = req.params; 
    const userId = req.user.id || req.user._id; 

    const payment = await Payment.findOne({ 
      orderId, 
      userId 
    }); 

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      }); 
    }

    res.json({
      success: true,
      payment: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        planType: payment.planType,
        planName: payment.planName,
        amount: payment.amount,
        period: payment.period,
        status: payment.status,
        createdAt: payment.createdAt,
        subscriptionEndDate: payment.subscriptionEndDate,
        customerDetails: payment.customerDetails,
        paymentMethod: payment.paymentMethod,
        paymentMethodDetails: payment.paymentMethodDetails,
      }
    }); 
  } catch (error) {
    console.error('Error fetching payment receipt:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  }
}; 

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 

    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      isPremium: false,
    }); 

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    }); 
  } catch (error) {
    console.error('Error cancelling subscription:', error); 
    res.status(500).json({ message: 'Internal server error' }); 
  }
}; 

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPlans,
  getCurrentSubscription,
  getPaymentReceipt,
  cancelSubscription,
};  