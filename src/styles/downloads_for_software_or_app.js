import * as stylex from "@stylexjs/stylex";

const gentlePulse = stylex.keyframes({
 "0%, 100%": {
  opacity: 0.4,
  transform: "translate(-50%, -50%) scale(1)",
 },
 "50%": {
  opacity: 0.7,
  transform: "translate(-50%, -50%) scale(1.03)",
 },
});

const spin = stylex.keyframes({
 "0%": { transform: "rotate(0deg)" },
 "100%": { transform: "rotate(360deg)" },
});

export const DownloadsForSoftwareOrAppStyles = stylex.create({
 downloadsContainer: {
  "--bg-primary": "#000000",
  "--bg-secondary": "#111111",
  "--text-primary": "#ffffff",
  "--text-secondary": "#adb5bd",
  "--border": "#333333",
  "--accent": "#ff8c42",
  "--accent-hover": "#ff7f00",
  "--shadow": "rgba(0, 0, 0, 0.4)",
  "--shadow-hover": "rgba(0, 0, 0, 0.6)",

  minHeight: "100vh",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)",
  position: "relative",
  transitionProperty: "all",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  lineHeight: 1.5,
 },

 auraBackground: {
  position: "fixed",
  top: "12%",
  left: "50%",
  width: 600,
  height: 600,
  transform: "translate(-50%, -50%)",
  backgroundImage:
   "radial-gradient(circle, rgba(255, 140, 66, 0.08) 0%, rgba(255, 127, 0, 0.04) 40%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(40px)",
  animationName: gentlePulse,
  animationDuration: "8s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  pointerEvents: "none",
  zIndex: 0,
 },

 downloadsContent: {
  position: "relative",
  zIndex: 1,
  maxWidth: 650,
  marginLeft: "auto",
  marginRight: "auto",
  paddingTop: 40,
  paddingRight: 20,
  paddingBottom: 40,
  paddingLeft: 20,

  "@media (max-width: 768px)": {
   paddingTop: 30,
   paddingRight: 16,
   paddingBottom: 30,
   paddingLeft: 16,
  },
 },

 downloadsHeader: {
  textAlign: "center",
  marginBottom: 35,
 },

 logoSection: {
  marginBottom: 16,
 },

 appLogo: {
  width: 80,
  height: 80,
  opacity: 0.9,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  cursor: "pointer",

  ":hover": {
   opacity: 1,
   transform: "scale(1.05)",
  },

  "@media (max-width: 768px)": {
   width: 70,
   height: 70,
  },
 },

 headerTitle: {
  fontSize: "2.2rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 8,
  marginLeft: 0,
  letterSpacing: "-0.02em",

  "@media (max-width: 768px)": {
   fontSize: "1.9rem",
  },
 },

 headerSubtitle: {
  fontSize: "1rem",
  color: "var(--text-secondary)",
  fontWeight: 400,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
 },

 mainDownload: {
  marginBottom: 40,
 },

 versionTag: {
  display: "inline-block",
  backgroundColor: "var(--accent)",
  color: "#ffffff",
  paddingTop: 4,
  paddingRight: 12,
  paddingBottom: 4,
  paddingLeft: 12,
  borderRadius: 16,
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: 16,
  letterSpacing: "0.025em",
 },

 downloadCard: {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 3px 15px var(--shadow)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: 20,
  transitionProperty: "all",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",

  ":hover": {
   boxShadow: "0 6px 25px var(--shadow-hover)",
   transform: "translateY(-1px)",
   borderColor: "#444444",
  },

  "@media (max-width: 768px)": {
   flexDirection: "column",
   textAlign: "center",
   rowGap: 16,
   padding: 20,
  },
 },

 platformInfo: {
  display: "flex",
  alignItems: "center",
  columnGap: 14,

  "@media (max-width: 768px)": {
   justifyContent: "center",
  },
 },

 platformIcon: {
  width: 44,
  height: 44,
  backgroundColor: "var(--accent)",
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  flexShrink: 0,
 },

 platformDetails: {},

 platformTitle: {
  fontSize: "1.2rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 3,
  marginLeft: 0,
 },

 platformText: {
  color: "var(--text-secondary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 4,
  marginLeft: 0,
  fontSize: "0.85rem",
 },

 fileSize: {
  fontSize: "0.75rem",
  color: "var(--text-secondary)",
  backgroundColor: "var(--bg-primary)",
  paddingTop: 2,
  paddingRight: 6,
  paddingBottom: 2,
  paddingLeft: 6,
  borderRadius: 6,
  display: "inline-block",
 },

 downloadButton: {
  backgroundColor: "var(--accent)",
  color: "#ffffff",
  borderWidth: 0,
  borderStyle: "solid",
  paddingTop: 12,
  paddingRight: 24,
  paddingBottom: 12,
  paddingLeft: 24,
  borderRadius: 10,
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  columnGap: 6,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  flexShrink: 0,

  ":hover": {
   backgroundColor: "var(--accent-hover)",
   transform: "translateY(-1px)",
   boxShadow: "0 3px 12px rgba(255, 140, 66, 0.3)",
  },

  ":active": {
   transform: "translateY(0)",
  },
 },

 changelogSection: {
  marginBottom: 30,
 },

 changelogTitle: {
  fontSize: "1.6rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 24,
  marginLeft: 0,
  textAlign: "center",
 },

 changelogCard: {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: 10,
  padding: 22,
  marginBottom: 18,
  boxShadow: "0 2px 8px var(--shadow)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   boxShadow: "0 3px 15px var(--shadow-hover)",
   borderColor: "#444444",
  },

  "@media (max-width: 768px)": {
   padding: 18,
  },
 },

 changelogHeader: {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: 16,
  flexWrap: "wrap",
  rowGap: 10,
  columnGap: 10,

  "@media (max-width: 768px)": {
   flexDirection: "column",
   alignItems: "flex-start",
  },
 },

 versionInfo: {},

 versionInfoTitle: {
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 3,
  marginLeft: 0,
 },

 versionInfoTime: {
  color: "var(--text-secondary)",
  fontSize: "0.85rem",
 },

 latestBadge: {
  backgroundColor: "var(--accent)",
  color: "#ffffff",
  paddingTop: 3,
  paddingRight: 8,
  paddingBottom: 3,
  paddingLeft: 8,
  borderRadius: 10,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
 },

 changelogContent: {},

 changelogList: {
  listStyle: "none",
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
 },

 changelogItem: {
  color: "var(--text-secondary)",
  marginBottom: 6,
  paddingLeft: 16,
  position: "relative",
  lineHeight: 1.4,
  fontSize: "0.9rem",

  "::before": {
   content: '"•"',
   color: "var(--accent)",
   fontWeight: "bold",
   position: "absolute",
   left: 0,
   top: 0,
  },
 },

 downloadOlder: {
  backgroundColor: "transparent",
  color: "var(--accent)",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "var(--accent)",
  paddingTop: 8,
  paddingRight: 16,
  paddingBottom: 8,
  paddingLeft: 16,
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  marginTop: 12,

  ":hover": {
   backgroundColor: "var(--accent)",
   color: "#ffffff",
  },
 },

 loadingState: {
  textAlign: "center",
  paddingTop: 60,
  paddingRight: 20,
  paddingBottom: 60,
  paddingLeft: 20,
 },

 loadingSpinner: {
  width: 28,
  height: 28,
  borderWidth: 3,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderTopWidth: 3,
  borderTopStyle: "solid",
  borderTopColor: "var(--accent)",
  borderRadius: "50%",
  animationName: spin,
  animationDuration: "1s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  marginTop: 0,
  marginRight: "auto",
  marginBottom: 16,
  marginLeft: "auto",
 },

 loadingText: {
  color: "var(--text-secondary)",
  fontSize: "0.95rem",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
 },
});
