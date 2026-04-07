import React, { useState, useEffect } from 'react'; 
import { X, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'; 
import api from '../services/api'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

const AdminCouponManagement = ({ adminToken }) => {
  const [coupons, setCoupons] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [formLoading, setFormLoading] = useState(false); 
  const [showCreateForm, setShowCreateForm] = useState(false); 
  const [editingCoupon, setEditingCoupon] = useState(null); 
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxRedemptions: 1,
    validFrom: '',
    validUntil: '',
    minPurchaseAmount: 0,
    applicablePlans: ['basic', 'pro', 'premium'],
    premiumDays: 30,
    isActive: true,
  }); 

  // Fetch coupons on component mount - BUT ONLY IF adminToken exists and is valid
  useEffect(() => {
    // Don't fetch if no admin token or if it's invalid
    if (!adminToken || typeof adminToken !== 'string' || adminToken.trim() === '') {
      console.warn('AdminCouponManagement: Invalid or missing adminToken:', {
        hasToken: !!adminToken,
        type: typeof adminToken,
        trimmed: adminToken?.trim() === '',
      }); 
      setLoading(false); 
      setCoupons([]); 
      return; 
    }
    
    console.log('AdminCouponManagement: Valid adminToken found, fetching coupons'); 
    fetchCoupons(); 
  }, [adminToken]); 

  const fetchCoupons = async () => {
    if (!adminToken || adminToken.trim() === '') {
      console.error('fetchCoupons: adminToken is invalid:', {
        token: adminToken,
        type: typeof adminToken,
        isEmpty: !adminToken || adminToken.trim() === '',
      }); 
      setError('Admin token not found or invalid. Please login as admin.'); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true); 
    setError(''); 
    try {
      console.log('Fetching coupons - Token starts with:', adminToken.substring(0, 20) + '...'); 
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      }); 
      
      console.log('Coupons fetch response status:', response.status); 
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        console.error('Coupons fetch error:', errorData); 
        throw new Error(errorData.message || `HTTP Error: ${response.status}`); 
      }
      
      const data = await response.json(); 
      if (data.success) {
        setCoupons(data.coupons || []); 
        setError(''); 
        console.log('Coupons fetched successfully:', data.coupons?.length || 0); 
      } else {
        setError(data.message || 'Failed to fetch coupons'); 
      }
    } catch (err) {
      console.error('Error fetching coupons:', err.message); 
      setError('Error fetching coupons: ' + err.message); 
    }
    setLoading(false); 
  }; 

  const handleCreateCoupon = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSuccess(''); 

    if (!adminToken) {
      setError('Admin token not found. Please login as admin.'); 
      return; 
    }

    // Validation
    if (!formData.code || !formData.discountValue) {
      setError('Code and discount value are required'); 
      return; 
    }

    if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      setError('Percentage must be between 0 and 100'); 
      return; 
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      setError('Valid from date must be before valid until date'); 
      return; 
    }

    setFormLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      }); 
      const data = await response.json(); 
      if (data.success) {
        setSuccess('Coupon created successfully'); 
        fetchCoupons(); 
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          maxRedemptions: 1,
          validFrom: '',
          validUntil: '',
          minPurchaseAmount: 0,
          applicablePlans: ['basic', 'pro', 'premium'],
          premiumDays: 30,
          isActive: true,
        }); 
        setShowCreateForm(false); 
      } else {
        setError(response.message || 'Failed to create coupon'); 
      }
    } catch (err) {
      setError('Error creating coupon'); 
    } finally {
      setFormLoading(false); 
    }
  }; 

  const handleUpdateCoupon = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSuccess(''); 

    setFormLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${editingCoupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      }); 
      const data = await response.json(); 
      if (data.success) {
        setSuccess('Coupon updated successfully'); 
        fetchCoupons(); 
        setEditingCoupon(null); 
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          maxRedemptions: 1,
          validFrom: '',
          validUntil: '',
          minPurchaseAmount: 0,
          applicablePlans: ['basic', 'pro', 'premium'],
          premiumDays: 30,
          isActive: true,
        }); 
      } else {
        setError(data.message || 'Failed to update coupon'); 
      }
    } catch (err) {
      setError('Error updating coupon'); 
    } finally {
      setFormLoading(false); 
    }
  }; 

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return; 
    }

    setLoading(true); 
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      }); 
      const data = await response.json(); 
      if (data.success) {
        setSuccess('Coupon deleted successfully'); 
        fetchCoupons(); 
      } else {
        setError(data.message || 'Failed to delete coupon'); 
      }
    } catch (err) {
      setError('Error deleting coupon'); 
    } finally {
      setLoading(false); 
    }
  }; 

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon); 
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxRedemptions: coupon.maxRedemptions,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      minPurchaseAmount: coupon.minPurchaseAmount,
      applicablePlans: coupon.applicablePlans,
      premiumDays: coupon.premiumDays || 30,
      isActive: coupon.isActive,
    }); 
    setShowCreateForm(true); 
  }; 

  const handlePlanToggle = (plan) => {
    const updatedPlans = formData.applicablePlans.includes(plan)
      ? formData.applicablePlans.filter((p) => p !== plan)
      : [...formData.applicablePlans, plan]; 
    setFormData({ ...formData, applicablePlans: updatedPlans }); 
  }; 

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`; 
    } else {
      return `₹${coupon.discountValue}`; 
    }
  }; 

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date(); 
  }; 

  if (!adminToken) {
    return (
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-red-500/20">
        <div className="text-center py-8">
          <p className="text-red-400 text-lg font-semibold">❌ Admin authentication required</p>
          <p className="text-slate-400 text-sm mt-2">Please login as admin to manage coupons</p>
        </div>
      </div>
    ); 
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Coupon Management</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            title="Refresh coupons list"
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? '⟳ Loading...' : '⟳ Refresh'}
          </button>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm); 
              setEditingCoupon(null); 
              setFormData({
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                maxRedemptions: 1,
                validFrom: '',
                validUntil: '',
                minPurchaseAmount: 0,
                applicablePlans: ['basic', 'pro', 'premium'],
                isActive: true,
              }); 
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <Plus size={20} />
            {editingCoupon ? 'Cancel Edit' : 'Create Coupon'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
          {success}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon} className="mb-8 p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Coupon Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={!!editingCoupon}
                placeholder="e.g., SAVE20"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition disabled:opacity-50"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Discount Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                placeholder="Enter value"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
            </div>

            {/* Max Redemptions */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Max Redemptions</label>
              <input
                type="number"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
            </div>

            {/* Min Purchase Amount */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Min Purchase Amount (₹)</label>
              <input
                type="number"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) })}
                min="0"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Get 20% off on all plans"
              rows="2"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition resize-none"
            />
          </div>

          {/* Premium Days */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Premium Days (How many days of access)</label>
            <input
              type="number"
              value={formData.premiumDays}
              onChange={(e) => setFormData({ ...formData, premiumDays: parseInt(e.target.value) })}
              min="1"
              placeholder="30"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
            />
          </div>

          {/* Applicable Plans */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Applicable Plans</label>
            <div className="flex gap-4">
              {['basic', 'pro', 'premium'].map((plan) => (
                <label key={plan} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applicablePlans.includes(plan)}
                    onChange={() => handlePlanToggle(plan)}
                    className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-slate-300 text-sm capitalize">{plan}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-slate-300 text-sm">Active</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200"
          >
            {formLoading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      )}

      {/* Coupons List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">All Coupons ({coupons.length})</h3>
        {loading && !showCreateForm ? (
          <div className="text-center py-8 text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No coupons yet. Create one to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Code</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Discount</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Redeemed</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Valid Until</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-white font-semibold">{coupon.code}</td>
                    <td className="py-3 px-4 text-slate-300">{formatDiscount(coupon)}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {coupon.currentRedemptions} / {coupon.maxRedemptions}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          coupon.isActive && !isExpired(coupon.validUntil)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {isExpired(coupon.validUntil) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-2 hover:bg-slate-700/50 rounded transition text-slate-400 hover:text-slate-300"
                        title="Edit coupon"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-2 hover:bg-red-500/20 rounded transition text-red-400 hover:text-red-300"
                        title="Delete coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  ); 
}; 

export default AdminCouponManagement; 