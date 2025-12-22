import * as stylex from "@stylexjs/stylex";

const reactionPopupIn = stylex.keyframes({
 "0%": { opacity: 0, transform: "translateX(-50%) translateY(10px)" },
 "100%": { opacity: 1, transform: "translateX(-50%) translateY(0)" },
});

export const ReactionBadgeStyles = stylex.create({
 reactionPopup: {
  position: "absolute",
  bottom: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 12,
  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.18)",
  padding: 8,
  display: "flex",
  columnGap: 6,
  zIndex: 20,
  marginBottom: 8,
  opacity: 0,
  animationName: reactionPopupIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease",
  animationFillMode: "forwards",

  ":global([data-theme='dark']) &": {
   backgroundColor: "var(--bg-tertiary)",
   boxShadow: "0 10px 28px rgba(0, 0, 0, 0.38)",
  },

  "@media (max-width: 768px)": {
   bottom: "120%",
   marginBottom: 4,
  },
 },

 reactionPopupFlipHorizontal: {
  left: "auto",
  right: 0,
  transform: "none",
 },

 reactionPopupFlipVertical: {
  bottom: "auto",
  top: "100%",
  marginBottom: 0,
  marginTop: 8,
 },

 reactionOption: {
  width: 40,
  height: 40,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  borderRadius: 12,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  transitionProperty: "transform, background-color",
  transitionDuration: "0.18s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   transform: "scale(1.14)",
  },

  ":active": {
   transform: "scale(1.0)",
  },

  "@media (max-width: 768px)": {
   width: 36,
   height: 36,
   fontSize: 16,
   borderRadius: 10,
  },
 },

 optionLike: { color: "#3b82f6" },
 optionLove: { color: "#ef4444" },
 optionHappy: { color: "#f59e0b" },
 optionSad: { color: "#6b7280" },
 optionAngry: { color: "#dc2626" },
 optionDislike: { color: "#7c3aed" },
 optionSkull: {
  color: "#374151",
  ":global([data-theme='dark']) &": { color: "#9ca3af" },
 },

 messageReactionBtn: {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "rgba(255, 255, 255, 0.08)",
  backgroundColor: "rgba(20, 20, 20, 0.85)",
  color: "var(--text-secondary)",
  borderRadius: 10,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.22)",
  opacity: 0,
  transitionProperty: "transform, opacity, background-color, color, border-color",
  transitionDuration: "0.18s",
  transitionTimingFunction: "ease",
  zIndex: 5,

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
   transform: "translateY(-50%) scale(1.08)",
   borderColor: "var(--border)",
  },

  ":active": {
   transform: "translateY(-50%) scale(0.94)",
  },

  ":global(.message.sent) &": { left: -84 },
  ":global(.message.received) &": { right: -84 },
  ":global(.message:hover) &": { opacity: 1 },

  ":global([data-theme='dark']) &": {
   backgroundColor: "rgba(255, 255, 255, 0.08)",
   boxShadow: "0 2px 10px rgba(0, 0, 0, 0.38)",
   borderColor: "rgba(255, 255, 255, 0.12)",
  },

  "@media (max-width: 768px)": {
   width: 28,
   height: 28,
   fontSize: 12,
   borderRadius: 9,

   ":global(.message.sent) &": { left: -70 },
   ":global(.message.received) &": { right: -70 },
  },
 },

 messageReactions: {
  display: "inline-flex",
  alignItems: "center",
  columnGap: 6,
  marginTop: 6,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  padding: 0,
  backgroundColor: "transparent",
  borderWidth: 0,
  borderStyle: "solid",
  borderRadius: 0,
  boxShadow: "none",
  position: "relative",
  zIndex: 10,

  "@media (max-width: 768px)": {
   columnGap: 4,
   marginTop: 6,
  },
 },

 reactionDisplay: {
  display: "inline-flex",
  alignItems: "center",
  columnGap: 6,
  paddingTop: 4,
  paddingRight: 10,
  paddingBottom: 4,
  paddingLeft: 10,
  backgroundColor: "var(--bg-tertiary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.12)",
  borderRadius: 8,
  fontSize: 12,
  cursor: "pointer",
  minHeight: 24,
  transitionProperty: "transform, background-color, border-color",
  transitionDuration: "0.14s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--bg-secondary)",
   transform: "translateY(-1px)",
   borderColor: "rgba(0, 0, 0, 0.18)",
  },

  ":global([data-theme='dark']) &": {
   borderColor: "rgba(255, 255, 255, 0.14)",
  },

  "@media (max-width: 768px)": {
   paddingTop: 4,
   paddingRight: 10,
   paddingBottom: 4,
   paddingLeft: 10,
   borderRadius: 8,
   borderWidth: 1,
  },
 },

 reactionDisplayUserReacted: {
  backgroundColor: "rgba(245, 158, 11, 0.18)",
  borderColor: "rgba(245, 158, 11, 0.55)",

  ":hover": {
   backgroundColor: "rgba(245, 158, 11, 0.24)",
   borderColor: "rgba(245, 158, 11, 0.65)",
  },

  ":global([data-theme='dark']) &": {
   backgroundColor: "rgba(245, 158, 11, 0.22)",
   borderColor: "rgba(245, 158, 11, 0.7)",
  },
 },

 reactionIcon: {
  fontSize: 14,
  lineHeight: 1,
 },

 iconLike: { color: "#3b82f6" },
 iconLove: { color: "#ef4444" },
 iconHappy: { color: "#f59e0b" },
 iconSad: { color: "#6b7280" },
 iconAngry: { color: "#dc2626" },
 iconDislike: { color: "#7c3aed" },
 iconSkull: {
  color: "#374151",
  ":global([data-theme='dark']) &": { color: "#9ca3af" },
 },

 reactionCount: {
  fontWeight: 600,
  fontSize: 11,
  minWidth: 10,
  textAlign: "center",
  color: "var(--text-primary)",
 },

 reactionPopupOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 15,
  backgroundColor: "transparent",
 },
});
