import * as stylex from '@stylexjs/stylex';

const mobileMenuSlideIn = stylex.keyframes({
 from: {
  opacity: 0,
  transform: 'translateY(10px)',
 },
 to: {
  opacity: 1,
  transform: 'translateY(0)',
 },
});

export const styles = stylex.create({
 // Main nav sidebar container
 navSidebar: {
  width: '72px',
  background: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px 0',
  position: 'fixed',
  left: 0,
  top: 0,
  height: '100vh',
  zIndex: 15,

  '@media (max-width: 768px)': {
   width: '100%',
   height: '70px',
   position: 'fixed',
   bottom: 0,
   top: 'auto',
   left: 0,
   padding: '12px 20px',
   borderRight: 'none',
   borderTop: '1px solid var(--border)',
   zIndex: 20,
   background: 'var(--bg-secondary)',
  },

  '@media (max-width: 480px)': {
   padding: '8px 16px',
   height: '70px',
  },

  '@media (min-width: 769px)': {
   // For banner support on desktop
  },
 },

 withBanner: {
  '@media (min-width: 769px)': {
   height: 'calc(100vh - 48px)',
   top: '48px',
  },
 },

 mobileHidden: {
  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 searchHidden: {
  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 // Navigation buttons container
 navButtons: {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  flex: 1,
  width: '100%',
  alignItems: 'center',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '0 12px',
  position: 'relative',

  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 // Logo
 navLogo: {
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginBottom: '-10px',
 },

 navLogoIcon: {
  width: '48px',
  height: '48px',
 },

 // Separator
 navSeparator: {
  width: '32px',
  height: '2px',
  background: 'var(--border)',
  borderRadius: '1px',
  margin: '4px 0',
  flexShrink: 0,
 },

 // Bottom section
 navBottom: {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'center',
  flexShrink: 0,
  paddingBottom: '8px',

  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 // Navigation button
 navBtn: {
  width: '40px',
  height: '40px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  borderRadius: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  transition: 'all 0.15s ease',
  position: 'relative',
  flexShrink: 0,

  ':hover': {
   background: 'var(--bg-tertiary)',
   color: 'var(--text-primary)',
  },

  ':active': {
   opacity: 0.7,
  },
 },

 active: {
  background: 'transparent',
  color: 'var(--text-primary)',
 },

 // Contact button specific
 navContactBtn: {
  padding: 0,
  overflow: 'visible',
  position: 'relative',

  '::before': {
   content: '""',
   position: 'absolute',
   left: '-16px',
   top: '50%',
   transform: 'translateY(-50%)',
   width: '4px',
   height: '8px',
   background: 'var(--text-primary)',
   borderRadius: '0 4px 4px 0',
   opacity: 0,
   transition: 'all 0.2s ease',
   zIndex: 1,
  },

  ':hover::before': {
   opacity: 1,
   height: '20px',
  },
 },

 navContactBtnActive: {
  '::before': {
   opacity: 1,
   height: '32px',
  },
 },

 // Contact avatar
 navContactAvatar: {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '12px',
 },

 // Tooltip
 navTooltip: {
  position: 'fixed',
  left: '65px',
  transform: 'translateY(-50%)',
  background: 'var(--bg-tertiary)',
  color: 'var(--chat-username)',
  padding: '8px 15px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease',
  border: '2px solid var(--border-tooltip)',
  boxShadow: '0 4px 12px var(--shadow)',
  zIndex: 9999,
  pointerEvents: 'none',
  marginTop: '35px',
 },

 navTooltipVisible: {
  opacity: 1,
  visibility: 'visible',
  transform: 'translateY(-50%) translateX(4px)',
 },

 hideTooltip: {
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.1s ease, visibility 0.1s ease',
 },

 // Logout button
 logoutBtn: {
  color: '#ef4444',

  ':hover': {
   backgroundColor: 'rgba(239, 68, 68, 0.1)',
   color: '#dc2626',
  },
 },

 // Mobile navigation
 mobileNav: {
  display: 'none',

  '@media (max-width: 768px)': {
   display: 'flex',
   justifyContent: 'space-around',
   alignItems: 'center',
   height: '100%',
   position: 'relative',
   gap: '72px',
   padding: '0 12px',
  },
 },

 mobileNavBtn: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  minWidth: '60px',

  ':hover': {
   color: 'var(--text-primary)',
   background: 'var(--bg-tertiary)',
  },

  '@media (max-width: 480px)': {
   padding: '6px 8px',
   minWidth: '50px',
  },
 },

 mobileNavBtnActive: {
  color: '#ff9800',
  background: 'transparent',
 },

 mobileNavBtnIcon: {
  width: '20px',
  height: '20px',
  marginBottom: '4px',
  display: 'block',

  '@media (max-width: 480px)': {
   width: '25px',
   height: '25px',
  },
 },

 mobileNavBtnIconActive: {
  color: '#ff9800',
 },

 mobileNavBtnText: {
  fontSize: '11px',
  fontWeight: 500,

  '@media (max-width: 480px)': {
   fontSize: '10px',
  },
 },

 // Mobile more menu
 mobileMoreMenu: {
  position: 'absolute',
  bottom: '100%',
  right: '20px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 8px 24px var(--shadow)',
  padding: '8px 0',
  marginBottom: '8px',
  minWidth: '140px',
  transform: 'translateY(10px)',
  animationName: mobileMenuSlideIn,
  animationDuration: '0.2s',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',

  '@media (max-width: 480px)': {
   right: '16px',
  },
 },

 mobileMoreItem: {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: '14px',
  textAlign: 'left',

  ':hover': {
   background: 'var(--bg-tertiary)',
  },
 },

 mobileMoreItemIcon: {
  fontSize: '16px',
  width: '20px',
  color: 'var(--text-secondary)',
 },

 // Sidebar from index.module.css
 sidebar: {
  width: '320px',
  background: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 10,
  marginLeft: '72px',

  '@media (max-width: 768px)': {
   width: '100%',
   position: 'absolute',
   top: 0,
   left: 0,
   height: '100%',
   zIndex: 10,
   transform: 'translateX(0)',
   transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
   marginLeft: 0,
  },
 },

 sidebarHeader: {
  padding: '24px 20px',
  borderBottom: 'none',
  position: 'sticky',
  top: 0,
  background: 'var(--bg-secondary)',
  zIndex: 5,

  '@media (max-width: 768px)': {
   display: 'none',
  },

  '@media (max-width: 480px)': {
   padding: '16px',
  },
 },

 // User profile
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
  background: 'transparent',
  color: 'var(--text-secondary)',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  flexShrink: 0,

  ':hover': {
   background: 'var(--bg-tertiary)',
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
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 8px 24px var(--shadow)',
  zIndex: 20,
  minWidth: '120px',
  overflow: 'hidden',
  opacity: 0,
  transform: 'translateY(-10px)',
  animationName: 'menuSlideIn',
  animationDuration: '0.2s',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',
 },

 userMenuButton: {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',

  ':hover': {
   background: 'var(--bg-tertiary)',
  },

  ':active': {
   transform: 'scale(0.98)',
  },
 },

 // Search section
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
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px var(--shadow)',
  zIndex: 20,
  marginTop: '8px',
  maxHeight: '280px',
  overflowY: 'auto',
  opacity: 0,
  transform: 'translateY(-10px)',
  animationName: 'searchSlideIn',
  animationDuration: '0.3s',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',
 },

 searchResult: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderBottom: '1px solid var(--border-light)',
  cursor: 'pointer',

  ':hover': {
   background: 'var(--bg-tertiary)',
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

 // Contacts list
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

 contactsListHeading: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: '24px 20px 12px 20px',

  '@media (max-width: 768px)': {
   margin: '20px 20px 12px 20px',
  },

  '@media (max-width: 480px)': {
   margin: '16px 16px 8px 16px',
  },
 },

 emptyContacts: {
  textAlign: 'center',
  padding: '60px 24px',
  color: 'var(--text-secondary)',
  animationName: 'fadeIn',
  animationDuration: '0.5s',
  animationTimingFunction: 'ease',
 },

 emptyContactsText: {
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

  ':hover': {
   background: 'var(--bg-tertiary)',
  },

  ':active': {
   transform: 'scale(0.98)',
  },

  ':last-child': {
   marginBottom: '8px',
  },

  '@media (max-width: 768px)': {
   padding: '12px 16px',
  },

  '@media (min-width: 1200px)': {
   padding: '12px 24px',
  },
 },

 contactItemActive: {
  background: 'var(--border)',
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

  '@media (max-width: 480px)': {
   width: '44px',
   height: '44px',
  },
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
  marginBottom: '0px',
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

 contactTime: {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: 500,
  flexShrink: 0,
  alignSelf: 'flex-start',
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

 // Mobile header
 mobileHeader: {
  display: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  background: 'var(--bg-secondary)',
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

 mobileUserMenu: {
  top: '60px',
  right: '20px',
 },

 // Mobile search trigger
 mobileSearchTrigger: {
  display: 'none',
  padding: '4px 16px',
  background: 'var(--bg-secondary)',

  '@media (max-width: 768px)': {
   display: 'block',
  },
 },

 // Mobile search overlay
 mobileSearchOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'var(--bg-primary)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
 },

 mobileSearchOverlayEntering: {
  animationName: 'searchEnter',
  animationDuration: '200ms',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',
 },

 mobileSearchOverlayExiting: {
  animationName: 'searchExit',
  animationDuration: '200ms',
  animationTimingFunction: 'ease',
  animationFillMode: 'forwards',
 },

 mobileSearchHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  background: 'var(--bg-primary)',
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
  background: 'transparent',
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

  ':hover': {
   background: 'var(--bg-tertiary)',
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
  background: 'var(--bg-tertiary)',
  color: 'var(--chat-username)',
  fontWeight: 400,
  minWidth: 0,
  WebkitAppearance: 'none',
  WebkitBorderRadius: '25px',

  ':focus': {
   outline: 'none',
  },

  '::placeholder': {
   color: 'var(--text-secondary)',
  },
 },

 mobileSearchContent: {
  flex: 1,
  overflowY: 'auto',
  background: 'var(--bg-primary)',
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