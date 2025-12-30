import * as stylex from '@stylexjs/stylex';

const injectedCss = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body, html { margin: 0; padding: 0; width: 100%; height: 100%; }

body {
 background: var(--bg-primary);
 color: var(--text-primary);
}

button, input, select, textarea {
 color: var(--text-primary);
 font-family: inherit;
}

input::placeholder, textarea::placeholder {
 color: var(--text-secondary);
 opacity: 1;
}

:root {
 --bg-primary: #f5f5f5;
 --bg-secondary: #ffffff;
 --signin-card: rgba(255, 255, 255, 0.98);
 --text-primary: #000000;
 --text-secondary: #333333;
 --border: #e0e0e0;
 --border-focus: #ff9800;
 --button-primary: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
 --button-primary-hover: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
 --button-primary-text: #1a1a1a;
 --shadow: rgba(0, 0, 0, 0.15);
 --error-bg: #fee;
 --error-text: #c53030;
 --error-border: #feb2b2;
 --success: #4caf50;
 --link-hover: #f57c00;
 --focus-ring: rgba(255, 152, 0, 0.1);
 --footer-link: #1a1a1a;
 --footer-link-hover: #000000;
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
 --success: #4caf50;
 --link-hover: #f57c00;
 --focus-ring: rgba(255, 152, 0, 0.1);
 --footer-link: #cccccc;
 --footer-link-hover: #f57c00;
 --back-hover-bg: rgba(255, 152, 0, 0.1);
 --star-bg: #000;
 --oauth-hover-light: #f8f8f8;
 --oauth-hover-dark: #3c3c3c;
}

[data-theme="light"] .oauthBtn:hover:not(:disabled) { background-color: var(--oauth-hover-light); }
[data-theme="dark"] .oauthBtn:hover:not(:disabled) { background-color: var(--oauth-hover-dark); }

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

/* ============================================================
   HARD OVERRIDES (Login only) — wins vs other CSS !important
   Strategy:
   - scope to login page via [data-login-page="true"]
   - use high-specificity selectors + !important
   - keep this style tag last in <head> (see JS below)
   ============================================================ */
html[data-theme="light"] body [data-login-page="true"] {
 color: #111 !important;
}

html[data-theme="light"] body [data-login-page="true"] *,
html[data-theme="light"] body [data-login-page="true"] *::before,
html[data-theme="light"] body [data-login-page="true"] *::after {
 color: inherit !important;
}

html[data-theme="light"] body [data-login-page="true"] input,
html[data-theme="light"] body [data-login-page="true"] select,
html[data-theme="light"] body [data-login-page="true"] textarea,
html[data-theme="light"] body [data-login-page="true"] option {
 color: inherit !important;
 -webkit-text-fill-color: inherit !important;
}

html[data-theme="light"] body [data-login-page="true"] input::placeholder,
html[data-theme="light"] body [data-login-page="true"] textarea::placeholder {
 color: #555 !important;
 opacity: 1 !important;
}

