import * as stylex from '@stylexjs/stylex';

const fadeIn = stylex.keyframes({
 from: { opacity: 0 },
 to: { opacity: 1 },
});

const menuSlideIn = stylex.keyframes({
 from: { opacity: 0, transform: 'translateY(-10px)' },
 to: { opacity: 1, transform: 'translateY(0)' },
});

const searchSlideIn = stylex.keyframes({
 from: { opacity: 0, transform: 'translateY(-10px)' },
 to: { opacity: 1, transform: 'translateY(0)' },
});

const searchEnter = stylex.keyframes({
 from: { opacity: 0, transform: 'translateY(-20px)' },
 to: { opacity: 1, transform: 'translateY(0)' },
});

const searchExit = stylex.keyframes({
 from: { opacity: 1, transform: 'translateY(0)' },
 to: { opacity: 0, transform: 'translateY(-20px)' },
});

const onlineIndicator = stylex.keyframes({
 '0%': { opacity: 1 },
 '50%': { opacity: 0.7 },
 '100%': { opacity: 1 },
});

export const styles = stylex.create({
 sidebar: {
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

 sidebarHeader: {
  padding: '24px 20px',
  borderBottom: 'none',
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--bg-secondary)',
  zIndex: 5,

  '@media (max-width: 768px)': {
   display: 'none',
  },

  '@media (max-width: 480px)': {
   padding: '16px',
  },

  '@media (min-width: 1200px)': {
   padding: '28px 24px',
  },
 },

 mobileHeader: {
  display: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  backgroundColor: 'var(--bg-secondary)',
  position: 'sticky',
  top: 0,
  zIndex: 5,
  gap: '12px',

  '@media (max-width: 768px)': {
   display: 'flex',
  },
 },

 mobileLogo: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
 },

 mobileLogoIcon: {
  width: '32px',
  height: '32px',
  objectFit: 'contain',
 },

 mobileLogoText: {
  fontSize: '28px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-1px',
 },

 mobileAvatar: {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  flexShrink: 0,
  cursor: 'pointer',
 },

 mobileHeaderActions: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
 },

 userProfile: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
  position: 'relative',
 },

 profileAvatar: {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  cursor: 'pointer',

  '@media (max-width: 480px)': {
   width: '44px',
   height: '44px',
  },
 },

 userInfo: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
 },

 username: {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--chat-username)',
  marginBottom: '2px',
  lineHeight: 1.2,

  '@media (max-width: 480px)': {
   fontSize: '15px',
  },
 },

 handle: {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  fontWeight: 400,
 },

 userMenuBtn: {
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

 userMenu: {
  position: 'absolute',
  top: '100%',
  right: 0,
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 8px 24px var(--shadow)',
  zIndex: 20,
  minWidth: '120px',
  overflow: 'hidden',
  animationName: menuSlideIn,
  animationDuration: '0.2s',
  animationFillMode: 'forwards',
 },

 mobileUserMenu: {
  top: '60px',
  right: '20px',
 },

 userMenuButton: {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
  },

  ':active': {
   transform: 'scale(0.98)',
  },
 },

 searchSection: {
  position: 'relative',
 },

 searchInputContainer: {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
 },

 searchResults: {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px var(--shadow)',
  zIndex: 20,
  marginTop: '8px',
  maxHeight: '280px',
  overflowY: 'auto',
  animationName: searchSlideIn,
  animationDuration: '0.3s',
  animationFillMode: 'forwards',
 },

 searchResult: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderBottom: '1px solid var(--border-light)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
  },

  ':active': {
   transform: 'scale(0.98)',
  },

  ':last-child': {
   borderBottom: 'none',
  },
 },

 searchAvatar: {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  flexShrink: 0,

  '@media (max-width: 480px)': {
   width: '36px',
   height: '36px',
  },
 },

 searchUserInfo: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
 },

 searchUsername: {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--chat-username)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.3,
  marginBottom: '2px',
 },

 searchHandle: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
 },

 addContactBtn: {
  padding: '6px 16px',
  borderRadius: '20px',
  border: 'none',
  backgroundColor: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  flexShrink: 0,
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',

  ':hover': {
   backgroundColor: 'var(--button-primary-hover)',
   transform: 'scale(1.05)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },
 },

 contactsList: {
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

 emptyContacts: {
  textAlign: 'center',
  padding: '60px 24px',
  color: 'var(--text-secondary)',
  animationName: fadeIn,
  animationDuration: '0.5s',
 },

 emptyContactsParagraph: {
  fontSize: '14px',
  marginBottom: '8px',
  lineHeight: 1.5,

  ':last-child': {
   marginBottom: 0,
  },
 },

 contactItem: {
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

 contactItemActive: {
  backgroundColor: 'var(--border)',
  color: 'var(--chat-username)',
 },

 contactAvatarContainer: {
  position: 'relative',
  flexShrink: 0,
 },

 contactAvatar: {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
  cursor: 'pointer',

  '@media (max-width: 480px)': {
   width: '44px',
   height: '44px',
  },
 },

 statusIndicator: {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  border: '2px solid var(--bg-primary)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
 },

 statusIndicatorOnline: {
  backgroundColor: '#4caf50',
  backgroundImage: 'none',
  animationName: onlineIndicator,
  animationDuration: '2s',
  animationIterationCount: 'infinite',
 },

 statusIndicatorOffline: {
  backgroundColor: '#9e9e9e',
  backgroundImage: 'none',
 },

 statusIndicatorAway: {
  backgroundColor: 'transparent',
  backgroundImage: 'url("/resources/icons/away-icon.svg")',
  backgroundSize: 'contain',
  border: 'none',
  borderRadius: 0,
 },

 statusIndicatorLarge: {
  width: '15px',
  height: '15px',
  bottom: '3px',
  right: '-4px',
 },

 contactInfo: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
 },

 contactMain: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 0,
 },

 contactName: {
  fontSize: '15px',
  fontWeight: 500,
  color: 'var(--chat-username)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '4px',
  lineHeight: 1.2,
 },

 contactPreview: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 400,
 },

 contactPreviewUnread: {
  fontWeight: 700,
  color: 'var(--text-primary)',
 },

 contactTime: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  flexShrink: 0,
  alignSelf: 'flex-start',
 },

 unverifiedIcon: {
  width: '17px',
  height: 'auto',
  marginLeft: '6px',
  verticalAlign: 'middle',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  filter: 'brightness(0) saturate(100%) invert(34%) sepia(95%) saturate(6800%) hue-rotate(354deg) brightness(98%) contrast(93%)',

  ':hover': {
   transform: 'scale(1.15)',
   filter: 'brightness(0) saturate(100%) invert(18%) sepia(97%) saturate(7496%) hue-rotate(354deg) brightness(90%) contrast(93%)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },
 },

 mobileSearchTrigger: {
  display: 'none',
  padding: '4px 16px',
  backgroundColor: 'var(--bg-secondary)',

  '@media (max-width: 768px)': {
   display: 'block',
  },
 },

 mobileSearchButton: {
  width: '100%',
  padding: '8px 16px',
  borderRadius: '20px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-tertiary)',
  fontSize: '14px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  WebkitAppearance: 'none',
  appearance: 'none',
 },

 mobileSearchOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'var(--bg-primary)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
 },

 mobileSearchOverlayEntering: {
  animationName: searchEnter,
  animationDuration: '200ms',
  animationFillMode: 'forwards',
 },

 mobileSearchOverlayExiting: {
  animationName: searchExit,
  animationDuration: '200ms',
  animationFillMode: 'forwards',
 },

 mobileSearchHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  backgroundColor: 'var(--bg-primary)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  width: '100%',
  boxSizing: 'border-box',
 },

 mobileSearchBack: {
  width: '36px',
  height: '36px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--button-primary)',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  flexShrink: 0,
  position: 'relative',
  transition: 'all 0.2s ease',

  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   transform: 'scale(1.05)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },

  '::before': {
   content: '"\\f060"',
   fontFamily: "'Font Awesome 6 Free'",
   fontWeight: 900,
   color: 'var(--button-primary)',
   fontSize: '16px',
  },
 },

 mobileSearchInput: {
  flex: 1,
  padding: '12px 18px',
  border: '1px solid var(--border)',
  borderRadius: '25px',
  fontSize: '16px',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--chat-username)',
  fontWeight: 400,
  minWidth: 0,
  WebkitAppearance: 'none',
  WebkitBorderRadius: '25px',
  outline: 'none',

  '::placeholder': {
   color: 'var(--text-secondary)',
  },
 },

 mobileSearchContent: {
  flex: 1,
  overflowY: 'auto',
  backgroundColor: 'var(--bg-primary)',
 },

 searchPlaceholder: {
  textAlign: 'center',
  color: 'var(--text-secondary)',
  padding: '60px 24px',
  fontSize: '16px',
 },

 noSearchResults: {
  textAlign: 'center',
  color: 'var(--text-secondary)',
  padding: '60px 24px',
  fontSize: '16px',
 },
});