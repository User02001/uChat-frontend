import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import { API_BASE_URL } from '../config';

const GoogleAuth = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [formData, setFormData] = useState({
  username: '',
  handle: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [userInfo, setUserInfo] = useState(null);

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
  document.title = 'uChat - Complete Setup';

  // Update favicon
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicon_add_user.png';
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

 useEffect(() => {
  // Check if we have user info from Google OAuth callback
  const urlParams = new URLSearchParams(location.search);
  const email = urlParams.get('email');
  const name = urlParams.get('name');
  const needsSetup = urlParams.get('setup') === 'true';

  if (email && name && needsSetup) {
   setUserInfo({ email, name });
   setFormData(prev => ({
    ...prev,
    username: name // Pre-fill with Google name
   }));
  } else {
   // If no setup needed or missing params, redirect to appropriate page
   navigate('/chat');
  }
 }, [location, navigate]);

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: value
  }));
  if (error) setError(''); // Clear error when user starts typing
 };

 const handleSetupComplete = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Client-side validation
  if (!formData.username.trim()) {
   setError('Display name is required');
   setLoading(false);
   return;
  }

  if (!formData.handle.trim()) {
   setError('Handle is required');
   setLoading(false);
   return;
  }

  // Handle validation
  const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
  if (handle.length < 3 || handle.length > 32 || !/^[a-zA-Z0-9_-]+$/.test(handle)) {
   setError('Handle must be 3-32 characters and use only letters, numbers, underscore, or dash');
   setLoading(false);
   return;
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/complete-google-setup`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
     username: formData.username.trim(),
     handle: handle
    })
   });

   const data = await response.json();

   if (response.ok) {
    // Setup complete, redirect to chat
    navigate('/chat');
   } else {
    setError(data.error || 'Setup failed');
   }
  } catch (error) {
   console.error('Setup error:', error);
   setError('Network error. Please try again.');
  } finally {
   setLoading(false);
  }
 };

 if (!userInfo) {
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
      <h1>
       <i className="fas fa-spinner fa-spin" style={{ marginRight: '12px', color: 'var(--primary-color, #007bff)' }}></i>
       Loading...
      </h1>
     </div>
    </div>
   </div>
  );
 }

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
     <h1>
      <i className="fas fa-cogs" style={{ marginRight: '12px', color: 'var(--primary-color, #007bff)' }}></i>
      Complete Your Setup
     </h1>
     <p>
      <i className="fas fa-google" style={{ marginRight: '8px', opacity: 0.7 }}></i>
      Hello {userInfo.name}! Just need a few more details to set up your uChat account.
     </p>
     <div style={{
      backgroundColor: 'var(--success-bg, #f0f9ff)',
      color: 'var(--success-text, #065f46)',
      padding: '12px',
      borderRadius: '6px',
      marginTop: '16px',
      fontSize: '14px',
      border: '1px solid var(--success-border, #a7f3d0)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
     }}>
      <i className="fas fa-check-circle"></i>
      Connected with Google: {userInfo.email}
     </div>
    </div>

    <div className={styles.loginForm}>
     {error && (
      <div style={{
       backgroundColor: 'var(--error-bg, #fee)',
       color: 'var(--error-text, #c53030)',
       padding: '12px',
       borderRadius: '6px',
       marginBottom: '16px',
       fontSize: '14px',
       border: '1px solid var(--error-border, #feb2b2)',
       display: 'flex',
       alignItems: 'center',
       gap: '8px'
      }}>
       <i className="fas fa-exclamation-circle"></i>
       {error}
      </div>
     )}

     <form onSubmit={handleSetupComplete}>
      <div className={styles.inputGroup}>
       <label htmlFor="username">
        <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
        Display Name
       </label>
       <div style={{ position: 'relative' }}>
        <input
         type="text"
         id="username"
         name="username"
         value={formData.username}
         onChange={handleInputChange}
         placeholder="How should we display your name?"
         required
         style={{ paddingLeft: '40px' }}
        />
        <i className="fas fa-id-card" style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         color: 'var(--text-secondary, #666)',
         fontSize: '14px'
        }}></i>
       </div>
      </div>

      <div className={styles.inputGroup}>
       <label htmlFor="handle">
        <i className="fas fa-hashtag" style={{ marginRight: '8px' }}></i>
        Handle
       </label>
       <div style={{ position: 'relative' }}>
        <input
         type="text"
         id="handle"
         name="handle"
         value={formData.handle}
         onChange={handleInputChange}
         placeholder="Your unique handle (e.g., @johndoe)"
         required
         style={{ paddingLeft: '40px' }}
        />
        <i className="fas fa-tag" style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         color: 'var(--text-secondary, #666)',
         fontSize: '14px'
        }}></i>
       </div>
       <small style={{
        color: 'var(--text-secondary, #666)',
        fontSize: '12px',
        marginTop: '4px',
        display: 'block'
       }}>
        <i className="fas fa-info-circle" style={{ marginRight: '4px' }}></i>
        3-32 characters, letters, numbers, underscore, or dash only
       </small>
      </div>

      <button type="submit" className={`${styles.loginBtn} ${styles.primary}`} disabled={loading}>
       <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'} style={{ marginRight: '8px' }}></i>
       {loading ? 'Setting up...' : 'Complete Setup'}
      </button>
     </form>
    </div>

    <div className={styles.loginFooter}>
     <p>
      <i className="fas fa-shield-alt" style={{ marginRight: '8px', opacity: 0.7 }}></i>
      Your Google account is securely connected
     </p>
    </div>
   </div>
  </div>
 );
};

export default GoogleAuth;