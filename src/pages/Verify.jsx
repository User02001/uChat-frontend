import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config';

const Verify = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [verificationCode, setVerificationCode] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [loading, setLoading] = useState(false);
 const [email, setEmail] = useState('');

 useEffect(() => {
  // Get email from navigation state or redirect if not available
  if (location.state && location.state.email) {
   setEmail(location.state.email);
  } else {
   // If no email in state, redirect to signup
   navigate('/signup');
   return;
  }
 }, [location.state, navigate]);

 useEffect(() => {
  // Load Font Awesome
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.rel = 'stylesheet';
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(fontAwesomeLink);

  return () => {
   if (document.head.contains(fontAwesomeLink)) {
    document.head.removeChild(fontAwesomeLink);
   }
  };
 }, []);

 useEffect(() => {
  // Set page title and favicon
  document.title = 'uChat - Verify Email';

  // Update favicon
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicon_email_verify.png';
  document.getElementsByTagName('head')[0].appendChild(favicon);

  // Detect system theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleThemeChange);
  return () => mediaQuery.removeEventListener('change', handleThemeChange);
 }, []);

 const handleInputChange = (e) => {
  const value = e.target.value;
  // Only allow numbers and limit to 7 digits
  if (/^\d{0,7}$/.test(value)) {
   setVerificationCode(value);
   if (error) setError('');
   if (success) setSuccess('');
  }
 };

 const handleVerification = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  if (verificationCode.length !== 7) {
   setError('Please enter the complete 7-digit verification code');
   setLoading(false);
   return;
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code: verificationCode })
   });

   const data = await response.json();

   if (response.ok) {
    setSuccess('Email verified successfully! Redirecting to login...');
    setTimeout(() => {
     navigate('/login');
    }, 2000);
   } else {
    setError(data.error || 'Verification failed');
   }
  } catch (error) {
   console.error('Verification error:', error);
   setError('Network error. Please try again.');
  } finally {
   setLoading(false);
  }
 };

 const handleResendCode = async () => {
  setLoading(true);
  setError('');
  setSuccess('');

  try {
   const response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email })
   });

   const data = await response.json();

   if (response.ok) {
    setSuccess('A new verification code has been sent to your email.');
   } else {
    setError(data.error || 'Failed to resend verification code.');
   }
  } catch (error) {
   console.error('Resend error:', error);
   setError('Network error. Please try again.');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="login-container">
   <div className="aura-background"></div>
   <div className="login-card">
    <div className="login-header">
     <div className="logo-container" style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px'
     }}>
      <img
       src="/resources/main-logo.svg"
       alt="uChat Logo"
       className="main-logo"
       style={{
        width: '80px',
        height: '80px',
        objectFit: 'contain'
       }}
       draggable="false"
      />
     </div>
     <h1>Verify Your Email</h1>
     <p>We've sent a 7-digit code to <strong>{email}</strong> in order to verify that you actually own this email.</p>
     <p className="helper-text">
      Check your spam folder if you don't see the email in your inbox.
     </p>
     <p className="helper-text">
      The email should be from <strong>uchat@ufonic.xyz</strong>, and anything else are FAKE, so don't trust them.
     </p>
    </div>

    <div className="login-form">
     {error && (
      <div className="alert alert-error">
       {error}
      </div>
     )}

     {success && (
      <div className="alert alert-success">
       {success}
      </div>
     )}

     <form onSubmit={handleVerification}>
      <div className="input-group">
       <label htmlFor="verificationCode">
        <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>
        Verification Code
       </label>
       <div style={{ position: 'relative' }}>
        <input
         type="text"
         id="verificationCode"
         name="verificationCode"
         value={verificationCode}
         onChange={handleInputChange}
         placeholder="Enter 7-digit code"
         maxLength="7"
         className="verification-input"
         autoComplete="one-time-code"
         required
         style={{ paddingLeft: '40px' }}
        />
        <i className="fas fa-key" style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         color: 'var(--text-secondary, #666)',
         fontSize: '14px'
        }}></i>
       </div>
      </div>

      <button type="submit" className="login-btn primary" disabled={loading}>
       <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-envelope-open'} style={{ marginRight: '8px' }}></i>
       {loading ? 'Verifying...' : 'Verify Email'}
      </button>
     </form>

     <div className="divider">
      <span>didn't receive the code?</span>
     </div>

     <button
      onClick={handleResendCode}
      className="oauth-btn"
      disabled={loading}
      style={{ marginBottom: '0' }}
     >
      <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} style={{ marginRight: '8px' }}></i>
      {loading ? 'Sending...' : 'Resend Code'}
     </button>
    </div>

    <div className="login-footer">
     <p>Remember your password? <a href="/login">Back to Login</a></p>
    </div>
   </div>
  </div>
 );
};

export default Verify;