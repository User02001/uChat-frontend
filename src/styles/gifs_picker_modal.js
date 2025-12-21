import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideUp = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(40px)" },
 to: { opacity: 1, transform: "translateY(0)" },
});

const spin = stylex.keyframes({
 from: { transform: "rotate(0deg)" },
 to: { transform: "rotate(360deg)" },
});

export const GifsPickerModalStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  animationName: fadeIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease",
 },

 modal: {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: 16,
  width: "100%",
  maxWidth: 600,
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  animationName: slideUp,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "#f59e0b",

  "@media (max-width: 768px)": {
   maxWidth: "100%",
   maxHeight: "90vh",
   borderRadius: "16px 16px 0 0",
   marginTop: "auto",
  },
 },

 header: {
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

 headerTitle: {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: "var(--text-primary)",
 },

 closeButton: {
  width: 36,
  height: 36,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  color: "var(--text-secondary)",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
   transform: "scale(1.1)",
  },
 },

 searchForm: {
  display: "flex",
  columnGap: 8,
  paddingTop: 16,
  paddingRight: 24,
  paddingBottom: 16,
  paddingLeft: 24,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",

  "@media (max-width: 768px)": {
   paddingTop: 12,
   paddingRight: 20,
   paddingBottom: 12,
   paddingLeft: 20,
  },
 },

 searchInput: {
  flex: 1,
  paddingTop: 12,
  paddingRight: 16,
  paddingBottom: 12,
  paddingLeft: 16,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 24,
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--chat-username)",
  fontSize: 14,
  outline: "none",
  transitionProperty: "border-color",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
 },

 searchButton: {
  width: 44,
  height: 44,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "var(--button-primary)",
  color: "white",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--button-primary-hover)",
   transform: "scale(1.05)",
  },
 },

 gridContainer: {
  flex: 1,
  overflowY: "auto",
  paddingTop: 16,
  paddingRight: 24,
  paddingBottom: 16,
  paddingLeft: 24,

  "@media (max-width: 768px)": {
   paddingTop: 12,
   paddingRight: 20,
   paddingBottom: 12,
   paddingLeft: 20,
  },
 },

 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 12,

  "@media (max-width: 768px)": {
   gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
   gap: 8,
  },
 },

 gifItem: {
  aspectRatio: "1 / 1",
  borderRadius: 8,
  overflow: "hidden",
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  position: "relative",

  ":hover": {
   transform: "scale(1.05)",
   boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },
 },

 gifImg: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
 },

 loadingEmptyWrap: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 60,
  paddingRight: 24,
  paddingBottom: 60,
  paddingLeft: 24,
  color: "var(--text-secondary)",
 },

 spinner: {
  width: 40,
  height: 40,
  borderWidth: 3,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderTopWidth: 3,
  borderTopStyle: "solid",
  borderTopColor: "var(--button-primary)",
  borderRadius: "50%",
  animationName: spin,
  animationDuration: "1s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  marginBottom: 16,
 },

 footer: {
  paddingTop: 12,
  paddingRight: 24,
  paddingBottom: 12,
  paddingLeft: 24,
  borderTopWidth: 1,
  borderTopStyle: "solid",
  borderTopColor: "var(--border)",
  textAlign: "center",
  color: "var(--text-muted)",
  fontSize: 12,
 },
});
