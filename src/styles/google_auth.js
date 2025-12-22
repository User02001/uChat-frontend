import * as stylex from "@stylexjs/stylex";

/* =========================================================
   CSS VARS + GLOBAL/COMPLEX SELECTORS (INJECTED ONCE)
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

/* Theme variables */
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
  --success: #4caf50;
  --link-hover: #f57c00;
  --focus-ring: rgba(255, 152, 0, 0.1);
  --back-hover-bg: rgba(255, 152, 0, 0.1);
  --star-bg: #000;
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
  --success: #4caf50;
  --link-hover: #f57c00;
  --focus-ring: rgba(255, 152, 0, 0.1);
  --back-hover-bg: rgba(255, 152, 0, 0.1);
  --star-bg: #000;
}

/* Autofill styling */
.inputGroup input:-webkit-autofill,
.inputGroup input:-webkit-autofill:hover,
.inputGroup input:-webkit-autofill:focus,
.inputGroup input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--bg-secondary) inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
  caret-color: var(--text-primary);
  transition: background-color 5000s ease-in-out 0s;
}

/* Firefox autofill */
.inputGroup input:-moz-autofill,
.inputGroup input:-moz-autofill-preview {
  filter: none;
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}
`;

if (typeof document !== "undefined") {
 if (!document.getElementById("google-auth-stylex-injected")) {
  const styleTag = document.createElement("style");
  styleTag.id = "google-auth-stylex-injected";
  styleTag.textContent = injectedCss;
  document.head.appendChild(styleTag);
 }
}

/* =========================================================
   KEYFRAMES
========================================================= */

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const slideInFromRight = stylex.keyframes({
 from: { transform: "translateX(100%)", opacity: 0 },
 to: { transform: "translateX(0)", opacity: 1 },
});

const slideInFromLeft = stylex.keyframes({
 from: { transform: "translateX(-100%)", opacity: 0 },
 to: { transform: "translateX(0)", opacity: 1 },
});

const slideOutLeft = stylex.keyframes({
 from: { transform: "translateX(0)", opacity: 1 },
 to: { transform: "translateX(-100%)", opacity: 0 },
});

const slideOutRight = stylex.keyframes({
 from: { transform: "translateX(0)", opacity: 1 },
 to: { transform: "translateX(100%)", opacity: 0 },
});

export const GoogleAuthStyles = stylex.create({
 loginContainer: {
  minHeight: "100vh",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  width: "100%",
 },

 starCanvas: {
  position: "fixed",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  zIndex: 0,
  pointerEvents: "none",
  background: "var(--star-bg)",
 },

 loginCard: {
  backgroundColor: "var(--signup-card)",
  borderRadius: "50px",
  border: "3px solid var(--border)",
  width: "100%",
  maxWidth: "900px",
  padding: "35px 50px",
  position: "relative",
  zIndex: 2,
  display: "grid",
  gridTemplateColumns: "380px 1fr",
  columnGap: "50px",
  rowGap: "15px",
  alignItems: "start",
  margin: "0 auto",

  "@media (max-width: 900px)": {
   maxWidth: "400px",
   padding: "30px",
   gridTemplateColumns: "1fr",
   gap: "24px",
   background: "var(--signup-card)",
  },
 },

 loginHeader: {
  gridColumn: 1,
  textAlign: "left",
  paddingRight: "30px",
  borderRight: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",

  "@media (max-width: 900px)": {
   textAlign: "center",
   borderRight: "none",
   borderBottom: "1px solid var(--border)",
   paddingRight: 0,
   paddingBottom: "20px",
  },
 },

 logoContainer: {
  display: "flex",
  justifyContent: "flex-start",
  marginBottom: "12px",

  "@media (max-width: 900px)": {
   justifyContent: "center",
  },
 },

 mainLogo: {
  width: "60px",
  height: "60px",
  objectFit: "contain",
 },

 headerTitle: {
  color: "var(--text-primary)",
  fontSize: "28px",
  fontWeight: 400,
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",

  "@media (max-width: 900px)": {
   fontSize: "24px",
   justifyContent: "center",
   textAlign: "center",
  },
 },

 stepExplanation: {
  marginTop: "16px",
 },

 stepExplanationP: {
  fontSize: "15px",
  lineHeight: 1.5,
  color: "var(--text-secondary)",
  margin: 0,
 },

 loginForm: {
  gridColumn: 2,
  "@media (max-width: 900px)": {
   gridColumn: 1,
  },
 },

 progressIndicator: {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  marginBottom: "16px",
 },

 progressDot: {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "var(--border)",
  transition: "all 0.3s ease",
 },

 progressDotActive: {
  background: "var(--border-focus)",
  transform: "scale(1.2)",
 },

 progressDotCompleted: {
  background: "var(--success)",
 },

 stepsWrapper: {
  position: "relative",
  minHeight: "150px",
  overflow: "hidden",
  marginBottom: "-5px",
 },

 stepContainer: {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  opacity: 0,
  pointerEvents: "none",
 },

 stepContainerActive: {
  opacity: 1,
  pointerEvents: "all",
  position: "relative",
 },

 slidingOutLeft: {
  animationName: slideOutLeft,
  animationDuration: "0.3s",
  animationTimingFunction: EASE,
  animationFillMode: "forwards",
 },

 slidingOutRight: {
  animationName: slideOutRight,
  animationDuration: "0.3s",
  animationTimingFunction: EASE,
  animationFillMode: "forwards",
 },

 comingFromLeft: {
  animationName: slideInFromLeft,
  animationDuration: "0.3s",
  animationTimingFunction: EASE,
  animationFillMode: "forwards",
 },

 comingFromRight: {
  animationName: slideInFromRight,
  animationDuration: "0.3s",
  animationTimingFunction: EASE,
  animationFillMode: "forwards",
 },

 stepHeader: {
  marginBottom: "8px",
 },

 stepHeaderH2: {
  fontSize: "16px",
  fontWeight: 400,
  color: "var(--text-primary)",
  marginBottom: "2px",
 },

 stepHeaderP: {
  fontSize: "12px",
  color: "var(--text-secondary)",
 },

 inputGroup: {
  marginBottom: 0,
 },

 inputGroupInput: {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  fontSize: "14px",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",

  ":focus": {
   outline: "none",
   borderColor: "var(--border-focus)",
   boxShadow: "0 0 0 2px var(--focus-ring)",
  },

  "::placeholder": {
   color: "var(--text-secondary)",
  },
 },

 buttonContainer: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginTop: "6px",
 },

 backBtn: {
  padding: "5.5px 18px",
  fontSize: "13px",
  fontWeight: 500,
  background: "transparent",
  color: "var(--border-focus)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  lineHeight: 1,

  ":hover:not(:disabled)": {
   background: "var(--back-hover-bg)",
   borderColor: "var(--border-focus)",
  },

  ":disabled": {
   opacity: 0.5,
   cursor: "not-allowed",
  },
 },

 backBtnImg: {
  width: "20px",
  height: "20px",
  display: "block",
 },

 loginBtn: {
  padding: "8px 18px",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",

  ":disabled": {
   opacity: 0.6,
   cursor: "not-allowed",
  },
 },

 loginBtnPrimary: {
  background: "var(--button-primary)",
  color: "var(--button-primary-text)",
  fontWeight: 600,

  ":hover:not(:disabled)": {
   background: "var(--button-primary-hover)",
  },
 },

 loginFooter: {
  gridColumn: "1 / -1",
  textAlign: "center",
  borderTop: "1px solid var(--border)",
  paddingTop: "10px",
  marginTop: "10px",

  "@media (max-width: 900px)": {
   gridColumn: 1,
   marginTop: "-6px",
  },
 },

 footerP: {
  color: "var(--text-secondary)",
  fontSize: "13px",
  margin: 0,
  marginTop: "22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "@media (max-width: 900px)": {
   fontSize: "12px",
   marginTop: "18px",
  },
 },

 /* Step-specific spacing */
 step0_inputGroup: { marginBottom: "15px" },
 step1_inputGroup: { marginBottom: "15px" },

 step0_stepHeader: { marginBottom: "20px" },
 step1_stepHeader: { marginBottom: "20px" },

 step0_progress: { marginBottom: "34px" },
 step1_progress: { marginBottom: "52px" },
});