import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Verify = () => {
 const lottieRef = useRef(null);
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

  // Load Lottie animation
  const script = document.createElement('script');
  script.src = '/resources/lottie.js';
  script.onload = () => {
   if (window.lottie && lottieRef.current) {
    window.lottie.loadAnimation({
     container: lottieRef.current,
     renderer: 'svg',
     loop: true,
     autoplay: true,
     path: '/resources/data.json'
    });
   }
  };
  document.head.appendChild(script);

  return () => {
   if (document.head.contains(script)) {
    document.head.removeChild(script);
   }
  };
 }, [location.state, navigate]);

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
   const response = await fetch('http://localhost:5000/api/verify', {
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
   const response = await fetch('http://localhost:5000/api/resend-verification', {
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
   <div className="login-card">
    <div className="login-header">
     <div ref={lottieRef} className="logo-animation"></div>
     <h1>Verify Your Email</h1>
     <p>We've sent a 7-digit code to <strong>{email}</strong></p>
     <p className="helper-text">
      Check your spam folder if you don't see it in your inbox
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
       <label htmlFor="verificationCode">Verification Code</label>
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
       />
      </div>

      <button
       type="submit"
       className={`login-btn primary ${loading ? 'loading' : ''}`}
       disabled={loading}
      >
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