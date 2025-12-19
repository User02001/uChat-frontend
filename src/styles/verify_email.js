import * as stylex from '@stylexjs/stylex';

// Define theme variables
const styles = `
:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --signup-card: #ffffff;
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
  --success-bg: #d4edda;
  --success-text: #155724;
  --success-border: #c3e6cb;
}

[data-theme="dark"] {
  --bg-primary: linear-gradient(135deg, #000000 0%, #000000 100%);
  --bg-secondary: #000000;
  --signup-card: #1212128c;
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
  --success-bg: #1a3d1a;
  --success-text: #9ae6b4;
  --success-border: #2d5a2d;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
 const styleTag = document.createElement('style');
 styleTag.textContent = styles;
 document.head.appendChild(styleTag);
}

export const verifyStyles = stylex.create({
 container: {
  minHeight: '100vh',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
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
  background: '#000',
 },

 card: {
  backgroundColor: 'var(--signup-card)',
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
  },
 },

 header: {
  gridColumn: '1',
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

 title: {
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
  },
 },

 explanation: {
  marginTop: '16px',
 },

 explanationText: {
  fontSize: '15px',
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  margin: 0,
 },

 form: {
  gridColumn: '2',
  '@media (max-width: 900px)': {
   gridColumn: '1',
  },
 },

 stepHeader: {
  marginBottom: '10px',
  marginTop: '10px',
 },

 stepHeaderTitle: {
  fontSize: '16px',
  fontWeight: 400,
  color: 'var(--text-primary)',
  marginBottom: '2px',
 },

 stepHeaderSubtitle: {
  fontSize: '12px',
  color: 'var(--text-secondary)',
 },

 inputGroup: {
  marginBottom: '15px',
 },

 input: {
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
   boxShadow: '0 0 0 2px rgba(255, 152, 0, 0.1)',
  },
  '::placeholder': {
   color: 'var(--text-secondary)',
  },
 },

 buttonContainer: {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '10px',
  marginTop: '6px',
  marginBottom: '13px',
 },

 primaryBtn: {
  padding: '8px 18px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  width: '100%',
  ':hover:not(:disabled)': {
   background: 'var(--button-primary-hover)',
  },
  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
 },

 skipBtn: {
  width: '100%',
  padding: '9px 14px',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  marginTop: '6px',
  ':hover:not(:disabled)': {
   borderColor: 'var(--border-focus)',
  },
 },

 divider: {
  position: 'relative',
  textAlign: 'center',
  margin: '16px 0',
 },

 dividerLine: {
  content: '""',
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: 'var(--border)',
 },

 dividerText: {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  padding: '0 10px',
  position: 'relative',
 },

 resendBtn: {
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
  ':hover:not(:disabled)': {
   borderColor: 'var(--border-focus)',
  },
  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
  },
 },

 alert: {
  padding: '12px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
 },

 alertError: {
  backgroundColor: 'var(--error-bg)',
  color: 'var(--error-text)',
  border: '1px solid var(--error-border)',
 },

 alertSuccess: {
  backgroundColor: 'var(--success-bg)',
  color: 'var(--success-text)',
  border: '1px solid var(--success-border)',
 },

 footer: {
  gridColumn: '1 / -1',
  textAlign: 'center',
  borderTop: '1px solid var(--border)',
  paddingTop: '10px',
  marginTop: '10px',
  '@media (max-width: 900px)': {
   gridColumn: '1',
   marginTop: '-6px',
  },
 },

 footerText: {
  color: 'var(--text-secondary)',
  fontSize: '13px',
  margin: 0,
  marginTop: '22px',
  '@media (max-width: 900px)': {
   fontSize: '15px',
  },
 },

 footerLink: {
  color: 'var(--border-focus)',
  textDecoration: 'none',
  ':hover': {
   textDecoration: 'underline',
   color: '#f57c00',
  },
 },
});