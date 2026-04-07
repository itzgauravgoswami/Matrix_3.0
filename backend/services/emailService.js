const nodemailer = require('nodemailer'); 

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
}); 

// Verify transporter on module load
console.log('📧 Email Service Initializing...'); 
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ NOT SET'); 
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ NOT SET'); 

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173'; 

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: `🎓 Welcome to Self Ranker, ${userName}!`,
      html: `
        <div style="
          font-family: 'Segoe UI', sans-serif; 
          background: repeating-linear-gradient(
            45deg,
            #0a0a0a,
            #0a0a0a 20px,
            #2b0057 20px,
            #2b0057 40px
          ); 
          color: #f0f0f0; 
          padding: 20px; 
        ">
          <div style="
            width: 95%; 
            max-width: 650px; 
            margin: auto; 
            background: rgba(15, 23, 42, 0.95); 
            border-radius: 16px; 
            box-shadow: 0 0 30px rgba(111, 0, 255, 0.7); 
            overflow: hidden; 
            border: 1px solid rgba(255,255,255,0.1); 
          ">

            <!-- HEADER -->
            <div style="
              background: linear-gradient(90deg, #7b00ff, #4b0082); 
              padding: 35px 20px; 
              text-align: center; 
              color: #ffffff; 
              text-shadow: 0 0 8px #7b00ff, 0 0 12px #4b0082; 
            ">
              <img src="${baseUrl}/pdf_mail.png" width="180" alt="Self Ranker Logo" style="border-radius: 14px;  margin-bottom: 10px;  max-width: 95%; " />
              <h1 style="margin: 5px 0 0;  font-size: 28px;  letter-spacing: 0.5px; ">Welcome to Self Ranker 🚀</h1>
              <p style="opacity: 0.9;  font-size: 14px;  color: #e0e0e0; ">Your AI-powered personalized learning assistant</p>
            </div>

            <!-- BODY -->
            <div style="padding: 25px 20px; ">
              <h2 style="color: #ffffff;  font-size: 20px; ">Hey ${userName} 👋</h2>
              <p style="font-size: 15px;  color: #d1d5db;  line-height: 1.7; ">
                We're thrilled to have you on board! Self Ranker is your new companion for smarter, personalized learning.
                Create quizzes, track your progress, and explore new topics — all with AI-powered insights.
              </p>

              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid #a78bfa; 
                padding: 15px 20px; 
                border-radius: 10px; 
                box-shadow: 0 0 12px rgba(111,0,255,0.3); 
              ">
                <h3 style="color: #c084fc;  margin: 0 0 10px; ">🌟 Here's what you can do:</h3>
                <ul style="margin: 0;  padding-left: 18px;  color: #f3f3f3;  line-height: 1.8; ">
                  <li>Create custom quizzes for any topic</li>
                  <li>Get AI-powered explanations and progress insights</li>
                  <li>Track your learning goals and achievements</li>
                  <li>Explore new topics with your personalized dashboard</li>
                </ul>
              </div>

              <div style="text-align: center;  margin-top: 30px; ">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
                  style="
                    background: linear-gradient(90deg, #7b00ff, #4b0082); 
                    color: white; 
                    text-decoration: none; 
                    padding: 14px 40px; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    display: inline-block; 
                    font-size: 15px; 
                    box-shadow: 0 0 15px rgba(111,0,255,0.6); 
                    text-shadow: 0 0 6px #7b00ff; 
                  ">
                  🚀 Go to Dashboard
                </a>
              </div>

              <p style="font-size: 14px;  color: #a1a1aa;  margin-top: 35px;  line-height: 1.6; ">
                Need help getting started? Our support team is always ready to assist you.<br>
                Let’s make learning smarter, faster, and more fun!
              </p>
            </div>

            <!-- FOOTER -->
            <div style="
              background: #0b1220; 
              text-align: center; 
              padding: 40px 20px 50px 20px; 
              color: #f0f0f0; 
            ">
              <p style="margin: 10px 0;  font-size: 16px;  font-weight: 600;  color: #c084fc;  text-shadow: 0 0 6px #c084fc; ">
                Stay Connected 🌐
              </p>
              <div style="margin: 15px 0; ">
                <a href="https://github.com/itzgauravgoswami" style="margin: 0 8px; ">
                  <img src="${baseUrl}/github.png" width="34" alt="GitHub" style="vertical-align: middle;  filter: drop-shadow(0 0 3px #7b00ff); " />
                </a>
                <a href="https://www.linkedin.com/in/itzgauravgoswami" style="margin: 0 8px; ">
                  <img src="${baseUrl}/linkedin.png" width="34" alt="LinkedIn" style="vertical-align: middle;  filter: drop-shadow(0 0 3px #7b00ff); " />
                </a>
              </div>
              <p style="font-size: 13px;  color: #a78bfa;  margin: 8px 0;  text-shadow: 0 0 4px #a78bfa; ">
                Made with ❤️ by <strong style="color:#c084fc; ">Gaurav Goswami</strong><br>
                © 2025 Self Ranker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('Welcome email sent:', info.response); 
    return { success: true, message: 'Welcome email sent successfully' }; 
  } catch (error) {
    console.error('Error sending welcome email:', error); 
    return { success: false, error: error.message }; 
  }
}; 

// Send subscription confirmation email
const sendSubscriptionConfirmationEmail = async (userEmail, userName, planType, planName, amount, subscriptionEndDate) => {
  try {
    // Define color scheme based on plan type
    const planColors = {
      pro: {
        gradient: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        primaryColor: '#667eea',
        lightColor: '#c084fc',
        shadowColor: 'rgba(111, 0, 255, 0.6)',
        badgeColor: '#a78bfa',
      },
      ultimate: {
        gradient: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
        primaryColor: '#f59e0b',
        lightColor: '#fbbf24',
        shadowColor: 'rgba(245, 158, 11, 0.6)',
        badgeColor: '#fcd34d',
      },
    }; 

    const colors = planColors[planType] || planColors.pro; 
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173'; 
    const endDate = new Date(subscriptionEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); 

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: `🎉 Welcome to Self Ranker ${planType === 'ultimate' ? '👑' : '⭐'} ${planName}`,
      html: `
        <div style="
          font-family: 'Segoe UI', sans-serif; 
          background: repeating-linear-gradient(
            45deg,
            #0a0a0a,
            #0a0a0a 20px,
            rgba(107, 0, 200, 0.1) 20px,
            rgba(107, 0, 200, 0.1) 40px
          ); 
          color: #f0f0f0; 
          padding: 20px; 
        ">
          <div style="
            width: 95%; 
            max-width: 650px; 
            margin: auto; 
            background: rgba(15, 23, 42, 0.95); 
            border-radius: 16px; 
            box-shadow: 0 0 30px ${colors.shadowColor}; 
            overflow: hidden; 
            border: 1px solid rgba(255,255,255,0.1); 
          ">

            <!-- HEADER -->
            <div style="
              background: ${colors.gradient}; 
              padding: 35px 20px; 
              text-align: center; 
              color: #ffffff; 
              text-shadow: 0 0 8px ${colors.primaryColor}, 0 0 12px ${colors.primaryColor}; 
            ">
              <img src="${baseUrl}/pdf_mail.png" width="150" alt="Self Ranker Logo" style="border-radius: 10px;  margin-bottom: 15px;  max-width: 95%; " />
              <h1 style="margin: 0 0 10px;  font-size: 32px;  letter-spacing: 0.5px; ">
                ${planType === 'ultimate' ? '👑' : '⭐'} ${planName} Activated
              </h1>
              <p style="opacity: 0.9;  font-size: 14px;  color: #ffffff;  margin: 0; ">
                Your subscription is now active and ready to use
              </p>
            </div>

            <!-- BODY -->
            <div style="padding: 30px 20px; ">
              <h2 style="color: #ffffff;  font-size: 20px; ">Thank you, ${userName}! 🎓</h2>
              <p style="font-size: 15px;  color: #d1d5db;  line-height: 1.7; ">
                Your ${planName} subscription has been successfully activated. You now have access to premium features that will enhance your learning experience.
              </p>

              <!-- Plan Details Card -->
              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid ${colors.primaryColor}; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 0 12px ${colors.shadowColor}; 
              ">
                <h3 style="color: ${colors.lightColor};  margin: 0 0 15px;  font-size: 16px; ">📊 Subscription Details</h3>
                
                <div style="
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px; 
                  margin-bottom: 15px; 
                ">
                  <div style="background: rgba(0,0,0,0.3);  padding: 12px;  border-radius: 8px; ">
                    <p style="margin: 0;  font-size: 12px;  color: #a1a1aa;  text-transform: uppercase;  letter-spacing: 0.5px; ">Plan Type</p>
                    <p style="margin: 5px 0 0;  font-size: 16px;  color: ${colors.lightColor};  font-weight: 600; ">${planName}</p>
                  </div>
                  <div style="background: rgba(0,0,0,0.3);  padding: 12px;  border-radius: 8px; ">
                    <p style="margin: 0;  font-size: 12px;  color: #a1a1aa;  text-transform: uppercase;  letter-spacing: 0.5px; ">Amount Paid</p>
                    <p style="margin: 5px 0 0;  font-size: 16px;  color: ${colors.lightColor};  font-weight: 600; ">₹${amount}</p>
                  </div>
                </div>

                <div style="background: rgba(0,0,0,0.3);  padding: 12px;  border-radius: 8px; ">
                  <p style="margin: 0;  font-size: 12px;  color: #a1a1aa;  text-transform: uppercase;  letter-spacing: 0.5px; ">Valid Until</p>
                  <p style="margin: 5px 0 0;  font-size: 16px;  color: ${colors.lightColor};  font-weight: 600; ">📅 ${endDate}</p>
                </div>
              </div>

              <!-- Features Unlocked -->
              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid ${colors.badgeColor}; 
                padding: 20px; 
                border-radius: 10px; 
              ">
                <h3 style="color: ${colors.lightColor};  margin: 0 0 12px;  font-size: 16px; ">🚀 Features Unlocked</h3>
                <ul style="margin: 0;  padding-left: 18px;  color: #f3f3f3;  line-height: 2; ">
                  ${planType === 'ultimate' 
                    ? `
                    <li>✨ AI Tutoring & Smart Study Plans</li>
                    <li>🎯 Mock Exams with Detailed Analysis</li>
                    <li>👨‍🏫 1-on-1 Mentoring Sessions</li>
                    <li>📈 Advanced Analytics & Insights</li>
                    <li>🏆 Priority Support 24/7</li>
                    `
                    : `
                    <li>∞ Unlimited Quizzes</li>
                    <li>🤖 Daily AI Tests</li>
                    <li>📊 Analytics Dashboard</li>
                    <li>⚡ Advanced Features</li>
                    <li>🎯 Priority Support</li>
                    `
                  }
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;  margin: 30px 0; ">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
                  style="
                    background: ${colors.gradient}; 
                    color: white; 
                    text-decoration: none; 
                    padding: 14px 40px; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    display: inline-block; 
                    font-size: 15px; 
                    box-shadow: 0 0 15px ${colors.shadowColor}; 
                    text-shadow: 0 0 6px ${colors.primaryColor}; 
                  ">
                  🚀 Start Learning Now
                </a>
              </div>

              <p style="font-size: 14px;  color: #a1a1aa;  line-height: 1.6; ">
                Your ${planName} plan will automatically renew on ${endDate}. You can manage your subscription settings in your account dashboard anytime.
              </p>
            </div>

            <!-- FOOTER -->
            <div style="
              background: #0b1220; 
              text-align: center; 
              padding: 30px 20px 40px 20px; 
              color: #f0f0f0; 
            ">
              <p style="margin: 0 0 10px;  font-size: 13px;  color: #a78bfa; ">
                Thank you for supporting Self Ranker! 💜
              </p>
              <p style="font-size: 13px;  color: #a78bfa;  margin: 8px 0; ">
                © 2025 SelfRanker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('Subscription confirmation email sent:', info.response); 
    return { success: true, message: 'Subscription confirmation email sent successfully' }; 
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error); 
    return { success: false, error: error.message }; 
  }
}; 

