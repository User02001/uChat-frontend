import * as stylex from "@stylexjs/stylex";

const fadeInViewer = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const pulseAudio = stylex.keyframes({
 "0%, 100%": {
  transform: "scale(1)",
  boxShadow: "0 10px 40px rgba(255, 152, 0, 0.3)",
 },
 "50%": {
  transform: "scale(1.05)",
  boxShadow: "0 15px 50px rgba(255, 152, 0, 0.5)",
 },
});

export const MediaViewerStyles = stylex.create({
 mediaViewerOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.98)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animationName: fadeInViewer,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",
 },

 mediaViewerContainer: {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
 },

 mediaViewerHeader: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: 20,
  paddingRight: 24,
  paddingBottom: 20,
  paddingLeft: 24,
  backgroundImage:
   "linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%)",
  columnGap: 16,
  zIndex: 100,
  opacity: 0,
  transform: "translateY(-20px)",
  transitionProperty: "all",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
  pointerEvents: "none",

  "@media (max-width: 768px)": {
   paddingTop: 16,
   paddingRight: 16,
   paddingBottom: 16,
   paddingLeft: 16,
  },

  "@media (max-width: 480px)": {
   paddingTop: 12,
   paddingRight: 12,
   paddingBottom: 12,
   paddingLeft: 12,
  },
 },

 mediaViewerHeaderVisible: {
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "all",
 },

 mediaViewerTitle: {
  fontSize: 16,
  fontWeight: 600,
  color: "white",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1,
  textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",

  "@media (max-width: 768px)": {
   fontSize: 14,
  },

  "@media (max-width: 480px)": {
   fontSize: 13,
  },
 },

 mediaViewerActions: {
  display: "flex",
  alignItems: "center",
  columnGap: 8,

  "@media (max-width: 768px)": {
   columnGap: 6,
  },
 },

 mediaViewerBtn: {
  width: 40,
  height: 40,
  borderRadius: 8,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--button-primary)",
   color: "white",
   transform: "scale(1.05)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  ":disabled": {
   opacity: 0.4,
   cursor: "not-allowed",
  },

  "@media (max-width: 768px)": {
   width: 36,
   height: 36,
   fontSize: 14,
  },

  "@media (max-width: 480px)": {
   width: 32,
   height: 32,
   fontSize: 13,
  },
 },

 mediaViewerBtnClose: {
  width: 40,
  height: 40,
  borderRadius: 8,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "rgba(255, 71, 87, 0.9)",
  backdropFilter: "blur(10px)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "#ff4757",
   transform: "scale(1.05)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  "@media (max-width: 768px)": {
   width: 36,
   height: 36,
   fontSize: 14,
  },

  "@media (max-width: 480px)": {
   width: 32,
   height: 32,
   fontSize: 13,
  },
 },

 mediaViewerContent: {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
  userSelect: "none",
  width: "100%",
  height: "100%",
 },

 mediaViewerImageWrapper: {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
 },

 mediaViewerImage: {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  transitionProperty: "transform",
  transitionDuration: "0.2s",
  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  transformOrigin: "center center",
  userSelect: "none",
  pointerEvents: "none",
 },

 mediaViewerZoomIndicator: {
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(10px)",
  color: "white",
  paddingTop: 8,
  paddingRight: 16,
  paddingBottom: 8,
  paddingLeft: 16,
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 600,
  pointerEvents: "none",
  zIndex: 10,

  "@media (max-width: 768px)": {
   bottom: 16,
   right: 16,
   paddingTop: 6,
   paddingRight: 12,
   paddingBottom: 6,
   paddingLeft: 12,
   fontSize: 12,
  },
 },

 mediaViewerVideoWrapper: {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
 },

 mediaViewerAudioWrapper: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  rowGap: 24,
  padding: 40,
  maxWidth: 600,
  width: "100%",

  "@media (max-width: 768px)": {
   padding: 20,
   rowGap: 20,
  },
 },

 mediaViewerAudioIcon: {
  width: 120,
  height: 120,
  borderRadius: "50%",
  backgroundImage:
   "linear-gradient(135deg, var(--button-primary), var(--button-primary-hover))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 48,
  color: "white",
  boxShadow: "0 10px 40px rgba(255, 152, 0, 0.3)",
  animationName: pulseAudio,
  animationDuration: "2s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",

  "@media (max-width: 768px)": {
   width: 100,
   height: 100,
   fontSize: 40,
  },

  "@media (max-width: 480px)": {
   width: 80,
   height: 80,
   fontSize: 32,
  },
 },

 mediaViewerAudioInfo: {
  textAlign: "center",
 },

 mediaViewerAudioInfoTitle: {
  fontSize: 20,
  fontWeight: 600,
  color: "white",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 8,
  marginLeft: 0,

  "@media (max-width: 768px)": {
   fontSize: 18,
  },

  "@media (max-width: 480px)": {
   fontSize: 16,
  },
 },

 mediaViewerAudioInfoSubtitle: {
  fontSize: 14,
  color: "rgba(255, 255, 255, 0.7)",
  margin: 0,

  "@media (max-width: 768px)": {
   fontSize: 13,
  },
 },

 mediaViewerAudio: {
  width: "100%",
  maxWidth: 500,
  height: 54,
  borderRadius: 27,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  outline: "none",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",

  "::-webkit-media-controls-panel": {
   backgroundColor: "rgba(255, 255, 255, 0.1)",
   backdropFilter: "blur(10px)",
   borderRadius: 27,
  },

  "::-webkit-media-controls-play-button": {
   backgroundColor: "var(--button-primary)",
   borderRadius: "50%",
  },

  "::-webkit-media-controls-pause-button": {
   backgroundColor: "var(--button-primary)",
   borderRadius: "50%",
  },

  "@media (max-width: 768px)": {
   height: 48,
   borderRadius: 24,
  },
 },
});
