import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
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
  // Check if user is already logged in first
  const checkAuthAndSetup = async () => {
   try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
     credentials: 'include'
    });

    if (response.ok) {
     // User is logged in
     const data = await response.json();
     setEmail(data.user.email);
     return; // Don't redirect, user is authenticated
    }
   } catch (error) {
    console.log('Not logged in, checking navigation state');
   }

   // If not logged in, check navigation state like before
   if (location.state && location.state.email) {
    setEmail(location.state.email);
   } else {
    // Only redirect to signup if not logged in AND no email in state
    navigate('/signup');
    return;
   }
  };

  checkAuthAndSetup();
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
   // Try logged-in verification first, fallback to regular verification
   let response = await fetch(`${API_BASE_URL}/api/verify-logged-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code: verificationCode })
   });

   // If that fails with 401, try regular verification
   if (response.status === 401) {
    response = await fetch(`${API_BASE_URL}/api/verify`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ code: verificationCode })
    });
   }

   const data = await response.json();

   if (response.ok) {
    setSuccess('Email verified successfully! Redirecting...');
    setTimeout(() => {
     navigate('/chat'); // Always redirect to chat after verification
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
   // Try logged-in resend first, fallback to regular resend
   let response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
   });

   // If that fails with 401, try regular resend
   if (response.status === 401) {
    response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ email })
    });
   }

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
  <div className={styles.loginContainer}>
   <div className={styles.auraBackground}></div>
   <div className={styles.loginCard}>
    <div className={styles.loginHeader}>
     <div className={styles.logoContainer} style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px'
     }}>
      <img
       src="/resources/main-logo.svg"
       alt="uChat Logo"
       className={styles.mainLogo}
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
     <p className={styles.helperText}>
      Check your spam folder if you don't see the email in your inbox.
     </p>
     <p className={styles.helperText}>
      Email may take 5 or more minutes to arrive.
     </p>
    </div>

    <div className={styles.loginForm}>
     {error && (
      <div className={`${styles.alert} ${styles.alertError}`}>
       {error}
      </div>
     )}

     {success && (
      <div className={`${styles.alert} ${styles.alertSuccess}`}>
       {success}
      </div>
     )}

     <form onSubmit={handleVerification}>
      <div className={styles.inputGroup}>
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
         className={styles.verificationInput}
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

      <button type="submit" className={`${styles.loginBtn} ${styles.primary}`} disabled={loading}>
       <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-envelope-open'} style={{ marginRight: '8px' }}></i>
       {loading ? 'Verifying...' : 'Verify Email'}
      </button>

      <button
       type="button"
       onClick={() => navigate('/chat')}
       className={styles.oauthBtn}
       style={{ marginTop: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
      >
       <i className="fas fa-arrow-right" style={{ marginRight: '8px' }}></i>
       Skip verification for now
      </button>
     </form>

     <div className={styles.divider}>
      <span>didn't receive the code?</span>
     </div>

     <button
      onClick={handleResendCode}
      className={styles.oauthBtn}
      disabled={loading}
      style={{ marginBottom: '0' }}
     >
      <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} style={{ marginRight: '8px' }}></i>
      {loading ? 'Sending...' : 'Resend Code'}
     </button>
    </div>

    <div className={styles.loginFooter}>
     <p>Remember your password? <a href="/login">Back to Login</a></p>
    </div>
   </div>
  </div>
 );
};

export default Verify;