import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});
const fadeOut = stylex.keyframes({
 from: { opacity: 1 },
 to: { opacity: 0 },
});
const slideUp = stylex.keyframes({
 from: { transform: "translateY(100%)" },
 to: { transform: "translateY(0)" },
});
const slideDown = stylex.keyframes({
 from: { transform: "translateY(0)" },
 to: { transform: "translateY(100%)" },
});

export const MessageActionsSheetStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 9998,
  pointerEvents: "auto",
  opacity: 0,
  animationName: fadeIn,
  animationDuration: "0.15s",
  animationTimingFunction: "ease",
  animationFillMode: "forwards",
 },

 overlayClosing: {
  animationName: fadeOut,
  animationDuration: "0.2s",
  animationTimingFunction: "ease",
  animationFillMode: "forwards",
 },

 bottomSheet: {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "var(--bg-secondary)",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  paddingTop: 0,
  paddingRight: 16,
  paddingBottom: 32,
  paddingLeft: 16,
  zIndex: 9999,
  boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.15)",
  animationName: slideUp,
  animationDuration: "0.2s",
  animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  animationFillMode: "forwards",
  maxHeight: "60vh",
  overflowY: "auto",
  transitionProperty: "transform",
  transitionDuration: "0.2s",
  transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  pointerEvents: "auto",

  "@supports (padding-bottom: env(safe-area-inset-bottom))": {
   paddingBottom: "max(32px, env(safe-area-inset-bottom))",
  },
 },

 bottomSheetClosing: {
  animationName: slideDown,
  animationDuration: "0.2s",
  animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  animationFillMode: "forwards",
 },

 handleArea: {
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 0,
  paddingRight: 0,
  cursor: "grab",
  userSelect: "none",
  marginTop: 0,
  marginBottom: 0,
  marginLeft: -16,
  marginRight: -16,
  width: "calc(100% + 32px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  touchAction: "none",
  WebkitTouchCallout: "none",
  ":active": { cursor: "grabbing" },
 },

 handle: {
  width: 48,
  height: 5,
  backgroundColor: "var(--text-muted)",
  borderRadius: 3,
  opacity: 0.6,
 },

 // ── Reactions ──────────────────────────────────────────────────────────────

 reactionsSection: {
  // Scrollable single row — no wrapping, no squeezing
  display: "flex",
  alignItems: "center",
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "none",
  gap: 6,
  paddingTop: 4,
  paddingBottom: 16,
  paddingLeft: 2,
  paddingRight: 2,
  marginBottom: 12,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",
  // hide webkit scrollbar
  "::-webkit-scrollbar": { display: "none" },
 },

 reactionButton: {
  flexShrink: 0,
  width: 52,
  height: 52,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "transparent",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "50%",
  fontSize: 26,
  cursor: "pointer",
  transitionProperty: "transform, background-color, border-color",
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ":active": {
   transform: "scale(1.2)",
   backgroundColor: "var(--border)",
  },
 },

 reactionActive: {
  borderColor: "var(--button-primary)",
  backgroundColor: "rgba(255, 152, 0, 0.12)",
  transform: "scale(1.08)",
  ":active": { transform: "scale(1.2)" },
 },

 // The "+" more-reactions button — styled consistently with reactionButton
 // but uses an icon instead of an emoji
 moreReactionsBtn: {
  flexShrink: 0,
  width: 52,
  height: 52,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "var(--border)",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "50%",
  cursor: "pointer",
  transitionProperty: "transform, background-color",
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-secondary)",
  fontSize: 16,
  ":active": {
   transform: "scale(1.15)",
   backgroundColor: "var(--border)",
  },
 },

 // ── Actions ────────────────────────────────────────────────────────────────

 actionsSection: {
  display: "flex",
  flexDirection: "column",
  rowGap: 8,
 },

 actionButton: {
  display: "flex",
  alignItems: "center",
  columnGap: 16,
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 20,
  paddingRight: 20,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease",
  width: "100%",
  textAlign: "left",
  ":active": {
   transform: "scale(0.98)",
   backgroundColor: "var(--border)",
  },
 },

 actionIcon: {
  fontSize: 18,
  width: 24,
  textAlign: "center",
  color: "var(--text-secondary)",
  flexShrink: 0,
 },

 deleteAction: {
  color: "#ef4444",
  ":active": { backgroundColor: "rgba(239, 68, 68, 0.1)" },
 },

 deleteIcon: {
  color: "#ef4444",
 },

 reportAction: {},
});