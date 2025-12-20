import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { loginStyles } from '../styles/login';
import { API_BASE_URL } from '../config';
import useStars from "../hooks/useStars";
import Icon from '../components/Icon';

const Login = () => {
 const navigate = useNavigate();
 const [currentStep, setCurrentStep] = useState(0);
 const [formData, setFormData] = useState({
  email: '',
  password: ''
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [direction, setDirection] = useState('forward');
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [prevStep, setPrevStep] = useState(0);
 const [validationError, setValidationError] = useState('');
 const canvasRef = useStars();

 useEffect(() => {
  document.title = 'uChat - Login';
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicons/login.png';
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

 useEffect(() => {
  const timeoutId = setTimeout(() => {
   if (isTransitioning) return;
   setValidationError('');
  }, 300);

  return () => clearTimeout(timeoutId);
 }, [currentStep, formData, isTransitioning]);

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: value
  }));
  if (error) setError('');
 };

 const handleGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const validateCurrentStepClientSide = () => {
  if (currentStep === 0) {
   if (!formData.email.trim()) {
    setValidationError('Enter your email!');
    return false;
   }
  }
  if (currentStep === 1) {
   if (!formData.password) {
    setValidationError('Enter your password!');
    return false;
   }
  }
  return true;
 };

 const checkEmailWithBackend = async () => {
  setLoading(true);

  // Auto-append @gmail.com if no @ symbol
  let emailToCheck = formData.email.trim();
  if (!emailToCheck.includes('@')) {
   emailToCheck = emailToCheck + '@gmail.com';
   setFormData(prev => ({ ...prev, email: emailToCheck }));
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/check-email-exists`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email: emailToCheck })
   });

   const data = await response.json();

   if (!response.ok) {
    setError('Could not verify email.');
    setLoading(false);
    return false;
   }

   if (!data.exists) {
    setError('We could not find an account with this email, try again!');
    setLoading(false);
    return false;
   }

   setLoading(false);
   return true;
  } catch (err) {
   console.error('Email check error:', err);
   setError('Connection error');
   setLoading(false);
   return false;
  }
 };

 const handleContinue = async () => {
  if (!validateCurrentStepClientSide()) return;

  setError('');
  setValidationError('');

  if (currentStep === 0) {
   const backendValid = await checkEmailWithBackend();
   if (!backendValid) return;

   setIsTransitioning(true);
   setDirection('forward');
   setPrevStep(currentStep);
   setTimeout(() => {
    setCurrentStep(1);
    setTimeout(() => setIsTransitioning(false), 50);
   }, 300);
  } else {
   handleLogin();
  }
 };

 const handleBack = () => {
  setError('');
  setValidationError('');
  setIsTransitioning(true);
  setDirection('backward');
  setPrevStep(currentStep);
  setTimeout(() => {
   setCurrentStep(0);
   setTimeout(() => setIsTransitioning(false), 50);
  }, 300);
 };

 const handleLogin = async () => {
  setLoading(true);
  setError('');
  setValidationError('');

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
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/chat');
   } else {
    setError('Wrong password. Please try again!');
   }
  } catch (error) {
   console.error('Login error:', error);
   setError('Connection error');
  } finally {
   setLoading(false);
  }
 };

 const getStepStyleList = (stepIndex) => {
  if (stepIndex === currentStep && !isTransitioning) {
   return [loginStyles.stepContainer, loginStyles.stepContainerActive];
  }

  if (stepIndex === prevStep && isTransitioning) {
   return [
    loginStyles.stepContainer,
    loginStyles.stepContainerActive,
    direction === 'forward' ? loginStyles.slidingOutLeft : loginStyles.slidingOutRight
   ];
  }

  if (stepIndex === currentStep && isTransitioning) {
   return [
    loginStyles.stepContainer,
    direction === 'forward' ? loginStyles.comingFromRight : loginStyles.comingFromLeft
   ];
  }

  return [loginStyles.stepContainer];
 };

 const stepHeaderSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return loginStyles.step0_stepHeader;
   case 1: return loginStyles.step1_stepHeader;
   default: return null;
  }
 };

 const inputGroupSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return loginStyles.step0_inputGroup;
   case 1: return loginStyles.step1_inputGroup;
   default: return null;
  }
 };

 const progressSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return loginStyles.progressIndicatorStep0;
   case 1: return loginStyles.progressIndicatorStep1;
   default: return null;
  }
 };

 const steps = [
  {
   title: "What's your email?",
   subtitle: "Enter the email you used to sign up",
   field: 'email',
   type: 'email',
   placeholder: 'Enter your email',
   icon: 'fas fa-envelope'
  },
  {
   title: "Enter your password",
   subtitle: "Welcome back! Let's get you signed in",
   field: 'password',
   type: showPassword ? 'text' : 'password',
   placeholder: 'Enter your password',
   icon: 'fas fa-lock'
  }
 ];

 return (
  <div {...stylex.props(loginStyles.loginContainer)}>
   <canvas ref={canvasRef} {...stylex.props(loginStyles.starCanvas)} aria-hidden="true" />
   <div {...stylex.props(loginStyles.loginCard)} role="region" aria-label="Login form">
    <div {...stylex.props(loginStyles.loginHeader)}>
     <div {...stylex.props(loginStyles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(loginStyles.mainLogo)}
       style={{ width: '60px', height: '60px' }}
       draggable="false"
      />
     </div>

     <h1 {...stylex.props(loginStyles.headerTitle)}>
      <i className="fas fa-sign-in-alt" style={{ marginRight: '12px', color: 'orange' }} aria-hidden="true"></i>
      Welcome back!
     </h1>

     {currentStep === 0 && (
      <div {...stylex.props(loginStyles.stepExplanation)}>
       <p {...stylex.props(loginStyles.stepExplanationP)}>
        Good to see you again! Enter your email to sign in, or use Google for quick access. Remember to enter your email correctly and also keep in mind that it doesn't matter if you enter your email with a capital letter. (Means it is not case-sensitive)
       </p>
      </div>
     )}

     {currentStep === 1 && (
      <div {...stylex.props(loginStyles.stepExplanation)}>
       <p {...stylex.props(loginStyles.stepExplanationP)}>
        Almost there! Just enter your password and you'll be back in your chats in no time. But also... REMEMBER that by clicking that 'Login' button, you agree to our T&C as well as our Privacy Policy! Beware of that!
       </p>
      </div>
     )}
    </div>

    <div {...stylex.props(loginStyles.loginForm)}>
     <div>
      <div
       {...stylex.props(loginStyles.progressIndicator, progressSpacingStyle(currentStep))}
       role="progressbar"
       aria-valuenow={currentStep + 1}
       aria-valuemin="1"
       aria-valuemax="2"
       aria-label={`Step ${currentStep + 1} of 2`}
      >
       {[0, 1].map((step) => (
        <div
         key={step}
         {...stylex.props(
          loginStyles.progressDot,
          step === currentStep && loginStyles.progressDotActive,
          step < currentStep && loginStyles.progressDotCompleted
         )}
         aria-current={step === currentStep ? "step" : undefined}
        />
       ))}
      </div>
     </div>

     <div {...stylex.props(loginStyles.stepsWrapper)}>
      <div {...stylex.props(...getStepStyleList(0))}>
       <div {...stylex.props(loginStyles.stepHeader, stepHeaderSpacingStyle(0))}>
        <h2 {...stylex.props(loginStyles.stepHeaderH2)}>{steps[0].title}</h2>
        <p {...stylex.props(loginStyles.stepHeaderP)}>{steps[0].subtitle}</p>
       </div>

       <div className="inputGroup" {...stylex.props(loginStyles.inputGroup, inputGroupSpacingStyle(0))}>
        <label
         htmlFor="email-input"
         style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
        >
         Email address
        </label>
        <input
         id="email-input"
         {...stylex.props(loginStyles.inputGroupInput)}
         type={steps[0].type}
         name={steps[0].field}
         value={formData[steps[0].field]}
         onChange={handleInputChange}
         placeholder={steps[0].placeholder}
         autoFocus
         autoComplete="email"
         aria-invalid={!!(error || validationError)}
         aria-describedby={error || validationError ? "email-error" : undefined}
        />
        {(error || validationError) && (
         <div
          id="email-error"
          role="alert"
          style={{
           fontSize: '12px',
           color: 'var(--error-text, #c53030)',
           marginTop: '4px',
           display: 'flex',
           alignItems: 'center',
           gap: '4px'
          }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
          {error || validationError}
         </div>
        )}
       </div>

       {/* Divider: replaces .divider::before with a real element */}
       <div {...stylex.props(loginStyles.divider)}>
        <div {...stylex.props(loginStyles.dividerLine)} />
        <span {...stylex.props(loginStyles.dividerSpan)}>or</span>
       </div>

       <div {...stylex.props(loginStyles.oauthButtons)}>
        <button
         onClick={handleGoogleLogin}
         className="oauthBtn"
         {...stylex.props(loginStyles.oauthBtn, loginStyles.google)}
         disabled={loading}
         aria-label="Sign in with Google"
        >
         <img
          src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
          alt=""
          width="18"
          height="18"
          aria-hidden="true"
         />
         Continue with Google
        </button>
       </div>

       <div {...stylex.props(loginStyles.buttonContainer)}>
        <button
         type="button"
         onClick={handleContinue}
         {...stylex.props(loginStyles.loginBtn, loginStyles.primary)}
         disabled={loading || !!validationError}
        >
         <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
         {loading ? 'Checking...' : 'Continue'}
        </button>
       </div>
      </div>

      <div {...stylex.props(...getStepStyleList(1))}>
       <div {...stylex.props(loginStyles.stepHeader, stepHeaderSpacingStyle(1))}>
        <h2 {...stylex.props(loginStyles.stepHeaderH2)}>{steps[1].title}</h2>
        <p {...stylex.props(loginStyles.stepHeaderP)}>{steps[1].subtitle}</p>
       </div>

       <div className="inputGroup" {...stylex.props(loginStyles.inputGroup, inputGroupSpacingStyle(1))}>
        <label
         htmlFor="password-input"
         style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
        >
         Password
        </label>
        <div style={{ position: 'relative' }}>
         <input
          id="password-input"
          {...stylex.props(loginStyles.inputGroupInput)}
          type={steps[1].type}
          name={steps[1].field}
          value={formData[steps[1].field]}
          onChange={handleInputChange}
          placeholder={steps[1].placeholder}
          autoFocus={currentStep === 1}
          aria-invalid={!!(error || validationError)}
          aria-describedby={error || validationError ? "password-error" : undefined}
         />
         <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
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
          <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true"></i>
         </button>
        </div>

        {(error || validationError) && (
         <div
          id="password-error"
          role="alert"
          style={{
           fontSize: '12px',
           color: 'var(--error-text, #c53030)',
           marginTop: '4px',
           display: 'flex',
           alignItems: 'center',
           gap: '4px'
          }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
          {error || validationError}
         </div>
        )}
       </div>

       <div {...stylex.props(loginStyles.buttonContainer)}>
        <button
         type="button"
         onClick={handleBack}
         {...stylex.props(loginStyles.backBtn)}
         disabled={loading}
        >
         <Icon
          name="return"
          alt="Back"
          {...stylex.props(loginStyles.backBtnImg)}
         />
         Back
        </button>
        <button
         type="button"
         onClick={handleContinue}
         {...stylex.props(loginStyles.loginBtn, loginStyles.primary)}
         disabled={loading || !!validationError}
        >
         <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
         {loading ? 'Logging in...' : 'Login'}
        </button>
       </div>
      </div>
     </div>
    </div>

    <div {...stylex.props(loginStyles.loginFooter)}>
     <p {...stylex.props(loginStyles.footerP)}>
      Don't have an account?
      <a href="/signup" {...stylex.props(loginStyles.footerA)}>
       <i className="fas fa-user-plus" style={{ marginLeft: '8px', marginRight: '4px' }} aria-hidden="true"></i>
       Sign up!
      </a>
     </p>
     </div>
   </div>
  </div>
 );
};

export default Login;