import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config';

const Login = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
  email: '',
  password: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);

 useEffect(() => {
  // Load Font Awesome
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.rel = 'stylesheet';
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(fontAwesomeLink);

  // Add breathing animation CSS
  const style = document.createElement('style');
  document.head.appendChild(style);

  return () => {
   // Cleanup styles
   if (document.head.contains(style)) {
    document.head.removeChild(style);
   }
   if (document.head.contains(fontAwesomeLink)) {
    document.head.removeChild(fontAwesomeLink);
   }
  };
 }, []);

 useEffect(() => {
  // Set page title and favicon
  document.title = 'uChat - Login';

  // Update favicon
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicon_key.png';
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
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: value
  }));
  if (error) setError(''); // Clear error when user starts typing
 };

 const handleGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const handleEmailLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
   const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData)
   });

   const data = await response.json();

   if (response.ok) {
    // Login successful
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/chat');
   } else {
    setError(data.error || 'Login failed');
   }
  } catch (error) {
   console.error('Login error:', error);
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
     <h1>
      <i className="fas fa-comments" style={{ marginRight: '12px', color: 'var(--primary-color, #007bff)' }}></i>
      Welcome to uChat
     </h1>
     <p>
      <i className="fas fa-sign-in-alt" style={{ marginRight: '8px', opacity: 0.7 }}></i>
      Hello there, now log in to start chatting :D
     </p>
    </div>

    <div className="login-form">
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

     <form onSubmit={handleEmailLogin}>
      <div className="input-group">
       <label htmlFor="email">
        <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
        Email
       </label>
       <div style={{ position: 'relative' }}>
        <input
         type="email"
         id="email"
         name="email"
         value={formData.email}
         onChange={handleInputChange}
         placeholder="Enter your email"
         required
         style={{ paddingLeft: '40px' }}
        />
        <i className="fas fa-at" style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         color: 'var(--text-secondary, #666)',
         fontSize: '14px'
        }}></i>
       </div>
      </div>
      <div className="input-group">
       <label htmlFor="password">
        <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
        Password
       </label>
       <div style={{ position: 'relative' }}>
        <input
         type={showPassword ? 'text' : 'password'}
         id="password"
         name="password"
         value={formData.password}
         onChange={handleInputChange}
         placeholder="Enter your password"
         required
         style={{ paddingLeft: '40px', paddingRight: '40px' }}
        />
        <i className="fas fa-key" style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         color: 'var(--text-secondary, #666)',
         fontSize: '14px'
        }}></i>
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary, #666)',
          fontSize: '14px'
         }}
        >
         <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
        </button>
       </div>
      </div>
      <button type="submit" className="login-btn primary" disabled={loading}>
       {loading ? 'Logging in...' : 'Login'}
      </button>
     </form>

     <div className="divider">
      <span>or continue with</span>
     </div>

     <div className="oauth-buttons">
      <button onClick={handleGoogleLogin} className="oauth-btn google" disabled={loading}>
       <img
        src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
        alt="Google"
        width="18"
        height="18"
        style={{ marginRight: '0px' }}
       />
       Google
      </button>
     </div>
    </div>

    <div className="login-footer">
     <p>
      Don't have an account?
      <a href="/signup">
       <i className="fas fa-user-plus" style={{ marginLeft: '8px', marginRight: '4px' }}></i>
       Sign up
      </a>
     </p>
    </div>
   </div>
  </div>
 );
};

export default Login;