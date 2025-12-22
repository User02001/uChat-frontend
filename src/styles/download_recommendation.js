import * as stylex from "@stylexjs/stylex";

const slideIn = stylex.keyframes({
 from: { transform: "translateX(100%)", opacity: 0 },
 to: { transform: "translateX(0)", opacity: 1 },
});

export const DownloadRecommendationNotificationStyles = stylex.create({
 notification: {
  position: "fixed",
  top: 20,
  right: 20,
  backgroundColor: "var(--bg-primary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  zIndex: 10000,
  minWidth: 320,
  maxWidth: 400,
  animationName: slideIn,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",

  "@media (max-width: 768px)": {
   top: 10,
   right: 10,
   left: 10,
   minWidth: "unset",
   maxWidth: "unset",
  },
 },

 content: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: 12,
  marginBottom: 12,
 },

 info: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  flex: 1,
 },

 iconWrap: {
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: "var(--accent-color)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: 18,
  flexShrink: 0,
 },

 text: {},

 title: {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 4,
  marginLeft: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-primary)",
 },

 subtitle: {
  margin: 0,
  fontSize: 12,
  color: "var(--text-secondary)",
  lineHeight: 1.3,
 },

 actions: {
  display: "flex",
  columnGap: 8,
 },

 btnSmallBase: {
  width: 32,
  height: 32,
  borderRadius: "50%",
  borderWidth: 0,
  borderStyle: "solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 14,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
 },

 dismissBtnSmall: {
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-secondary)",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
  },
 },

 downloadBtnSmall: {
  backgroundColor: "var(--accent-color)",
  color: "#ffffff",

  ":hover": {
   backgroundColor: "var(--accent-hover)",
   transform: "scale(1.05)",
  },
 },

 footer: {
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",
  paddingTop: 12,
  marginTop: 12,
 },

 alreadyHaveCheckbox: {
  "--cmBorderColor": "var(--border)",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: 12,
  color: "var(--text-secondary)",
  userSelect: "none",

  ":hover": {
   "--cmBorderColor": "var(--accent-color)",
  },
 },

 alreadyHaveInput: {
  display: "none",
 },

 checkmark: {
  "--cmAfterOpacity": 0,
  width: 16,
  height: 16,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "var(--cmBorderColor)",
  borderRadius: 3,
  marginRight: 8,
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  "::after": {
   content: '"✓"',
   color: "#ffffff",
   fontSize: 10,
   fontWeight: "bold",
   opacity: "var(--cmAfterOpacity)",
   transform: "translateY(-0.5px)",
  },

  ":global(input[type='checkbox']:checked + &)": {
   backgroundColor: "var(--accent-color)",
   borderColor: "var(--accent-color)",
   "--cmAfterOpacity": 1,
  },
 },
});
