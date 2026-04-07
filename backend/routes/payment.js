const express = require('express'); 
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPlans,
  getCurrentSubscription,
  getPaymentReceipt,
  cancelSubscription,
} = require('../controllers/paymentController'); 
const auth = require('../middleware/auth'); 

const router = express.Router(); 

// Create payment order
router.post('/create-order', auth, createPaymentOrder); 

// Verify payment
router.post('/verify-payment', auth, verifyPayment); 

// Get payment history
router.get('/history', auth, getPaymentHistory); 

// Get payment receipt
router.get('/receipt/:orderId', auth, getPaymentReceipt); 

// Get subscription plans
router.get('/plans', getPlans); 

// Get current subscription
router.get('/subscription', auth, getCurrentSubscription); 

// Cancel subscription
router.post('/cancel-subscription', auth, cancelSubscription); 

module.exports = router; 
