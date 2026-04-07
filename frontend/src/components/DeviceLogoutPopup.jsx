import React, { useState } from 'react'; 
import { AlertTriangle, Smartphone, LogOut, Lock } from 'lucide-react'; 

export default function DeviceLogoutPopup({ 
  isOpen, 
  currentDevice, 
  newDevice, 
  onLogout,
  onCancel,
  isLoading = false 
}) {
  if (!isOpen) return null; 

  const handleLogout = () => {
    onLogout(); 
  }; 

  const handleCancel = () => {
    onCancel(); 
  }; 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Logged Out</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-slate-300 text-center font-semibold">
            Another device has been logged in with your account
          </p>

          <p className="text-slate-400 text-sm text-center">
            Your account is active on only one device at a time. Your session on this device has been ended for security reasons.
          </p>

          {/* Current Device Info (This device that's being logged out) */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-semibold">
              <Smartphone className="w-5 h-5" />
              This Device
            </div>
            <p className="text-slate-200 ml-7">{currentDevice?.deviceName || 'Unknown Device'}</p>
            <p className="text-slate-400 text-sm ml-7">
              {currentDevice?.ipAddress || 'Unknown IP'}
            </p>
          </div>

          {/* New Device Info (Device that just logged in) */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <Lock className="w-5 h-5" />
              New Active Device
            </div>
            <p className="text-slate-200 ml-7">{newDevice?.deviceName || 'Unknown Device'}</p>
            <p className="text-slate-400 text-sm ml-7">
              Logged in at: {newDevice?.lastLoginAt 
                ? new Date(newDevice.lastLoginAt).toLocaleString() 
                : 'Unknown'}
            </p>
            <p className="text-slate-400 text-sm ml-7">
              {newDevice?.ipAddress || 'Unknown IP'}
            </p>
          </div>

          <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
            <p className="text-orange-200 text-sm">
              If this wasn't you, change your password immediately to secure your account.
            </p>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="bg-slate-800 px-6 py-4 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging Out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ); 
}
