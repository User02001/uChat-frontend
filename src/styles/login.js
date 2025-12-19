import * as stylex from '@stylexjs/stylex';

/* =========================================================
   GLOBAL THEME VARS + GLOBAL/COMPLEX SELECTORS (INJECTED ONCE)
   - Includes ALL original variables from :root and [data-theme="dark"]
   - Also includes reset/body/html + autofill + theme-specific hover selectors
   - Adds a few helper vars to avoid hard-coded colors while preserving look
========================================================= */

const injectedCss = `
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* Theme variables (original, unmodified) */
:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --signin-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border: #e0e0e0;
  --border-focus: #ff9800;
  --button-primary: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  --button-primary-hover: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  --button-primary-text: #1a1a1a;
  --shadow: rgba(0, 0, 0, 0.1);
  --error-bg: #fee;
  --error-text: #c53030;
  --error-border: #feb2b2;

  /* Helper vars to avoid hard-coded colors while preserving original visuals */
  --success: #4caf50;
  --link-hover: #f57c00;
  --focus-ring: rgba(255, 152, 0, 0.1);
  --back-hover-bg: rgba(255, 152, 0, 0.1);
  --star-bg: #000;
  --oauth-hover-light: #f8f8f8;
  --oauth-hover-dark: #3c3c3c;
}

[data-theme="dark"] {
  --bg-primary: linear-gradient(135deg, #000000 0%, #000000 100%);
  --bg-secondary: #000000;
  --signin-card: #1212128c;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border: #404040;
  --border-focus: #ff9800;
  --button-primary: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  --button-primary-hover: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  --button-primary-text: #1a1a1a;
  --shadow: rgba(0, 0, 0, 0.3);
  --error-bg: #2d1b1b;
  --error-text: #fc8181;
  --error-border: #9b2c2c;

  /* Helper vars */
  --success: #4caf50;
  --link-hover: #f57c00;
  --focus-ring: rgba(255, 152, 0, 0.1);
  --back-hover-bg: rgba(255, 152, 0, 0.1);
  --star-bg: #000;
  --oauth-hover-light: #f8f8f8;
  --oauth-hover-dark: #3c3c3c;
}

/* Theme-specific complex selector hover (preserved) */
[data-theme="light"] .oauthBtn:hover:not(:disabled) {
  background-color: var(--oauth-hover-light);
}
[data-theme="dark"] .oauthBtn:hover:not(:disabled) {
  background-color: var(--oauth-hover-dark);
}

/* Autofill styling (preserved) */
.inputGroup input:-webkit-autofill,
.inputGroup input:-webkit-autofill:hover,
.inputGroup input:-webkit-autofill:focus,
.inputGroup input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--bg-secondary) inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
  caret-color: var(--text-primary);
  transition: background-color 5000s ease-in-out 0s;
}

.inputGroup input:-moz-autofill,
.inputGroup input:-moz-autofill-preview {
  filter: none;
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}
`;

if (typeof document !== 'undefined') {
 if (!document.getElementById('login-stylex-injected')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'login-stylex-injected';
  styleTag.textContent = injectedCss;
  document.head.appendChild(styleTag);
 }
}

/* =========================================================
   KEYFRAMES (preserved)
========================================================= */

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

const slideInFromRight = stylex.keyframes({
 from: { transform: 'translateX(100%)', opacity: 0 },
 to: { transform: 'translateX(0)', opacity: 1 },
});

const slideInFromLeft = stylex.keyframes({
 from: { transform: 'translateX(-100%)', opacity: 0 },
 to: { transform: 'translateX(0)', opacity: 1 },
});

const slideOutLeft = stylex.keyframes({
 from: { transform: 'translateX(0)', opacity: 1 },
 to: { transform: 'translateX(-100%)', opacity: 0 },
});

const slideOutRight = stylex.keyframes({
 from: { transform: 'translateX(0)', opacity: 1 },
 to: { transform: 'translateX(100%)', opacity: 0 },
});

/* =========================================================
   STYLEX STYLES
========================================================= */

