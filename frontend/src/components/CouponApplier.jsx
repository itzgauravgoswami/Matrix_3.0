import React, { useState, useEffect } from 'react'; 
import { X, Tag, Copy, Check } from 'lucide-react'; 
import api from '../services/api'; 

const CouponApplier = ({ onCouponApplied, onRemoveCoupon, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 
  const [availableCoupons, setAvailableCoupons] = useState([]); 
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false); 
  const [copiedCode, setCopiedCode] = useState(''); 
  const [isMounting, setIsMounting] = useState(true); 

  // Fetch available coupons on component mount
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const response = await api.getAvailableCoupons(); 
        if (response.success) {
          setAvailableCoupons(response.coupons || []); 
        }
      } catch (err) {
        console.error('Error fetching coupons:', err); 
      } finally {
        setIsMounting(false); 
      }
    }; 
    fetchAvailableCoupons(); 
  }, []); 

  const handleValidateCoupon = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSuccess(''); 

    if (!couponCode.trim()) {
      setError('Please enter a coupon code'); 
      return; 
    }

    setLoading(true); 
    try {
      // Just get the coupon details without validating against a plan
      const response = await api.getCouponByCode(couponCode); 

      if (response.success) {
        setSuccess(`Coupon applied! ${formatDiscount(response.coupon)}`); 
        setCouponCode(''); 
        onCouponApplied?.(response.coupon); 
      } else {
        setError(response.message || 'Invalid coupon code'); 
      }
    } catch (err) {
      setError('Error validating coupon'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const handleRemoveCoupon = () => {
    setCouponCode(''); 
    setSuccess(''); 
    setError(''); 
    onRemoveCoupon?.(); 
  }; 

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code); 
    setCopiedCode(code); 
    setTimeout(() => setCopiedCode(''), 2000); 
  }; 

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`; 
    } else {
      return `₹${coupon.discountValue} OFF`; 
    }
  }; 

  return (
    <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 mt-6">
      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag size={20} className="text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">{appliedCoupon.code}</p>
                <p className="text-green-300 text-sm">
                  {formatDiscount(appliedCoupon)} Discount Applied
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-400 hover:text-green-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input Form */}
      <form onSubmit={handleValidateCoupon} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Apply Coupon Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={!!appliedCoupon || isMounting}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !!appliedCoupon || isMounting}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
            >
              {loading ? 'Applying...' : isMounting ? 'Loading...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}
      </form>

      {/* Available Coupons Section */}
      {availableCoupons.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm"
          >
            <Tag size={16} />
            {showAvailableCoupons ? 'Hide' : 'Show'} Available Coupons ({availableCoupons.length})
          </button>

          {showAvailableCoupons && (
            <div className="mt-4 space-y-2">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-3 bg-slate-700/30 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {coupon.code} - {formatDiscount(coupon)}
                      </p>
                      {coupon.minPurchaseAmount > 0 && (
                        <p className="text-slate-500 text-xs mt-1">
                          Min. purchase: ₹{coupon.minPurchaseAmount}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyCouponCode(coupon.code)}
                      className="p-2 hover:bg-slate-600/50 rounded transition text-slate-400 hover:text-slate-300"
                      title="Copy coupon code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check size={18} className="text-green-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  ); 
}; 

export default CouponApplier; 