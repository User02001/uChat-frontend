import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { loginStyles } from '../styles/login';
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

 // Major Asian languages
 { code: 'zh-CN', name: '中文（简体）(Chinese Simplified)' },
 { code: 'zh-TW', name: '中文（繁體）(Chinese Traditional)' },
 { code: 'ja', name: '日本語 (Japanese)' },
 { code: 'ko', name: '한국어 (Korean)' },
 { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
 { code: 'th', name: 'ไทย (Thai)' },
 { code: 'id', name: 'Bahasa Indonesia' },
 { code: 'ms', name: 'Bahasa Melayu (Malay)' },
 { code: 'tl', name: 'Filipino / Tagalog' },

 // South Asia
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

 // Middle East / North Africa
 { code: 'ar', name: 'العربية (Arabic)' },
 { code: 'fa', name: 'فارسی (Persian)' },
 { code: 'he', name: 'עברית (Hebrew)' },
 { code: 'tr', name: 'Türkçe (Turkish)' },

 // Africa
 { code: 'sw', name: 'Kiswahili (Swahili)' },
 { code: 'am', name: 'አማርኛ (Amharic)' },
 { code: 'ha', name: 'Hausa' },
 { code: 'yo', name: 'Yorùbá (Yoruba)' },
 { code: 'ig', name: 'Igbo' },
 { code: 'zu', name: 'isiZulu (Zulu)' },
 { code: 'xh', name: 'isiXhosa (Xhosa)' },
 { code: 'so', name: 'Soomaali (Somali)' },
 { code: 'af', name: 'Afrikaans' },

 // Europe (additional)
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

 // Caucasus / Central Asia (includes Mongolian)
 { code: 'ka', name: 'ქართული (Georgian)' },
 { code: 'hy', name: 'Հայերեն (Armenian)' },
 { code: 'az', name: 'Azərbaycan (Azerbaijani)' },
 { code: 'kk', name: 'Қазақша (Kazakh)' },
 { code: 'uz', name: 'Oʻzbek (Uzbek)' },
 { code: 'ky', name: 'Кыргызча (Kyrgyz)' },
 { code: 'tg', name: 'Тоҷикӣ (Tajik)' },
 { code: 'mn', name: 'Монгол (Mongolian)' },

 // Southeast Asia (additional)
 { code: 'my', name: 'မြန်မာ (Burmese)' },
 { code: 'km', name: 'ខ្មែរ (Khmer)' },
 { code: 'lo', name: 'ລາວ (Lao)' },
];

const ORIGINAL_CONTENT = {
 // === COMMON (subset used on Login) ===
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

 // === LOGIN PAGE (updated keys) ===
 welcomeBack0: 'Sign in',
 welcomeBack1: 'Welcome back!',

 loginStep0Explanation: 'by entering your email first right there in that little box!',
 loginStep1Explanation: 'Now enter your password to continue chatting on uChat.',

 loginButton: "Login",
 loggingIn: "Logging in...",

 forgotEmail: "Forgot your email?",
 forgotPassword: "Forgot your password?",

 continueWithGoogle: "Continue with Google",

 footerLinkSignup: "Create account",

 wrongPassword: "Wrong password. Please try again!",
 emailNotFound: "We could not find an account with this email, try again!",
};

