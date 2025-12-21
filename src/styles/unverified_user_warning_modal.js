import * as stylex from "@stylexjs/stylex";

const fadeInOverlay = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideInModal = stylex.keyframes({
 from: {
  opacity: 0,
  transform: "translateY(-30px) scale(0.9)",
 },
 to: {
  opacity: 1,
  transform: "translateY(0) scale(1)",
 },
});

export const UnverifiedUserWarningModalStyles = stylex.create({
 unverifiedModalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,

  opacity: 0,
  animationName: fadeInOverlay,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",

  // Equivalent of: [data-theme="dark"] .unverifiedModalOverlay { ... }
  ':global([data-theme="dark"]) &': {
   backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
 },

 unverifiedModalContent: {
  backgroundColor: "var(--bg-primary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 12,

  maxWidth: 500,
  width: "90%",
  maxHeight: "80vh",
  overflowY: "auto",

  boxShadow: "0 25px 80px var(--shadow)",
  position: "relative",

  animationName: slideInModal,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
 },

 title: {
  marginTop: 20,
  marginRight: 20,
  marginBottom: 16,
  marginLeft: 20,
  color: "#ef4444",
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  columnGap: 10,
 },

 paragraph: {
  marginTop: 0,
  marginRight: 20,
  marginBottom: 10,
  marginLeft: 20,
  color: "var(--text-primary)",
  fontSize: 15,
  lineHeight: 1.6,
 },

 unverifiedWarningBox: {
  backgroundColor: "var(--warning-bg)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--warning-border)",
  borderRadius: 8,
  marginTop: 16,
  marginRight: 20,
  marginBottom: 16,
  marginLeft: 20,
  padding: 16,
 },

 warningBoxTitle: {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 12,
  marginLeft: 0,
  color: "var(--warning-text)",
  fontWeight: 600,
 },

 warningList: {
  margin: 0,
  paddingLeft: 20,
  color: "var(--text-secondary)",
  fontSize: 14,
 },

 warningListItem: {
  marginTop: 6,
  marginBottom: 6,
  lineHeight: 1.5,
 },

 unverifiedInfo: {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 0,
  marginRight: 20,
  marginBottom: 24,
  marginLeft: 20,
  fontStyle: "italic",
  fontSize: '16px',
 },

 modalActions: {
  display: "flex",
  columnGap: 12,
  padding: 20,
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",
 },

 modalClose: {
  flex: 1,
  paddingTop: 12,
  paddingRight: 28,
  paddingBottom: 12,
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
  backgroundColor: "var(--button-primary)",
  color: "white",

  ":hover": {
   backgroundColor: "var(--button-primary-hover)",
   transform: "scale(1.03)",
  },

  ":active": {
   transform: "scale(0.98)",
  },
 },

 unverifiedIcon: {
  width: 35,
  height: 35,
  flexShrink: 0,
 },
});