// Send account deletion confirmation email
const sendAccountDeletionEmail = async (userEmail, userName) => {
  try {
    console.log(''); 
    console.log('🗑️  SENDING ACCOUNT DELETION EMAIL'); 
    console.log('   To:', userEmail); 
    console.log('   Name:', userName); 
    console.log('   From:', process.env.EMAIL_USER); 
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: '👋 Your Self Ranker Account Has Been Deleted',
      html: `
        <div style="
          font-family: 'Segoe UI', sans-serif; 
          background: repeating-linear-gradient(
            45deg,
            #0a0a0a,
            #0a0a0a 20px,
            rgba(220, 38, 38, 0.1) 20px,
            rgba(220, 38, 38, 0.1) 40px
          ); 
          color: #f0f0f0; 
          padding: 20px; 
        ">
          <div style="
            width: 95%; 
            max-width: 650px; 
            margin: auto; 
            background: rgba(15, 23, 42, 0.95); 
            border-radius: 16px; 
            box-shadow: 0 0 30px rgba(220, 38, 38, 0.5); 
            overflow: hidden; 
            border: 1px solid rgba(255,255,255,0.1); 
          ">

            <!-- HEADER -->
            <div style="
              background: linear-gradient(90deg, #dc2626, #991b1b); 
              padding: 35px 20px; 
              text-align: center; 
              color: #ffffff; 
              text-shadow: 0 0 8px #dc2626, 0 0 12px #991b1b; 
            ">
              <h1 style="margin: 0 0 10px;  font-size: 32px;  letter-spacing: 0.5px; ">
                Account Deleted
              </h1>
              <p style="opacity: 0.9;  font-size: 14px;  color: #ffffff;  margin: 0; ">
                Your Self Ranker account has been permanently removed
              </p>
            </div>

            <!-- BODY -->
            <div style="padding: 30px 20px; ">
              <h2 style="color: #ffffff;  font-size: 20px; ">Goodbye, ${userName}! 👋</h2>
              <p style="font-size: 15px;  color: #d1d5db;  line-height: 1.7; ">
                We've received your request and your Self Ranker account has been permanently deleted. All your personal data, quiz history, and subscription information have been securely removed from our servers.
              </p>

              <!-- WARNING: CANNOT BE RECOVERED -->
              <div style="
                margin: 20px 0; 
                background: rgba(220, 38, 38, 0.1); 
                border-left: 4px solid #dc2626; 
                border-radius: 4px; 
                padding: 15px; 
              ">
                <p style="margin: 0;  font-size: 14px;  color: #f87171;  font-weight: 600;  line-height: 1.6; ">
                  ⚠️ <strong>IMPORTANT:</strong> Your account <strong>CANNOT BE RECOVERED</strong> once deleted. This action is permanent and irreversible. All data associated with your account has been permanently erased from our systems.
                </p>
              </div>

              <!-- Deletion Details Card -->
              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid #dc2626; 
                padding: 20px; 
                border-radius: 10px; 
                box-shadow: 0 0 12px rgba(220, 38, 38, 0.3); 
              ">
                <h3 style="color: #fca5a5;  margin: 0 0 15px;  font-size: 16px; ">🔐 What Was Deleted</h3>
                <ul style="margin: 0;  padding-left: 18px;  color: #f3f3f3;  line-height: 2; ">
                  <li>✓ User profile and account information</li>
                  <li>✓ All quiz history and scores</li>
                  <li>✓ Learning progress and statistics</li>
                  <li>✓ Payment and subscription records</li>
                  <li>✓ Personal preferences and settings</li>
                </ul>
              </div>

              <!-- Retention Policy -->
              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid #f97316; 
                padding: 20px; 
                border-radius: 10px; 
              ">
                <h3 style="color: #fed7aa;  margin: 0 0 10px;  font-size: 16px; ">📋 Permanent Data Deletion</h3>
                <p style="margin: 0;  font-size: 14px;  color: #f3f3f3;  line-height: 1.6; ">
                  Your account and all associated data have been immediately and permanently erased from our primary systems. We do not maintain recoverable backups of deleted user accounts. Your data cannot be restored under any circumstances.
                </p>
              </div>

              <!-- Important Information -->
              <div style="
                margin: 25px 0; 
                background: rgba(30, 41, 59, 0.85); 
                border-left: 4px solid #8b5cf6; 
                padding: 20px; 
                border-radius: 10px; 
              ">
                <h3 style="color: #d8b4fe;  margin: 0 0 10px;  font-size: 16px; ">ℹ️ Important Notes</h3>
                <ul style="margin: 0;  padding-left: 18px;  color: #f3f3f3;  line-height: 1.8;  font-size: 14px; ">
                  <li><strong>Your account CANNOT be recovered</strong> - Deletion is permanent and irreversible</li>
                  <li><strong>All data is permanently erased</strong> - No backups or recovery options available</li>
                  <li>You can create a new account anytime with the same or different email</li>
                  <li>Any pending refunds have been processed (if applicable)</li>
                </ul>
              </div>

              <!-- CTA and Feedback -->
              <div style="text-align: center;  margin: 30px 0; ">
                <p style="font-size: 14px;  color: #9ca3af;  margin-bottom: 15px; ">
                  We'd love to know why you're leaving. Your feedback helps us improve!
                </p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback"
                  style="
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 30px; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    display: inline-block; 
                    font-size: 14px; 
                    box-shadow: 0 0 15px rgba(111, 0, 255, 0.4); 
                  ">
                  Share Your Feedback
                </a>
              </div>

              <p style="font-size: 14px;  color: #a1a1aa;  line-height: 1.6;  margin-top: 30px; ">
                If you have any questions or concerns about your account deletion, please don't hesitate to reach out to our support team at <strong>support@selfranker.com</strong>.
              </p>

              <p style="font-size: 13px;  color: #6b7280;  line-height: 1.6;  margin-top: 20px; ">
                <strong>⛔ Account Recovery Not Possible:</strong><br>
                Your account has been permanently deleted and cannot be restored under any circumstances. We do not maintain recovery options or backups for deleted accounts.                 If you wish to use Self Ranker again, you will need to create a new account.
              </p>
            </div>

            <!-- FOOTER -->
            <div style="
              background: #0b1220; 
              text-align: center; 
              padding: 30px 20px 40px 20px; 
              color: #f0f0f0; 
            ">
              <p style="margin: 0 0 10px;  font-size: 13px;  color: #f87171; ">
                We hope to see you again in the future! 
              </p>
              <p style="font-size: 13px;  color: #a78bfa;  margin: 8px 0; ">
                © 2025 Self Ranker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }; 

    console.log('   Sending via transporter...'); 
    const info = await transporter.sendMail(mailOptions); 
    console.log('   ✅ EMAIL SENT SUCCESSFULLY!'); 
    console.log('   Response:', info.response); 
    console.log(''); 
    return { success: true, message: 'Account deletion email sent successfully' }; 
  } catch (error) {
    console.log('   ❌ EMAIL FAILED TO SEND!'); 
    console.log('   Error Type:', error.name); 
    console.log('   Error Message:', error.message); 
    console.log('   Full Error:', error); 
    console.log(''); 
    return { success: false, error: error.message }; 
  }
}; 

// Send payment receipt email with PDF
const sendPaymentReceiptEmail = async (userEmail, userName, paymentDetails) => {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173'; 
    const { planName, amount, planType, period, createdAt, subscriptionEndDate, customerDetails, paymentMethodDetails } = paymentDetails; 
    
    const transactionDate = new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }); 
    const transactionTime = new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); 
    
    const planColors = {
      pro: '#8b5cf6',
      ultimate: '#f59e0b',
      free: '#6b7280'
    }; 
    
    const planColor = planColors[planType] || planColors.free; 

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: `💳 Payment Receipt - Self Ranker ${planName} Plan`,
      html: `
        <div style="
          font-family: 'Segoe UI', sans-serif; 
          background: #f0f0f0; 
          padding: 20px; 
        ">
          <div style="
            width: 95%; 
            max-width: 650px; 
            margin: auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
            overflow: hidden; 
          ">
            <!-- HEADER -->
            <div style="
              background: linear-gradient(90deg, ${planColor}, rgba(139,92,246,0.8)); 
              padding: 30px 20px; 
              text-align: center; 
              color: white; 
            ">
              <img src="${baseUrl}/pdf_mail.png" width="150" alt="Self Ranker Logo" style="margin-bottom: 10px;  max-width: 95%; " />
              <h1 style="margin: 10px 0 5px;  font-size: 24px; ">Payment Receipt</h1>
              <p style="opacity: 0.9;  font-size: 13px;  margin: 0; ">Thank you for your purchase!</p>
            </div>

            <!-- BODY -->
            <div style="padding: 25px 20px; ">
              <h2 style="color: #1f2937;  font-size: 18px; ">Hi ${userName},</h2>
              <p style="font-size: 14px;  color: #4b5563;  line-height: 1.6;  margin: 0 0 20px; ">
                Thank you for upgrading to the ${planName} plan! Your subscription is now active and ready to use.
              </p>

              <!-- Receipt Details -->
              <div style="
                background: #f9fafb; 
                border: 1px solid #e5e7eb; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px 0; 
                font-size: 14px; 
              ">
                <div style="display: grid;  grid-template-columns: 1fr 1fr;  gap: 15px;  margin-bottom: 15px; ">
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Order ID</p>
                    <p style="color: #1f2937;  margin: 0;  font-weight: 600; ">${paymentDetails.orderId}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Plan</p>
                    <p style="color: #1f2937;  margin: 0;  font-weight: 600;  text-transform: capitalize; ">${planName}</p>
                  </div>
                </div>

                <div style="display: grid;  grid-template-columns: 1fr 1fr;  gap: 15px;  margin-bottom: 15px; ">
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Transaction Date</p>
                    <p style="color: #1f2937;  margin: 0; ">${transactionDate}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Transaction Time</p>
                    <p style="color: #1f2937;  margin: 0; ">${transactionTime}</p>
                  </div>
                </div>

                <div style="display: grid;  grid-template-columns: 1fr 1fr;  gap: 15px;  margin-bottom: 15px; ">
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Payment Mode</p>
                    <p style="color: #1f2937;  margin: 0; ">${paymentMethodDetails || 'Razorpay'}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Period</p>
                    <p style="color: #1f2937;  margin: 0;  text-transform: capitalize; ">${period}</p>
                  </div>
                </div>

                <div>
                  <p style="color: #6b7280;  margin: 0 0 5px;  font-size: 12px;  font-weight: 600; ">Valid Till</p>
                  <p style="color: #1f2937;  margin: 0; ">${new Date(subscriptionEndDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                </div>
              </div>

              <!-- Amount -->
              <div style="
                background: linear-gradient(90deg, ${planColor}, rgba(139,92,246,0.8)); 
                border-radius: 8px; 
                padding: 20px; 
                text-align: center; 
                color: white; 
                margin: 20px 0; 
              ">
                <p style="margin: 0 0 10px;  font-size: 12px;  opacity: 0.9; ">Amount Paid</p>
                <h3 style="margin: 0;  font-size: 32px;  font-weight: 700; ">₹${amount}</h3>
              </div>

              <!-- Status -->
              <div style="
                background: #f0fdf4; 
                border-left: 4px solid #22c55e; 
                border-radius: 4px; 
                padding: 12px 15px; 
                margin: 20px 0; 
                font-size: 14px; 
                color: #166534; 
              ">
                ✅ Payment confirmed. Your subscription is active immediately.
              </div>

              <!-- Next Steps -->
              <div style="margin: 25px 0; ">
                <h3 style="color: #1f2937;  font-size: 16px;  margin: 0 0 12px; ">📋 Next Steps</h3>
                <ol style="margin: 0;  padding-left: 20px;  color: #4b5563;  line-height: 1.8;  font-size: 14px; ">
                  <li>Log in to your dashboard</li>
                  <li>Start creating quizzes</li>
                  <li>Track your progress</li>
                </ol>
              </div>

              <!-- Support -->
              <div style="
                background: #eff6ff; 
                border-left: 4px solid #3b82f6; 
                border-radius: 4px; 
                padding: 12px 15px; 
                margin: 20px 0; 
                font-size: 14px; 
                color: #1e40af; 
              ">
                <strong>💬 Support:</strong> If you have any questions, reach out to support@selfranker.com
              </div>
            </div>

            <!-- FOOTER -->
            <div style="
              background: #f9fafb; 
              text-align: center; 
              padding: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 12px; 
              color: #6b7280; 
            ">
              <p style="margin: 0 0 10px; ">© 2025 Self Ranker. All rights reserved.</p>
              <p style="margin: 0; ">support@selfranker.com | www.selfranker.com</p>
            </div>
          </div>
        </div>
      `,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('Payment receipt email sent:', info.response); 
    return { success: true, message: 'Payment receipt email sent successfully' }; 
  } catch (error) {
    console.error('Error sending payment receipt email:', error); 
    return { success: false, error: error.message }; 
  }
}; 

// Send account blocked email
const sendAccountBlockedEmail = async (userEmail, userName, blockReason, duration = 'permanent', blockExpiryDate = null) => {
  try {
    const { getEmailTemplate } = require('../utils/emailTemplate'); 

    const subject = `⚠️ Your Self Ranker Account Has Been Blocked`; 
    
    let durationText = 'Permanent'; 
    let durationInfo = 'This block is permanent and will remain in effect unless manually reviewed by our support team.'; 
    
    if (duration === '1d') {
      durationText = '1 Day'; 
      durationInfo = `This block will automatically expire on ${new Date(blockExpiryDate).toLocaleDateString()} at ${new Date(blockExpiryDate).toLocaleTimeString()}.`; 
    } else if (duration === '7d') {
      durationText = '7 Days'; 
      durationInfo = `This block will automatically expire on ${new Date(blockExpiryDate).toLocaleDateString()} at ${new Date(blockExpiryDate).toLocaleTimeString()}.`; 
    } else if (duration === '30d') {
      durationText = '30 Days'; 
      durationInfo = `This block will automatically expire on ${new Date(blockExpiryDate).toLocaleDateString()} at ${new Date(blockExpiryDate).toLocaleTimeString()}.`; 
    } else if (duration === '90d') {
      durationText = '90 Days'; 
      durationInfo = `This block will automatically expire on ${new Date(blockExpiryDate).toLocaleDateString()} at ${new Date(blockExpiryDate).toLocaleTimeString()}.`; 
    }
    
    const message = `
      <div style="line-height: 1.8;  color: #333; ">
        <p>We regret to inform you that your Self Ranker account has been blocked effective immediately.</p>
        
        <div style="
          background-color: #fee2e2; 
          border-left: 4px solid #ef4444; 
          padding: 15px; 
          margin: 20px 0; 
          border-radius: 4px; 
        ">
          <p style="margin: 0 0 10px 0;  font-weight: bold;  color: #991b1b; ">Reason for Block:</p>
          <p style="margin: 0;  color: #7f1d1d;  font-size: 16px; ">${blockReason}</p>
        </div>

        <div style="
          background-color: #fef3c7; 
          border-left: 4px solid #f59e0b; 
          padding: 15px; 
          margin: 20px 0; 
          border-radius: 4px; 
        ">
          <p style="margin: 0 0 10px 0;  font-weight: bold;  color: #92400e; ">Block Duration:</p>
          <p style="margin: 0 0 5px 0;  color: #b45309;  font-size: 16px;  font-weight: bold; ">${durationText}</p>
          <p style="margin: 0;  color: #a16207;  font-size: 14px; ">${durationInfo}</p>
        </div>

        <p><strong>What this means:</strong></p>
        <ul style="color: #555; ">
          <li>You will no longer be able to log in to your account</li>
          <li>Your access to all features has been suspended</li>
          <li>Your subscription (if any) has been paused</li>
        </ul>

        <p><strong>Next Steps:</strong></p>
        <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team at <strong>support@selfranker.com</strong></p>

        <p style="margin-top: 30px;  color: #666;  font-size: 14px; ">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `; 

    const htmlTemplate = getEmailTemplate(userName, subject, message, 'blocked'); 

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('✅ Account blocked notification sent to:', userEmail); 
    return { success: true, message: 'Account blocked email sent successfully' }; 
  } catch (error) {
    console.error('Error sending account blocked email:', error); 
    return { success: false, error: error.message }; 
  }
}; 

// Send account unblocked email
const sendAccountUnblockedEmail = async (userEmail, userName) => {
  try {
    const { getEmailTemplate } = require('../utils/emailTemplate'); 

    const subject = `✅ Your Self Ranker Account Has Been Unblocked`; 
    
    const message = `
      <div style="line-height: 1.8;  color: #333; ">
        <p>Great news! Your Self Ranker account has been unblocked and is now active.</p>
        
        <div style="
          background-color: #dcfce7; 
          border-left: 4px solid #22c55e; 
          padding: 15px; 
          margin: 20px 0; 
          border-radius: 4px; 
        ">
          <p style="margin: 0;  color: #15803d;  font-size: 16px; ">Your account is now fully accessible and operational.</p>
        </div>

        <p><strong>You can now:</strong></p>
        <ul style="color: #555; ">
          <li>Log in to your account with your credentials</li>
          <li>Access all features and courses</li>
          <li>Use your subscription (if active)</li>
          <li>Create and take quizzes</li>
        </ul>

        <p><strong>Next Steps:</strong></p>
        <p>Simply log in to your account to get started. If you have any questions, feel free to contact our support team at <strong>support@selfranker.com</strong></p>

        <p style="margin-top: 30px;  color: #666;  font-size: 14px; ">
          Welcome back to Self Ranker! We're excited to have you with us again.
        </p>
      </div>
    `; 

    const htmlTemplate = getEmailTemplate(userName, subject, message, 'promotion'); 

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@selfranker.com',
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    }; 

    const info = await transporter.sendMail(mailOptions); 
    console.log('✅ Account unblocked notification sent to:', userEmail); 
    return { success: true, message: 'Account unblocked email sent successfully' }; 
  } catch (error) {
    console.error('Error sending account unblocked email:', error); 
    return { success: false, error: error.message }; 
  }
}; 

module.exports = {
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendAccountDeletionEmail,
  sendPaymentReceiptEmail,
  sendAccountBlockedEmail,
  sendAccountUnblockedEmail,
}; 
