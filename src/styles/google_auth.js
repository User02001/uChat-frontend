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
 --focus-ring:rgba(255,152,0,0.12)
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
 --focus-ring:rgba(255,152,0,0.16)
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

const auraDrift = stylex.keyframes({
 "0%": { transform: "translate3d(0,0,0) scale(1)", opacity: 0.85 },
 "50%": { transform: "translate3d(-2%,1%,0) scale(1.05)", opacity: 1 },
 "100%": { transform: "translate3d(0,0,0) scale(1)", opacity: 0.85 },
});

const cardIn = stylex.keyframes({
 from: { transform: "translateY(10px) scale(0.99)", opacity: 0 },
 to: { transform: "translateY(0) scale(1)", opacity: 1 },
});

export const GoogleAuthStyles = stylex.create({
 loginContainer: {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  position: "relative",
  background: "var(--bg-primary)",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif",
 },

 auraBackground: {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
   "radial-gradient(60% 50% at 15% 20%, rgba(255,167,38,0.22) 0%, rgba(255,152,0,0) 60%), radial-gradient(55% 45% at 85% 30%, rgba(255,152,0,0.18) 0%, rgba(255,152,0,0) 62%), radial-gradient(70% 55% at 50% 85%, rgba(245,124,0,0.16) 0%, rgba(245,124,0,0) 65%)",
  filter: "blur(18px)",
  animationName: auraDrift,
  animationDuration: "10s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
 },

 loginCard: {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "520px",
  borderRadius: "26px",
  backgroundColor: "var(--signin-card)",
  border: "2px solid var(--border)",
  boxShadow: "0 18px 56px var(--shadow)",
  padding: "34px 34px 22px 34px",
  animationName: cardIn,
  animationDuration: "0.35s",
  animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  backdropFilter: "blur(14px)",
  "@media (max-width: 520px)": {
   padding: "26px 18px 18px 18px",
   borderRadius: "20px",
  },
 },

 loginHeader: {
  textAlign: "left",
 },

 logoContainer: {
  display: "flex",
  justifyContent: "center",
  marginBottom: "18px",
 },

 mainLogo: {
  width: "80px",
  height: "80px",
  objectFit: "contain",
 },

 headerTitle: {
  color: "var(--text-primary)",
  fontSize: "24px",
  fontWeight: 500,
  margin: 0,
  display: "flex",
  alignItems: "center",
  lineHeight: 1.2,
  "@media (max-width: 520px)": {
   fontSize: "22px",
  },
 },

 headerParagraph: {
  color: "var(--text-secondary)",
  fontSize: "14px",
  lineHeight: 1.55,
  marginTop: "10px",
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
  padding: "10px 12px 10px 40px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "14px",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
  ":focus": {
   outline: "none",
   borderColor: "var(--border-focus)",
   boxShadow: "0 0 0 3px var(--focus-ring)",
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
  padding: "11px 16px",
  border: "none",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  ":disabled": {
   opacity: 0.65,
   cursor: "not-allowed",
  },
  ":active:not(:disabled)": {
   transform: "scale(0.985)",
  },
 },

 primary: {
  background: "var(--button-primary)",
  color: "var(--button-primary-text)",
  boxShadow: "0 10px 26px rgba(255,152,0,0.18)",
  ":hover:not(:disabled)": {
   background: "var(--button-primary-hover)",
   boxShadow: "0 12px 30px rgba(255,152,0,0.24)",
   transform: "translateY(-1px)",
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
