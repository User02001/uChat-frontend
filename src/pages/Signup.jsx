import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { signupStyles } from '../styles/signup';
import { API_BASE_URL } from '../config';
import useStars from "../hooks/useStars";
import Icon from '../components/Icon';

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

 // Used to replicate `.checkboxLabel:hover .checkboxCustom`
 const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);

 const ids = useMemo(() => {
  return {
   pageTitle: 'signup-page-title',
   form: 'signup-form',
   progress: 'signup-progress',
   stepTitle: (i) => `signup-step-${i}-title`,
   stepSubtitle: (i) => `signup-step-${i}-subtitle`,
   stepExplain: (i) => `signup-step-${i}-explain`,
   stepError: (i) => `signup-step-${i}-error`,
   field: {
    email: 'signup-email',
    username: 'signup-username',
    handle: 'signup-handle',
    password: 'signup-password',
    confirmPassword: 'signup-confirm-password',
    terms: 'signup-terms'
   },
   counter: {
    username: 'signup-username-counter',
    handle: 'signup-handle-counter'
   }
  };
 }, []);

 useEffect(() => {
  document.title = 'uChat - Sign Up';
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicons/sign_up.png';
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

  if (name === 'handle' && value.includes('@')) {
   setValidationError('Don\'t include "@" because it will be added automatically.');
   return;
  }

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

  if (error) setError('');
 };

 const handleGoogleSignup = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const validateCurrentStepClientSide = () => {
  switch (currentStep) {
   case 0:
    if (!formData.email.trim()) {
     setValidationError('Email is required');
     return false;
    }
    break;
   case 1:
    if (!formData.username.trim()) {
     setValidationError('Username is required');
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
     setValidationError('Handle is required');
     return false;
    }
    {
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
    }
    break;
   case 3:
    if (!formData.password) {
     setValidationError('Password is required');
     return false;
    }
    if (formData.password.length < 8) {
     setValidationError('Password must be at least 8 characters!');
     return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
     setValidationError('Password must contain at least one uppercase letter!');
     return false;
    }
    if (!/[0-9]/.test(formData.password)) {
     setValidationError('Password must contain at least one number!');
     return false;
    }
    break;
   case 4:
    if (formData.password !== formData.confirmPassword) {
     setValidationError('Passwords do not match!');
     return false;
    }
    if (!agreedToTerms) {
     setValidationError('Please agree to the terms and conditions');
     return false;
    }
    break;
   default:
    break;
  }
  return true;
 };

 const checkStepWithBackend = async () => {
  if (currentStep === 0) {
   setLoading(true);

   let emailToCheck = formData.email.trim();
   if (!emailToCheck.includes('@')) {
    emailToCheck = emailToCheck + '@gmail.com';
    setFormData(prev => ({ ...prev, email: emailToCheck }));
   }

   try {
    const response = await fetch(`${API_BASE_URL}/api/check-email-availability`, {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     credentials: 'include',
     body: JSON.stringify({
      email: emailToCheck
     })
    });

    const data = await response.json();

    if (!response.ok) {
     setError('Unable to verify email');
     setLoading(false);
     return false;
    }

    if (!data.available) {
     setError('This email is already taken. Try again!');
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
  } else if (currentStep === 2) {
   setLoading(true);
   try {
    const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
    const response = await fetch(`${API_BASE_URL}/api/check-handle-availability`, {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     credentials: 'include',
     body: JSON.stringify({
      handle: handle
     })
    });

    const data = await response.json();

    if (!response.ok) {
     setError('Could not verify handle!');
     setLoading(false);
     return false;
    }

    if (!data.available) {
     setError('This handle is already taken. Try again!');
     setLoading(false);
     return false;
    }

    setLoading(false);
    return true;
   } catch (err) {
    console.error('Handle check error:', err);
    setError('Connection error');
    setLoading(false);
    return false;
   }
  }

  return true;
 };

 const handleContinue = async () => {
  if (!validateCurrentStepClientSide()) return;

  setError('');
  setValidationError('');

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

   await response.json();

   if (response.ok) {
    navigate('/verify', { state: { email: formData.email } });
   } else {
    setError('Signup failed');
   }
  } catch (error) {
   console.error('Signup error:', error);
   setError('Connection error');
  } finally {
   setLoading(false);
  }
 };

 const handleFormSubmit = (e) => {
  e.preventDefault();
  handleContinue();
 };

 // Converted from string className builder to StyleX style list
 const getStepStyleList = (stepIndex) => {
  if (stepIndex === currentStep && !isTransitioning) {
   return [signupStyles.stepContainer, signupStyles.stepContainerActive];
  }

  if (stepIndex === prevStep && isTransitioning) {
   return [
    signupStyles.stepContainer,
    signupStyles.stepContainerActive,
    direction === 'forward' ? signupStyles.slidingOutLeft : signupStyles.slidingOutRight
   ];
  }

  if (stepIndex === currentStep && isTransitioning) {
   return [
    signupStyles.stepContainer,
    direction === 'forward' ? signupStyles.comingFromRight : signupStyles.comingFromLeft
   ];
  }

  return [signupStyles.stepContainer];
 };

 const stepHeaderSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return signupStyles.step0_stepHeader;
   case 1: return signupStyles.step1_stepHeader;
   case 2: return signupStyles.step2_stepHeader;
   case 3: return signupStyles.step3_stepHeader;
   case 4: return signupStyles.step4_stepHeader;
   default: return null;
  }
 };

 const inputGroupSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return signupStyles.step0_inputGroup;
   case 1: return signupStyles.step1_inputGroup;
   case 2: return signupStyles.step2_inputGroup;
   case 3: return signupStyles.step3_inputGroup;
   case 4: return signupStyles.step4_inputGroup;
   default: return null;
  }
 };

 const progressSpacingStyle = (stepIndex) => {
  switch (stepIndex) {
   case 0: return signupStyles.step0_progress;
   case 1: return signupStyles.step1_progress;
   case 2: return signupStyles.step2_progress;
   case 3: return signupStyles.step3_progress;
   case 4: return signupStyles.step4_progress;
   default: return null;
  }
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

 const getActiveErrorText = () => error || validationError;

 const activeErrorId = ids.stepError(currentStep);
 const activeSubtitleId = ids.stepSubtitle(currentStep);
 const activeExplainId = ids.stepExplain(currentStep);

 const buildDescribedBy = (parts) => parts.filter(Boolean).join(' ') || undefined;

 return (
  <div {...stylex.props(signupStyles.loginContainer)}>
   <canvas
    ref={canvasRef}
    {...stylex.props(signupStyles.starCanvas)}
    aria-hidden="true"
    role="presentation"
   />

   <div
    {...stylex.props(signupStyles.loginCard)}
    role="main"
    aria-labelledby={ids.pageTitle}
   >
    <div {...stylex.props(signupStyles.loginHeader)}>
     <div {...stylex.props(signupStyles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(signupStyles.mainLogo)}
       style={{ width: '60px', height: '60px' }}
       draggable="false"
      />
     </div>

     <h1 id={ids.pageTitle} {...stylex.props(signupStyles.headerTitle)}>
      <i
       className="fas fa-user-plus"
       aria-hidden="true"
       style={{ marginRight: '12px', color: 'var(--border-focus)' }}
      />
      Create your account
     </h1>

     {currentStep === 0 && (
      <div {...stylex.props(signupStyles.stepExplanation)}>
       <p id={ids.stepExplain(0)} {...stylex.props(signupStyles.stepExplanationP)}>
        Ah, welcome! This text is here to help you signup. First, let's enter your email address that you own OR you can sign up with Google for instant access. Whichever you prefer.
       </p>
      </div>
     )}

     {currentStep === 1 && (
      <div {...stylex.props(signupStyles.stepExplanation)}>
       <p id={ids.stepExplain(1)} {...stylex.props(signupStyles.stepExplanationP)}>
        Choose how you want to be known on uChat. This is your username that others will see in chats and your profile. Think of it like a nickname.
       </p>
      </div>
     )}

     {currentStep === 2 && (
      <div {...stylex.props(signupStyles.stepExplanation)}>
       <p id={ids.stepExplain(2)} {...stylex.props(signupStyles.stepExplanationP)}>
        Your handle is a unique identifier that ensures your account isn’t duplicated or impersonated. It will appear as "@handle" to other users. For example, if multiple people share the same name, handles help distinguish who is who.
       </p>
      </div>
     )}

     {currentStep === 3 && (
      <div {...stylex.props(signupStyles.stepExplanation)}>
       <p id={ids.stepExplain(3)} {...stylex.props(signupStyles.stepExplanationP)}>
        Create a strong password with at least 8 characters. We recommend using a mix of letters, numbers, and symbols for better security.
       </p>
      </div>
     )}

     {currentStep === 4 && (
      <div {...stylex.props(signupStyles.stepExplanation)}>
       <p id={ids.stepExplain(4)} {...stylex.props(signupStyles.stepExplanationP)}>
        Almost there. Confirm your password and agree to our terms (you should read them—though no one really does). Once you’re done, you’ll be ready. You’ll still need to verify your email! You can skip it, but you probably shouldn’t—you’ll see why later.
       </p>
      </div>
     )}
    </div>

    <form
     id={ids.form}
     {...stylex.props(signupStyles.loginForm)}
     onSubmit={handleFormSubmit}
     noValidate
     aria-busy={loading ? 'true' : 'false'}
     aria-describedby={buildDescribedBy([
      activeSubtitleId,
      activeExplainId,
      getActiveErrorText() ? activeErrorId : null
     ])}
    >
     <div>
      <div
       {...stylex.props(signupStyles.progressIndicator, progressSpacingStyle(currentStep))}
       aria-label="Signup progress"
       role="list"
       id={ids.progress}
      >
       {[0, 1, 2, 3, 4].map((step) => (
        <div
         key={step}
         role="listitem"
         aria-label={`Step ${step + 1} of 5${step === currentStep ? ', current step' : ''}`}
         aria-current={step === currentStep ? 'step' : undefined}
         {...stylex.props(
          signupStyles.progressDot,
          step === currentStep && signupStyles.progressDotActive,
          step < currentStep && signupStyles.progressDotCompleted
         )}
        />
       ))}
      </div>
     </div>

     <div {...stylex.props(signupStyles.stepsWrapper)}>
      {/* STEP 0 */}
      <div {...stylex.props(...getStepStyleList(0))} aria-hidden={currentStep !== 0}>
       <div {...stylex.props(signupStyles.stepHeader, stepHeaderSpacingStyle(0))}>
        <h2 id={ids.stepTitle(0)} {...stylex.props(signupStyles.stepHeaderH2)}>{steps[0].title}</h2>
        <p id={ids.stepSubtitle(0)} {...stylex.props(signupStyles.stepHeaderP)}>{steps[0].subtitle}</p>
       </div>

       <div {...stylex.props(signupStyles.inputGroup, inputGroupSpacingStyle(0))}>
        {/* Visible label not required visually, but required for accessibility. */}
        <label htmlFor={ids.field.email} style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
         Email address
        </label>

        <input
         {...stylex.props(signupStyles.inputGroupInput)}
         id={ids.field.email}
         type={steps[0].type}
         name={steps[0].field}
         value={formData[steps[0].field]}
         onChange={handleInputChange}
         placeholder={steps[0].placeholder}
         title="Enter the email address you will use to sign in"
         autoFocus={currentStep === 0 && !isTransitioning}
         autoComplete="email"
         inputMode="email"
         required
         aria-required="true"
         aria-invalid={Boolean((error || validationError) && currentStep === 0) ? 'true' : 'false'}
         aria-describedby={buildDescribedBy([
          ids.stepSubtitle(0),
          ids.stepExplain(0),
          (error || validationError) ? ids.stepError(0) : null
         ])}
        />

        {(error || validationError) && (
         <div
          id={ids.stepError(0)}
          role="alert"
          aria-live="assertive"
          style={{
           fontSize: '12px',
           color: 'var(--error-text, #c53030)',
           marginTop: '4px',
           display: 'flex',
           alignItems: 'center',
           gap: '4px'
          }}
         >
          <i className="fas fa-exclamation-circle" aria-hidden="true" style={{ fontSize: '11px' }} />
          {error || validationError}
         </div>
        )}
       </div>

       {/* Divider */}
       <div {...stylex.props(signupStyles.divider)} aria-hidden="true">
        <div {...stylex.props(signupStyles.dividerLine)} />
        <span {...stylex.props(signupStyles.dividerSpan)}>or</span>
       </div>

       <div {...stylex.props(signupStyles.oauthButtons)}>
        <button
         type="button"
         onClick={handleGoogleSignup}
         {...stylex.props(signupStyles.oauthBtn)}
         disabled={loading}
         aria-disabled={loading ? 'true' : 'false'}
         title="Sign up with Google"
        >
         <Icon
          name="google_logo"
          alt=""
          aria-hidden="true"
          style={{ width: '16px', height: '16px', marginTop: '-1px' }}
         />
         Continue with Google
        </button>
       </div>

       <div {...stylex.props(signupStyles.buttonContainer)}>
        <button
         type="submit"
         {...stylex.props(signupStyles.loginBtn, signupStyles.loginBtnPrimary)}
         disabled={loading || !!validationError}
         aria-disabled={(loading || !!validationError) ? 'true' : 'false'}
         title="Continue to the next step"
        >
         <i
          className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'}
          aria-hidden="true"
          style={{ marginRight: '8px' }}
         />
         {loading ? 'Loading...' : 'Continue'}
        </button>
       </div>
      </div>

      {/* STEPS 1 - 3 */}
      {[1, 2, 3].map(stepNum => {
       const fieldName = steps[stepNum].field;
       const fieldId = ids.field[fieldName];
       const hasStepError = Boolean((error || validationError) && currentStep === stepNum);

       const extraDescribedBy = [];
       if (stepNum === 1) extraDescribedBy.push(ids.counter.username);
       if (stepNum === 2) extraDescribedBy.push(ids.counter.handle);

       const inputPropsByStep = (() => {
        if (stepNum === 1) {
         return {
          autoComplete: 'username',
          minLength: 3,
          maxLength: 30,
          required: true,
          spellCheck: 'false'
         };
        }
        if (stepNum === 2) {
         return {
          autoComplete: 'nickname',
          minLength: 3,
          maxLength: 15,
          required: true,
          spellCheck: 'false',
          pattern: '^[a-zA-Z0-9_]+$'
         };
        }
        // stepNum === 3 password
        return {
         autoComplete: 'new-password',
         minLength: 8,
         required: true
        };
       })();

       const labelText =
        stepNum === 1 ? 'Username' :
         stepNum === 2 ? 'Handle' :
          'Password';

       return (
        <div
         key={stepNum}
         {...stylex.props(...getStepStyleList(stepNum))}
         aria-hidden={currentStep !== stepNum}
        >
         <div {...stylex.props(signupStyles.stepHeader, stepHeaderSpacingStyle(stepNum))}>
          <h2 id={ids.stepTitle(stepNum)} {...stylex.props(signupStyles.stepHeaderH2)}>{steps[stepNum].title}</h2>
          <p id={ids.stepSubtitle(stepNum)} {...stylex.props(signupStyles.stepHeaderP)}>{steps[stepNum].subtitle}</p>
         </div>

         <div {...stylex.props(signupStyles.inputGroup, inputGroupSpacingStyle(stepNum))}>
          <div style={{ position: 'relative' }}>
           <label htmlFor={fieldId} style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
            {labelText}
           </label>

           <input
            {...stylex.props(signupStyles.inputGroupInput)}
            id={fieldId}
            type={steps[stepNum].type}
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleInputChange}
            placeholder={steps[stepNum].placeholder}
            title={steps[stepNum].subtitle}
            autoFocus={currentStep === stepNum && !isTransitioning}
            aria-required="true"
            aria-invalid={hasStepError ? 'true' : 'false'}
            aria-describedby={buildDescribedBy([
             ids.stepSubtitle(stepNum),
             ids.stepExplain(stepNum),
             ...extraDescribedBy,
             hasStepError ? ids.stepError(stepNum) : null
            ])}
            {...inputPropsByStep}
           />

           {stepNum === 3 && (
            <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             aria-label={showPassword ? 'Hide password' : 'Show password'}
             aria-pressed={showPassword ? 'true' : 'false'}
             title={showPassword ? 'Hide password' : 'Show password'}
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
             <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true" />
            </button>
           )}

           {stepNum === 1 && (
            <div
             id={ids.counter.username}
             aria-live="polite"
             style={{
              fontSize: '12px',
              color: formData.username.length > 30 ? 'var(--error-text, #c53030)' : 'var(--text-secondary, #666)',
              marginTop: '4px',
              textAlign: 'right'
             }}
            >
             {formData.username.length}/30 characters
            </div>
           )}

           {stepNum === 2 && (
            <div
             id={ids.counter.handle}
             aria-live="polite"
             style={{
              fontSize: '12px',
              color: formData.handle.length > 15 ? 'var(--error-text, #c53030)' : 'var(--text-secondary, #666)',
              marginTop: '4px',
              textAlign: 'right'
             }}
            >
             {formData.handle.length}/15 characters
            </div>
           )}
          </div>

          {(stepNum === 1 || stepNum === 2) && (error || validationError) && (
           <div
            id={ids.stepError(stepNum)}
            role="alert"
            aria-live="assertive"
            style={{
             fontSize: '12px',
             color: 'var(--error-text, #c53030)',
             marginTop: '-12.5px',
             display: 'flex',
             alignItems: 'center',
             gap: '4px'
            }}
           >
            <i className="fas fa-exclamation-circle" aria-hidden="true" style={{ fontSize: '11px' }} />
            {error || validationError}
           </div>
          )}

          {stepNum === 3 && (error || validationError) && (
           <div
            id={ids.stepError(stepNum)}
            role="alert"
            aria-live="assertive"
            style={{
             fontSize: '12px',
             color: 'var(--error-text, #c53030)',
             marginTop: '4px',
             display: 'flex',
             alignItems: 'center',
             gap: '4px'
            }}
           >
            <i className="fas fa-exclamation-circle" aria-hidden="true" style={{ fontSize: '11px' }} />
            {error || validationError}
           </div>
          )}
         </div>

         <div {...stylex.props(signupStyles.buttonContainer)}>
          <button
           type="button"
           onClick={handleBack}
           {...stylex.props(signupStyles.backBtn)}
           disabled={loading}
           aria-disabled={loading ? 'true' : 'false'}
           title="Go back to the previous step"
          >
           <Icon name="return" alt="Back" {...stylex.props(signupStyles.backBtnImg)} />
           Back
          </button>

          <button
           type="submit"
           {...stylex.props(signupStyles.loginBtn, signupStyles.loginBtnPrimary)}
           disabled={loading || !!validationError}
           aria-disabled={(loading || !!validationError) ? 'true' : 'false'}
           title="Continue to the next step"
          >
           <i
            className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'}
            aria-hidden="true"
            style={{ marginRight: '8px' }}
           />
           {loading ? 'Loading...' : 'Continue'}
          </button>
         </div>
        </div>
       );
      })}

      {/* STEP 4 */}
      <div {...stylex.props(...getStepStyleList(4))} aria-hidden={currentStep !== 4}>
       <div {...stylex.props(signupStyles.stepHeader, stepHeaderSpacingStyle(4))}>
        <h2 id={ids.stepTitle(4)} {...stylex.props(signupStyles.stepHeaderH2)}>{steps[4].title}</h2>
        <p id={ids.stepSubtitle(4)} {...stylex.props(signupStyles.stepHeaderP)}>{steps[4].subtitle}</p>
       </div>

       <div {...stylex.props(signupStyles.inputGroup, inputGroupSpacingStyle(4))}>
        <div style={{ position: 'relative' }}>
         <label htmlFor={ids.field.confirmPassword} style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          Confirm password
         </label>

         <input
          {...stylex.props(signupStyles.inputGroupInput)}
          id={ids.field.confirmPassword}
          type={steps[4].type}
          name={steps[4].field}
          value={formData[steps[4].field]}
          onChange={handleInputChange}
          placeholder={steps[4].placeholder}
          title="Re-enter your password to confirm"
          autoFocus={currentStep === 4 && !isTransitioning}
          autoComplete="new-password"
          required
          aria-required="true"
          aria-invalid={Boolean((error || validationError) && currentStep === 4) ? 'true' : 'false'}
          aria-describedby={buildDescribedBy([
           ids.stepSubtitle(4),
           ids.stepExplain(4),
           (error || validationError) ? ids.stepError(4) : null
          ])}
         />

         <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          aria-pressed={showConfirmPassword ? 'true' : 'false'}
          title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
          <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true" />
         </button>
        </div>

        {(error || validationError) && (
         <div
          id={ids.stepError(4)}
          role="alert"
          aria-live="assertive"
          style={{
           fontSize: '12px',
           color: 'var(--error-text, #c53030)',
           marginTop: '4px',
           display: 'flex',
           alignItems: 'center',
           gap: '4px'
          }}
         >
          <i className="fas fa-exclamation-circle" aria-hidden="true" style={{ fontSize: '11px' }} />
          {error || validationError}
         </div>
        )}
       </div>

       <div {...stylex.props(signupStyles.termsCheckbox)}>
        <label
         {...stylex.props(signupStyles.checkboxLabel)}
         htmlFor={ids.field.terms}
         onMouseEnter={() => setIsCheckboxHovered(true)}
         onMouseLeave={() => setIsCheckboxHovered(false)}
        >
         <input
          id={ids.field.terms}
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => {
           setAgreedToTerms(e.target.checked);
           if (e.target.checked && validationError.toLowerCase().includes('terms')) {
            setValidationError('');
           }
          }}
          {...stylex.props(signupStyles.checkboxInput)}
          aria-describedby={buildDescribedBy([
           ids.stepExplain(4),
           (error || validationError) ? ids.stepError(4) : null
          ])}
         />

         <span
          {...stylex.props(
           signupStyles.checkboxCustom,
           isCheckboxHovered && signupStyles.checkboxCustomHovered,
           agreedToTerms && signupStyles.checkboxCustomChecked
          )}
          aria-hidden="true"
         >
          {agreedToTerms && <span {...stylex.props(signupStyles.checkboxCheckmark)} />}
         </span>

         <span {...stylex.props(signupStyles.checkboxText)}>
          I agree to the{' '}
          <a
           href="/terms"
           target="_blank"
           rel="noreferrer"
           {...stylex.props(signupStyles.termsLink)}
           aria-label="Terms and Conditions (opens in a new tab)"
           title="Open Terms and Conditions in a new tab"
          >
           Terms & Conditions
          </a>
          {' '}and{' '}
          <a
           href="/privacy"
           target="_blank"
           rel="noreferrer"
           {...stylex.props(signupStyles.termsLink)}
           aria-label="Privacy Policy (opens in a new tab)"
           title="Open Privacy Policy in a new tab"
          >
           Privacy Policy
          </a>
         </span>
        </label>
       </div>

       <div {...stylex.props(signupStyles.buttonContainer)}>
        <button
         type="button"
         onClick={handleBack}
         {...stylex.props(signupStyles.backBtn)}
         disabled={loading}
         aria-disabled={loading ? 'true' : 'false'}
         title="Go back to the previous step"
        >
         <Icon name="return" alt="Back" {...stylex.props(signupStyles.backBtnImg)} />
         Back
        </button>

        <button
         type="submit"
         {...stylex.props(signupStyles.loginBtn, signupStyles.loginBtnPrimary)}
         disabled={loading || !!validationError || !agreedToTerms}
         aria-disabled={(loading || !!validationError || !agreedToTerms) ? 'true' : 'false'}
         title="Create your account"
        >
         <i
          className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'}
          aria-hidden="true"
          style={{ marginRight: '8px' }}
         />
         {loading ? 'Creating...' : 'Create Account'}
        </button>
       </div>
      </div>
     </div>
    </form>

    {/* Footer stays EXACTLY here (outside loginForm) */}
    <div {...stylex.props(signupStyles.loginFooter)}>
     <p {...stylex.props(signupStyles.footerP)}>
      Already have an account?
      <a href="/login" {...stylex.props(signupStyles.footerA)} title="Go to sign in">
       <i className="fas fa-sign-in-alt" aria-hidden="true" style={{ marginLeft: '8px', marginRight: '4px' }} />
       Sign in!
      </a>
     </p>
    </div>
   </div>
  </div>
 );
};

export default Signup;