const Login = () => {
 const navigate = useNavigate();

 const [currentStep, setCurrentStep] = useState(0);
 const [formData, setFormData] = useState({ email: '', password: '' });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);

 const [direction, setDirection] = useState('forward');
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [prevStep, setPrevStep] = useState(0);

 const [validationError, setValidationError] = useState('');
 const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
 const [content, setContent] = useState(ORIGINAL_CONTENT);
 const [languageSearch, setLanguageSearch] = useState('');

 const {
  currentLanguage,
  changeLanguage,
  suggestedLanguage,
  showSuggestion,
  acceptSuggestion,
  dismissSuggestion
 } = useLanguage();

 const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
 const canvasRef = useStars({ enabled: isDark });
 const liquidCanvasRef = useLiquidLayers({ enabled: !isDark });
 const dropdownRef = useRef(null);

 // Cache loaded translations (from /public/translations)
 const translationsCacheRef = useRef(new Map());

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

 const loadTranslation = async (langCode) => {
  if (langCode === 'en') return ORIGINAL_CONTENT;

  const cached = translationsCacheRef.current.get(langCode);
  if (cached) return cached;

  try {
   const res = await fetch(`/translations/${langCode}.json`, { cache: 'force-cache' });
   if (!res.ok) throw new Error(`Failed to load translation ${langCode}`);
   const json = await res.json();

   // Light safety: if file is malformed, fall back
   if (!json || typeof json !== 'object') return ORIGINAL_CONTENT;

   translationsCacheRef.current.set(langCode, json);
   return json;
  } catch {
   return ORIGINAL_CONTENT;
  }
 };

 useEffect(() => {
  let cancelled = false;

  (async () => {
   const next = await loadTranslation(currentLanguage);
   if (!cancelled) setContent(next);
  })();

  return () => { cancelled = true; };
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
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (error) setError('');
 };

 const handleGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
 };

 const validateCurrentStepClientSide = () => {
  if (currentStep === 0) {
   if (!formData.email.trim()) {
    setValidationError(content.enterEmail);
    return false;
   }
  }
  if (currentStep === 1) {
   if (!formData.password) {
    setValidationError(content.enterPassword);
    return false;
   }
  }
  return true;
 };

 const normalizeEmail = (raw) => {
  let email = (raw || '').trim();
  if (!email) return email;
  if (!email.includes('@')) email = email + '@gmail.com';
  return email;
 };

 const checkEmailWithBackend = async () => {
  setLoading(true);

  const emailToCheck = normalizeEmail(formData.email);
  if (emailToCheck !== formData.email) {
   setFormData((prev) => ({ ...prev, email: emailToCheck }));
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/check-email-exists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: emailToCheck })
   });

   const data = await response.json();

   if (!response.ok) {
    setError(content.couldNotVerify);
    setLoading(false);
    return false;
   }

   if (!data.exists) {
    setError(content.emailNotFound);
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
   const deviceIdentity = getDeviceIdentity();

   const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
     email: normalizeEmail(formData.email),
     password: formData.password,
     deviceId: deviceIdentity.deviceId,
     deviceFingerprint: deviceIdentity.deviceFingerprint,
    }),
   });

   const data = await response.json();

   if (response.ok) {
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/chat');
   } else {
    setError(content.wrongPassword);
   }
  } catch (e) {
   setError(content.connectionError);
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

 const selectedLang = LANGUAGES.find(l => l.code === currentLanguage);

 return (
  <div data-login-page="true" {...stylex.props(loginStyles.loginContainer)}>
   {isDark ? (
    <canvas
     key="bg-dark"
     ref={canvasRef}
     {...stylex.props(loginStyles.starCanvas)}
     aria-hidden="true"
     data-theme-canvas="dark"
    />
   ) : (
    <canvas
     key="bg-light"
     ref={liquidCanvasRef}
     {...stylex.props(loginStyles.starCanvas)}
     aria-hidden="true"
     data-theme-canvas="light"
    />
   )}

   <div {...stylex.props(loginStyles.loginCard)} role="region" aria-label="Login form">
    {/* Left column */}
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
      {currentStep === 0 ? content.welcomeBack0 : content.welcomeBack1}
     </h1>

     <p {...stylex.props(loginStyles.headerSubtitle)}>
      {currentStep === 0 ? content.loginStep0Explanation : content.loginStep1Explanation}
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
    <div {...stylex.props(loginStyles.loginForm)}>
     <div {...stylex.props(loginStyles.formSurface)}>
      <div {...stylex.props(loginStyles.formTop)}>
       <div
        {...stylex.props(loginStyles.progressIndicatorWrapper)}
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin="1"
        aria-valuemax="2"
        aria-label={`Step ${currentStep + 1} of 2`}
       >
        <div {...stylex.props(loginStyles.progressIndicator)}>
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
        {/* STEP 0 */}
        <div {...stylex.props(...getStepStyleList(0))}>
         <div {...stylex.props(loginStyles.stepContent)}>
          <div className="inputGroup" {...stylex.props(loginStyles.inputGroup)}>
           <input
            {...stylex.props(loginStyles.inputGroupInput)}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={content.emailPlaceholder}
            autoFocus
            autoComplete="email"
            aria-invalid={!!(error || validationError)}
            aria-describedby={error || validationError ? "email-error" : undefined}
           />
           {(error || validationError) && (
            <div id="email-error" role="alert" {...stylex.props(loginStyles.inlineError)}>
             <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
             {error || validationError}
            </div>
           )}
          </div>

          <div {...stylex.props(loginStyles.stepRow)}>
           <button
            type="button"
            {...stylex.props(loginStyles.linkButton)}
            onClick={() => { }}
           >
            {content.forgotEmail}
           </button>
          </div>

          <div {...stylex.props(loginStyles.divider)}>
           <div {...stylex.props(loginStyles.dividerLine)} />
           <span {...stylex.props(loginStyles.dividerSpan)}>{content.orDivider}</span>
          </div>

          <button
           onClick={handleGoogleLogin}
           className="oauthBtn"
           {...stylex.props(loginStyles.oauthBtn)}
           disabled={loading}
           aria-label="Sign in with Google"
          >
           <Icon name="google_logo" alt="" aria-hidden="true" style={{ width: '16px', height: '16px', marginTop: '-1px' }} />
           {content.continueWithGoogle}
          </button>
         </div>
        </div>

        {/* STEP 1 */}
        <div {...stylex.props(...getStepStyleList(1))}>
         <div {...stylex.props(loginStyles.stepContent)}>
          <button
           type="button"
           {...stylex.props(loginStyles.emailChip)}
           onClick={handleBack}
           title="Change email"
          >
           <i className="fas fa-user" aria-hidden="true" />
           <span {...stylex.props(loginStyles.emailChipText)}>{normalizeEmail(formData.email) || '—'}</span>
           <i className="fas fa-pen" aria-hidden="true" />
          </button>

          <div className="inputGroup" {...stylex.props(loginStyles.inputGroup)}>
           <div style={{ position: 'relative' }}>
            <input
             id="password-input"
             {...stylex.props(loginStyles.inputGroupInput)}
             type={showPassword ? 'text' : 'password'}
             name="password"
             value={formData.password}
             onChange={handleInputChange}
             placeholder={content.passwordPlaceholder}
             autoFocus={currentStep === 1}
             aria-invalid={!!(error || validationError)}
             aria-describedby={error || validationError ? "password-error" : undefined}
            />

            <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             aria-label={showPassword ? "Hide password" : "Show password"}
             {...stylex.props(loginStyles.passwordToggle)}
            >
             <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden="true"></i>
            </button>
           </div>

           {(error || validationError) && (
            <div id="password-error" role="alert" {...stylex.props(loginStyles.inlineError)}>
             <i className="fas fa-exclamation-circle" style={{ fontSize: '11px' }} aria-hidden="true"></i>
             {error || validationError}
            </div>
           )}
          </div>

          <div {...stylex.props(loginStyles.stepRow)}>
           <button
            type="button"
            {...stylex.props(loginStyles.linkButton)}
            onClick={() => { }}
           >
            {content.forgotPassword}
           </button>
          </div>
         </div>
        </div>
       </div>
      </div>

      <div {...stylex.props(loginStyles.formActions)}>
       {currentStep === 0 ? (
        <>
         <a href="/signup" {...stylex.props(loginStyles.secondaryAction)}>
          {content.footerLinkSignup}
         </a>

         <button
          type="button"
          onClick={handleContinue}
          {...stylex.props(loginStyles.primaryButton)}
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
          {...stylex.props(loginStyles.secondaryButton)}
          disabled={loading}
         >
          {content.backButton}
         </button>

         <button
          type="button"
          onClick={handleContinue}
          {...stylex.props(loginStyles.primaryButton)}
          disabled={loading || !!validationError}
         >
          <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'} style={{ marginRight: '8px' }} aria-hidden="true"></i>
          {loading ? content.loggingIn : content.loginButton}
         </button>
        </>
       )}
      </div>
     </div>

     <div {...stylex.props(loginStyles.floatingMenu)}>
      <span {...stylex.props(loginStyles.copyrightText)}>{content.copyright}</span>

      <div {...stylex.props(loginStyles.floatingMenuLinks)} role="navigation" aria-label="Legal and help links">
       <div ref={dropdownRef} {...stylex.props(loginStyles.languageDropdownWrapper)}>
        <a
         onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
         {...stylex.props(loginStyles.floatingMenuItem, loginStyles.languageMenuButton)}
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

          <div style={{ overflowY: 'auto', maxHeight: '280px' }}>
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
        {...stylex.props(loginStyles.floatingMenuItem)}
        title="View Terms and Conditions"
       >
        {content.termsOfUse}
       </a>

       <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(loginStyles.floatingMenuItem)}
        title="View Privacy Policy"
       >
        {content.privacyPolicy}
       </a>

       <a
        href="/help"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(loginStyles.floatingMenuItem)}
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

export default Login;
