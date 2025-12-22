import * as stylex from "@stylexjs/stylex";

export const VideoPlayerStyles = stylex.create({
 videoPlayerContainer: {
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
 },

 videoPlayerInChat: {
  maxWidth: 400,
  maxHeight: 400,
  borderRadius: 12,

  "@media (max-width: 768px)": {
   maxWidth: 300,
   maxHeight: 300,
  },

  "@media (max-width: 480px)": {
   maxWidth: 250,
   maxHeight: 250,
  },
 },

 videoPlayerVideo: {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
 },

 videoPlayerPlayOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  zIndex: 2,
  cursor: "pointer",
 },

 videoPlayerPlayButton: {
  width: 70,
  height: 70,
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000",
  fontSize: 28,
  paddingLeft: 4,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
  transitionProperty: "all",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",

  ":hover": {
   transform: "scale(1.1)",
   backgroundColor: "#fff",
   boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
  },

  "@media (max-width: 768px)": {
   width: 60,
   height: 60,
   fontSize: 24,
  },

  "@media (max-width: 480px)": {
   width: 50,
   height: 50,
   fontSize: 20,
  },
 },

 videoPlayerControls: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundImage: "linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%)",
  paddingTop: 40,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  zIndex: 3,
  opacity: 0,
  transitionProperty: "opacity",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
  pointerEvents: "none",

  "@media (max-width: 768px)": {
   paddingTop: 30,
   paddingRight: 12,
   paddingBottom: 12,
   paddingLeft: 12,
  },
 },

 videoPlayerControlsVisible: {
  opacity: 1,
  pointerEvents: "all",
 },

 videoPlayerProgressBar: {
  "--vp-progress-height": "6px",
  "--vp-thumb-opacity": 0,
  width: "100%",
  height: "var(--vp-progress-height)",
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderRadius: 3,
  cursor: "pointer",
  marginBottom: 12,
  position: "relative",
  overflow: "visible",
  touchAction: "none",
  userSelect: "none",
  transitionProperty: "height",
  transitionDuration: "0.12s",
  transitionTimingFunction: "ease",

  ":hover": {
   "--vp-progress-height": "8px",
   "--vp-thumb-opacity": 1,
  },

  ":active": {
   "--vp-progress-height": "8px",
   "--vp-thumb-opacity": 1,
  },
 },

 videoPlayerProgress: {
  height: "100%",
  backgroundColor: "var(--button-primary)",
  borderRadius: 3,
  position: "relative",
  willChange: "width",
  pointerEvents: "none",
 },

 videoPlayerProgressThumb: {
  position: "absolute",
  right: -6,
  top: "50%",
  transform: "translateY(-50%)",
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#fff",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  opacity: "var(--vp-thumb-opacity)",
  transitionProperty: "opacity",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  pointerEvents: "none",
 },

 videoPlayerControlsBottom: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: 12,
 },

 videoPlayerControlsLeft: {
  display: "flex",
  alignItems: "center",
  columnGap: 8,
  flex: 1,
 },

 videoPlayerControlsRight: {
  display: "flex",
  alignItems: "center",
  columnGap: 8,
 },

 videoPlayerBtn: {
  width: 36,
  height: 36,
  borderRadius: "50%",
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  flexShrink: 0,

  ":hover": {
   backgroundColor: "var(--button-primary)",
   transform: "scale(1.1)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  "@media (max-width: 768px)": {
   width: 32,
   height: 32,
   fontSize: 13,
  },
 },

 videoPlayerVolumeControl: {
  "--vp-vol-width": "0px",
  "--vp-vol-opacity": 0,
  display: "flex",
  alignItems: "center",
  columnGap: 8,

  ":hover": {
   "--vp-vol-width": "80px",
   "--vp-vol-opacity": 1,
  },

  "@media (max-width: 768px)": {
   ":hover": {
    "--vp-vol-width": "60px",
    "--vp-vol-opacity": 1,
   },
  },
 },

 videoPlayerVolumeSlider: {
  width: "var(--vp-vol-width)",
  opacity: "var(--vp-vol-opacity)",
  transitionProperty: "all",
  transitionDuration: "0.3s",
  transitionTimingFunction: "ease",
  WebkitAppearance: "none",
  appearance: "none",
  height: 4,
  borderRadius: 2,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  outline: "none",
  cursor: "pointer",

  "@media (max-width: 480px)": {
   display: "none",
  },

  "::-webkit-slider-thumb": {
   WebkitAppearance: "none",
   appearance: "none",
   width: 12,
   height: 12,
   borderRadius: "50%",
   backgroundColor: "var(--button-primary)",
   cursor: "pointer",
  },

  "::-moz-range-thumb": {
   width: 12,
   height: 12,
   borderRadius: "50%",
   backgroundColor: "var(--button-primary)",
   cursor: "pointer",
   borderWidth: 0,
   borderStyle: "solid",
  },
 },

 videoPlayerTime: {
  fontSize: 13,
  color: "#fff",
  fontWeight: 500,
  whiteSpace: "nowrap",
  userSelect: "none",

  "@media (max-width: 768px)": {
   fontSize: 12,
  },
 },
});
