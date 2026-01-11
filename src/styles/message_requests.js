import * as stylex from '@stylexjs/stylex';

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const slideIn = stylex.keyframes({
 from: { opacity: 0, transform: 'translateY(-10px)' },
 to: { opacity: 1, transform: 'translateY(0)' },
});

const onlineIndicator = stylex.keyframes({
 '0%': { opacity: 1 },
 '50%': { opacity: 0.7 },
 '100%': { opacity: 1 },
});

export const styles = stylex.create({
 // Sidebar
 requestsSidebar: {
  width: '320px',
  backgroundColor: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 10,
  marginLeft: '72px',
  transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  '@media (max-width: 768px)': {
   width: '100%',
   position: 'absolute',
   top: 0,
   left: 0,
   height: '100%',
   marginLeft: 0,
   transform: 'translateX(0)',
  },

  '@media (min-width: 769px) and (max-width: 1024px)': {
   width: '280px',
  },

  '@media (min-width: 1200px)': {
   width: '360px',
  },
 },

 requestsHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '24px 20px',
  borderBottom: 'none',
  backgroundColor: 'var(--bg-secondary)',
  position: 'sticky',
  top: 0,
  zIndex: 5,

  '@media (max-width: 768px)': {
   padding: '16px 20px',
  },

  '@media (max-width: 480px)': {
   padding: '16px',
  },

  '@media (min-width: 1200px)': {
   padding: '28px 24px',
  },
 },

 backButton: {
  width: '36px',
  height: '36px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flexShrink: 0,
  transition: 'all 0.2s ease',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   color: 'var(--text-primary)',
   transform: 'scale(1.05)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },
 },

 requestsTitle: {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--chat-username)',
  margin: 0,
  flex: 1,
 },

 requestsList: {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '0 0 20px 0',
  WebkitOverflowScrolling: 'touch',
  transform: 'translateZ(0)',

  '@media (max-width: 768px)': {
   paddingBottom: '100px',
  },
 },

 loadingContainer: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 24px',
  color: 'var(--text-secondary)',
 },

 emptyState: {
  textAlign: 'center',
  padding: '60px 24px',
  color: 'var(--text-secondary)',
  animationName: fadeIn,
  animationDuration: '0.5s',
 },

 emptyIcon: {
  fontSize: '48px',
  color: 'var(--text-secondary)',
  marginBottom: '16px',
 },

 emptyTitle: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '8px',
 },

 emptyText: {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
  marginTop: '8px',
 },

 requestItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  margin: '4px 12px',
  cursor: 'pointer',
  borderRadius: '12px',
  border: 'none',
  transition: 'all 0.2s ease',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  pointerEvents: 'auto',
  userSelect: 'none',

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
  },

  ':active': {
   transform: 'scale(0.98)',
  },

  ':last-child': {
   marginBottom: '8px',
  },

  '@media (max-width: 480px)': {
   padding: '12px 16px',
  },

  '@media (min-width: 1200px)': {
   padding: '12px 24px',
  },
 },

 requestItemActive: {
  backgroundColor: 'var(--border)',
  color: 'var(--chat-username)',
 },

 requestAvatar: {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  flexShrink: 0,
  cursor: 'pointer',

  '@media (max-width: 480px)': {
   width: '44px',
   height: '44px',
  },
 },

 requestInfo: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
 },

 requestMain: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 0,
 },

 requestName: {
  fontSize: '15px',
  fontWeight: 500,
  color: 'var(--chat-username)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '4px',
  lineHeight: 1.2,
 },

 requestHandle: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '4px',
 },

 requestPreview: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 400,
 },

 // Chat View
 chatView: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--bg-primary)',
  position: 'relative',
 },

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

 mobileBackBtn: {
  display: 'none',
  width: '40px',
  height: '40px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  borderRadius: '50%',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  transition: 'all 0.2s ease',
  flexShrink: 0,
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  '@media (max-width: 768px)': {
   display: 'flex',
  },

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   transform: 'scale(1.05)',
  },

  ':active': {
   transform: 'scale(0.95)',
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

 chatUserInfo: {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
 },

 chatUsername: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--chat-username)',
  marginBottom: '2px',
  lineHeight: 1.2,
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

 requestWarning: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  margin: '0 12px 16px 12px',
  background: 'rgba(255, 152, 0, 0.1)',
  border: '1px solid rgba(255, 152, 0, 0.3)',
  borderRadius: '12px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  fontWeight: 500,
  animationName: slideIn,
  animationDuration: '0.3s',
 },

 requestWarningIcon: {
  fontSize: '16px',
  color: '#ff9800',
  flexShrink: 0,
 },

 actionButtons: {
  display: 'flex',
  gap: '12px',
  padding: '20px',
  borderTop: '1px solid var(--border)',
  backgroundColor: 'var(--bg-secondary)',
 },

 acceptButton: {
  flex: 1,
  padding: '14px 24px',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  ':hover': {
   transform: 'translateY(-2px)',
   boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
  },

  ':active': {
   transform: 'translateY(0)',
  },

  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
   transform: 'none',
  },
 },

 blockButton: {
  flex: 1,
  padding: '14px 24px',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #f44336 0%, #da190b 100%)',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  ':hover': {
   transform: 'translateY(-2px)',
   boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
  },

  ':active': {
   transform: 'translateY(0)',
  },

  ':disabled': {
   opacity: 0.6,
   cursor: 'not-allowed',
   transform: 'none',
  },
 },

 buttonIcon: {
  fontSize: '18px',
 },

 requestTime: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  flexShrink: 0,
  alignSelf: 'flex-start',
 },
});