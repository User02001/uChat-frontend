import * as stylex from "@stylexjs/stylex";

const fadeInOverlay = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideInModal = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(-30px) scale(0.95)" },
 to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

const onlineIndicator = stylex.keyframes({
 "0%": { transform: "scale(1)", opacity: 1 },
 "50%": { transform: "scale(1.08)", opacity: 0.85 },
 "100%": { transform: "scale(1)", opacity: 1 },
});

export const QuickProfileModalStyles = stylex.create({
 overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
  opacity: 0,
  animationName: fadeInOverlay,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
 },

 overlayDark: {
  backgroundColor: "rgba(0, 0, 0, 0.6)",
 },

 content: {
  backgroundColor: "var(--bg-primary)",
  borderRadius: 12,
  maxWidth: 480,
  width: "90%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 25px 80px var(--shadow)",
  position: "relative",
  animationName: slideInModal,
  animationDuration: "0.3s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",

  "@media (max-width: 768px)": {
   width: "95%",
   maxWidth: 420,
  },
 },

 contentDark: {
  backgroundImage:
   "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)",
  backgroundBlendMode: "normal",
 },

 closeButton: {
  position: "absolute",
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  color: "var(--text-secondary)",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  zIndex: 10,

  ":hover": {
   backgroundColor: "var(--bg-tertiary)",
   color: "var(--text-primary)",
   transform: "scale(1.1)",
  },

  ":active": {
   transform: "scale(0.9)",
  },
 },

 header: {
  paddingTop: 40,
  paddingRight: 32,
  paddingBottom: 24,
  paddingLeft: 32,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border)",
  textAlign: "center",

  "@media (max-width: 768px)": {
   paddingTop: 32,
   paddingRight: 24,
   paddingBottom: 20,
   paddingLeft: 24,
  },
 },

 avatarContainer: {
  position: "relative",
  marginBottom: 16,
 },

 avatar: {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  borderWidth: 4,
  borderStyle: "solid",
  borderColor: "var(--border)",
  boxShadow: "0 8px 24px var(--shadow)",

  "@media (max-width: 768px)": {
   width: 100,
   height: 100,
  },
 },

 statusDotBase: {
  width: 28,
  height: 28,
  position: "absolute",
  bottom: 4,
  right: -2,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  borderWidth: 4,
  borderStyle: "solid",
  borderColor: "var(--bg-primary)",
  borderRadius: "50%",
 },

 statusDotOnline: {
  backgroundColor: "#4caf50",
  backgroundImage: "none",
  animationName: onlineIndicator,
  animationDuration: "2s",
  animationTimingFunction: "ease",
  animationIterationCount: "infinite",
 },

 statusDotOffline: {
  backgroundColor: "#9e9e9e",
  backgroundImage: "none",
 },

 statusDotAway: {
  backgroundColor: "transparent",
  backgroundImage: "url('/src/assets/icons/away_icon.svg')",
  backgroundSize: "contain",
  borderWidth: 0,
  borderRadius: 0,
 },

 statusDotAwayLight: {
  backgroundImage: "url('/src/assets/icons/away_icon.svg')",
 },

 username: {
  fontSize: 24,
  fontWeight: 700,
  color: "var(--chat-username)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 16,
  marginLeft: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  columnGap: 8,

  "@media (max-width: 768px)": {
   fontSize: 22,
  },
 },

 unverifiedIcon: {
  width: 22,
  height: 22,
 },

 actionsRow: {
  display: "flex",
  columnGap: 12,
  marginTop: 8,
 },

 actionButton: {
  width: 48,
  height: 48,
  borderRadius: "50%",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--button-primary)",
   color: "white",
   transform: "scale(1.08)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  "@media (max-width: 768px)": {
   width: 44,
   height: 44,
  },
 },

 body: {
  paddingTop: 24,
  paddingRight: 32,
  paddingBottom: 32,
  paddingLeft: 32,

  "@media (max-width: 768px)": {
   paddingTop: 20,
   paddingRight: 24,
   paddingBottom: 24,
   paddingLeft: 24,
  },
 },

 section: {
  marginBottom: 24,
 },

 sectionLast: {
  marginBottom: 0,
 },

 sectionTitle: {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 12,
  marginLeft: 0,
 },

 statusItem: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  padding: 16,
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
 },

 statusIndicatorBase: {
  width: 16,
  height: 16,
  borderRadius: "50%",
  flexShrink: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
 },

 statusIndicatorOnline: {
  backgroundColor: "#4caf50",
  backgroundImage: "none",
 },

 statusIndicatorOffline: {
  backgroundColor: "#9e9e9e",
  backgroundImage: "none",
 },

 statusIndicatorAway: {
  backgroundColor: "transparent",
  backgroundImage: "url('/src/assets/icons/away_icon.svg')",
  backgroundSize: "contain",
  borderRadius: 0,
 },

 statusIndicatorAwayLight: {
  backgroundImage: "url('/src/assets/icons/away_icon.svg')",
 },

 statusInfo: {
  display: "flex",
  flexDirection: "column",
  rowGap: 2,
 },

 statusLabel: {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--chat-username)",
 },

 lastSeen: {
  fontSize: 13,
  color: "var(--text-secondary)",
 },

 infoItem: {
  display: "flex",
  alignItems: "center",
  columnGap: 14,
  paddingTop: 14,
  paddingBottom: 14,
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  borderBottomColor: "var(--border-light)",
 },

 infoItemFirst: {
  paddingTop: 0,
 },

 infoItemLast: {
  borderBottomWidth: 0,
  paddingBottom: 0,
 },

 infoIcon: {
  color: "var(--text-secondary)",
  width: 18,
  height: 18,
  flexShrink: 0,
 },

 infoIconImg: {
  width: 18,
  height: 18,
  flexShrink: 0,
 },

 infoContent: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  rowGap: 4,
 },

 infoLabel: {
  fontSize: 12,
  color: "var(--text-secondary)",
  fontWeight: 500,
 },

 infoValue: {
  fontSize: 15,
  color: "var(--chat-username)",
  fontWeight: 500,
 },

 verifiedValue: {
  color: "#10b981",
 },

 unverifiedValue: {
  color: "#f59e0b",
 },

 lastMessageBox: {
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: "break-word",
  overflowWrap: "break-word",
 },

 messageSender: {
  fontWeight: 600,
  color: "var(--text-primary)",
 },

 messageContent: {
  color: "var(--text-secondary)",
  wordBreak: "break-word",
  overflowWrap: "break-word",
 },

 quickMessageRow: {
  display: "flex",
  columnGap: 8,
  alignItems: "center",
 },

 messageInput: {
  flex: 1,
  paddingTop: 12,
  paddingRight: 16,
  paddingBottom: 12,
  paddingLeft: 16,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 24,
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":focus": {
   borderColor: "var(--border-focus)",
  },

  "::placeholder": {
   color: "var(--text-secondary)",
  },
 },

 sendButton: {
  width: 44,
  height: 44,
  borderRadius: "50%",
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "var(--button-primary)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  flexShrink: 0,

  ":hover": {
   backgroundColor: "var(--button-primary-hover)",
   transform: "scale(1.08)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  ":disabled": {
   opacity: 0.5,
   cursor: "not-allowed",
  },
 },

 currentUserNotice: {
  display: "flex",
  alignItems: "center",
  columnGap: 10,
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  marginTop: 8,
 },

 currentUserNoticeText: {
  fontSize: 14,
  color: "var(--text-secondary)",
  fontStyle: "italic",
 },
});