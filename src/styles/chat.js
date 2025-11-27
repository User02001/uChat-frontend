import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
 chatHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '18px 28px',
  borderBottom: '1px solid var(--border)',
  backgroundColor: 'var(--bg-secondary)',
  position: 'sticky',
  top: 0,
  zIndex: 5,

  '@media (max-width: 768px)': {
   padding: '12px 16px',
   gap: '8px',
  },
 },

 chatAvatar: {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  flexShrink: 0,
 },

 chatUsername: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--chat-username)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '2px',
  lineHeight: 1.2,
 },

 chatUserInfo: {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
 },

 chatStatus: {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  fontWeight: 500,
 },

 chatUnverifiedIcon: {
  width: '16px',
  height: '16px',
  marginLeft: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
 },

 chatUsernameContainer: {
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px',
  flexWrap: 'wrap',
  lineHeight: 1.2,
  rowGap: 0,
 },

 chatAka: {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: 400,
  fontStyle: 'italic',
 },

 chatHandle: {
  fontSize: '13px',
  fontWeight: 500,
  color: '#eeb600',
 },

 messagesContainer: {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 10px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--bg-primary)',
  scrollBehavior: 'auto',
  WebkitOverflowScrolling: 'touch',
  transform: 'translateZ(0)',
  willChange: 'scroll-position',
  overflowAnchor: 'none',
  position: 'relative',
  opacity: 1,

  '@media (max-width: 768px)': {
   padding: '10px 0px',
  },
 },

 emptyMessages: {
  textAlign: 'center',
  color: 'var(--text-secondary)',
  fontSize: '16px',
  padding: '60px 24px',
  margin: 'auto 0',
  animation: 'fadeIn 0.5s ease',
 },

 typingIndicatorFloating: {
  padding: '6px 12px',
  margin: '0 24px 4px 24px',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  opacity: 0,
  transform: 'translateY(10px)',
  animation: 'typingFloatIn 0.3s ease forwards',
  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
 },

 noChatSelected: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  padding: '60px 24px',
  backgroundColor: 'var(--bg-primary)',
  animation: 'fadeIn 0.5s ease',
 },

 fadeIn: {
  opacity: 1,
  animationName: 'fadeIn',
  animationDuration: '0.3s',
  animationTimingFunction: 'ease-in-out',
 },
 fadeOut: {
  opacity: 0,
  animationName: 'fadeOut',
  animationDuration: '0.3s',
  animationTimingFunction: 'ease-in-out',
 },
});