import React, { useState, useEffect } from 'react'; 
import { Check, Zap, Loader } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
import PaymentSuccess from './PaymentSuccess'; 
import CouponModal from './CouponModal'; 
import { formatDateToDDMMYYYY } from '../utils/dateFormatter'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

export default function PricingSection({ onNavigate }) {
  const { isAuthenticated, user, refreshUserData } = useAuth(); 
  const [billingCycle, setBillingCycle] = useState('monthly'); 
  const [loading, setLoading] = useState(false); 
  const [paymentSuccess, setPaymentSuccess] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [currentPlan, setCurrentPlan] = useState(null); 
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null); 
  const [subscriptionPeriod, setSubscriptionPeriod] = useState(null); 
  const [successOrderData, setSuccessOrderData] = useState(null); 
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [couponModalOpen, setCouponModalOpen] = useState(false); 
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState(null); 
  const [proceedWithoutCoupon, setProceedWithoutCoupon] = useState(false); 
  const [appliedCouponForPlan, setAppliedCouponForPlan] = useState(null);  // Track which plan the coupon is for

  // Fetch current subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated) return; 
      
      try {
        const response = await fetch(`${API_BASE_URL}/payments/subscription`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        if (data.success) {
          setCurrentPlan(data.planType); 
          setSubscriptionEndDate(data.subscriptionEndDate); 
          setSubscriptionPeriod(data.subscriptionPeriod); 
          
          // If user is on yearly plan, set billing cycle to yearly
          if (data.subscriptionPeriod === 'yearly') {
            setBillingCycle('yearly'); 
          }
        }
      } catch (error) {
        // console.error('Error fetching subscription:', error); 
      }
    }; 

    fetchSubscription(); 
  }, [isAuthenticated]); 

  // Handle proceed without coupon
  useEffect(() => {
    if (proceedWithoutCoupon && selectedPlanForCoupon) {
      // Trigger payment flow without coupon
      processPaymentWithCoupon(selectedPlanForCoupon.name); 
      setProceedWithoutCoupon(false); 
    }
  }, [proceedWithoutCoupon]); 

  // Function to get filtered plans based on current subscription
  const getFilteredPlans = (allPlans) => {
    if (!isAuthenticated || !currentPlan || currentPlan === 'free') {
      return allPlans; 
    }

    let filteredPlans = [...allPlans]; 

    // Hide free plan for any paid user
    filteredPlans = filteredPlans.filter(plan => plan.id !== 'free'); 

    // If user has ultimate plan, also hide pro plans
    // EXCEPT Pro Yearly for Ultimate Monthly users (they can switch to it)
    if (currentPlan === 'ultimate') {
      filteredPlans = filteredPlans.filter(plan => {
        // Allow Pro Yearly for Ultimate Monthly users
        if (plan.id === 'pro' && subscriptionPeriod === 'monthly') {
          return plan.period === '/year'; 
        }
        // Hide all other Pro plans for Ultimate users
        return plan.id !== 'pro'; 
      }); 
    }

    // If user is on a yearly plan, hide monthly versions of plans
    if (subscriptionPeriod === 'yearly' && subscriptionEndDate) {
      const today = new Date(); 
      const endDate = new Date(subscriptionEndDate); 
      
      // Only hide monthly plans if the yearly subscription is still active
      if (endDate > today) {
        filteredPlans = filteredPlans.filter(plan => plan.name === 'Starter' || plan.period === '/year' || plan.period === ''); 
      }
    }

    // If user is on Pro Monthly, show all upgrade options (Pro Yearly, Ultimate Monthly, Ultimate Yearly)
    // No additional filtering needed as all options are relevant for upgrade

    return filteredPlans; 
  }; 

  // Calculate prorated amount using the formula:
  // prorated price = ultimate plan - pro plan - (0.37 * No of days of used plans)
  const calculateProratedAmount = (newPlanAmount, currentPlanAmount = 0) => {
    if (currentPlan === 'free') {
      return newPlanAmount; 
    }

    // Calculate number of days used
    let daysUsed = 0; 
    if (subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate); 
      const today = new Date(); 
      const timeDiff = endDate.getTime() - today.getTime(); 
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      // Days used in current month = 30 - days remaining (approximately)
      daysUsed = Math.max(0, 30 - daysRemaining); 
    }

    // Apply the formula: ultimate plan - pro plan - (0.37 * days used)
    // Pro = 11, Ultimate = 21
    const ultimatePlan = 21; 
    const proPlan = 11; 
    const proratedAmount = (ultimatePlan - proPlan) - (0.37 * daysUsed); 

    // console.log('Prorated calculation:', {
    //   newPlanAmount,
    //   currentPlanAmount,
    //   daysUsed,
    //   ultimatePlan,
    //   proPlan,
    //   proratedAmount,
    //   currentPlan,
    //   subscriptionPeriod
    // }); 

    return Math.max(0, Math.round(proratedAmount)); 
  }; 

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script'); 
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'; 
      script.onload = () => resolve(true); 
      script.onerror = () => resolve(false); 
      document.body.appendChild(script); 
    }); 
  }; 

  const handlePayment = async (planName, amount) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      onNavigate?.('signup'); 
      return; 
    }

    // Free plan - no payment needed
    if (amount === 0) {
      return; 
    }

    // Clear coupon if switching to a different plan
    if (appliedCoupon && appliedCouponForPlan !== planName) {
      setAppliedCoupon(null); 
      setAppliedCouponForPlan(null); 
    }

    // Open coupon modal for the user to apply a coupon
    setSelectedPlanForCoupon({ name: planName, amount }); 
    setCouponModalOpen(true); 
  }; 

  const handleCouponApplied = (couponData) => {
    if (!couponData) {
      // Continue without coupon - proceed with regular payment
      setProceedWithoutCoupon(true); 
      setAppliedCoupon(null); 
      return; 
    }

    // Store coupon details with pricing info AND the plan it's for
    setAppliedCoupon({
      coupon: couponData.coupon,
      originalPrice: couponData.originalPrice,
      discountedPrice: couponData.discountedPrice,
      discount: couponData.discount,
      discountPercentage: couponData.discountPercentage,
    }); 
    
    // Store which plan this coupon is applied to
    setAppliedCouponForPlan(selectedPlanForCoupon.name); 

    // If 100% discount, automatically grant access
    if (couponData.discountedPrice === 0) {
      handleFreeOrDiscountedPlan(selectedPlanForCoupon.name, couponData.coupon.code); 
    }
  }; 

  const handleFreeOrDiscountedPlan = async (planName, couponCode = null) => {
    try {
      setLoading(true); 

      const token = localStorage.getItem('authToken'); 

      // Create order with coupon
      const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: planName.toLowerCase(),
          planName: planName,
          planPrice: 0, // Free/fully discounted plan
          originalPrice: selectedPlanForCoupon.amount,
          currentPlan,
          period: 'monthly',
          couponCode: couponCode, // Include coupon code if applied
          isFreeUpgrade: true,
        }),
      }); 

      const orderData = await orderResponse.json(); 

      if (!orderResponse.ok) {
        alert(orderData.message || 'Failed to grant plan access'); 
        setLoading(false); 
        return; 
      }

      // Refresh user data to get updated subscription status
      await refreshUserData(); 
      
      // Update local state
      setCurrentPlan(orderData.planType || planName.toLowerCase()); 
      setAppliedCoupon(null); 
      setAppliedCouponForPlan(null); 
      setCouponModalOpen(false); 
      setSelectedPlanForCoupon(null); 

      // Show success message
      setSuccessMessage(`Congratulations! You've been granted ${planName} plan access!`); 
      setPaymentSuccess(true); 

      setTimeout(() => {
        setPaymentSuccess(false); 
      }, 5000); 

      setLoading(false); 
    } catch (error) {
      console.error('Error granting plan access:', error); 
      alert('Failed to grant plan access. Please try again.'); 
      setLoading(false); 
    }
  }; 

  const processPaymentWithCoupon = async (planName) => {
    if (!selectedPlanForCoupon) {
      alert('Plan not selected. Please try again.'); 
      return; 
    }

    try {
      setLoading(true); 

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript(); 
      if (!scriptLoaded) {
        alert('Failed to load payment gateway'); 
        setLoading(false); 
        return; 
      }

      // Calculate prorated amount if upgrading
      const planAmountMap = {
        'free': 0,
        'pro': 11,
        'ultimate': 21,
        'starter': 0
      }; 
      const currentPlanAmount = planAmountMap[currentPlan] || 0; 
      
      // Use discounted price if coupon applied, otherwise original price
      const finalPrice = appliedCoupon ? appliedCoupon.discountedPrice : selectedPlanForCoupon.amount; 
      const proratedAmount = calculateProratedAmount(finalPrice, currentPlanAmount); 

      const token = localStorage.getItem('authToken'); 

      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: planName.toLowerCase(),
          planName: planName,
          planPrice: proratedAmount,
          originalPrice: selectedPlanForCoupon.amount,
          currentPlan,
          period: 'monthly',
          couponCode: appliedCoupon?.coupon.code,
        }),
      }); 

      const orderData = await orderResponse.json(); 

      if (!orderResponse.ok) {
        alert(orderData.message || 'Failed to create payment order'); 
        setLoading(false); 
        return; 
      }

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RXGNLF12apA8mF',
        amount: proratedAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Self Ranker',
        description: `${planName} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#a855f7',
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            }); 

            const verifyData = await verifyResponse.json(); 

            if (verifyData.success) {
              // Refresh user data
              await refreshUserData(); 
              
              setCurrentPlan(verifyData.payment?.planType || planName.toLowerCase()); 
              setSubscriptionEndDate(verifyData.subscriptionEndDate); 
              setSubscriptionPeriod(verifyData.payment?.period || billingCycle); 
              
              setPaymentSuccess(true); 
              setSuccessOrderData({
                orderId: orderData.orderId,
                planName: planName,
                amount: proratedAmount,
              }); 
              setSuccessMessage(`✨ Payment Successful! You're now on ${planName} plan!`); 
              
              // Reset coupon and modal
              setAppliedCoupon(null); 
              setAppliedCouponForPlan(null); 
              setCouponModalOpen(false); 
              setSelectedPlanForCoupon(null); 
              
              setLoading(false); 
            } else {
              alert('Payment verification failed'); 
              setLoading(false); 
            }
          } catch (error) {
            alert('Payment verification failed'); 
            setLoading(false); 
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false); 
          },
        },
      }; 

      const rzp = new window.Razorpay(options); 
      rzp.open(); 
    } catch (error) {
      console.error('Payment error:', error); 
      alert('Payment failed. Please try again.'); 
      setLoading(false); 
    }
  }; 

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      displayPrice: 'Free',
      period: '',
      amount: 0,
      description: 'Perfect for beginners',
      popular: false,
      features: [
        'Up to 5 AI Notes per day',
        'Up to 5 Quizzes per day',
        'Basic Quiz Types (MCQ, True/False)',
        'Basic Learning Path Access',
        'Basic Performance Score',
        'Basic Analytics',
        '7-day Quiz History',
        'Ads Displayed',
      ],
      textColor: 'from-cyan-400 to-blue-400',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: "₹11",
      displayPrice: "₹11",
      period: '/month',
      amount: 11,
      description: 'For serious learners',
      popular: true,
      features: [
        'Unlimited AI Notes',
        'Unlimited Quizzes',
        'Advanced Quiz Types (Short Answer)',
        'Full Learning Path Access',
        'Weak Topic Detection',
        'Better Performance Insights',
        'Detailed Analytics',
        '30-day Quiz History',
        'Ad-free Experience',
      ],
      textColor: 'from-blue-300 to-cyan-300',
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: "₹21",
      displayPrice: "₹21",
      period: '/month',
      amount: 21,
      description: 'For competitive exams',
      popular: false,
      features: [
        'Unlimited AI Notes',
        'Unlimited Quizzes',
        'Advanced Quiz Types (Concept-based, Higher-level)',
        'Full Learning Path & Supreme Learning',
        'Weak Topic Detection',
        'AI Doubt Solver',
        'Advanced Analytics & Performance Insights',
        'Permanent Quiz History',
        'Complete Ad-free Experience',
      ],
      textColor: 'from-purple-400 to-cyan-400',
    },
  ]; 

  return (
    <section id="pricing" className="relative py-12 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background - Matching HowItWorks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
        {/* Additional subtle grid layer */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs - Matching HowItWorks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-cyan-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Payment Success Modal */}
        {paymentSuccess && successOrderData && (
          <PaymentSuccess 
            orderId={successOrderData.orderId}
            planName={successOrderData.planName}
            amount={successOrderData.amount}
            onContinue={() => {
              // Force refresh of user data
              refreshUserData().then(() => {
                setPaymentSuccess(false); 
                setSuccessOrderData(null); 
                // Trigger storage event to notify Dashboard
                window.dispatchEvent(new Event('paymentSuccess')); 
                onNavigate?.('dashboard'); 
              }); 
            }}
          />
        )}

        {/* Header */}
        <div className="text-center mb-8 md:mb-14 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/30 rounded-full mb-4 md:mb-6">
            <span className="text-xs md:text-xs font-medium text-purple-300">💎 Pricing Plans</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Simple, Transparent <span className="text-white">Pricing</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8">
            Choose the plan that fits your learning goals
          </p>

          {/* Billing Toggle - Hidden as only monthly plans available */}
          {/* Removed: Only monthly plans available now */}

          {/* Show message for premium users */}
          {isAuthenticated && currentPlan && currentPlan !== 'free' && (
            <div className="mb-6 md:mb-10 p-3 md:p-4 bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/30 rounded-lg text-center animate-in fade-in slide-in-from-top-4">
              <p className="text-sm md:text-base text-purple-300">
                🌟 You're currently on <span className="font-bold capitalize">{currentPlan}</span>
                {subscriptionPeriod && <span className="font-bold"> {subscriptionPeriod}</span>} plan
                {subscriptionPeriod === 'yearly' && ' • Monthly plans are hidden until your plan expires'}
                {currentPlan === 'pro' && subscriptionPeriod === 'monthly' && ' • You can upgrade to Pro Yearly or Ultimate plans'}
                {currentPlan === 'pro' && subscriptionPeriod === 'yearly' && ' • You can upgrade to Ultimate Yearly only'}
                {currentPlan === 'ultimate' && subscriptionPeriod === 'monthly' && ' • You can switch to Pro Yearly or upgrade to Ultimate Yearly'}
                {currentPlan === 'ultimate' && subscriptionPeriod === 'yearly' && ' • You have the highest tier plan'}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
          {getFilteredPlans(plans).map((plan, idx) => (
            <div
              key={idx}
              className="group animate-in fade-in"
              style={{
                animationDelay: `${idx * 150}ms`,
                animationDuration: '800ms',
              }}
            >
              <div
                className={`relative rounded-2xl p-6 md:p-8 transition-all duration-500 transform group-hover:scale-105 h-full backdrop-blur-sm overflow-visible ${
                  plan.popular
                    ? `md:scale-105 bg-gradient-to-br from-purple-500/10 to-magenta-600/5 border-2 border-purple-500/60 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500`
                    : plan.id === 'ultimate'
                    ? `bg-gradient-to-br from-orange-500/10 to-yellow-600/5 border-2 border-orange-500/60 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:border-orange-500`
                    : `bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/10`
                }`}
              >
                {/* Badge - On the border */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500 to-magenta-500 text-white text-xs font-bold rounded-full animate-in fade-in zoom-in duration-500 shadow-lg shadow-purple-500/50 whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                {plan.id === 'ultimate' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-4 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold rounded-full animate-in fade-in zoom-in duration-500 shadow-lg shadow-orange-500/50 whitespace-nowrap">
                    Elite
                  </div>
                )}
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-500 rounded-2xl pointer-events-none"></div>

                <div className="relative z-5">

                  {/* Plan Name */}
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors mt-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-xs mb-6 group-hover:text-slate-300 transition-colors">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${plan.textColor} bg-clip-text text-transparent`}>
                        {plan.price === 0 ? 'Free' : `${plan.price}`}
                      </span>
                      {plan.price !== 0 && (
                        <span className="text-slate-400 text-xs whitespace-nowrap">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Show current plan info if user is on a plan with matching tier AND period */}
                  {isAuthenticated && currentPlan && (
                    ((plan.id === 'free' && currentPlan === 'free') ||
                    (plan.name.toLowerCase() === currentPlan.toLowerCase() && plan.period === (subscriptionPeriod === 'yearly' ? '/year' : '/month')))
                  ) && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium text-center">
                      ✓ Your Current Plan
                    </div>
                  )}

                  {/* Show validity if on a plan */}
                  {isAuthenticated && currentPlan && subscriptionEndDate && (
                    (plan.name.toLowerCase() !== currentPlan.toLowerCase()) ||
                    (plan.name.toLowerCase() === currentPlan.toLowerCase() && plan.period !== (subscriptionPeriod === 'yearly' ? '/year' : '/month'))
                  ) && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                      <p className="font-semibold mb-1">Upgrade Details:</p>
                      <p>Valid till: {formatDateToDDMMYYYY(subscriptionEndDate)}</p>
                      <p className="mt-1 text-yellow-300">
                        Prorated: ₹{calculateProratedAmount(plan.amount, 
                          {
                            'pro': subscriptionPeriod === 'yearly' ? 2999 : 299,
                            'ultimate': subscriptionPeriod === 'yearly' ? 9999 : 999
                          }[currentPlan] || 0
                        )}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handlePayment(plan.name, plan.amount)}
                    disabled={loading || (isAuthenticated && currentPlan && ((plan.id === 'free' && currentPlan === 'free') || (plan.name.toLowerCase() === currentPlan.toLowerCase() && plan.period === (subscriptionPeriod === 'yearly' ? '/year' : '/month'))))}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 mb-8 group/btn flex items-center justify-center gap-2 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    } ${
                      isAuthenticated && currentPlan && ((plan.id === 'free' && currentPlan === 'free') || (plan.name.toLowerCase() === currentPlan.toLowerCase() && plan.period === (subscriptionPeriod === 'yearly' ? '/year' : '/month')))
                        ? 'opacity-50 cursor-not-allowed bg-gradient-to-r from-slate-700 to-slate-800 text-slate-400'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70'
                        : plan.id === 'ultimate'
                        ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70'
                        : 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white border border-purple-500/30 hover:border-purple-500/60'
                    }`}
                  >
                    {loading && <Loader size={18} className="animate-spin" />}
                    {isAuthenticated && currentPlan && ((plan.id === 'free' && currentPlan === 'free') || (plan.name.toLowerCase() === currentPlan.toLowerCase() && plan.period === (subscriptionPeriod === 'yearly' ? '/year' : '/month')))
                      ? 'Current Plan'
                      : plan.name === 'Starter'
                      ? 'Get Started Free'
                      : isAuthenticated && currentPlan && currentPlan !== 'free'
                      ? 'Upgrade Plan'
                      : isAuthenticated ? 'Upgrade Now' : 'Sign Up to Upgrade'}
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase group-hover:text-slate-300 transition-colors">
                      What's included:
                    </p>
                    {plan.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300 animate-in fade-in"
                        style={{ animationDelay: `${idx * 150 + fIdx * 50}ms`, animationDuration: '600ms' }}
                      >
                        <Check className="text-cyan-400 flex-shrink-0 mt-0.5 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-300" size={18} />
                        <span className="text-slate-300 text-sm group-hover/item:text-white transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-6 md:p-8 text-center backdrop-blur-xl transition-all duration-300 group cursor-pointer transform hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
            <span className="text-2xl">💯</span>
            <p className="text-sm md:text-base">
              <span className="font-bold text-white">30-day money-back guarantee</span> — Try any plan risk-free!
            </p>
          </div>
        </div>

        {/* Coupon Modal */}
        {selectedPlanForCoupon && (
          <CouponModal
            isOpen={couponModalOpen}
            onClose={() => setCouponModalOpen(false)}
            onApplyCoupon={handleCouponApplied}
            planPrice={selectedPlanForCoupon.amount}
            planName={selectedPlanForCoupon.name}
            currentAppliedCoupon={appliedCoupon}
          />
        )}

        {/* Proceed to Payment Modal (shown after coupon is applied) */}
        {appliedCoupon && couponModalOpen === false && selectedPlanForCoupon && appliedCouponForPlan === selectedPlanForCoupon.name && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-green-500/30 rounded-2xl max-w-md w-full shadow-2xl shadow-green-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">✨ Coupon Applied!</h2>
              
              <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Original Price:</span>
                  <span className="text-slate-300 line-through">₹{appliedCoupon.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Discount:</span>
                  <span className="text-green-400 font-semibold">-₹{appliedCoupon.discount}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-white font-semibold">Final Price:</span>
                  <span className="text-2xl font-bold text-green-400">₹{appliedCoupon.discountedPrice}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => processPaymentWithCoupon(selectedPlanForCoupon.name)}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader size={18} className="animate-spin" />}
                  {appliedCoupon.discountedPrice === 0 ? 'Get Free Access' : 'Proceed to Payment'}
                </button>
                <button
                  onClick={() => {
                    setAppliedCoupon(null); 
                    setAppliedCouponForPlan(null); 
                    setCouponModalOpen(true); 
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors border border-slate-700"
                >
                  Change Coupon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  ); 
}