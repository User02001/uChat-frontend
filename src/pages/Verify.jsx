import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { verifyStyles } from '../styles/verify_email';
import { API_BASE_URL } from '../config';
import useStars from "../hooks/useStars";
import Icon from '../components/Icon';

const Verify = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [verificationCode, setVerificationCode] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [loading, setLoading] = useState(false);
 const [email, setEmail] = useState('');
 const canvasRef = useStars();

 useEffect(() => {
  const checkAuthAndSetup = async () => {
   try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
     credentials: 'include'
    });

    if (response.ok) {
     const data = await response.json();
     setEmail(data.user.email);
     return;
    }
   } catch (error) {
    console.log('Not logged in, checking navigation state');
   }

   if (location.state && location.state.email) {
    setEmail(location.state.email);
   } else {
    navigate('/signup');
    return;
   }
  };

  checkAuthAndSetup();
 }, [location.state, navigate]);

 useEffect(() => {
  document.title = 'uChat - Verify Email';

  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicons/email_verification.png';
  document.getElementsByTagName('head')[0].appendChild(favicon);

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleThemeChange);
  return () => mediaQuery.removeEventListener('change', handleThemeChange);
 }, []);

 const handleInputChange = (e) => {
  const value = e.target.value;
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
   let response = await fetch(`${API_BASE_URL}/api/verify-logged-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code: verificationCode })
   });

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
     navigate('/chat');
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
   let response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
   });

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
  <div data-verify-page="true" {...stylex.props(verifyStyles.container)}>
   <canvas ref={canvasRef} {...stylex.props(verifyStyles.starCanvas)} aria-hidden="true" />
   <div {...stylex.props(verifyStyles.card)} role="region" aria-label="Email verification form">
    <div {...stylex.props(verifyStyles.header)}>
     <div {...stylex.props(verifyStyles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(verifyStyles.mainLogo)}
       draggable="false"
      />
     </div>
     <h1 {...stylex.props(verifyStyles.title)}>
      <i className="fas fa-envelope-open" style={{ marginRight: '12px', color: 'orange' }} aria-hidden="true"></i>
      Verify Your Email
     </h1>

     <div {...stylex.props(verifyStyles.explanation)}>
      <p {...stylex.props(verifyStyles.explanationText)}>
       We've sent a 7-digit code to <strong>{email}</strong> to verify that you actually own this email.
      </p>
      <p {...stylex.props(verifyStyles.explanationText)} style={{ marginTop: '12px' }}>
       Check your spam folder if you don't see the email in your inbox.
      </p>
      <p {...stylex.props(verifyStyles.explanationText)} style={{ marginTop: '8px', fontSize: '13px', opacity: '0.8' }}>
       Email may take 5 or more minutes to arrive. We're sorry for the massive wait :(
      </p>
     </div>
    </div>

    <div {...stylex.props(verifyStyles.form)}>
     {error && (
      <div {...stylex.props(verifyStyles.alert, verifyStyles.alertError)} role="alert">
       <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }} aria-hidden="true"></i>
       {error}
      </div>
     )}

     {success && (
      <div {...stylex.props(verifyStyles.alert, verifyStyles.alertSuccess)} role="alert">
       <i className="fas fa-check-circle" style={{ marginRight: '8px' }} aria-hidden="true"></i>
       {success}
      </div>
     )}

     <form onSubmit={handleVerification}>
      <div {...stylex.props(verifyStyles.stepHeader)}>
       <h2 {...stylex.props(verifyStyles.stepHeaderTitle)}>Enter verification code</h2>
       <p {...stylex.props(verifyStyles.stepHeaderSubtitle)}>The 7-digit code sent to your email</p>
      </div>

      <div {...stylex.props(verifyStyles.inputGroup)}>
       <label
        htmlFor="verificationCode"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
       >
        Verification code
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
         autoComplete="one-time-code"
         required
         autoFocus
         {...stylex.props(verifyStyles.input)}
         aria-invalid={!!error}
         aria-describedby={error ? "verify-error" : "code-counter"}
        />
       </div>
       <div
        id="code-counter"
        style={{
         fontSize: '12px',
         color: verificationCode.length === 7 ? '#4caf50' : 'var(--text-secondary)',
         marginTop: '4px',
         textAlign: 'right'
        }}
        aria-live="polite"
       >
        {verificationCode.length}/7 digits
       </div>
      </div>

      <div {...stylex.props(verifyStyles.buttonContainer)}>
       <button
        type="submit"
        {...stylex.props(verifyStyles.primaryBtn)}
        disabled={loading || verificationCode.length !== 7}
        aria-label={loading ? "Verifying email" : "Verify email"}
       >
        <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
        {loading ? 'Verifying...' : 'Verify Email'}
       </button>
      </div>

      <button
       type="button"
       onClick={() => navigate('/chat')}
       {...stylex.props(verifyStyles.skipBtn)}
       aria-label="Skip email verification and continue to chat"
      >
       <i className="fas fa-arrow-right" style={{ marginRight: '8px' }} aria-hidden="true"></i>
       Skip verification for now
      </button>
     </form>

     <div {...stylex.props(verifyStyles.divider)} role="separator" aria-label="Or">
      <div {...stylex.props(verifyStyles.dividerLine)}></div>
      <span {...stylex.props(verifyStyles.dividerText)}>didn't receive the code?</span>
     </div>

     <button
      type="button"
      onClick={handleResendCode}
      {...stylex.props(verifyStyles.resendBtn)}
      disabled={loading}
      aria-label={loading ? "Sending verification code" : "Resend verification code"}
     >
      <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
      {loading ? 'Sending...' : 'Resend Code'}
     </button>
    </div>

    <div {...stylex.props(verifyStyles.footer)}>
     <p {...stylex.props(verifyStyles.footerText)}>
      Remember your password?
      <a href="/login" {...stylex.props(verifyStyles.footerLink)}>
       <i className="fas fa-sign-in-alt" style={{ marginLeft: '8px', marginRight: '4px' }} aria-hidden="true"></i>
       Back to Login
      </a>
     </p>
    </div>
   </div>
  </div>
 );
};

export default Verify;