html[data-theme="light"] body [data-login-page="true"] a,
html[data-theme="light"] body [data-login-page="true"] a:visited {
 color: inherit !important;
}
`;

if (typeof document !== 'undefined') {
 const head = document.head;

 let styleTag = document.getElementById('login-stylex-injected');
 if (!styleTag) {
  styleTag = document.createElement('style');
  styleTag.id = 'login-stylex-injected';
  styleTag.textContent = injectedCss;
  head.appendChild(styleTag);
 } else {
  // keep content in sync if this module hot-reloads
  if (styleTag.textContent !== injectedCss) styleTag.textContent = injectedCss;
  // move to end so we win by load order
  head.appendChild(styleTag);
 }

 // Ensure this style tag stays last, even if other CSS is injected later.
 if (!window.__loginStylexHeadObserver) {
  const ensureLast = () => {
   const tag = document.getElementById('login-stylex-injected');
   if (tag && head.lastChild !== tag) head.appendChild(tag);
  };

  ensureLast();

  const observer = new MutationObserver(() => ensureLast());
  observer.observe(head, { childList: true });

  window.__loginStylexHeadObserver = observer;
 }
}

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

const slideInFromRight = stylex.keyframes({
 from: { transform: 'translateX(12px)', opacity: 0 },
 to: { transform: 'translateX(0)', opacity: 1 },
});

const slideInFromLeft = stylex.keyframes({
 from: { transform: 'translateX(-12px)', opacity: 0 },
 to: { transform: 'translateX(0)', opacity: 1 },
});

const slideOutLeft = stylex.keyframes({
 from: { transform: 'translateX(0)', opacity: 1 },
 to: { transform: 'translateX(-12px)', opacity: 0 },
});

const slideOutRight = stylex.keyframes({
 from: { transform: 'translateX(0)', opacity: 1 },
 to: { transform: 'translateX(12px)', opacity: 0 },
});

export const loginStyles = stylex.create({
 loginContainer: {
  minHeight: '100vh',
  minHeight: '100dvh',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  width: '100%',
  '@media (max-width: 900px)': {
   padding: '16px',
   paddingTop: 'max(16px, env(safe-area-inset-top))',
   paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
  },
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
  borderRadius: '42px',
  border: '3px solid var(--border)',
  width: '100%',
  maxWidth: '980px',
  padding: '34px 42px',
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  gridTemplateColumns: '380px 1fr',
  columnGap: '44px',
  alignItems: 'stretch',
  margin: '0 auto',
  boxShadow: '5px 10px 2px 0px var(--shadow)',
  '@media (max-width: 900px)': {
   maxWidth: '500px',
   padding: '28px 24px',
   gridTemplateColumns: '1fr',
   rowGap: '20px',
   borderRadius: '24px',
   border: '2px solid var(--border)',
   boxShadow: '0 18px 40px var(--shadow)',
  },
 },

 loginHeader: {
  gridColumn: 1,
  textAlign: 'left',
  paddingRight: '34px',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: '14px',
  '@media (max-width: 900px)': {
   gridColumn: 1,
   textAlign: 'center',
   borderRight: 'none',
   borderBottom: '1px solid var(--border)',
   paddingRight: 0,
   paddingBottom: '18px',
   gap: '10px',
  },
 },

 logoContainer: {
  display: 'flex',
  justifyContent: 'flex-start',
  '@media (max-width: 900px)': {
   justifyContent: 'center',
  },
 },

 mainLogo: {
  width: '60px',
  height: '60px',
  objectFit: 'contain',
  '@media (max-width: 900px)': {
   width: '50px',
   height: '50px',
  },
 },

 headerTitle: {
  color: 'var(--text-primary)',
  fontSize: '40px',
  fontWeight: 400,
  margin: 0,
  letterSpacing: '-0.2px',
  '@media (max-width: 900px)': {
   fontSize: '24px',
   letterSpacing: 0,
  },
 },

 headerSubtitle: {
  color: 'var(--text-secondary)',
  fontSize: '14px',
  lineHeight: 1.5,
  margin: 0,
  maxWidth: '360px',
  '@media (max-width: 900px)': {
   maxWidth: '100%',
   fontSize: '13px',
   lineHeight: 1.4,
  },
 },

 loginForm: {
  gridColumn: 2,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  '@media (max-width: 900px)': {
   gridColumn: 1,
  },
 },

 formSurface: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid var(--border)',
  borderRadius: '22px',
  padding: '18px 18px 12px 18px',
  backgroundColor: 'var(--bg-secondary)',
  '@media (max-width: 900px)': {
   border: 'none',
   borderRadius: 0,
   padding: 0,
   backgroundColor: 'transparent',
  },
 },

 formTop: {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
 },

 progressIndicatorWrapper: {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  '@media (max-width: 900px)': {
   justifyContent: 'center',
  },
 },

 progressIndicator: {
  display: 'flex',
  gap: '8px',
 },

 progressDot: {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--border)',
  transition: 'all 0.25s ease',
  '@media (max-width: 900px)': {
   width: '10px',
   height: '10px',
  },
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
  overflow: 'hidden',
  minHeight: '140px',
  '@media (max-width: 900px)': {
   minHeight: 0,
  },
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
  animationDuration: '0.25s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 slidingOutRight: {
  animationName: slideOutRight,
  animationDuration: '0.25s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 comingFromLeft: {
  animationName: slideInFromLeft,
  animationDuration: '0.25s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 comingFromRight: {
  animationName: slideInFromRight,
  animationDuration: '0.25s',
  animationTimingFunction: EASE,
  animationFillMode: 'forwards',
 },

 stepContent: {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
 },

 inputGroup: {
  marginBottom: 0,
 },

 inputGroupInput: {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  ':focus': {
   outline: 'none',
   borderColor: 'var(--border-focus)',
   boxShadow: '0 0 0 2px var(--focus-ring)',
  },
  '::placeholder': {
   color: 'var(--text-secondary)',
  },
  '@media (max-width: 900px)': {
   padding: '12px 14px',
   fontSize: '16px',
   borderRadius: '8px',
  },
 },

 passwordToggle: {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontSize: '14px',
 },

 inlineError: {
  fontSize: '12px',
  color: 'var(--error-text, #c53030)',
  marginTop: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
 },

 stepRow: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
 },

 linkButton: {
  alignSelf: 'flex-start',
  background: 'transparent',
  border: 'none',
  padding: 0,
  color: 'var(--border-focus)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  ':hover': {
   textDecoration: 'underline',
   color: 'var(--link-hover)',
  },
 },

 emailChip: {
  width: 'fit-content',
  maxWidth: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: '999px',
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  ':hover': {
   borderColor: 'var(--border-focus)',
  },
  '@media (max-width: 900px)': {
   borderRadius: '12px',
   width: '100%',
   justifyContent: 'space-between',
  },
 },

 emailChipText: {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '340px',
  '@media (max-width: 900px)': {
   maxWidth: '100%',
  },
 },

 divider: {
  position: 'relative',
  textAlign: 'center',
  marginTop: '2px',
  marginBottom: '2px',
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
  '@media (max-width: 900px)': {
   backgroundColor: 'transparent',
  },
 },

 oauthBtn: {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.2s ease',
  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
  ':hover:not(:disabled)': {
   borderColor: 'var(--border-focus)',
  },
  '@media (max-width: 900px)': {
   borderRadius: '10px',
   fontSize: '14px',
  },
 },

 formActions: {
  marginTop: 'auto',
  paddingTop: '14px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  '@media (max-width: 900px)': {
   marginTop: '16px',
   paddingTop: 0,
   position: 'static',
   backgroundColor: 'transparent',
   borderTop: 'none',
   flexDirection: 'row',
   alignItems: 'center',
  },
 },

 secondaryAction: {
  color: 'var(--border-focus)',
  ':visited': {
   color: 'var(--border-focus)',
  },
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  ':hover': {
   textDecoration: 'underline',
   color: 'var(--link-hover)',
  },
  '@media (max-width: 900px)': {
   fontSize: '13px',
   fontWeight: 700,
   border: 'none',
   padding: 0,
   justifyContent: 'flex-start',
  },
 },

 secondaryButton: {
  padding: '12px 14px',
  fontSize: '13px',
  fontWeight: 700,
  background: 'transparent',
  color: 'var(--border-focus)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover:not(:disabled)': {
   background: 'var(--back-hover-bg)',
   borderColor: 'var(--border-focus)',
  },
  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
  '@media (max-width: 900px)': {
   padding: '11px 18px',
   borderRadius: '10px',
  },
 },

 primaryButton: {
  padding: '12px 16px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  ':hover:not(:disabled)': {
   background: 'var(--button-primary-hover)',
  },
  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
  '@media (max-width: 900px)': {
   padding: '12px 22px',
   borderRadius: '10px',
   fontSize: '14px',
  },
 },

 floatingMenu: {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 30px',
  backgroundColor: 'transparent',
  '@media (max-width: 900px)': {
   position: 'relative',
   flexDirection: 'column',
   gap: '12px',
   padding: '16px 0 0 0',
   marginTop: '12px',
   borderTop: '1px solid var(--border)',
   backgroundColor: 'transparent',
  },
 },

 floatingMenuLinks: {
  display: 'flex',
  gap: '24px',
  alignItems: 'center',
  '@media (max-width: 900px)': {
   gap: '16px',
   flexWrap: 'wrap',
   justifyContent: 'center',
  },
 },

 floatingMenuItem: {
  textDecoration: 'none',
  color: 'var(--footer-link)',
  ':visited': {
   color: 'var(--footer-link)',
  },
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 1,
  ':hover': {
   color: 'var(--footer-link-hover)',
   textDecoration: 'underline',
  },
  '@media (max-width: 900px)': {
   fontSize: '12px',
  },
 },

 languageDropdownWrapper: {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
 },

 languageMenuButton: {
  gap: '4px',
  userSelect: 'none',
 },

 copyrightText: {
  color: 'var(--footer-link)',
  fontSize: '13px',
  fontWeight: 500,
  opacity: 0.85,
  '@media (max-width: 900px)': {
   fontSize: '12px',
   textAlign: 'center',
  },
 },
});
