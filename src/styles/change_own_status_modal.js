import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideUp = stylex.keyframes({
 from: { transform: "translateY(20px)", opacity: 0 },
 to: { transform: "translateY(0)", opacity: 1 },
});

export const ChangeOwnStatusModalStyles = stylex.create({
 modalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  animationName: fadeIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease",
 },

 modal: {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: 12,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
  animationName: slideUp,
  animationDuration: "0.3s",
  animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",

  "@media (max-width: 768px)": {
   maxWidth: 340,
  },
 },

 modalHeader: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: 20,
  paddingRight: 24,
  paddingBottom: 20,
  paddingLeft: 24,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",

  "@media (max-width: 768px)": {
   paddingTop: 16,
   paddingRight: 20,
   paddingBottom: 16,
   paddingLeft: 20,
  },
 },

 modalHeaderTitle: {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: "var(--text-primary)",

  "@media (max-width: 768px)": {
   fontSize: 16,
  },
 },

 closeBtn: {
  width: 32,
  height: 32,
  borderRadius: "50%",
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  color: "var(--text-secondary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
  },
 },

 statusList: {
  padding: 12,
 },

 statusItem: {
  display: "flex",
  alignItems: "center",
  columnGap: 16,
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
  borderRadius: 8,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  width: "100%",
  textAlign: "left",
  marginBottom: 6,

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
  },

  "@media (max-width: 768px)": {
   paddingTop: 12,
   paddingRight: 14,
   paddingBottom: 12,
   paddingLeft: 14,
  },
 },

 statusItemActive: {
  backgroundColor: "var(--bg-tertiary)",
 },

 statusIcon: {
  fontSize: 20,
  width: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
 },

 statusInfo: {
  flex: 1,
  minWidth: 0,
 },

 statusLabel: {
  fontSize: 15,
  fontWeight: 500,
  color: "var(--text-primary)",
  marginBottom: 2,

  "@media (max-width: 768px)": {
   fontSize: 14,
  },
 },

 statusDescription: {
  fontSize: 13,
  color: "var(--text-secondary)",

  "@media (max-width: 768px)": {
   fontSize: 12,
  },
 },

 checkIcon: {
  color: "var(--button-primary)",
  marginLeft: "auto",
 },

 statusFaIcon: {
  fontSize: 20,
 },

 statusFaOutlineIcon: {
  fontSize: 20,
  opacity: 0.5,
 },

 statusAwayIcon: {
  width: 24,
  height: 24,
 },
});
