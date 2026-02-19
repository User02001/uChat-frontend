import * as stylex from "@stylexjs/stylex";

const fadeInOverlay = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideInModal = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(-30px) scale(0.95)" },
 to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

export const NewDeviceModalStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999998,
  opacity: 0,
  animationName: fadeInOverlay,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
  ":global([data-theme='dark']) &": {
   backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
 },

 modal: {
  backgroundColor: "var(--bg-primary)",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "#667eea",
  borderRadius: 16,
  maxWidth: 520,
  width: "90%",
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

 header: {
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

 headerIcon: {
  marginRight: 10,
  fontSize: 28,
  color: "#667eea",
 },

 headerTitle: {
  margin: 0,
  color: "#667eea",
  fontSize: "1.5rem",
  fontWeight: 700,
  "@media (max-width: 480px)": {
   fontSize: "1.3rem",
  },
 },

 body: {
  paddingTop: 24,
  paddingRight: 24,
  paddingBottom: 4,
  paddingLeft: 24,
  "@media (max-width: 480px)": {
   paddingTop: 20,
   paddingRight: 20,
   paddingBottom: 4,
   paddingLeft: 20,
  },
 },

 description: {
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

 infoBox: {
  backgroundColor: "var(--bg-tertiary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  paddingTop: 14,
  paddingRight: 18,
  paddingBottom: 14,
  paddingLeft: 18,
  marginBottom: 20,
 },

 infoRow: {
  display: "flex",
  alignItems: "center",
  columnGap: 10,
  color: "var(--chat-username)",
  fontSize: 14,
  marginBottom: 8,
 },

 infoRowLast: {
  marginBottom: 0,
 },

 infoIcon: {
  color: "#667eea",
  fontSize: 15,
  flexShrink: 0,
 },

 infoLabel: {
  color: "var(--text-secondary)",
  marginRight: 4,
 },

 infoValue: {
  color: "var(--text-primary)",
  fontWeight: 600,
  wordBreak: "break-all",
 },

 warningText: {
  fontSize: 13,
  color: "var(--text-secondary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 20,
  marginLeft: 0,
  fontStyle: "italic",
  display: "flex",
  alignItems: "center",
  columnGap: 6,
 },

 actions: {
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
   rowGap: 10,
   paddingTop: 16,
   paddingRight: 20,
   paddingBottom: 16,
   paddingLeft: 20,
  },
 },

 btnBase: {
  flex: 1,
  paddingTop: 14,
  paddingRight: 28,
  paddingBottom: 14,
  paddingLeft: 28,
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  columnGap: 6,
  "@media (max-width: 480px)": {
   width: "100%",
  },
 },

 btnAcknowledge: {
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  ":hover": {
   backgroundColor: "var(--border)",
   transform: "scale(1.03)",
  },
 },

 btnRevoke: {
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  ":hover": {
   backgroundColor: "#b91c1c",
   transform: "scale(1.03)",
  },
 },
});