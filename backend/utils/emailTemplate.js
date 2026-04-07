/**
 * Email Template Generator
 * Provides consistent email templates with different colors for different mail types
 */

const colorMap = {
  notification: {
    primary: '#3B82F6',    // Blue
    secondary: '#1E40AF',
    accent: '#60A5FA',
    name: 'Notification'
  },
  promotion: {
    primary: '#10B981',    // Green
    secondary: '#047857',
    accent: '#6EE7B7',
    name: 'Promotion'
  },
  announcement: {
    primary: '#F59E0B',    // Amber
    secondary: '#D97706',
    accent: '#FBBF24',
    name: 'Announcement'
  },
  alert: {
    primary: '#EF4444',    // Red
    secondary: '#991B1B',
    accent: '#FCA5A5',
    name: 'Alert'
  },
  planGrant: {
    primary: '#8B5CF6',    // Purple
    secondary: '#6D28D9',
    accent: '#A78BFA',
    name: 'Plan Grant'
  },
  welcome: {
    primary: '#EC4899',    // Pink
    secondary: '#BE185D',
    accent: '#F472B6',
    name: 'Welcome'
  },
  verification: {
    primary: '#06B6D4',    // Cyan/Turquoise
    secondary: '#0891B2',
    accent: '#67E8F9',
    name: 'Verification'
  },
  cancellation: {
    primary: '#F97316',    // Orange
    secondary: '#EA580C',
    accent: '#FDBA74',
    name: 'Cancellation'
  },
  blocked: {
    primary: '#6B7280',    // Gray
    secondary: '#374151',
    accent: '#9CA3AF',
    name: 'Account Blocked'
  },
}; 

/**
 * Generate professional email template
 * @param {string} userName - User's name
 * @param {string} subject - Email subject
 * @param {string} message - Main message content
 * @param {string} mailType - Type of email (notification, promotion, announcement, alert, planGrant, welcome)
 * @returns {string} HTML email template
 */
const getEmailTemplate = (userName, subject, message, mailType = 'notification') => {
  const colors = colorMap[mailType] || colorMap.notification; 

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background-color: #f5f5f5; 
            margin: 0; 
            padding: 20px; 
          }
          .container {
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
          }
          .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); 
            padding: 50px 30px; 
            text-align: center; 
            color: white; 
            border-bottom: 4px solid ${colors.secondary}; 
          }
          .header .logo {
            display: inline-block; 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            background: rgba(255, 255, 255, 0.2); 
            padding: 8px 16px; 
            border-radius: 6px; 
            backdrop-filter: blur(10px); 
          }
          .header h1 {
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
            letter-spacing: -0.5px; 
          }
          .header p {
            margin: 8px 0 0 0; 
            font-size: 14px; 
            opacity: 0.95; 
            font-weight: 500; 
          }
          .content {
            padding: 45px 30px; 
          }
          .greeting {
            font-size: 16px; 
            color: #333; 
            margin: 0 0 25px 0; 
            line-height: 1.6; 
          }
          .greeting strong {
            color: ${colors.primary}; 
          }
          .message-box {
            background: linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accent}10 100%); 
            border-left: 5px solid ${colors.primary}; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0; 
          }
          .message-box p {
            margin: 0; 
            color: #333; 
            line-height: 1.8; 
            font-size: 15px; 
          }
          .cta-button {
            display: inline-block; 
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); 
            color: white; 
            padding: 12px 30px; 
            border-radius: 6px; 
            text-decoration: none; 
            font-weight: 600; 
            margin: 20px 0; 
            font-size: 14px; 
            box-shadow: 0 4px 12px ${colors.primary}40; 
            transition: transform 0.2s; 
          }
          .cta-button:hover {
            transform: translateY(-2px); 
          }
          .divider {
            height: 2px; 
            background: linear-gradient(90deg, transparent, ${colors.primary}, transparent); 
            margin: 30px 0; 
            opacity: 0.5; 
          }
          .footer {
            background-color: #f9fafb; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb; 
          }
          .footer-text {
            margin: 8px 0; 
            font-size: 13px; 
            color: #6b7280; 
            line-height: 1.6; 
          }
          .footer-brand {
            font-weight: 600; 
            color: ${colors.primary}; 
            margin-bottom: 5px; 
          }
          .footer-disclaimer {
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 11px; 
            color: #9ca3af; 
          }
          .badge {
            display: inline-block; 
            background: ${colors.accent}30; 
            color: ${colors.primary}; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            margin-top: 10px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨ Self Ranker</div>
            <h1>${subject}</h1>
            <p><span class="badge">${colors.name}</span></p>
          </div>
          
          <div class="content">
            <p class="greeting">Hello <strong>${userName}</strong>,</p>
            
            <div class="message-box">
              <p>${message.replace(/\n/g, '<br><br>')}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="margin: 25px 0 0 0;  color: #6b7280;  font-size: 14px;  line-height: 1.8; ">
              We're here to help! If you have any questions or need assistance, feel free to reach out to our support team.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-brand">Self Ranker</p>
            <p class="footer-text">Your Learning Excellence Platform</p>
            <p class="footer-text" style="margin-top: 15px; ">© 2025 Self Ranker. All rights reserved.</p>
            <p class="footer-disclaimer">This is an automated message. Please do not reply directly to this email. For support, visit our website or contact us through the app.</p>
          </div>
        </div>
      </body>
    </html>
  `; 
}; 

module.exports = {
  getEmailTemplate,
  colorMap,
}; 
