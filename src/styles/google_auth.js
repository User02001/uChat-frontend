import * as stylex from "@stylexjs/stylex";

const injectedCss = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%}
:root{
 --bg-primary:#f5f5f5;
 --bg-secondary:#ffffff;
 --signin-card:#ffffff;
 --text-primary:#1a1a1a;
 --text-secondary:#666666;
 --border:#e0e0e0;
 --border-focus:#ff9800;
 --button-primary:linear-gradient(135deg,#ffa726 0%,#ff9800 100%);
 --button-primary-hover:linear-gradient(135deg,#ff9800 0%,#f57c00 100%);
 --button-primary-text:#1a1a1a;
 --shadow:rgba(0,0,0,0.1);
 --error-bg:#fee;
 --error-text:#c53030;
 --error-border:#feb2b2;
 --success-bg:#f0f9ff;
 --success-text:#065f46;
 --success-border:#a7f3d0;
 --focus-ring:rgba(255,152,0,0.12);
 --star-bg:#000;
}
[data-theme="dark"]{
 --bg-primary:linear-gradient(135deg,#000000 0%,#000000 100%);
 --bg-secondary:#000000;
 --signin-card:#1212128c;
 --text-primary:#ffffff;
 --text-secondary:#cccccc;
 --border:#404040;
 --border-focus:#ff9800;
 --button-primary:linear-gradient(135deg,#ffa726 0%,#ff9800 100%);
 --button-primary-hover:linear-gradient(135deg,#ff9800 0%,#f57c00 100%);
 --button-primary-text:#1a1a1a;
 --shadow:rgba(0,0,0,0.3);
 --error-bg:#2d1b1b;
 --error-text:#fc8181;
 --error-border:#9b2c2c;
 --success-bg:rgba(6,95,70,0.12);
 --success-text:#8ff0c8;
 --success-border:rgba(167,243,208,0.35);
 --focus-ring:rgba(255,152,0,0.16);
 --star-bg:#000;
}
.inputGroup input:-webkit-autofill,
.inputGroup input:-webkit-autofill:hover,
.inputGroup input:-webkit-autofill:focus,
.inputGroup input:-webkit-autofill:active{
 -webkit-box-shadow:0 0 0 30px var(--bg-secondary) inset !important;
 -webkit-text-fill-color:var(--text-primary) !important;
 caret-color:var(--text-primary);
 transition:background-color 5000s ease-in-out 0s
}
`;

if (typeof document !== "undefined") {
 if (!document.getElementById("login-stylex-injected")) {
  const styleTag = document.createElement("style");
  styleTag.id = "login-stylex-injected";
  styleTag.textContent = injectedCss;
  document.head.appendChild(styleTag);
 }
}

export const GoogleAuthStyles = stylex.create({
 loginContainer: {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  position: "relative",
  background: "transparent",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif",
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
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "520px",
  borderRadius: "50px",
  backgroundColor: "var(--signin-card)",
  border: "3px solid var(--border)",
  boxShadow: "0 18px 56px var(--shadow)",
  padding: "35px 50px",
  backdropFilter: "blur(14px)",
  "@media (max-width: 520px)": {
   padding: "30px",
   borderRadius: "40px",
  },
 },

 loginHeader: {
  textAlign: "left",
  "@media (max-width: 520px)": {
   textAlign: "center",
  },
 },

 logoContainer: {
  display: "flex",
  justifyContent: "flex-start",
  marginBottom: "12px",
  "@media (max-width: 520px)": {
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
  lineHeight: 1.2,
  "@media (max-width: 520px)": {
   fontSize: "24px",
   justifyContent: "center",
  },
 },

 headerParagraph: {
  color: "var(--text-secondary)",
  fontSize: "15px",
  lineHeight: 1.5,
  marginTop: "16px",
  marginBottom: 0,
 },

 infoBox: {
  backgroundColor: "var(--success-bg)",
  color: "var(--success-text)",
  padding: "12px 12px",
  borderRadius: "10px",
  marginTop: "14px",
  fontSize: "13px",
  border: "1px solid var(--success-border)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
 },

 errorBox: {
  backgroundColor: "var(--error-bg)",
  color: "var(--error-text)",
  padding: "12px 12px",
  borderRadius: "10px",
  marginBottom: "14px",
  fontSize: "13px",
  border: "1px solid var(--error-border)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
 },

 loginForm: {
  marginTop: "18px",
 },

 inputGroup: {
  marginBottom: "14px",
 },

 inputLabel: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  color: "var(--text-primary)",
  marginBottom: "8px",
  fontWeight: 600,
 },

 inputWrapper: {
  position: "relative",
 },

 inputIcon: {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--text-secondary)",
  fontSize: "14px",
  opacity: 0.95,
  pointerEvents: "none",
 },

 inputGroupInput: {
  width: "100%",
  padding: "9px 12px 9px 40px",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  fontSize: "14px",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  ":focus": {
   outline: "none",
   borderColor: "var(--border-focus)",
   boxShadow: "0 0 0 2px var(--focus-ring)",
  },
  ":hover": {
   borderColor: "var(--border-focus)",
  },
  "::placeholder": {
   color: "var(--text-secondary)",
  },
 },

 helperText: {
  color: "var(--text-secondary)",
  fontSize: "12px",
  marginTop: "6px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
 },

 loginBtn: {
  width: "100%",
  padding: "8px 18px",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  ":disabled": {
   opacity: 0.6,
   cursor: "not-allowed",
  },
 },

 primary: {
  background: "var(--button-primary)",
  color: "var(--button-primary-text)",
  ":hover:not(:disabled)": {
   background: "var(--button-primary-hover)",
  },
 },

 loginFooter: {
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid var(--border)",
 },

 footerP: {
  color: "var(--text-secondary)",
  fontSize: "13px",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "8px",
 },
});