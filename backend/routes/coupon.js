const express = require('express'); 
const {
  createCoupon,
  getAllCoupons,
  getAvailableCoupons,
  validateCoupon,
  redeemCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
} = require('../controllers/couponController'); 
const auth = require('../middleware/auth'); 
const { verifyAdminToken } = require('../middleware/adminAuth'); 

const router = express.Router(); 

// Specific routes first (must come before parameterized routes)
router.get('/available', getAvailableCoupons);  // Get available coupons (public)
router.post('/validate', auth, validateCoupon);  // Validate coupon
router.post('/redeem', auth, redeemCoupon);  // Redeem coupon

// Admin routes (admin token only, no user auth needed)
router.post('/', verifyAdminToken, createCoupon);  // Create coupon
router.get('/', verifyAdminToken, getAllCoupons);  // Get all coupons
router.put('/:id', verifyAdminToken, updateCoupon);  // Update coupon
router.delete('/:id', verifyAdminToken, deleteCoupon);  // Delete coupon

// Parameterized routes last
router.get('/:code', getCouponByCode);  // Get coupon by code (public)

module.exports = router; 