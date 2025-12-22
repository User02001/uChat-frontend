import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideUp = stylex.keyframes({
 from: { transform: "translateY(30px)", opacity: 0 },
 to: { transform: "translateY(0)", opacity: 1 },
});

const pulse = stylex.keyframes({
 "0%, 100%": { transform: "scale(1)" },
 "50%": { transform: "scale(1.05)" },
});

const spin = stylex.keyframes({
 to: { transform: "rotate(360deg)" },
});

export const ModerationCustomWarningForMessageModalStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  animationName: fadeIn,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",
 },

 modal: {
  backgroundColor: "var(--background-secondary, #1e1e1e)",
  borderRadius: 16,
  width: "90%",
  maxWidth: 550,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  animationName: slideUp,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "#ff6b35",

  ":global(@media (prefers-color-scheme: light))": {
   backgroundColor: "#ffffff",
   borderColor: "#ff6b35",
  },
 },

 header: {
  backgroundImage: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
  padding: 24,
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  textAlign: "center",
  position: "relative",
 },

 iconContainer: {
  width: 64,
  height: 64,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 0,
  marginRight: "auto",
  marginBottom: 16,
  marginLeft: "auto",
  animationName: pulse,
  animationDuration: "2s",
  animationIterationCount: "infinite",
 },

 icon: {
  fontSize: 32,
  color: "#ffffff",
 },

 title: {
  color: "#ffffff",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  fontSize: 24,
  fontWeight: 700,
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
 },

 content: {
  paddingTop: 32,
  paddingRight: 24,
  paddingBottom: 32,
  paddingLeft: 24,
 },

 warningBox: {
  backgroundColor: "rgba(255, 107, 53, 0.1)",
  borderLeftWidth: 4,
  borderLeftStyle: "solid",
  borderLeftColor: "#ff6b35",
  padding: 20,
  borderRadius: 8,
  marginBottom: 24,
 },

 warningText: {
  color: "var(--text-primary, #ffffff)",
  fontSize: 16,
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",

  ":global(@media (prefers-color-scheme: light))": {
   color: "#1e1e1e",
  },
 },

 metadata: {
  display: "flex",
  flexDirection: "column",
  rowGap: 12,
  marginBottom: 24,
 },

 metaItem: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  color: "var(--text-secondary, #aaaaaa)",
  fontSize: 14,
  margin: 0,

  ":global(@media (prefers-color-scheme: light))": {
   color: "#666666",
  },
 },

 metaIcon: {
  width: 20,
  textAlign: "center",
  color: "#ff6b35",
 },

 infoBox: {
  backgroundColor: "rgba(255, 193, 7, 0.1)",
  borderLeftWidth: 4,
  borderLeftStyle: "solid",
  borderLeftColor: "#ffc107",
  padding: 16,
  borderRadius: 8,
  marginBottom: 24,
 },

 infoText: {
  color: "var(--text-primary, #ffffff)",
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,

  ":global(@media (prefers-color-scheme: light))": {
   color: "#1e1e1e",
  },
 },

 infoStrong: {
  color: "#ffc107",
 },

 progressIndicator: {
  marginTop: 24,
 },

 progressLabel: {
  color: "var(--text-secondary, #aaaaaa)",
  fontSize: 13,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 8,
  marginLeft: 0,
  textAlign: "center",

  ":global(@media (prefers-color-scheme: light))": {
   color: "#666666",
  },
 },

 progressBar: {
  height: 6,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: 3,
  overflow: "hidden",
 },

 progressFill: {
  height: "100%",
  backgroundImage: "linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)",
  borderRadius: 3,
  transitionProperty: "width",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
 },

 footer: {
  paddingTop: 0,
  paddingRight: 24,
  paddingBottom: 24,
  paddingLeft: 24,
 },

 acknowledgeBtn: {
  width: "100%",
  padding: 16,
  backgroundImage: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
  color: "#ffffff",
  borderWidth: 0,
  borderStyle: "solid",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",

  ":hover": {
   transform: "translateY(-2px)",
   boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
  },

  ":active": {
   transform: "translateY(0)",
  },
 },

 loadingSpinner: {
  width: 48,
  height: 48,
  borderWidth: 4,
  borderStyle: "solid",
  borderColor: "rgba(255, 107, 53, 0.2)",
  borderTopColor: "#ff6b35",
  borderRadius: "50%",
  animationName: spin,
  animationDuration: "0.8s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  marginTop: 40,
  marginRight: "auto",
  marginBottom: 40,
  marginLeft: "auto",
 },
});
