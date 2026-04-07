import React, { useState, useEffect } from 'react'; 
import { X, Tag, Check, AlertCircle } from 'lucide-react'; 
import api from '../services/api'; 

const CouponModal = ({ 
  isOpen, 
  onClose, 
  onApplyCoupon, 
  planPrice, 
  planName,
  currentAppliedCoupon 
}) => {
  const [couponCode, setCouponCode] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 
  const [availableCoupons, setAvailableCoupons] = useState([]); 
  const [showAvailable, setShowAvailable] = useState(false); 
  const [selectedCoupon, setSelectedCoupon] = useState(null); 
  const [isActivated, setIsActivated] = useState(false); 

  // Fetch available coupons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableCoupons(); 
      setCouponCode(''); 
      setError(''); 
      setSuccess(''); 
      setSelectedCoupon(null); 
      setIsActivated(false); 
    }
  }, [isOpen]); 

  const fetchAvailableCoupons = async () => {
    try {
      const response = await api.getAvailableCoupons(); 
      if (response.success) {
        setAvailableCoupons(response.coupons || []); 
      }
    } catch (err) {
      console.error('Error fetching available coupons:', err); 
    }
  }; 

  const calculateDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return Math.round((planPrice * coupon.discountValue) / 100); 
    } else {
      return coupon.discountValue; 
    }
  }; 

  const getDiscountedPrice = (coupon) => {
    const discount = calculateDiscount(coupon); 
    return Math.max(0, planPrice - discount); 
  }; 

  const handleApplyCoupon = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSuccess(''); 

    if (!couponCode.trim()) {
      setError('Please enter a coupon code'); 
      return; 
    }

    setLoading(true); 
    try {
      // Get coupon details
      const response = await api.getCouponByCode(couponCode); 

      if (response.success && response.coupon) {
        const coupon = response.coupon; 
        
        // Validate coupon
        if (!coupon.isActive) {
          setError('This coupon is no longer active'); 
          setLoading(false); 
          return; 
        }

        const now = new Date(); 
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
          setError('This coupon is not yet active'); 
          setLoading(false); 
          return; 
        }

        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
          setError('This coupon has expired'); 
          setLoading(false); 
          return; 
        }

        if (coupon.minPurchaseAmount && planPrice < coupon.minPurchaseAmount) {
          setError(`Minimum purchase amount required: ₹${coupon.minPurchaseAmount}`); 
          setLoading(false); 
          return; 
        }

        // Check if coupon is applicable to the selected plan
        if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
          const planLower = planName.toLowerCase(); 
          if (!coupon.applicablePlans.some(plan => plan.toLowerCase() === planLower)) {
            setError(`This coupon is only applicable for: ${coupon.applicablePlans.join(', ')}`); 
            setLoading(false); 
            return; 
          }
        }

        // Coupon is valid - set as selected but don't close yet
        const discountedPrice = getDiscountedPrice(coupon); 
        setSelectedCoupon({
          coupon,
          originalPrice: planPrice,
          discountedPrice,
          discount: calculateDiscount(coupon),
          discountPercentage: coupon.discountType === 'percentage' ? coupon.discountValue : 0,
        }); 
        setCouponCode(''); 
        setSuccess(`Coupon valid! ${coupon.discountType === 'percentage' ? coupon.discountValue + '% OFF' : '₹' + coupon.discountValue + ' OFF'}`); 
      } else {
        setError(response.message || 'Coupon not found'); 
      }
    } catch (err) {
      console.error('Error applying coupon:', err); 
      setError('Failed to apply coupon. Please try again.'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const handleQuickApply = async (coupon) => {
    // Check if coupon is applicable to the selected plan
    if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
      const planLower = planName.toLowerCase(); 
      if (!coupon.applicablePlans.some(plan => plan.toLowerCase() === planLower)) {
        setError(`This coupon is only applicable for: ${coupon.applicablePlans.join(', ')}`); 
        return; 
      }
    }

    setError(''); 
    const discountedPrice = getDiscountedPrice(coupon); 
    setSelectedCoupon({
      coupon,
      originalPrice: planPrice,
      discountedPrice,
      discount: calculateDiscount(coupon),
      discountPercentage: coupon.discountType === 'percentage' ? coupon.discountValue : 0,
    }); 
    setSuccess(`Coupon valid! ${coupon.discountType === 'percentage' ? coupon.discountValue + '% OFF' : '₹' + coupon.discountValue + ' OFF'}`); 
  }; 

  const handleRemoveCoupon = () => {
    onApplyCoupon(null); 
    setCouponCode(''); 
    setError(''); 
    setSuccess(''); 
  }; 

  const handleActivatePlan = async () => {
    if (!selectedCoupon) return; 

    setLoading(true); 
    try {
      // Call parent callback with coupon details - this will trigger redemption
      onApplyCoupon(selectedCoupon); 
      setIsActivated(true); 

      // Close modal after a short delay
      setTimeout(() => {
        onClose(); 
      }, 800); 
    } catch (err) {
      console.error('Error activating plan:', err); 
      setError('Failed to activate plan. Please try again.'); 
    } finally {
      setLoading(false); 
    }
  }; 

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20 sticky top-0 bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Tag className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">Apply Coupon Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
              <Check className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Plan Info */}
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Plan Details</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-bold text-white">₹{planPrice}</p>
              <p className="text-slate-400 text-sm">{planName} Plan</p>
            </div>
          </div>

          {/* Applied Coupon Display */}
          {currentAppliedCoupon && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold text-lg">{currentAppliedCoupon.coupon.code}</p>
                  <p className="text-green-300 text-sm mt-1">
                    Saves you ₹{currentAppliedCoupon.discount}
                  </p>
                  <p className="text-green-400 font-bold text-lg mt-2">
                    New Price: ₹{currentAppliedCoupon.discountedPrice}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Selected Coupon Display */}
          {selectedCoupon && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold text-lg">{selectedCoupon.coupon.code}</p>
                  <p className="text-green-300 text-sm mt-1">
                    Saves you ₹{selectedCoupon.discount}
                  </p>
                  <p className="text-green-400 font-bold text-lg mt-2">
                    New Price: ₹{selectedCoupon.discountedPrice}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCoupon(null)}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Coupon Code Input - Show only if no coupon selected */}
          {!selectedCoupon && (
            <form onSubmit={handleApplyCoupon} className="space-y-3">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Enter Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., SAVE50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validating...' : 'Validate Coupon'}
              </button>
            </form>
          )}

          {/* Available Coupons */}
          {!selectedCoupon && (
            <div>
              <button
                onClick={() => setShowAvailable(!showAvailable)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                {showAvailable ? '▼' : '▶'} Available Coupons ({availableCoupons.length})
              </button>

              {showAvailable && availableCoupons.length > 0 && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {availableCoupons.map((coupon) => (
                    <button
                      key={coupon._id}
                      onClick={() => handleQuickApply(coupon)}
                      disabled={loading}
                      className="w-full text-left bg-slate-800/50 border border-purple-500/30 hover:border-purple-500/60 rounded-lg p-3 transition-all hover:bg-slate-800/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 font-semibold text-sm">{coupon.code}</p>
                          <p className="text-slate-400 text-xs mt-1">{coupon.description || 'Discount coupon'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}% OFF` 
                              : `₹${coupon.discountValue} OFF`}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Save ₹{calculateDiscount(coupon)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showAvailable && availableCoupons.length === 0 && (
                <p className="text-slate-400 text-sm mt-3">No active coupons available right now.</p>
              )}
            </div>
          )}

          {/* Buttons Section */}
          <div className="space-y-3">
            {selectedCoupon && (
              <button
                onClick={handleActivatePlan}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Activating...' : 'Activate Plan'}
              </button>
            )}

            {!selectedCoupon && (
              <button
                onClick={() => {
                  onApplyCoupon(null); 
                  onClose(); 
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Continue Without Coupon
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors border border-slate-700"
            >
              {selectedCoupon ? 'Cancel' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ); 
}; 

export default CouponModal; 