export const loginStyles = stylex.create({
 loginContainer: {
  minHeight: '100vh',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily:
   "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  width: '100%',
 },

 starCanvas: {
  position: 'fixed',
  inset: 0,
  display: 'block',
  width: '100%',
  height: '100%',
  zIndex: 0,
  pointerEvents: 'none',
  background: 'var(--star-bg)',
 },

 loginCard: {
  backgroundColor: 'var(--signin-card)',
  borderRadius: '50px',
  border: '3px solid var(--border)',
  width: '100%',
  maxWidth: '900px',
  padding: '35px 50px',
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  gridTemplateColumns: '380px 1fr',
  columnGap: '50px',
  rowGap: '15px',
  alignItems: 'start',
  margin: '0 auto',

  '@media (max-width: 900px)': {
   maxWidth: '400px',
   padding: '30px',
   gridTemplateColumns: '1fr',
   gap: '24px',
   background: 'var(--signin-card)',
  },
 },

 loginHeader: {
  gridColumn: 1,
  textAlign: 'left',
  paddingRight: '30px',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  '@media (max-width: 900px)': {
   textAlign: 'center',
   borderRight: 'none',
   borderBottom: '1px solid var(--border)',
   paddingRight: 0,
   paddingBottom: '20px',
  },
 },

 logoContainer: {
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '12px',

  '@media (max-width: 900px)': {
   justifyContent: 'center',
  },
 },

 mainLogo: {
  width: '60px',
  height: '60px',
  objectFit: 'contain',
 },

 headerTitle: {
  color: 'var(--text-primary)',
  fontSize: '28px',
  fontWeight: 400,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  '@media (max-width: 900px)': {
   fontSize: '24px',
   justifyContent: 'center',
   textAlign: 'center',
  },
 },

 loginForm: {
  gridColumn: 2,
  '@media (max-width: 900px)': {
   gridColumn: 1,
  },
 },

 stepExplanation: {
  marginTop: '16px',
 },

 stepExplanationP: {
  fontSize: '15px',
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  margin: 0,
 },

 progressIndicator: {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '16px',
 },

 progressIndicatorStep0: { marginBottom: '33px' },
 progressIndicatorStep1: { marginBottom: '50px' },

 progressDot: {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--border)',
  transition: 'all 0.3s ease',
 },

 progressDotActive: {
  background: 'var(--border-focus)',
  transform: 'scale(1.2)',
 },

 progressDotCompleted: {
  background: 'var(--success)',
 },

 stepsWrapper: {
  position: 'relative',
  minHeight: '150px',
  overflow: 'hidden',
  marginBottom: '-5px',
 },

 stepContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  opacity: 0,
  pointerEvents: 'none',
 },

 stepContainerActive: {
  opacity: 1,
  pointerEvents: 'all',
  position: 'relative',
 },

 slidingOutLeft: {
  animationName: slideOutLeft,
  animationDuration: '0.3s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 slidingOutRight: {
  animationName: slideOutRight,
  animationDuration: '0.3s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 comingFromLeft: {
  animationName: slideInFromLeft,
  animationDuration: '0.3s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 comingFromRight: {
  animationName: slideInFromRight,
  animationDuration: '0.3s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 stepHeader: { marginBottom: '8px' },
 step0_stepHeader: { marginBottom: '8px' },
 step1_stepHeader: { marginBottom: '20px' },

 stepHeaderH2: {
  fontSize: '16px',
  fontWeight: 400,
  color: 'var(--text-primary)',
  marginBottom: '2px',
 },

 stepHeaderP: {
  fontSize: '12px',
  color: 'var(--text-secondary)',
 },

 inputGroup: { marginBottom: 0 },
 step0_inputGroup: { marginBottom: 0 },
 step1_inputGroup: { marginBottom: '15px' },

 inputGroupInput: {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  fontSize: '14px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',

  ':focus': {
   outline: 'none',
   borderColor: 'var(--border-focus)',
   boxShadow: '0 0 0 2px var(--focus-ring)',
  },

  '::placeholder': {
   color: 'var(--text-secondary)',
  },
 },

 divider: {
  position: 'relative',
  textAlign: 'center',
  margin: '6px 0',
 },

 dividerLine: {
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: 'var(--border)',
 },

 dividerSpan: {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  padding: '0 10px',
  position: 'relative',
 },

 oauthButtons: {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '13px',
 },

 oauthBtn: {
  width: '100%',
  padding: '9px 14px',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',

  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },

  ':hover:not(:disabled)': {
   borderColor: 'var(--border-focus)',
   /* background-color handled via injected [data-theme] selector for exact parity */
  },
 },

 /* Present in JSX in the original but not used in the provided CSS; kept as noop for exact mapping */
 google: {},

 buttonContainer: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  marginTop: '6px',
 },

 backBtn: {
  padding: '5.5px 18px',
  fontSize: '13px',
  fontWeight: 500,
  background: 'transparent',
  color: 'var(--border-focus)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  lineHeight: 1,

  ':hover:not(:disabled)': {
   background: 'var(--back-hover-bg)',
   borderColor: 'var(--border-focus)',
  },

  ':disabled': {
   opacity: 0.5,
   cursor: 'not-allowed',
  },
 },

 backBtnImg: {
  width: '20px',
  height: '20px',
  display: 'block',
 },

 loginBtn: {
  padding: '8px 18px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
 },

 primary: {
  background: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  fontWeight: 600,

  ':hover:not(:disabled)': {
   background: 'var(--button-primary-hover)',
  },
 },

 loginFooter: {
  gridColumn: '1 / -1',
  textAlign: 'center',
  borderTop: '1px solid var(--border)',
  paddingTop: '10px',
  marginTop: '10px',

  '@media (max-width: 900px)': {
   gridColumn: 1,
   marginTop: '-6px',
  },
 },

 footerP: {
  color: 'var(--text-secondary)',
  fontSize: '32px',
  margin: 0,
  marginTop: '22px',

  '@media (max-width: 900px)': {
   fontSize: '15px',
  },
 },

 footerA: {
  color: 'var(--border-focus)',
  textDecoration: 'none',

  ':hover': {
   textDecoration: 'underline',
   color: 'var(--link-hover)',
  },
 },
});
