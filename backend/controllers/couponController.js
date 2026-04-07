const Coupon = require('../models/Coupon'); 
const User = require('../models/user'); 

// @desc    Create a new coupon (Admin only)
// @route   POST /api/coupons
// @access  Protected (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxRedemptions,
      validFrom,
      validUntil,
      minPurchaseAmount,
      applicablePlans,
      premiumDays,
    } = req.body; 

    // Validation
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and discount value are required' }); 
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 0 and 100' }); 
    }

    if (discountValue < 0) {
      return res.status(400).json({ message: 'Discount value cannot be negative' }); 
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() }); 
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' }); 
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxRedemptions: maxRedemptions || 1,
      validFrom,
      validUntil,
      minPurchaseAmount: minPurchaseAmount || 0,
      applicablePlans: applicablePlans || ['basic', 'pro', 'premium'],
      premiumDays: premiumDays || 0,
      createdBy: req.admin?.admin || 'system-admin',
    }); 

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    }); 
  } catch (error) {
    console.error('Create coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to create coupon' }); 
  }
}; 

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Protected (Admin)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      coupons,
    }); 
  } catch (error) {
    console.error('Get coupons error:', error); 
    res.status(500).json({ message: error.message || 'Failed to fetch coupons' }); 
  }
}; 

// @desc    Get available coupons for users
// @route   GET /api/coupons/available
// @access  Public
exports.getAvailableCoupons = async (req, res, next) => {
  try {
    const now = new Date(); 

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    })
      .select('code description discountType discountValue minPurchaseAmount applicablePlans')
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      coupons,
    }); 
  } catch (error) {
    console.error('Get available coupons error:', error); 
    res.status(500).json({ message: error.message || 'Failed to fetch available coupons' }); 
  }
}; 

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Protected
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, planType, purchaseAmount } = req.body; 
    const userId = req.user.id; 

    if (!code || !planType || purchaseAmount === undefined) {
      return res.status(400).json({ message: 'Code, plan type, and purchase amount are required' }); 
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }); 

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' }); 
    }
 
    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is no longer active' }); 
    }

    // Check validity dates
    const now = new Date(); 
    if (now < coupon.validFrom) {
      return res.status(400).json({ message: 'Coupon is not yet valid' }); 
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({ message: 'Coupon has expired' }); 
    }

    // Check if coupon is applicable for this plan
    if (!coupon.applicablePlans.includes(planType)) {
      return res.status(400).json({
        message: `Coupon is not applicable for ${planType} plan`,
      }); 
    }

    // Check minimum purchase amount
    if (purchaseAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`,
      }); 
    }

    // Check if coupon has reached max redemptions
    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({ message: 'Coupon has reached maximum redemptions' }); 
    }

    // Check if user has already redeemed this coupon
    const alreadyRedeemed = coupon.redeemedBy.some(
      (redemption) => redemption.userId.toString() === userId
    ); 

    if (alreadyRedeemed) {
      return res.status(400).json({ message: 'You have already redeemed this coupon' }); 
    }

    // Calculate discount
    let discount = 0; 
    if (coupon.discountType === 'percentage') {
      discount = (purchaseAmount * coupon.discountValue) / 100; 
    } else {
      discount = coupon.discountValue; 
    }

    // Ensure discount doesn't exceed purchase amount
    discount = Math.min(discount, purchaseAmount); 

    const finalAmount = purchaseAmount - discount; 

    res.status(200).json({
      success: true,
      message: 'Coupon validated successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        originalAmount: purchaseAmount,
        finalAmount,
      },
    }); 
  } catch (error) {
    console.error('Validate coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to validate coupon' }); 
  }
}; 

// @desc    Redeem coupon (after successful payment)
// @route   POST /api/coupons/redeem
// @access  Protected
exports.redeemCoupon = async (req, res, next) => {
  try {
    const { code } = req.body; 
    const userId = req.user.id; 

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' }); 
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }); 

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' }); 
    }

    // Check if user has already redeemed this coupon
    const alreadyRedeemed = coupon.redeemedBy.some(
      (redemption) => redemption.userId.toString() === userId
    ); 

    if (alreadyRedeemed) {
      return res.status(400).json({ message: 'You have already redeemed this coupon' }); 
    }

    // Check if coupon has reached max redemptions
    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({ message: 'Coupon has reached maximum redemptions' }); 
    }

    // Add user to redeemedBy array
    coupon.redeemedBy.push({
      userId,
      redeemedAt: new Date(),
    }); 

    coupon.currentRedemptions += 1; 

    await coupon.save(); 

    res.status(200).json({
      success: true,
      message: 'Coupon redeemed successfully',
    }); 
  } catch (error) {
    console.error('Redeem coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to redeem coupon' }); 
  }
}; 

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Protected (Admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const updates = req.body; 

    // Don't allow updating certain fields
    delete updates.redeemedBy; 
    delete updates.currentRedemptions; 
    delete updates.createdBy; 

    const coupon = await Coupon.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }); 

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' }); 
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    }); 
  } catch (error) {
    console.error('Update coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to update coupon' }); 
  }
}; 

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Protected (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params; 

    const coupon = await Coupon.findByIdAndDelete(id); 

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' }); 
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    }); 
  } catch (error) {
    console.error('Delete coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to delete coupon' }); 
  }
}; 

// @desc    Get coupon details by code
// @route   GET /api/coupons/:code
// @access  Public
exports.getCouponByCode = async (req, res, next) => {
  try {
    const { code } = req.params; 

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .select('code description discountType discountValue minPurchaseAmount applicablePlans'); 

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' }); 
    }

    res.status(200).json({
      success: true,
      coupon,
    }); 
  } catch (error) {
    console.error('Get coupon error:', error); 
    res.status(500).json({ message: error.message || 'Failed to fetch coupon' }); 
  }
}; 