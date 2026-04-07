import React from 'react'; 
import { GoogleLogin } from '@react-oauth/google'; 

const GoogleSignInButton = ({ onSuccess, onError, isSignup = false, loading = false }) => {
  return (
    <div className="w-full">
      <style>{`
        /* Maximum specificity for Google button styling */
        .google-signin-wrapper {
          width: 100% !important; 
        }

        .google-signin-wrapper .gsi-material {
          width: 100% !important; 
        }

        .google-signin-wrapper > div {
          width: 100% !important; 
          display: flex; 
          justify-content: center; 
        }

        .google-signin-wrapper > div > div {
          width: 100% !important; 
        }

        /* Target all possible Google button containers */
        .google-signin-wrapper [role="button"],
        .google-signin-wrapper button,
        .google-signin-wrapper div[data-oauth-button] {
          width: 100% !important; 
          background: #1e293b !important; 
          border: 1px solid #475569 !important; 
          border-radius: 8px !important; 
          padding: 10px 16px !important; 
          height: 40px !important; 
          min-height: 40px !important; 
          max-height: 40px !important; 
          font-size: 14px !important; 
          font-weight: 600 !important; 
          color: #e2e8f0 !important; 
          cursor: pointer !important; 
          transition: all 0.3s ease !important; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important; 
          display: flex !important; 
          align-items: center !important; 
          justify-content: center !important; 
          gap: 8px !important; 
        }

        .google-signin-wrapper [role="button"]:hover,
        .google-signin-wrapper button:hover,
        .google-signin-wrapper div[data-oauth-button]:hover {
          background: #0f172a !important; 
          border-color: #64748b !important; 
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4) !important; 
          transform: translateY(-2px) !important; 
        }

        .google-signin-wrapper [role="button"]:active,
        .google-signin-wrapper button:active,
        .google-signin-wrapper div[data-oauth-button]:active {
          transform: scale(0.98) !important; 
        }

        /* Google icon styling */
        .google-signin-wrapper img {
          width: 18px !important; 
          height: 18px !important; 
          margin: 0 8px 0 0 !important; 
          filter: none !important; 
        }

        /* Text styling */
        .google-signin-wrapper span {
          color: #e2e8f0 !important; 
          font-weight: 600 !important; 
          font-size: 14px !important; 
        }

        /* For iframe rendering */
        .google-signin-wrapper iframe {
          width: 100% !important; 
          height: 40px !important; 
          border: none !important; 
        }

        /* GSI Button specific targeting */
        .google-signin-wrapper .gsi-button {
          width: 100% !important; 
        }

        .google-signin-wrapper .gsi-button > div {
          width: 100% !important; 
        }

        /* Disable Google's default styling */
        .google-signin-wrapper .gsi-material-button {
          width: 100% !important; 
          background: #1e293b !important; 
          border: 1px solid #475569 !important; 
          border-radius: 8px !important; 
        }

        .google-signin-wrapper .gsi-material-button:hover {
          background: #0f172a !important; 
          border-color: #64748b !important; 
        }
      `}</style>

      <div className="google-signin-wrapper w-full">
        <GoogleLogin 
          onSuccess={onSuccess}
          onError={onError}
          text={isSignup ? "signup_with" : "signin_with"}
          size="large"
          width="100%"
          locale="en"
          theme="dark"
        />
      </div>
    </div>
  ); 
}; 

export default GoogleSignInButton; 
