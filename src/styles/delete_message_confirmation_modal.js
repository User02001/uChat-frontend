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

export const DeleteMessageConfirmationModalStyles = stylex.create({
 overlay: {
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

  // [data-theme="dark"] .delete-modal-overlay
  ':global([data-theme="dark"]) &': {
   backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
 },

 content: {
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
  color: "#ff4757",
  fontSize: "1.5rem",
 },

 paragraph: {
  marginTop: 0,
  marginRight: 20,
  marginBottom: 10,
  marginLeft: 20,
  color: "var(--chat-username)",
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.6,
 },

 warning: {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 0,
  marginRight: 20,
  marginBottom: 24,
  marginLeft: 20,
  fontStyle: "italic",
  fontSize: '14px',
 },

 actions: {
  display: "flex",
  columnGap: 12,
  padding: 20,
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",
 },

 // Shared base for both buttons
 buttonBase: {
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
 },

 cancel: {
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",

  ":hover": {
   backgroundColor: "var(--border)",
   transform: "scale(1.03)",
  },
 },

 delete: {
  backgroundColor: "#ef4444",
  color: "white",

  ":hover": {
   backgroundColor: "#dc2626",
   transform: "scale(1.03)",
  },
 },

 previewBox: {
  backgroundColor: "var(--bg-tertiary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 8,
  marginTop: 10,
  marginRight: 20,
  marginBottom: 16,
  marginLeft: 20,
  paddingTop: 10,
  paddingRight: 14,
  paddingBottom: 10,
  paddingLeft: 14,
  color: "var(--text-primary)",
 },

 previewLabel: {
  fontSize: 13,
  color: "var(--text-muted)",
  marginBottom: 4,
 },

 previewContent: {
  fontSize: 14,
  color: "var(--chat-username)",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
 },

 // For the <i> icons that previously used inline style
 iconTrashAlt: {
  marginRight: 8,
  color: "#ff4757",
 },

 iconInline: {
  marginRight: 6,
 },
});
