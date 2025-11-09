import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';
import { API_BASE_URL } from '../config';
import useStars from "../hooks/useStars";

const Signup = () => {
 const navigate = useNavigate();
 const [currentStep, setCurrentStep] = useState(0);
 const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  handle: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [agreedToTerms, setAgreedToTerms] = useState(false);
 const [direction, setDirection] = useState('forward');
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [prevStep, setPrevStep] = useState(0);
 const [validationError, setValidationError] = useState('');
 const canvasRef = useStars();

 useEffect(() => {
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
  document.title = 'uChat - Sign Up';
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicon_add_user.png';
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

 // Real-time client-side validation as user types
 useEffect(() => {
  const timeoutId = setTimeout(() => {
   if (isTransitioning) return;

   setValidationError('');

   switch (currentStep) {
    case 0: // Email validation
     if (formData.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
       setValidationError('Please enter a valid email address');
      }
     }
     break;

    case 1: // Username validation
     if (formData.username.trim()) {
      if (formData.username.length < 3) {
       setValidationError('Username must be at least 3 characters');
      } else if (formData.username.length > 30) {
       setValidationError('Username cannot exceed 30 characters');
      }
     }
     break;

    case 2: // Handle validation
     if (formData.handle.trim()) {
      const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
      if (handle.length < 3) {
       setValidationError('Handle must be at least 3 characters');
      } else if (handle.length > 15) {
       setValidationError('Handle cannot exceed 15 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
       setValidationError('Handle can only contain letters, numbers, and underscores');
      }
     }
     break;

    case 3: // Password validation
     if (formData.password) {
      if (formData.password.length < 8) {
       setValidationError('Password must be at least 8 characters');
      } else if (!/[A-Z]/.test(formData.password)) {
       setValidationError('Password must contain at least one uppercase letter');
      } else if (!/[0-9]/.test(formData.password)) {
       setValidationError('Password must contain at least one number');
      }
     }
     break;

    case 4: // Confirm password validation
     if (formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
       setValidationError('Passwords do not match');
      }
     }
     break;
   }
  }, 300); // 300ms debounce

  return () => clearTimeout(timeoutId);
 }, [currentStep, formData, isTransitioning]);

 const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Block @ symbol in handle and show friendly message
  if (name === 'handle' && value.includes('@')) {
   setValidationError('Don\'t include "@" because it will be added automatically.');
   return;
  }

  // Apply character limits during input
  let finalValue = value;
  if (name === 'username' && value.length > 30) {
   finalValue = value.slice(0, 30);
  }
  if (name === 'handle' && value.length > 15) {
   finalValue = value.slice(0, 15);
  }

  setFormData(prev => ({
   ...prev,
   [name]: finalValue
  }));

  // Clear server error when user starts typing
  if (error) setError('');
 };

 const handleGoogleSignup = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const validateCurrentStepClientSide = () => {
  switch (currentStep) {
   case 0:
    if (!formData.email.trim()) {
     setValidationError('Please enter your email');
     return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
     setValidationError('Please enter a valid email');
     return false;
    }
    break;
   case 1:
    if (!formData.username.trim()) {
     setValidationError('Please enter your username');
     return false;
    }
    if (formData.username.length < 3) {
     setValidationError('Username must be at least 3 characters');
     return false;
    }
    if (formData.username.length > 30) {
     setValidationError('Username cannot exceed 30 characters');
     return false;
    }
    break;
   case 2:
    if (!formData.handle.trim()) {
     setValidationError('Please enter a handle');
     return false;
    }
    const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
    if (handle.length < 3) {
     setValidationError('Handle must be at least 3 characters');
     return false;
    }
    if (handle.length > 15) {
     setValidationError('Handle cannot exceed 15 characters');
     return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
     setValidationError('Handle can only contain letters, numbers, and underscores');
     return false;
    }
    break;
   case 3:
    if (!formData.password) {
     setValidationError('Please enter a password');
     return false;
    }
    if (formData.password.length < 8) {
     setValidationError('Password must be at least 8 characters');
     return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
     setValidationError('Password must contain at least one uppercase letter');
     return false;
    }
    if (!/[0-9]/.test(formData.password)) {
     setValidationError('Password must contain at least one number');
     return false;
    }
    break;
   case 4:
    if (formData.password !== formData.confirmPassword) {
     setValidationError('Passwords do not match');
     return false;
    }
    if (!agreedToTerms) {
     setValidationError('Please agree to the terms and conditions');
     return false;
    }
    break;
  }
  return true;
 };

 const checkStepWithBackend = async () => {
  // Only check email and handle with backend
  if (currentStep === 0) {
   // Check email availability by attempting partial signup
   setLoading(true);
   try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     credentials: 'include',
     body: JSON.stringify({
      email: formData.email,
      username: 'temp',
      handle: 'temp123',
      password: 'TempPass123',
      confirmPassword: 'TempPass123'
     })
    });

    const data = await response.json();

    if (!response.ok && data.error) {
     // Check if error is about email
     if (data.error.toLowerCase().includes('email')) {
      setError(data.error);
      setLoading(false);
      return false;
     }
    }
   } catch (err) {
    console.error('Backend check error:', err);
   }
   setLoading(false);
  } else if (currentStep === 2) {
   // Check handle availability
   setLoading(true);
   try {
    const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     credentials: 'include',
     body: JSON.stringify({
      email: 'temp@temp.com',
      username: 'temp',
      handle: handle,
      password: 'TempPass123',
      confirmPassword: 'TempPass123'
     })
    });

    const data = await response.json();

    if (!response.ok && data.error) {
     // Check if error is about handle
     if (data.error.toLowerCase().includes('handle')) {
      setError(data.error);
      setLoading(false);
      return false;
     }
    }
   } catch (err) {
    console.error('Backend check error:', err);
   }
   setLoading(false);
  }

  return true;
 };

 const handleContinue = async () => {
  if (!validateCurrentStepClientSide()) return;

  setError('');
  setValidationError('');

  // Check with backend for email and handle steps
  if (currentStep === 0 || currentStep === 2) {
   const backendValid = await checkStepWithBackend();
   if (!backendValid) return;
  }

  if (currentStep < 4) {
   setIsTransitioning(true);
   setDirection('forward');
   setPrevStep(currentStep);
   setTimeout(() => {
    setCurrentStep(currentStep + 1);
    setTimeout(() => setIsTransitioning(false), 50);
   }, 300);
  } else {
   handleSubmit();
  }
 };

 const handleBack = () => {
  setError('');
  setValidationError('');
  setIsTransitioning(true);
  setDirection('backward');
  setPrevStep(currentStep);
  setTimeout(() => {
   setCurrentStep(currentStep - 1);
   setTimeout(() => setIsTransitioning(false), 50);
  }, 300);
 };

 const handleSubmit = async () => {
  setLoading(true);
  setError('');
  setValidationError('');

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

 const getStepClassName = (stepIndex) => {
  if (stepIndex === currentStep && !isTransitioning) {
   return `${styles.stepContainer} ${styles.active}`;
  }

  if (stepIndex === prevStep && isTransitioning) {
   return `${styles.stepContainer} ${styles.active} ${direction === 'forward' ? styles.slidingOutLeft : styles.slidingOutRight}`;
  }

  if (stepIndex === currentStep && isTransitioning) {
   return `${styles.stepContainer} ${direction === 'forward' ? styles.comingFromRight : styles.comingFromLeft}`;
  }

  return styles.stepContainer;
 };

 const steps = [
  {
   title: "What's your email?",
   subtitle: "You'll use this to sign in",
   field: 'email',
   type: 'email',
   placeholder: 'Enter your email',
   icon: 'fas fa-envelope'
  },
  {
   title: "What's your username?",
   subtitle: "This is how others will see you (3-30 characters)",
   field: 'username',
   type: 'text',
   placeholder: 'Enter your username',
   icon: 'fas fa-user'
  },
  {
   title: "Choose a handle",
   subtitle: "Your unique identifier (3-15 characters, letters, numbers, underscore)",
   field: 'handle',
   type: 'text',
   placeholder: 'Enter your handle',
   icon: 'fas fa-hashtag'
  },
  {
   title: "Create a password",
   subtitle: "Min 8 characters, 1 uppercase, 1 number",
   field: 'password',
   type: showPassword ? 'text' : 'password',
   placeholder: 'Enter password',
   icon: 'fas fa-lock'
  },
  {
   title: "Confirm your password",
   subtitle: "Just to make sure",
   field: 'confirmPassword',
   type: showConfirmPassword ? 'text' : 'password',
   placeholder: 'Re-enter your password',
   icon: 'fas fa-shield-alt'
  }
 ];

 // Error message component
 const ErrorMessage = ({ message, isServerError }) => {
  if (!message) return null;

  const isError = isServerError || message.toLowerCase().includes('already') || message.toLowerCase().includes('taken');

  return (
   <div style={{
    backgroundColor: isError ? 'var(--error-bg, #fee)' : '#e3f2fd',
    color: isError ? 'var(--error-text, #c53030)' : '#1565c0',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    border: isError ? '1px solid var(--error-border, #feb2b2)' : '1px solid #90caf9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
   }}>
    <i className={isError ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}></i>
    {message}
   </div>
  );
 };

 return (
  <div className={styles.loginContainer}>
   <canvas ref={canvasRef} className={styles.starCanvas} />
   <div className={styles.loginCard}>
    <div className={styles.loginHeader}>
     <div className={styles.logoContainer}>
      <img
       src="/resources/main-logo.svg"
       alt="uChat Logo"
       className={styles.mainLogo}
       style={{ width: '60px', height: '60px' }}
       draggable="false"
      />
     </div>
     <h1>
      <i className="fas fa-user-plus" style={{ marginRight: '12px', color: 'orange' }}></i>
      Create your account
     </h1>

     {currentStep === 0 && (
      <div className={styles.stepExplanation}>
       <p>Ah, welcome! This text is here to help you signup. First, let's enter your email address that you own OR you can sign up with Google for instant access. Whichever you prefer.</p>
      </div>
     )}

     {currentStep === 1 && (
      <div className={styles.stepExplanation}>
       <p>Choose how you want to be known on uChat. This is your username that others will see in chats and your profile. Think of it like a nickname.</p>
      </div>
     )}

     {currentStep === 2 && (
      <div className={styles.stepExplanation}>
       <p>Your handle is a unique identifier which makes sure your account is unique and doesn't get duplicated and impersonated. Your handle will be displayed as "@handle". For example, a person named Steven exists, but another person also uses the same username exists. To be clear from confusion, handles will help you identify which one is who.</p>
      </div>
     )}

     {currentStep === 3 && (
      <div className={styles.stepExplanation}>
       <p>Create a strong password with at least 8 characters. We recommend using a mix of letters, numbers, and symbols for better security.</p>
      </div>
     )}

     {currentStep === 4 && (
      <div className={styles.stepExplanation}>
       <p>Almost there. Confirm your password and agree to our terms. You should read them too... Honestly no one reads them tho.. Anyways, once you're done, you'll be ready. However, you will need to verify your email. You can skip it but really you shouldn't, you will see why if you don't..</p>
      </div>
     )}
    </div>

    <div className={styles.loginForm}>
     <div className={`${styles[`step${currentStep}`]}`}>
      {/* Progress Indicator */}
      <div className={styles.progressIndicator}>
       {[0, 1, 2, 3, 4].map((step) => (
        <div
         key={step}
         className={`${styles.progressDot} ${step === currentStep ? styles.active : ''
          } ${step < currentStep ? styles.completed : ''}`}
        />
       ))}
      </div>
     </div>

     <div className={`${styles.stepsWrapper} ${styles[`step${currentStep}`]}`}>
      {/* Step 0: Email or OAuth */}
      <div className={getStepClassName(0)}>
       <ErrorMessage message={error || validationError} isServerError={!!error} />

       <div className={styles.stepHeader}>
        <h2>{steps[0].title}</h2>
        <p>{steps[0].subtitle}</p>
       </div>

       <div className={styles.inputGroup}>
        <input
         type={steps[0].type}
         name={steps[0].field}
         value={formData[steps[0].field]}
         onChange={handleInputChange}
         placeholder={steps[0].placeholder}
         autoFocus
         autoComplete="email"
        />
       </div>

       <div className={styles.divider}>
        <span>or</span>
       </div>

       <div className={styles.oauthButtons}>
        <button onClick={handleGoogleSignup} className={`${styles.oauthBtn} ${styles.google}`} disabled={loading}>
         <img
          src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
          alt="Google"
          width="18"
          height="18"
         />
         Continue with Google
        </button>
       </div>

       <div className={styles.buttonContainer}>
        <button
         type="button"
         onClick={handleContinue}
         className={`${styles.loginBtn} ${styles.primary}`}
         disabled={loading || !!validationError}
        >
         <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'} style={{ marginRight: '8px' }}></i>
         {loading ? 'Checking...' : 'Continue'}
        </button>
       </div>
      </div>

      {/* Steps 1-3: Name, Handle, Password */}
      {[1, 2, 3].map(stepNum => (
       <div key={stepNum} className={getStepClassName(stepNum)}>
        <ErrorMessage message={error || validationError} isServerError={!!error} />

        <div className={styles.stepHeader}>
         <h2>{steps[stepNum].title}</h2>
         <p>{steps[stepNum].subtitle}</p>
        </div>

        <div className={styles.inputGroup}>
         <div style={{ position: 'relative' }}>
          <input
           type={steps[stepNum].type}
           name={steps[stepNum].field}
           value={formData[steps[stepNum].field]}
           onChange={handleInputChange}
           placeholder={steps[stepNum].placeholder}
           autoFocus={currentStep === stepNum}
          />
          {stepNum === 3 && (
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
          )}
          {stepNum === 1 && (
           <div style={{
            fontSize: '12px',
            color: formData.username.length > 30 ? '#c53030' : 'var(--text-secondary, #666)',
            marginTop: '4px',
            textAlign: 'right'
           }}>
            {formData.username.length}/30 characters
           </div>
          )}
          {stepNum === 2 && (
           <div style={{
            fontSize: '12px',
            color: formData.handle.length > 15 ? '#c53030' : 'var(--text-secondary, #666)',
            marginTop: '4px',
            textAlign: 'right'
           }}>
            {formData.handle.length}/15 characters
           </div>
          )}
         </div>
        </div>

        <div className={styles.buttonContainer}>
         <button
          type="button"
          onClick={handleBack}
          className={styles.backBtn}
          disabled={loading}
         >
          <img src="/resources/icons/return.svg" alt="Back" />
          Back
         </button>
         <button
          type="button"
          onClick={handleContinue}
          className={`${styles.loginBtn} ${styles.primary}`}
          disabled={loading || !!validationError}
         >
          <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'} style={{ marginRight: '8px' }}></i>
          {loading ? 'Checking...' : 'Continue'}
         </button>
        </div>
       </div>
      ))}

      {/* Step 4: Confirm Password & Terms */}
      <div className={getStepClassName(4)}>
       <ErrorMessage message={error || validationError} isServerError={!!error} />

       <div className={styles.stepHeader}>
        <h2>{steps[4].title}</h2>
        <p>{steps[4].subtitle}</p>
       </div>

       <div className={styles.inputGroup}>
        <div style={{ position: 'relative' }}>
         <input
          type={steps[4].type}
          name={steps[4].field}
          value={formData[steps[4].field]}
          onChange={handleInputChange}
          placeholder={steps[4].placeholder}
          autoFocus
         />
         <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
         </button>
        </div>
       </div>

       <div className={styles.termsCheckbox}>
        <label className={styles.checkboxLabel}>
         <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => {
           setAgreedToTerms(e.target.checked);
           if (e.target.checked && validationError.includes('terms')) {
            setValidationError('');
           }
          }}
          className={styles.checkboxInput}
         />
         <span className={styles.checkboxCustom}></span>
         <span className={styles.checkboxText}>
          I agree to the{' '}
          <a href="/terms" target="_blank" className={styles.termsLink}>
           Terms & Conditions
          </a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" className={styles.termsLink}>
           Privacy Policy
          </a>
         </span>
        </label>
       </div>

       <div className={styles.buttonContainer}>
        <button
         type="button"
         onClick={handleBack}
         className={styles.backBtn}
         disabled={loading}
        >
         <img src="/resources/icons/return.svg" alt="Back" />
         Back
        </button>
        <button
         type="button"
         onClick={handleContinue}
         className={`${styles.loginBtn} ${styles.primary}`}
         disabled={loading || !!validationError || !agreedToTerms}
        >
         <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'} style={{ marginRight: '8px' }}></i>
         {loading ? 'Creating...' : 'Create Account'}
        </button>
       </div>
      </div>
     </div>
    </div>

    <div className={styles.loginFooter}>
     <p>
      Already have an account?
      <a href="/login">
       <i className="fas fa-sign-in-alt" style={{ marginLeft: '8px', marginRight: '4px' }}></i>
       Sign in!
      </a>
     </p>
    </div>
   </div>
  </div>
 );
};

export default Signup;