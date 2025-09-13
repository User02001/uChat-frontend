import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config';

const Login = () => {
 const lottieRef = useRef(null);
 const animationRef = useRef(null); // Store animation instance
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
  email: '',
  password: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [animationError, setAnimationError] = useState('');

 useEffect(() => {
  let script = null;

  const loadLottie = () => {
   script = document.createElement('script');
   script.src = '/resources/lottie.js';

   script.onload = () => {
    console.log('Lottie script loaded successfully');

    if (window.lottie && lottieRef.current) {
     try {
      // Destroy existing animation if any
      if (animationRef.current) {
       animationRef.current.destroy();
      }

      // Create new animation with better error handling
      animationRef.current = window.lottie.loadAnimation({
       container: lottieRef.current,
       renderer: 'svg',
       loop: true,
       autoplay: true,
       path: '/resources/data.json',
       // Add error handling
       rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
       }
      });

      // Listen for animation events
      animationRef.current.addEventListener('complete', () => {
       console.log('Animation completed one loop');
      });

      animationRef.current.addEventListener('loopComplete', () => {
       console.log('Animation loop completed');
      });

      animationRef.current.addEventListener('enterFrame', () => {
       // This will log every frame - comment out if too verbose
       // console.log('Animation frame');
      });

      animationRef.current.addEventListener('segmentStart', () => {
       console.log('Animation segment started');
      });

      animationRef.current.addEventListener('data_ready', () => {
       console.log('Animation data loaded and ready');
      });

      animationRef.current.addEventListener('data_failed', () => {
       console.error('Animation data failed to load');
       setAnimationError('Failed to load animation data');
      });

      animationRef.current.addEventListener('loadError', (error) => {
       console.error('Animation load error:', error);
       setAnimationError('Animation load error');
      });

     } catch (error) {
      console.error('Error creating Lottie animation:', error);
      setAnimationError('Failed to create animation');
     }
    } else {
     console.error('Lottie not available or container not found');
     setAnimationError('Lottie library not loaded');
    }
   };

   script.onerror = () => {
    console.error('Failed to load Lottie script');
    setAnimationError('Failed to load animation library');
   };

   document.head.appendChild(script);
  };

  loadLottie();

  return () => {
   // Cleanup
   if (animationRef.current) {
    animationRef.current.destroy();
    animationRef.current = null;
   }
   if (script && document.head.contains(script)) {
    document.head.removeChild(script);
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
   <div className="login-card">
    <div className="login-header">
     <div ref={lottieRef} className="logo-animation"></div>
     {animationError && (
      <div style={{
       fontSize: '12px',
       color: 'var(--error-text)',
       marginTop: '8px'
      }}>
       Debug: {animationError}
      </div>
     )}
     <h1>Welcome to uChat</h1>
     <p>Login to your existing account to start chatting</p>
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

     <form onSubmit={handleEmailLogin}>
      <div className="input-group">
       <label htmlFor="email">Email</label>
       <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter your email"
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
        placeholder="Enter your password"
        required
       />
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
     <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
   </div>
  </div>
 );
};

export default Login;