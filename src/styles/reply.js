import * as stylex from "@stylexjs/stylex";

const replySlideIn = stylex.keyframes({
 to: { opacity: 1, transform: "translateY(0)" },
});

const smoothHighlight = stylex.keyframes({
 "50%": { opacity: 0.7 },
});

export const ReplyStyles = stylex.create({
 replyPreview: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  paddingTop: 12,
  paddingRight: 16,
  paddingBottom: 12,
  paddingLeft: 16,
  backgroundColor: "var(--bg-tertiary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: -1,
  marginLeft: 0,
  position: "relative",
  opacity: 0,
  transform: "translateY(10px)",
  animationName: replySlideIn,
  animationDuration: "0.3s",
  animationTimingFunction: "ease",
  animationFillMode: "forwards",

  "@media (max-width: 768px)": {
   paddingTop: 10,
   paddingRight: 12,
   paddingBottom: 10,
   paddingLeft: 12,
   columnGap: 10,
  },

  ":global([data-theme='dark']) &": {
   backgroundColor: "var(--bg-tertiary)",
   borderColor: "var(--border)",
  },
 },

 replyContent: {
  display: "flex",
  alignItems: "center",
  columnGap: 12,
  flex: 1,
  minWidth: 0,
 },

 replyIcon: {
  color: "var(--button-primary)",
  fontSize: 14,
  flexShrink: 0,
 },

 replyInfo: {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  rowGap: 4,

  "@media (max-width: 768px)": {
   rowGap: 2,
  },
 },

 replyHeader: {
  display: "flex",
  alignItems: "center",
  columnGap: 3,
  fontSize: 12,
  fontWeight: 500,

  "@media (max-width: 768px)": {
   fontSize: 11,
  },
 },

 replyText: {
  color: "var(--text-secondary)",
 },

 replySender: {
  color: "var(--button-primary)",
  fontWeight: 600,
 },

 replyMessage: {
  fontSize: 14,
  color: "var(--chat-username)",
  fontWeight: 400,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: 1.3,
  opacity: 0.8,

  "@media (max-width: 768px)": {
   fontSize: 13,
  },
 },

 replyCancel: {
  width: 28,
  height: 28,
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "transparent",
  color: "var(--text-secondary)",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  flexShrink: 0,
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",

  ":hover": {
   backgroundColor: "var(--border)",
   color: "var(--text-primary)",
   transform: "scale(1.1)",
  },

  ":active": {
   transform: "scale(0.9)",
  },

  "@media (max-width: 768px)": {
   width: 24,
   height: 24,
   fontSize: 11,
  },
 },

 replyInside: {
  paddingTop: 8,
  paddingRight: 12,
  paddingBottom: 6,
  paddingLeft: 12,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  marginBottom: 8,
  fontSize: 12,
  opacity: 1,
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: 8,
  marginTop: 6,
  marginRight: 6,
  marginBottom: 6,
  marginLeft: 6,
  cursor: "pointer",
  transitionProperty: "all",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease",
  maxWidth: 250,
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",

  ":global(.message.sent) &": {
   backgroundColor: "var(--bg-tertiary)",
   borderColor: "var(--border)",
  },

  ":global(.message.received) &": {
   backgroundColor: "var(--bg-tertiary)",
   borderColor: "var(--border)",
  },

  ":hover": {
   backgroundColor: "var(--bg-secondary)",
   transform: "translateY(-1px)",
   boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
  },

  ":global(.message.sent) &:hover": {
   backgroundColor: "var(--bg-secondary)",
  },

  ":global(.message.received) &:hover": {
   backgroundColor: "var(--bg-secondary)",
  },

  "@media (max-width: 768px)": {
   paddingTop: 8,
   paddingRight: 12,
   paddingBottom: 6,
   paddingLeft: 12,
   marginTop: 6,
   marginRight: 6,
   marginBottom: 6,
   marginLeft: 6,
   fontSize: 11,
  },

  ":global([data-theme='dark']) &": {
   backgroundColor: "rgba(255, 255, 255, 0.05)",
   borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  ":global([data-theme='dark']) :global(.message.sent) &": {
   backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  ":global([data-theme='dark']) :global(.message.received) &": {
   backgroundColor: "rgba(255, 255, 255, 0.03)",
  },

  ":global([data-theme='dark']) &:hover": {
   backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  ":global([data-theme='dark']) :global(.message.sent) &:hover": {
   backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  ":global([data-theme='dark']) :global(.message.received) &:hover": {
   backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
 },

 replySenderInside: {
  fontWeight: 600,
  opacity: 1,
  display: "block",
  marginBottom: 3,
  fontSize: 11,
  color: "var(--text-secondary)",

  ":global(.message.sent) &": { color: "var(--text-secondary)" },
  ":global(.message.received) &": { color: "var(--text-secondary)" },

  "@media (max-width: 768px)": {
   fontSize: 10,
  },

  ":global([data-theme='dark']) &": {
   color: "var(--text-primary)",
   opacity: 0.8,
  },

  ":global([data-theme='dark']) :global(.message.sent) &": {
   color: "var(--text-primary)",
   opacity: 0.8,
  },

  ":global([data-theme='dark']) :global(.message.received) &": {
   color: "var(--text-primary)",
   opacity: 0.7,
  },
 },

 replyContentInside: {
  fontWeight: 400,
  opacity: 1,
  lineHeight: 1.3,
  wordBreak: "break-word",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "var(--text-primary)",

  ":global(.message.sent) &": { color: "var(--text-primary)" },
  ":global(.message.received) &": { color: "var(--text-primary)" },

  ":global([data-theme='dark']) &": {
   color: "var(--text-primary)",
   opacity: 0.8,
  },

  ":global([data-theme='dark']) :global(.message.sent) &": {
   color: "var(--text-primary)",
   opacity: 0.8,
  },

  ":global([data-theme='dark']) :global(.message.received) &": {
   color: "var(--text-primary)",
   opacity: 0.7,
  },
 },

 messageHighlighted: {
  position: "relative",

  "::before": {
   content: '""',
   position: "absolute",
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   borderRadius: "inherit",
   pointerEvents: "none",
   backgroundColor: "#3b82f6",
   opacity: 0,
   animationName: smoothHighlight,
   animationDuration: "0.4s",
   animationTimingFunction: "ease-in-out",
  },

  ":global(.message.sent) &::before": {
   backgroundColor: "#10b981",
  },

  ":global([data-theme='dark']) :global(.message.sent) &::before": {
   backgroundColor: "#10b981",
  },
 },

 replyInsideDiscord: {
  display: "flex",
  alignItems: "center",
  columnGap: 8,
  marginBottom: 6,
  paddingLeft: 28,
  position: "relative",
  cursor: "pointer",
  transitionProperty: "opacity",
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease",

  ":hover": {
   opacity: 0.8,
  },
 },

 replyCurveLine: {
  position: "absolute",
  left: 3.5,
  top: "90%",
  width: 20,
  height: 16,
  borderLeftWidth: 2,
  borderLeftStyle: "solid",
  borderLeftColor: "var(--text-muted)",
  borderTopWidth: 2,
  borderTopStyle: "solid",
  borderTopColor: "var(--text-muted)",
  borderTopLeftRadius: 8,
  opacity: 0.4,
  transform: "translateY(-50%)",
 },

 replyAvatarSmall: {
  width: 16,
  height: 16,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
 },

 replyTextContent: {
  display: "flex",
  alignItems: "baseline",
  columnGap: 6,
  flex: 1,
  minWidth: 0,
 },

 replyUsernameSmall: {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--chat-username)",
  flexShrink: 0,
 },

 replyMessageSmall: {
  fontSize: 13,
  color: "var(--text-secondary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  opacity: 0.85,
 },
});
