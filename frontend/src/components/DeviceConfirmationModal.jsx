import React, { useState } from 'react'; 
import { AlertCircle, Smartphone, CheckCircle, X } from 'lucide-react'; 

export default function DeviceConfirmationModal({ 
  isOpen, 
  currentDevice, 
  previousDevice, 
  onConfirm, 
  onCancel,
  isLoading = false 
}) {
  if (!isOpen) return null; 

  const handleLoginClick = () => {
    onConfirm(true);  // forceLogin = true
  }; 

  const handleKeepPreviousClick = () => {
    onCancel(); 
  }; 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">New Device Login</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-slate-300 text-center">
            You're trying to login from a different device. Your account can only be active on one device at a time.
          </p>

          {/* Current Device Info */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Smartphone className="w-5 h-5" />
              Current Device
            </div>
            <p className="text-slate-200 ml-7">{currentDevice?.deviceName || 'Unknown Device'}</p>
          </div>

          {/* Previous Device Info */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <Smartphone className="w-5 h-5" />
              Previously Active Device
            </div>
            <p className="text-slate-200 ml-7">{previousDevice?.deviceName || 'Unknown Device'}</p>
            <p className="text-slate-400 text-sm ml-7">
              Last login: {previousDevice?.lastLoginAt 
                ? new Date(previousDevice.lastLoginAt).toLocaleString() 
                : 'Unknown'}
            </p>
          </div>

          <p className="text-slate-400 text-sm text-center">
            Choose whether to login to the new device or keep your session on the previous device.
          </p>
        </div>

        {/* Footer - Actions */}
        <div className="bg-slate-800 px-6 py-4 flex gap-3">
          <button
            onClick={handleKeepPreviousClick}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Previous Device
          </button>
          <button
            onClick={handleLoginClick}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging In...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Login to New Device
              </>
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleKeepPreviousClick}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  ); 
}
