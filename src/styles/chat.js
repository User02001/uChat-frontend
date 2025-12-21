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
  marginBottom: '2px',
  lineHeight: 1.2,
  position: 'relative',
  overflow: 'hidden',
  maxWidth: '200px',
 },

 chatUsernameText: {
  display: 'inline-block',
  whiteSpace: 'nowrap',
 },

 chatUsernameScrolling: {
  display: 'inline-block',
  whiteSpace: 'nowrap',
  animationName: 'marqueeScroll',
  animationDuration: '3s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  animationDelay: '1s',
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
  position: 'relative',
  overflow: 'hidden',
  maxWidth: '250px',
 },

 chatStatusText: {
  display: 'inline-block',
  whiteSpace: 'nowrap',
 },

 chatUnverifiedIcon: {
  width: '16px',
  height: '16px',
  marginLeft: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  '@media (max-width: 768px)': {
   display: 'none',
  },
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
 addContactBtn: {
  padding: '8px 16px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#0084ff',
  backgroundColor: 'transparent',
  color: '#0084ff',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  flexShrink: 0,
  minWidth: '60px',
  transitionProperty: 'all',
  transitionDuration: '0.2s',
  ':hover': {
   backgroundColor: '#0084ff',
   color: 'white',
   transform: 'scale(1.05)',
  },
  ':active': {
   transform: 'scale(0.95)',
  }
 },
 searchInput: {
  width: '100%',
  padding: '14px 20px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: '25px',
  fontSize: '16px',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  fontWeight: '400',
  WebkitAppearance: 'none',
  WebkitBorderRadius: '25px',
  ':focus': {
   outline: 'none',
  },
  '::placeholder': {
   color: 'var(--text-secondary)',
  }
 },
 searchClose: {
  position: 'absolute',
  right: '12px',
  width: '24px',
  height: '24px',
  borderWidth: '0',
  borderStyle: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  ':hover': {
   backgroundColor: 'var(--border)',
   color: 'var(--text-primary)',
   transform: 'scale(1.1)',
  },
  ':active': {
   transform: 'scale(0.9)',
  }
 }
});