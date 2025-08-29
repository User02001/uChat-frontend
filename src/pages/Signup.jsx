import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Using the same CSS file for consistent styling
import { API_BASE_URL } from '../config';

const Signup = () => {
 const lottieRef = useRef(null);
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  handle: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  // Load Lottie animation - same approach as Login component
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
 }, []);

 useEffect(() => {
  // Set page title and favicon
  document.title = 'uChat - Sign Up';

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

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: value
  }));
  if (error) setError(''); // Clear error when user starts typing
 };

 const handleGoogleSignup = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const handleEmailSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Client-side validation
  if (formData.password !== formData.confirmPassword) {
   setError('Passwords do not match!');
   setLoading(false);
   return;
  }

  if (formData.password.length < 8) {
   setError('Password must be at least 8 characters long!');
   setLoading(false);
   return;
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData)
   });

   const data = await response.json();

   if (response.ok) {
    // Signup successful, redirect to verification
    navigate('/verify', { state: { email: formData.email } });
   } else {
    setError(data.error || 'Signup failed');
   }
  } catch (error) {
   console.error('Signup error:', error);
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
     <h1>Join uChat</h1>
     <p>Create your account to start chatting</p>
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
       border: '1px solid var(--error-border, #feb2b2)'
      }}>
       {error}
      </div>
     )}

     <form onSubmit={handleEmailSignup}>
      <div className="input-group">
       <label htmlFor="username">Full Name</label>
       <input
        type="text"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        placeholder="Enter your full name"
        required
       />
      </div>

      <div className="input-group">
       <label htmlFor="email">Email</label>
       <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter your email address"
        required
       />
      </div>

      <div className="input-group">
       <label htmlFor="handle">Handle</label>
       <input
        type="text"
        id="handle"
        name="handle"
        value={formData.handle}
        onChange={handleInputChange}
        placeholder="Unique handle that can be anything"
        required
       />
      </div>

      <div className="input-group">
       <label htmlFor="password">Password</label>
       <input
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Create a strong password"
        minLength="8"
        required
       />
      </div>

      <div className="input-group">
       <label htmlFor="confirmPassword">Confirm Password</label>
       <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        placeholder="Confirm your password"
        minLength="8"
        required
       />
      </div>

      <button type="submit" className="login-btn primary" disabled={loading}>
       {loading ? 'Creating Account...' : 'Create Account'}
      </button>
     </form>

     <div className="divider">
      <span>or sign up with</span>
     </div>

     <div className="oauth-buttons">
      <button onClick={handleGoogleSignup} className="oauth-btn google" disabled={loading}>
       <img
        src="/resources/google.svg"
        alt="Google"
        style={{
         width: '20px',
         height: '20px',
         objectFit: 'contain',
         flexShrink: 0
        }}
       />
       Google
      </button>
     </div>
    </div>

    <div className="login-footer">
     <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
   </div>
  </div>
 );
};

export default Signup;