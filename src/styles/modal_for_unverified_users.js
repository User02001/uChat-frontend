import * as stylex from "@stylexjs/stylex";

const fadeInOverlay = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideInModal = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(-30px) scale(0.95)" },
 to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const ModalForUnverifiedUsersStyles = stylex.create({
 verificationModalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
  opacity: 0,
  animationName: fadeInOverlay,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",

  ":global([data-theme='dark']) &": {
   backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
 },

 verificationModalContent: {
  backgroundColor: "var(--bg-primary)",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "#f59e0b",
  borderRadius: 16,
  maxWidth: 520,
  width: "90%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 25px 80px var(--shadow)",
  position: "relative",
  animationName: slideInModal,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",

  "@media (max-width: 480px)": {
   maxWidth: "95%",
  },
 },

 modalHeader: {
  display: "flex",
  alignItems: "center",
  paddingTop: 24,
  paddingRight: 24,
  paddingBottom: 16,
  paddingLeft: 24,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",

  "@media (max-width: 480px)": {
   paddingTop: 20,
   paddingRight: 20,
   paddingBottom: 12,
   paddingLeft: 20,
  },
 },

 modalHeaderTitle: {
  margin: 0,
  color: "#f59e0b",
  fontSize: "1.5rem",
  fontWeight: 700,

  "@media (max-width: 480px)": {
   fontSize: "1.3rem",
  },
 },

 modalBody: {
  padding: 24,

  "@media (max-width: 480px)": {
   padding: 20,
  },
 },

 mainMessage: {
  color: "var(--chat-username)",
  fontSize: 16,
  lineHeight: 1.6,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 20,
  marginLeft: 0,

  "@media (max-width: 480px)": {
   fontSize: 15,
  },
 },

 mainMessageStrong: {
  color: "#f59e0b",
  fontWeight: 700,
 },

 benefitsBox: {
  backgroundColor: "var(--bg-tertiary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  paddingTop: 16,
  paddingRight: 20,
  paddingBottom: 16,
  paddingLeft: 20,
  marginTop: 20,
  marginRight: 0,
  marginBottom: 20,
  marginLeft: 0,

  "@media (max-width: 480px)": {
   paddingTop: 14,
   paddingRight: 16,
   paddingBottom: 14,
   paddingLeft: 16,
  },
 },

 benefitsTitle: {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 12,
  marginLeft: 0,
  color: "var(--text-primary)",
  fontSize: 15,
  fontWeight: 600,
 },

 benefitsList: {
  margin: 0,
  padding: 0,
  listStyle: "none",
 },

 benefitsItem: {
  color: "var(--chat-username)",
  fontSize: 14,
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  columnGap: 10,
 },

 benefitsItemLast: {
  marginBottom: 0,
 },

 benefitsItemIcon: {
  color: "#10b981",
  fontSize: 16,
 },

 warningText: {
  fontSize: 13,
  color: "var(--text-secondary)",
  marginTop: 20,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  fontStyle: "italic",
  display: "flex",
  alignItems: "center",
 },

 modalActions: {
  display: "flex",
  columnGap: 12,
  paddingTop: 20,
  paddingRight: 24,
  paddingBottom: 20,
  paddingLeft: 24,
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",

  "@media (max-width: 480px)": {
   flexDirection: "column",
   paddingTop: 16,
   paddingRight: 20,
   paddingBottom: 16,
   paddingLeft: 20,
  },
 },

 modalClose: {
  flex: 1,
  paddingTop: 14,
  paddingRight: 28,
  paddingBottom: 14,
  paddingLeft: 28,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",

  ":hover": {
   backgroundColor: "var(--border)",
   transform: "scale(1.03)",
  },

  "@media (max-width: 480px)": {
   width: "100%",
  },
 },

 modalVerify: {
  flex: 1,
  paddingTop: 14,
  paddingRight: 28,
  paddingBottom: 14,
  paddingLeft: 28,
  borderWidth: 0,
  borderStyle: "solid",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f59e0b",
  color: "#ffffff",

  ":hover": {
   backgroundColor: "#d97706",
   transform: "scale(1.03)",
  },

  "@media (max-width: 480px)": {
   width: "100%",
  },
 },
});
