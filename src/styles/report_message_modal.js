import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideUp = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(20px)" },
 to: { opacity: 1, transform: "translateY(0)" },
});

export const ReportMessageModalStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  animationName: fadeIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease",
 },

 modal: {
  backgroundColor: "var(--bg-primary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 16,
  maxWidth: 500,
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  animationName: slideUp,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",

  "@media (max-width: 768px)": {
   maxWidth: "95%",
   borderRadius: 12,
  },
 },

 header: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 24,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",

  "@media (max-width: 768px)": {
   padding: 20,
  },
 },

 headerTitle: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
 },

 headerTitleIcon: {
  fontSize: 24,
  color: "#fbbf24",
 },

 headerTitleText: {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "var(--text-primary)",

  "@media (max-width: 768px)": {
   fontSize: 18,
  },
 },

 closeBtn: {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderStyle: "solid",
  fontSize: 24,
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: 0,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  transitionProperty: "all",
  transitionDuration: "0.2s",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
  },
 },

 content: {
  padding: 24,

  "@media (max-width: 768px)": {
   padding: 20,
  },
 },

 description: {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 24,
  marginLeft: 0,
  fontSize: 14,
  color: "var(--text-secondary)",
  lineHeight: 1.5,
 },

 categoryLabel: {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: 12,
 },

 categories: {
  display: "flex",
  flexDirection: "column",
  rowGap: 8,
  marginBottom: 24,
 },

 categoryBtn: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  textAlign: "left",
  width: "100%",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   borderColor: "var(--text-secondary)",
  },

  "@media (max-width: 768px)": {
   paddingTop: 12,
   paddingRight: 14,
   paddingBottom: 12,
   paddingLeft: 14,
  },
 },

 categoryBtnSelected: {
  backgroundColor: "var(--bg-tertiary)",
  borderColor: "var(--button-primary)",
  boxShadow: "0 0 0 1px var(--button-primary)",
 },

 categoryIcon: {
  fontSize: 24,
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  "@media (max-width: 768px)": {
   fontSize: 20,
   width: 28,
   height: 28,
  },
 },

 categoryText: {
  fontSize: 15,
  fontWeight: 500,
  color: "var(--text-primary)",
  flex: 1,

  "@media (max-width: 768px)": {
   fontSize: 14,
  },
 },

 checkIcon: {
  marginLeft: "auto",
  color: "var(--button-primary)",
 },

 actions: {
  display: "flex",
  columnGap: 12,
  justifyContent: "flex-end",

  "@media (max-width: 768px)": {
   flexDirection: "column-reverse",
  },
 },

 cancelBtn: {
  paddingTop: 12,
  paddingRight: 24,
  paddingBottom: 12,
  paddingLeft: 24,
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transitionProperty: "all",
  transitionDuration: "0.2s",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
  },

  "@media (max-width: 768px)": {
   width: "100%",
  },
 },

 submitBtn: {
  paddingTop: 12,
  paddingRight: 24,
  paddingBottom: 12,
  paddingLeft: 24,
  backgroundColor: "var(--button-primary)",
  borderWidth: 0,
  borderStyle: "solid",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transitionProperty: "all",
  transitionDuration: "0.2s",

  ":hover": {
   backgroundColor: "var(--button-primary-hover)",
   transform: "translateY(-1px)",
  },

  ":active": {
   transform: "translateY(0)",
  },

  ":disabled": {
   opacity: 0.5,
   cursor: "not-allowed",
   transform: "none",
  },

  "@media (max-width: 768px)": {
   width: "100%",
  },
 },
});
