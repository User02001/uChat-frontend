import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { signupStyles } from '../styles/signup';
import { API_BASE_URL } from '../config';
import useStars from "../hooks/useStars";
import useLiquidLayers from "../hooks/useLiquidLayers";
import Icon from '../components/Icon';
import { getDeviceIdentity } from '../utils/deviceFingerprint';
import { useLanguage } from '../hooks/useLanguage';

const LANGUAGES = [
 // Core
 { code: 'en', name: 'English' },
 { code: 'en-US', name: 'English (United States)' },
 { code: 'en-GB', name: 'English (United Kingdom)' },
 { code: 'en-AU', name: 'English (Australia)' },
 { code: 'en-CA', name: 'English (Canada)' },
 { code: 'es', name: 'Español (Spanish)' },
 { code: 'fr', name: 'Français (French)' },
 { code: 'de', name: 'Deutsch (German)' },
 { code: 'it', name: 'Italiano (Italian)' },
 { code: 'pt', name: 'Português (Portuguese)' },
 { code: 'pt-BR', name: 'Português (Brasil)' },
 { code: 'ru', name: 'Русский (Russian)' },
 { code: 'uk', name: 'Українська (Ukrainian)' },
 { code: 'pl', name: 'Polski (Polish)' },
 { code: 'nl', name: 'Nederlands (Dutch)' },
 { code: 'sv', name: 'Svenska (Swedish)' },
 { code: 'da', name: 'Dansk (Danish)' },
 { code: 'fi', name: 'Suomi (Finnish)' },
 { code: 'no', name: 'Norsk (Norwegian)' },
 { code: 'zh-CN', name: '中文（简体）(Chinese Simplified)' },
 { code: 'zh-TW', name: '中文（繁體）(Chinese Traditional)' },
 { code: 'ja', name: '日本語 (Japanese)' },
 { code: 'ko', name: '한국어 (Korean)' },
 { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
 { code: 'th', name: 'ไทย (Thai)' },
 { code: 'id', name: 'Bahasa Indonesia' },
 { code: 'ms', name: 'Bahasa Melayu (Malay)' },
 { code: 'tl', name: 'Filipino / Tagalog' },
 { code: 'hi', name: 'हिन्दी (Hindi)' },
 { code: 'bn', name: 'বাংলা (Bengali)' },
 { code: 'ur', name: 'اردو (Urdu)' },
 { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
 { code: 'mr', name: 'मराठी (Marathi)' },
 { code: 'ta', name: 'தமிழ் (Tamil)' },
 { code: 'te', name: 'తెలుగు (Telugu)' },
 { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
 { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
 { code: 'ml', name: 'മലയാളം (Malayalam)' },
 { code: 'ne', name: 'नेपाली (Nepali)' },
 { code: 'si', name: 'සිංහල (Sinhala)' },
 { code: 'ar', name: 'العربية (Arabic)' },
 { code: 'fa', name: 'فارسی (Persian)' },
 { code: 'he', name: 'עברית (Hebrew)' },
 { code: 'tr', name: 'Türkçe (Turkish)' },
 { code: 'sw', name: 'Kiswahili (Swahili)' },
 { code: 'am', name: 'አማርኛ (Amharic)' },
 { code: 'ha', name: 'Hausa' },
 { code: 'yo', name: 'Yorùbá (Yoruba)' },
 { code: 'ig', name: 'Igbo' },
 { code: 'zu', name: 'isiZulu (Zulu)' },
 { code: 'xh', name: 'isiXhosa (Xhosa)' },
 { code: 'so', name: 'Soomaali (Somali)' },
 { code: 'af', name: 'Afrikaans' },
 { code: 'cs', name: 'Čeština (Czech)' },
 { code: 'sk', name: 'Slovenčina (Slovak)' },
 { code: 'hu', name: 'Magyar (Hungarian)' },
 { code: 'ro', name: 'Română (Romanian)' },
 { code: 'bg', name: 'Български (Bulgarian)' },
 { code: 'el', name: 'Ελληνικά (Greek)' },
 { code: 'sr', name: 'Српски (Serbian)' },
 { code: 'hr', name: 'Hrvatski (Croatian)' },
 { code: 'sl', name: 'Slovenščina (Slovenian)' },
 { code: 'lt', name: 'Lietuvių (Lithuanian)' },
 { code: 'lv', name: 'Latviešu (Latvian)' },
 { code: 'et', name: 'Eesti (Estonian)' },
 { code: 'ca', name: 'Català (Catalan)' },
 { code: 'eu', name: 'Euskara (Basque)' },
 { code: 'gl', name: 'Galego (Galician)' },
 { code: 'cy', name: 'Cymraeg (Welsh)' },
 { code: 'ga', name: 'Gaeilge (Irish)' },
 { code: 'is', name: 'Íslenska (Icelandic)' },
 { code: 'ka', name: 'ქართული (Georgian)' },
 { code: 'hy', name: 'Հայերեն (Armenian)' },
 { code: 'az', name: 'Azərbaycan (Azerbaijani)' },
 { code: 'kk', name: 'Қазақша (Kazakh)' },
 { code: 'uz', name: 'Oʻzbek (Uzbek)' },
 { code: 'ky', name: 'Кыргызча (Kyrgyz)' },
 { code: 'tg', name: 'Тоҷикӣ (Tajik)' },
 { code: 'mn', name: 'Монгол (Mongolian)' },
 { code: 'my', name: 'မြန်မာ (Burmese)' },
 { code: 'km', name: 'ខ្មែរ (Khmer)' },
 { code: 'lo', name: 'ລາວ (Lao)' },
];

const ORIGINAL_CONTENT = {
 // === COMMON ===
 continueButton: "Continue",
 backButton: "Back",
 loading: "Loading...",
 orDivider: "or",
 termsOfUse: "Terms of use",
 privacyPolicy: "Privacy Policy",
 help: "Get help",
 copyright: "© 2025 UFOnic LLC. All rights reserved.",
 translatePrompt: "Would you like to translate to",
 translateYes: "Yes",
 translateNo: "No",
 searchLanguages: "Search languages...",
 emailPlaceholder: "Enter your email",
 passwordPlaceholder: "Enter your password",
 enterEmail: "Enter your email!",
 enterPassword: "Enter your password!",
 connectionError: "Having server errors, try again!",
 couldNotVerify: "Could not verify email.",

 // === SIGNUP PAGE ===
 pageTitle: 'Create your account',
 step0Title: "Signing up!",
 step1Title: "Username...",
 step2Title: "Handle time!",
 step3Title: "Password eh?",
 step4Title: "Confirm that!",
 step0Subtitle: "You'll use this to sign in",
 step1Subtitle: "This is how others will see you (3-30 characters)",
 step2Subtitle: "Your unique identifier (3-15 characters)",
 step3Subtitle: "Min 8 characters, 1 uppercase, 1 number",
 step4Subtitle: "Just to make sure",
 signupStep0Explanation: "Welcome! Let's get started by entering your email address OR you can sign up with Google for instant access.",
 signupStep1Explanation: "Choose how you want to be known on uChat. This is your display name that others will see. It is like a nickname!",
 signupStep2Explanation: "Your handle is like your identifier - it's completely unique to you and helps others find you. No one can copy your handle!",
 signupStep3Explanation: "Create a strong password to keep your account secure, please make it secure like seriously! 🥺",
 signupStep4Explanation: "Almost there! Confirm your password and agree to our terms to finish creating your account.",
 usernamePlaceholder: "Enter your username",
 handlePlaceholder: "Enter your handle",
 confirmPasswordPlaceholder: "Enter your password again",
 createAccountButton: "Create Account",
 creating: "Creating...",
 signupWithGoogle: "Sign up with Google",
 agreeToTerms: "I agree to the",
 and: "and",
 alreadyHaveAccount: "Already have an account?",
 signIn: "Sign in!",
 enterUsername: "Username is required",
 usernameTooShort: "Username must be at least 3 characters",
 usernameTooLong: "Username cannot exceed 30 characters",
 enterHandle: "Handle is required",
 handleTooShort: "Handle must be at least 3 characters",
 handleTooLong: "Handle cannot exceed 15 characters",
 handleInvalid: "Handle can only contain letters, numbers, and underscores",
 handleNoAt: "Don't include \"@\" because it will be added automatically",
 passwordTooShort: "Password must be at least 8 characters",
 passwordNoUppercase: "Password must contain at least one uppercase letter",
 passwordNoNumber: "Password must contain at least one number",
 passwordsNotMatch: "Passwords do not match",
 mustAgreeToTerms: "Please agree to the terms and conditions",
 emailTaken: "This email is already taken. Try again!",
 handleTaken: "This handle is already taken. Try again!",
 unableToVerify: "Unable to verify",
 signupFailed: "Signup failed",
 charactersCount: "characters",
};

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

 const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
 const [content, setContent] = useState(ORIGINAL_CONTENT);
 const [languageSearch, setLanguageSearch] = useState('');
 const { currentLanguage, changeLanguage, suggestedLanguage, showSuggestion, acceptSuggestion, dismissSuggestion } = useLanguage();

 const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
 const canvasRef = useStars({ enabled: isDark });
 const liquidCanvasRef = useLiquidLayers({ enabled: !isDark });
 const dropdownRef = useRef(null);
 const translationsCacheRef = useRef(new Map());

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
   setIsDark(e.matches);
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

 useEffect(() => {
  const handleClickOutside = (event) => {
   if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    setShowLanguageDropdown(false);
   }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const getTranslation = (langCode) => {
  const translationPath = `/src/translations/${langCode}.json`;
  const allTranslations = import.meta.glob('/src/translations/*.json', { eager: true, import: 'default' });
  return allTranslations[translationPath] || ORIGINAL_CONTENT;
 };

 useEffect(() => {
  if (currentLanguage.startsWith('en')) {
   setContent(ORIGINAL_CONTENT);
   return;
  }

  const cached = translationsCacheRef.current.get(currentLanguage);
  if (cached) {
   setContent(cached);
   return;
  }

  const translation = getTranslation(currentLanguage);
  translationsCacheRef.current.set(currentLanguage, translation);
  setContent(translation);
 }, [currentLanguage]);

 const handleLanguageChange = (langCode) => {
  changeLanguage(langCode);
  setShowLanguageDropdown(false);
  setLanguageSearch('');
 };

 const filteredLanguages = LANGUAGES.filter(lang =>
  lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
  lang.code.toLowerCase().includes(languageSearch.toLowerCase())
 );

 const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === 'handle' && value.includes('@')) {
   setValidationError(content.handleNoAt);
   return;
  }

  let finalValue = value;
  if (name === 'username' && value.length > 30) {
   finalValue = value.slice(0, 30);
  }
  if (name === 'handle' && value.length > 15) {
   finalValue = value.slice(0, 15);
  }

  setFormData((prev) => ({ ...prev, [name]: finalValue }));
  if (error) setError('');
 };

 const handleGoogleSignup = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const normalizeEmail = (raw) => {
  let email = (raw || '').trim();
  if (!email) return email;
  if (!email.includes('@')) email = email + '@gmail.com';
  return email;
 };

 const validateCurrentStepClientSide = () => {
  if (currentStep === 0) {
   if (!formData.email.trim()) {
    setValidationError(content.enterEmail);
    return false;
   }
  }
  if (currentStep === 1) {
   if (!formData.username.trim()) {
    setValidationError(content.enterUsername);
    return false;
   }
   if (formData.username.length < 3) {
    setValidationError(content.usernameTooShort);
    return false;
   }
   if (formData.username.length > 30) {
    setValidationError(content.usernameTooLong);
    return false;
   }
  }
  if (currentStep === 2) {
   if (!formData.handle.trim()) {
    setValidationError(content.enterHandle);
    return false;
   }
   const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
   if (handle.length < 3) {
    setValidationError(content.handleTooShort);
    return false;
   }
   if (handle.length > 15) {
    setValidationError(content.handleTooLong);
    return false;
   }
   if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
    setValidationError(content.handleInvalid);
    return false;
   }
  }
  if (currentStep === 3) {
   if (!formData.password) {
    setValidationError(content.enterPassword);
    return false;
   }
   if (formData.password.length < 8) {
    setValidationError(content.passwordTooShort);
    return false;
   }
   if (!/[A-Z]/.test(formData.password)) {
    setValidationError(content.passwordNoUppercase);
    return false;
   }
   if (!/[0-9]/.test(formData.password)) {
    setValidationError(content.passwordNoNumber);
    return false;
   }
  }
  if (currentStep === 4) {
   if (formData.password !== formData.confirmPassword) {
    setValidationError(content.passwordsNotMatch);
    return false;
   }
   if (!agreedToTerms) {
    setValidationError(content.mustAgreeToTerms);
    return false;
   }
  }
  return true;
 };

 const checkStepWithBackend = async () => {
  if (currentStep === 0) {
   setLoading(true);

   let emailToCheck = normalizeEmail(formData.email);
   if (emailToCheck !== formData.email) {
    setFormData(prev => ({ ...prev, email: emailToCheck }));
   }

   try {
    const response = await fetch(`${API_BASE_URL}/api/check-email-availability`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ email: emailToCheck })
    });

    const data = await response.json();

    if (!response.ok) {
     setError(content.unableToVerify);
     setLoading(false);
     return false;
    }

    if (!data.available) {
     setError(content.emailTaken);
     setLoading(false);
     return false;
    }

    setLoading(false);
    return true;
   } catch (err) {
    setError(content.connectionError);
    setLoading(false);
    return false;
   }
  } else if (currentStep === 2) {
   setLoading(true);
   try {
    const handle = formData.handle.startsWith('@') ? formData.handle.slice(1) : formData.handle;
    const response = await fetch(`${API_BASE_URL}/api/check-handle-availability`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ handle: handle })
    });

    const data = await response.json();

    if (!response.ok) {
     setError(content.couldNotVerify);
     setLoading(false);
     return false;
    }

    if (!data.available) {
     setError(content.handleTaken);
     setLoading(false);
     return false;
    }

    setLoading(false);
    return true;
   } catch (err) {
    setError(content.connectionError);
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
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(formData)
   });

   await response.json();

   if (response.ok) {
    navigate('/verify', { state: { email: formData.email } });
   } else {
    setError(content.signupFailed);
   }
  } catch (error) {
   setError(content.connectionError);
  } finally {
   setLoading(false);
  }
 };

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

 const selectedLang = LANGUAGES.find(l => l.code === currentLanguage);

 const getStepTitle = () => {
  switch (currentStep) {
   case 0: return content.step0Title;
   case 1: return content.step1Title;
   case 2: return content.step2Title;
   case 3: return content.step3Title;
   case 4: return content.step4Title;
   default: return '';
  }
 };

 const getStepExplanation = () => {
  switch (currentStep) {
   case 0: return content.signupStep0Explanation;
   case 1: return content.signupStep1Explanation;
   case 2: return content.signupStep2Explanation;
   case 3: return content.signupStep3Explanation;
   case 4: return content.signupStep4Explanation;
   default: return '';
  }
 };

 return (
  <div data-signup-page="true" {...stylex.props(signupStyles.signupContainer)}>
   {isDark ? (
    <canvas
     key="bg-dark"
     ref={canvasRef}
     {...stylex.props(signupStyles.starCanvas)}
     aria-hidden="true"
     data-theme-canvas="dark"
    />
   ) : (
    <canvas
     key="bg-light"
     ref={liquidCanvasRef}
     {...stylex.props(signupStyles.starCanvas)}
     aria-hidden="true"
     data-theme-canvas="light"
    />
   )}

   <div {...stylex.props(signupStyles.signupCard)} role="region" aria-label="Signup form">
    {/* Left column */}
    <div {...stylex.props(signupStyles.signupHeader)}>
     <div {...stylex.props(signupStyles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(signupStyles.mainLogo)}
       style={{ width: '60px', height: '60px' }}
       draggable="false"
      />
     </div>

     <h1 {...stylex.props(signupStyles.headerTitle)}>
      {getStepTitle()}
     </h1>

     <p {...stylex.props(signupStyles.headerSubtitle)}>
      {getStepExplanation()}
     </p>

     {showSuggestion && suggestedLanguage && (
      <div style={{
       marginTop: '12px',
       padding: '10px 14px',
       backgroundColor: 'var(--focus-ring)',
       border: '1px solid var(--border-focus)',
       borderRadius: '8px',
       fontSize: '13px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
       gap: '10px'
      }}>
       <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
        {content.translatePrompt} {LANGUAGES.find(l => l.code === suggestedLanguage)?.name}?
       </span>
       <div style={{ display: 'flex', gap: '8px' }}>
        <button
         onClick={acceptSuggestion}
         style={{
          padding: '6px 14px',
          backgroundColor: 'var(--button-primary)',
          color: 'var(--button-primary-text)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
         }}
         onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
         onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
         {content.translateYes}
        </button>
        <button
         onClick={dismissSuggestion}
         style={{
          padding: '6px 14px',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
         }}
         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--back-hover-bg)'}
         onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
         {content.translateNo}
        </button>
       </div>
      </div>
     )}
    </div>

    {/* Right column */}
    <div {...stylex.props(signupStyles.signupForm)}>
     <div {...stylex.props(signupStyles.formSurface)}>
      <div {...stylex.props(signupStyles.formTop)}>
       <div
        {...stylex.props(signupStyles.progressIndicatorWrapper)}
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin="1"
        aria-valuemax="5"
        aria-label={`Step ${currentStep + 1} of 5`}
       >
        <div {...stylex.props(signupStyles.progressIndicator)}>
         {[0, 1, 2, 3, 4].map((step) => (
          <div
           key={step}
           {...stylex.props(
            signupStyles.progressDot,
            step === currentStep && signupStyles.progressDotActive,
            step < currentStep && signupStyles.progressDotCompleted
           )}
           aria-current={step === currentStep ? "step" : undefined}
          />
         ))}
        </div>
       </div>

       <div {...stylex.props(signupStyles.stepsWrapper)}>
        {/* STEP 0: EMAIL */}
        <div {...stylex.props(...getStepStyleList(0))}>
         <div {...stylex.props(signupStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(signupStyles.inputGroup)}>
           <input
            {...stylex.props(signupStyles.inputGroupInput)}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={content.emailPlaceholder}
            autoFocus
            autoComplete="email"
            maxLength={254}
            aria-invalid={!!(error || validationError)}
            aria-describedby={error || validationError ? "email-error" : undefined}
           />

           <div {...stylex.props(signupStyles.fieldMetaRow)}>
            <div {...stylex.props(signupStyles.fieldMetaLeft)}>
             {(error || validationError) && (
              <div id="email-error" role="alert" {...stylex.props(signupStyles.inlineErrorCompact)}>
               <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
               {error || validationError}
              </div>
             )}
            </div>
            <div {...stylex.props(signupStyles.fieldMetaRight, signupStyles.charCounter)}>
             {formData.email.length}/254 {content.charactersCount}
            </div>
           </div>
          </div>

          <div {...stylex.props(signupStyles.divider)}>
           <div {...stylex.props(signupStyles.dividerLine)} />
           <span {...stylex.props(signupStyles.dividerSpan)}>{content.orDivider}</span>
          </div>

          <button
           onClick={handleGoogleSignup}
           className="oauthBtn"
           {...stylex.props(signupStyles.oauthBtn)}
           disabled={loading}
           aria-label="Sign up with Google"
          >
           <Icon name="google_logo" alt="" aria-hidden="true" style={{ width: '16px', height: '16px', marginTop: '-1px' }} />
           {content.signupWithGoogle}
          </button>
         </div>
        </div>

        {/* STEP 1: USERNAME */}
        <div {...stylex.props(...getStepStyleList(1))}>
         <div {...stylex.props(signupStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(signupStyles.inputGroup)}>
           <input
            {...stylex.props(signupStyles.inputGroupInput)}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder={content.usernamePlaceholder}
            autoFocus={currentStep === 1}
            autoComplete="username"
            maxLength={30}
            aria-invalid={!!(error || validationError)}
            aria-describedby={error || validationError ? "username-error" : undefined}
           />

           <div {...stylex.props(signupStyles.fieldMetaRow)}>
            <div {...stylex.props(signupStyles.fieldMetaLeft)}>
             {(error || validationError) && (
              <div id="username-error" role="alert" {...stylex.props(signupStyles.inlineErrorCompact)}>
               <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
               {error || validationError}
              </div>
             )}
            </div>
            <div {...stylex.props(signupStyles.fieldMetaRight, signupStyles.charCounter)}>
             {formData.username.length}/30 {content.charactersCount}
            </div>
           </div>
          </div>
         </div>
        </div>

        {/* STEP 2: HANDLE */}
        <div {...stylex.props(...getStepStyleList(2))}>
         <div {...stylex.props(signupStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(signupStyles.inputGroup)}>
           <input
            {...stylex.props(signupStyles.inputGroupInput)}
            type="text"
            name="handle"
            value={formData.handle}
            onChange={handleInputChange}
            placeholder={content.handlePlaceholder}
            autoFocus={currentStep === 2}
            maxLength={15}
            aria-invalid={!!(error || validationError)}
            aria-describedby={error || validationError ? "handle-error" : undefined}
           />

           <div {...stylex.props(signupStyles.fieldMetaRow)}>
            <div {...stylex.props(signupStyles.fieldMetaLeft)}>
             {(error || validationError) && (
              <div id="handle-error" role="alert" {...stylex.props(signupStyles.inlineErrorCompact)}>
               <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
               {error || validationError}
              </div>
             )}
            </div>
            <div {...stylex.props(signupStyles.fieldMetaRight, signupStyles.charCounter)}>
             {formData.handle.length}/15 {content.charactersCount}
            </div>
           </div>
          </div>
         </div>
        </div>

        {/* STEP 3: PASSWORD */}
        <div {...stylex.props(...getStepStyleList(3))}>
         <div {...stylex.props(signupStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(signupStyles.inputGroup)}>
           <div style={{ position: 'relative' }}>
            <input
             {...stylex.props(signupStyles.inputGroupInput)}
             type={showPassword ? 'text' : 'password'}
             name="password"
             value={formData.password}
             onChange={handleInputChange}
             placeholder={content.passwordPlaceholder}
             autoFocus={currentStep === 3}
             autoComplete="new-password"
             aria-invalid={!!(error || validationError)}
             aria-describedby={error || validationError ? "password-error" : undefined}
            />
            <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             aria-label={showPassword ? "Hide password" : "Show password"}
             {...stylex.props(signupStyles.passwordToggle)}
            >
             <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true"></i>
            </button>
           </div>
           {(error || validationError) && (
            <div id="password-error" role="alert" {...stylex.props(signupStyles.inlineError)}>
             <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
             {error || validationError}
            </div>
           )}
          </div>
         </div>
        </div>

        {/* STEP 4: CONFIRM PASSWORD + TERMS */}
        <div {...stylex.props(...getStepStyleList(4))}>
         <div {...stylex.props(signupStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(signupStyles.inputGroup)}>
           <div style={{ position: 'relative' }}>
            <input
             {...stylex.props(signupStyles.inputGroupInput)}
             type={showConfirmPassword ? 'text' : 'password'}
             name="confirmPassword"
             value={formData.confirmPassword}
             onChange={handleInputChange}
             placeholder={content.confirmPasswordPlaceholder}
             autoFocus={currentStep === 4}
             autoComplete="new-password"
             aria-invalid={!!(error || validationError)}
             aria-describedby={error || validationError ? "confirm-password-error" : undefined}
            />
            <button
             type="button"
             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
             {...stylex.props(signupStyles.passwordToggle)}
            >
             <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true"></i>
            </button>
           </div>
           {(error || validationError) && (
            <div id="confirm-password-error" role="alert" {...stylex.props(signupStyles.inlineError)}>
             <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
             {error || validationError}
            </div>
           )}
          </div>

          <div {...stylex.props(signupStyles.termsCheckbox)}>
           <label {...stylex.props(signupStyles.checkboxLabel)}>
            <input
             type="checkbox"
             checked={agreedToTerms}
             onChange={(e) => setAgreedToTerms(e.target.checked)}
             {...stylex.props(signupStyles.checkboxInput)}
            />
            <span {...stylex.props(signupStyles.checkboxCustom, agreedToTerms && signupStyles.checkboxCustomChecked)} aria-hidden="true">
             {agreedToTerms && <span {...stylex.props(signupStyles.checkboxCheckmark)} />}
            </span>
            <span {...stylex.props(signupStyles.checkboxText)}>
             {content.agreeToTerms}{' '}
             <a href="/terms" target="_blank" rel="noreferrer" {...stylex.props(signupStyles.termsLink)}>
              {content.termsOfUse}
             </a>
             {' '}{content.and}{' '}
             <a href="/privacy" target="_blank" rel="noreferrer" {...stylex.props(signupStyles.termsLink)}>
              {content.privacyPolicy}
             </a>
            </span>
           </label>
          </div>
         </div>
        </div>
       </div>
      </div>

      <div {...stylex.props(signupStyles.formActions)}>
       {currentStep === 0 ? (
        <>
         <a href="/login" {...stylex.props(signupStyles.secondaryAction)}>
          {content.alreadyHaveAccount}
         </a>

         <button
          type="button"
          onClick={handleContinue}
          {...stylex.props(signupStyles.primaryButton)}
          disabled={loading || !!validationError}
         >
          <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
          {loading ? content.loading : content.continueButton}
         </button>
        </>
       ) : (
        <>
         <button
          type="button"
          onClick={handleBack}
          {...stylex.props(signupStyles.secondaryButton)}
          disabled={loading}
         >
          {content.backButton}
         </button>

         <button
          type="button"
          onClick={handleContinue}
          {...stylex.props(signupStyles.primaryButton)}
          disabled={loading || !!validationError || (currentStep === 4 && !agreedToTerms)}
         >
          <i className={loading ? 'fas fa-spinner fa-spin' : (currentStep === 4 ? 'fas fa-check' : 'fas fa-arrow-right')} style={{ marginRight: '8px' }} aria-hidden="true"></i>
          {loading ? (currentStep === 4 ? content.creating : content.loading) : (currentStep === 4 ? content.createAccountButton : content.continueButton)}
         </button>
        </>
       )}
      </div>
     </div>

     <div {...stylex.props(signupStyles.floatingMenu)}>
      <span {...stylex.props(signupStyles.copyrightText)}>{content.copyright}</span>

      <div {...stylex.props(signupStyles.floatingMenuLinks)} role="navigation" aria-label="Legal and help links">
       <div ref={dropdownRef} {...stylex.props(signupStyles.languageDropdownWrapper)}>
        <a
         onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
         {...stylex.props(signupStyles.floatingMenuItem, signupStyles.languageMenuButton)}
         style={{ cursor: 'pointer' }}
        >
         {selectedLang?.name || 'English'}
         <i className="fas fa-chevron-down" style={{ fontSize: '9px' }} />
        </a>

        {showLanguageDropdown && (
         <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '0',
          marginBottom: '8px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px var(--shadow)',
          minWidth: '220px',
          maxHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
         }}>
          <div style={{
           padding: '10px',
           borderBottom: '1px solid var(--border)',
           position: 'sticky',
           top: 0,
           backgroundColor: 'var(--bg-secondary)',
           zIndex: 1
          }}>
           <input
            type="text"
            placeholder={content.searchLanguages}
            value={languageSearch}
            onChange={(e) => setLanguageSearch(e.target.value)}
            autoFocus
            style={{
             width: '100%',
             padding: '8px 12px',
             border: '1px solid var(--border)',
             borderRadius: '6px',
             fontSize: '13px',
             backgroundColor: 'var(--bg-secondary)',
             color: 'var(--text-primary)',
             outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
           />
          </div>

          <div style={{
           overflowY: 'auto',
           maxHeight: '280px'
          }}>
           {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => (
             <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
               width: '100%',
               padding: '10px 16px',
               textAlign: 'left',
               background: currentLanguage === lang.code ? 'var(--focus-ring)' : 'none',
               border: 'none',
               color: 'var(--text-primary)',
               fontSize: '13px',
               cursor: 'pointer',
               transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => {
               if (currentLanguage !== lang.code) e.currentTarget.style.backgroundColor = 'var(--focus-ring)';
              }}
              onMouseOut={(e) => {
               if (currentLanguage !== lang.code) e.currentTarget.style.backgroundColor = 'transparent';
              }}
             >
              {lang.name}
             </button>
            ))
           ) : (
            <div style={{
             padding: '20px',
             textAlign: 'center',
             color: 'var(--text-secondary)',
             fontSize: '13px'
            }}>
             No languages found
            </div>
           )}
          </div>
         </div>
        )}
       </div>

       <a
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(signupStyles.floatingMenuItem)}
        title="View Terms and Conditions"
       >
        {content.termsOfUse}
       </a>

       <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(signupStyles.floatingMenuItem)}
        title="View Privacy Policy"
       >
        {content.privacyPolicy}
       </a>

       <a
        href="/help"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(signupStyles.floatingMenuItem)}
        title="Get help"
       >
        {content.help}
       </a>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
};

export default Signup;