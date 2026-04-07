import React, { useEffect, useState } from 'react'; 
import { Download, Check, ArrowRight } from 'lucide-react'; 
import { formatDateToDDMMYYYY } from '../utils/dateFormatter'; 

const API_BASE_URL = import.meta.env.VITE_API_URL_FRONTEND || import.meta.env.VITE_API_LOCAL_URL_FRONTEND || 'http://localhost:5000/api'

export default function PaymentSuccess({ orderId, planName, amount, onContinue }) {
  const [paymentDetails, setPaymentDetails] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [downloading, setDownloading] = useState(false); 

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payments/receipt/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }); 
        const data = await response.json(); 
        if (data.success) setPaymentDetails(data.payment); 
      } catch (error) {
        // console.error('Error fetching payment details:', error); 
      } finally {
        setLoading(false); 
      }
    }; 
    if (orderId) fetchPaymentDetails(); 
  }, [orderId]); 

  const getFeaturesByPlan = (planName) => {
    const featuresMap = {
      'free': [
        '✓ Limited Quiz Access',
        '✓ Basic Analytics',
        '✓ 5 Quizzes/Month',
      ],
      'pro': [
        '✓ Unlimited Quizzes',
        '✓ Advanced Analytics',
        '✓ AI-Generated Questions',
        '✓ Custom Topics',
        '✓ Performance Tracking',
        '✓ Priority Support',
      ],
      'ultimate': [
        '✓ All Pro Features',
        '✓ AI Learning Assistant',
        '✓ Custom Study Plans',
        '✓ Expert Consultations',
        '✓ Advanced Reports',
        '✓ API Access',
        '✓ 24/7 Premium Support',
      ],
    }; 
    return featuresMap[planName?.toLowerCase()] || featuresMap['free']; 
  }; 

  const getThemeByPlan = (planName) => {
    const themeMap = {
      'free': {
        color: '#6b7280',
        bgColor: '#f3f4f6',
        accent: '#6b7280',
        emoji: '🎯',
        title: 'Welcome to Free Plan!',
        subtitle: 'Start your learning journey today',
        gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        pdfGradient: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      },
      'pro': {
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        accent: '#a855f7',
        emoji: '⚡',
        title: 'Welcome to Pro Plan!',
        subtitle: 'Unlock advanced learning features',
        gradient: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
        pdfGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      },
      'ultimate': {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        accent: '#f97316',
        emoji: '👑',
        title: 'Welcome to Ultimate Plan!',
        subtitle: 'Experience premium learning excellence',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        pdfGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      },
    }; 
    return themeMap[planName?.toLowerCase()] || themeMap['free']; 
  }; 

  const generateReceipt = async () => {
    try {
      setDownloading(true); 
      const html2pdf = (await import('html2pdf.js')).default; 
      const element = document.getElementById('receipt-content'); 
      if (!element) return alert('Receipt content not found'); 

      const clonedElement = element.cloneNode(true); 
      clonedElement.style.backgroundColor = '#ffffff'; 
      clonedElement.style.color = '#111827'; 
      clonedElement.style.padding = '15px'; 
      clonedElement.style.margin = '0'; 
      clonedElement.style.fontFamily = 'Poppins, Arial, sans-serif'; 
      clonedElement.style.width = '100%'; 
      clonedElement.style.boxSizing = 'border-box'; 
      clonedElement.style.border = '2px solid #1f2937'; 
      clonedElement.style.borderRadius = '6px'; 
      clonedElement.style.fontSize = '10px'; 

      // Add gradient background to PDF
      const pdfTheme = getThemeByPlan(planName); 
      clonedElement.style.background = pdfTheme.pdfGradient; 

      // Logo at top (smaller)
      const logoContainer = document.createElement('div'); 
      logoContainer.style.textAlign = 'center'; 
      logoContainer.style.marginBottom = '8px'; 
      logoContainer.style.paddingBottom = '8px'; 
      logoContainer.style.borderBottom = '1.5px solid #1f2937'; 
      logoContainer.innerHTML = `<img src="/pdf_mail.png" alt="Self Ranker Logo" style="height:40px;  object-fit:contain; ">`; 
      clonedElement.insertBefore(logoContainer, clonedElement.firstChild); 

      // Payment Confirmation Box (Compact)
      const paymentBox = document.createElement('div'); 
      paymentBox.style.marginTop = '8px'; 
      paymentBox.style.padding = '6px 8px'; 
      paymentBox.style.backgroundColor = '#f0fdf4'; 
      paymentBox.style.borderRadius = '4px'; 
      paymentBox.style.borderLeft = '2px solid #22c55e'; 
      paymentBox.innerHTML = `<p style="margin:0;  font-size:9px;  color:#166534; ">✅ Payment confirmed. Subscription active immediately.</p>`; 
      clonedElement.appendChild(paymentBox); 

      // Customer and Transaction Details (Compact)
      const detailsBox = document.createElement('div'); 
      detailsBox.style.marginTop = '8px'; 
      detailsBox.style.paddingTop = '8px'; 
      detailsBox.style.borderTop = '1.5px solid #1f2937'; 
      const theme = getThemeByPlan(planName); 
      
      const transactionDate = paymentDetails?.createdAt ? new Date(paymentDetails.createdAt) : new Date(); 
      const formattedDate = formatDateToDDMMYYYY(paymentDetails?.createdAt); 
      const formattedTime = transactionDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); 
      const paymentModeDisplay = paymentDetails?.paymentMethodDetails || 'Razorpay Payment Gateway'; 
      
      detailsBox.innerHTML = `
        <div style="display:grid;  grid-template-columns:1fr 1fr;  gap:6px;  font-size:8.5px;  line-height:1.4; ">
          <div><p style="margin:0 0 2px 0;  font-weight:700;  color:#1f2937;  font-size:8px; ">Name:</p><p style="margin:0;  color:#4b5563;  font-size:8.5px; ">${paymentDetails?.customerDetails?.name || 'N/A'}</p></div>
          <div><p style="margin:0 0 2px 0;  font-weight:700;  color:#1f2937;  font-size:8px; ">Email:</p><p style="margin:0;  color:#4b5563;  font-size:8.5px; ">${paymentDetails?.customerDetails?.email || 'N/A'}</p></div>
          <div><p style="margin:0 0 2px 0;  font-weight:700;  color:#1f2937;  font-size:8px; ">Date:</p><p style="margin:0;  color:#4b5563;  font-size:8.5px; ">${formattedDate}</p></div>
          <div><p style="margin:0 0 2px 0;  font-weight:700;  color:#1f2937;  font-size:8px; ">Time:</p><p style="margin:0;  color:#4b5563;  font-size:8.5px; ">${formattedTime}</p></div>
          <div style="grid-column:1/-1; "><p style="margin:0 0 2px 0;  font-weight:700;  color:#1f2937;  font-size:8px; ">Payment Mode:</p><p style="margin:0;  color:#4b5563;  font-size:8.5px; ">${paymentModeDisplay}</p></div>
        </div>
      `; 
      clonedElement.appendChild(detailsBox); 

      // Plan Benefits Section (Compact - single column)
      const benefitsBox = document.createElement('div'); 
      benefitsBox.style.marginTop = '8px'; 
      benefitsBox.style.paddingTop = '8px'; 
      benefitsBox.style.borderTop = '1.5px solid #1f2937'; 
      const features = getFeaturesByPlan(planName); 
      const benefitsHTML = features.map(feature => {
        const featureName = feature.replace('✓ ', ''); 
        return `
          <div style="display:flex;  align-items:flex-start;  gap:5px;  margin-bottom:3px;  padding:3px;  background:#f9fafb;  border-radius:3px; ">
            <span style="color:${theme.color};  font-weight:700;  flex-shrink:0;  font-size:8px; ">✓</span>
            <span style="font-size:8px;  color:#374151;  line-height:1.2; ">${featureName}</span>
          </div>
        `; 
      }).join(''); 
      
      benefitsBox.innerHTML = `
        <p style="margin:0 0 5px 0;  font-weight:700;  color:${theme.color};  font-size:9px; ">📋 ${planName?.toUpperCase()} Benefits:</p>
        <div>${benefitsHTML}</div>
      `; 
      clonedElement.appendChild(benefitsBox); 

      // Quick Start + Support (Combined - Horizontal)
      const quickStart = document.createElement('div'); 
      quickStart.style.marginTop = '8px'; 
      quickStart.style.paddingTop = '8px'; 
      quickStart.style.borderTop = '1.5px solid #1f2937'; 
      quickStart.style.display = 'grid'; 
      quickStart.style.gridTemplateColumns = '1fr 1fr'; 
      quickStart.style.gap = '8px'; 
      quickStart.innerHTML = `
        <div>
          <p style="margin:0 0 3px 0;  font-weight:700;  font-size:8px; ">🚀 Next Steps:</p>
          <p style="margin:0;  font-size:7.5px;  color:#4b5563;  line-height:1.3; ">1. Log in<br/>2. Create quiz<br/>3. Track</p>
        </div>
        <div style="background:#eff6ff;  padding:5px;  border-radius:3px;  border-left:2px solid #3b82f6; ">
          <p style="margin:0 0 3px 0;  font-weight:700;  font-size:8px;  color:#1e40af; ">💬 Support:</p>
          <p style="margin:0;  font-size:7.5px;  color:#4b5563;  line-height:1.3; ">📧 support@selfranker.com<br/>💬 Live Chat</p>
        </div>
      `; 
      clonedElement.appendChild(quickStart); 

      // Compact Footer
      const footer = document.createElement('div'); 
      footer.style.marginTop = '8px'; 
      footer.style.paddingTop = '8px'; 
      footer.style.borderTop = '1.5px solid #1f2937'; 
      footer.style.textAlign = 'center'; 
      footer.innerHTML = `
        <p style="margin:0 0 3px 0;  font-weight:700;  font-size:9px;  color:#4f46e5; ">🎓 Self Ranker</p>
        <p style="margin:0 0 3px 0;  font-size:8px;  color:#6b7280;  line-height:1.3; ">Smart learning through adaptive quizzes</p>
        <p style="margin:0;  font-size:7px;  color:#9ca3af; ">support@selfranker.com | www.selfranker.com | © 2025</p>
      `; 
      clonedElement.appendChild(footer); 

      const opt = {
        margin: 3,
        filename: `SelfRanker-Receipt-${orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }; 

      await html2pdf().set(opt).from(clonedElement).save(); 
    } catch (error) {
      // console.error('Error generating receipt:', error); 
      alert('Failed to download receipt. Please try again.'); 
    } finally {
      setDownloading(false); 
    }
  }; 

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Poppins, Arial, sans-serif'
      }}>
        Loading Payment Details...
      </div>
    ); 
  }

  const theme = getThemeByPlan(planName); 

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '12px', zIndex: 50, top: 0, left: 0, right: 0, bottom: 0,
      overflowY: 'auto'
    }}>
      <div style={{
        background: theme.gradient, borderRadius: '24px', padding: 'clamp(16px, 5vw, 32px)',
        maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 6px 30px rgba(0,0,0,0.1)', border: `2px solid ${theme.color}`,
        margin: 'auto'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <img src="/pdf_mail.png" alt="SelfRanker Logo" style={{ height: 'clamp(40px, 8vw, 50px)', objectFit: 'contain' }} />
        </div>

        {/* Success Icon with Theme Color */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
          <div style={{
            width: 'clamp(48px, 12vw, 64px)', height: 'clamp(48px, 12vw, 64px)', borderRadius: '50%',
            background: `linear-gradient(to right, ${theme.color}, ${theme.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(20px, 5vw, 32px)',
            flexShrink: 0
          }}>
            {theme.emoji}
          </div>
        </div>

        {/* Theme-based Title and Subtitle */}
        <h1 style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '700', textAlign: 'center', marginBottom: '4px', color: theme.color, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          {theme.title}
        </h1>
        <p style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#4b5563', textAlign: 'center', marginBottom: 'clamp(16px, 4vw, 24px)', fontWeight: '500' }}>
          {theme.subtitle}
        </p>

        {/* Receipt */}
        <div id="receipt-content" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', border: `2px solid ${theme.color}`, borderRadius: '8px',
          padding: 'clamp(16px, 4vw, 24px)', marginBottom: 'clamp(16px, 4vw, 24px)', backdropFilter: 'blur(10px)', boxShadow: `0 4px 6px rgba(${theme.color === '#f59e0b' ? '245,158,11' : theme.color === '#8b5cf6' ? '139,92,246' : '107,114,128'}, 0.1)`
        }}>
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${theme.color}`, paddingBottom: 'clamp(12px, 3vw, 16px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
            <h2 style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', fontWeight: '700', color: theme.color }}>Self Ranker</h2>
            <p style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#6b7280' }}>Payment Receipt</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(11px, 2.5vw, 13px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Order ID:</span>
              <span style={{ fontWeight: '600' }}>{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Plan:</span>
              <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{planName}</span>
            </div>
            {paymentDetails && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Name:</span>
                  <span style={{ fontWeight: '600' }}>{paymentDetails.customerDetails?.name || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Email:</span>
                  <span style={{ fontWeight: '600' }}>{paymentDetails.customerDetails?.email || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Subscription Period:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{paymentDetails.period}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Payment Date:</span>
                  <span style={{ fontWeight: '600' }}>{formatDateToDDMMYYYY(paymentDetails.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Payment Time:</span>
                  <span style={{ fontWeight: '600' }}>{new Date(paymentDetails.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Payment Mode:</span>
                  <span style={{ fontWeight: '600' }}>{paymentDetails?.paymentMethodDetails || 'Razorpay Payment Gateway'}</span>
                </div>
                {paymentDetails.subscriptionEndDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Valid Till:</span>
                    <span style={{ fontWeight: '600' }}>{formatDateToDDMMYYYY(paymentDetails.subscriptionEndDate)}</span>
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${theme.color}`, paddingTop: 'clamp(8px, 2vw, 12px)' }}>
              <span style={{ color: '#6b7280' }}>Amount Paid:</span>
              <span style={{ fontWeight: '700', fontSize: 'clamp(12px, 2.5vw, 14px)', color: theme.color }}>₹{amount}</span>
            </div>
          </div>

          {/* Features Section */}
          <div style={{ marginTop: 'clamp(16px, 4vw, 20px)', paddingTop: 'clamp(16px, 4vw, 20px)', borderTop: `2px solid ${theme.color}` }}>
            <h3 style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '700', marginBottom: 'clamp(8px, 2vw, 12px)', color: theme.color }}>
              Your {planName?.toUpperCase()} Plan Includes:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.5vw, 8px)' }}>
              {getFeaturesByPlan(planName).map((feature, index) => (
                <div key={index} style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#374151', display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                  <span style={{ color: theme.color, fontWeight: '700' }}>•</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={generateReceipt}
          disabled={downloading}
          style={{
            width: '100%', marginBottom: 'clamp(8px, 2vw, 12px)', padding: 'clamp(10px, 2.5vw, 12px)',
            backgroundColor: '#4ade80', color: 'white', border: 'none',
            borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: downloading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(11px, 2.5vw, 13px)', boxSizing: 'border-box', minHeight: '44px'
          }}
        >
          <Download size={16} style={{ minWidth: '16px' }} />
          <span>{downloading ? 'Generating PDF...' : 'Download Receipt'}</span>
        </button>

        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: 'clamp(10px, 2.5vw, 12px)',
            backgroundColor: theme.color, color: 'white', border: 'none',
            borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(11px, 2.5vw, 13px)', boxSizing: 'border-box', minHeight: '44px'
          }}
        >
          <span>Continue to Dashboard</span>
          <ArrowRight size={16} style={{ minWidth: '16px' }} />
        </button>

        <p style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: '#6b7280', textAlign: 'center', marginTop: 'clamp(12px, 3vw, 16px)' }}>
          A receipt has been sent to your email as well.
        </p>
      </div>
    </div>
  ); 
}