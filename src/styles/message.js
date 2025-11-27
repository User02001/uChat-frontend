import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
 // Message Row (Discord-style layout)
 messageRow: {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '56px 1fr',
  gap: '12px',
  padding: '1px 16px',
  transition: 'background-color 0.1s ease',

  ':hover': {
   background: 'var(--bg-tertiary)',
  },

  ':first-child': {
   marginTop: '0px',
  },

  '@media (max-width: 768px)': {
   gridTemplateColumns: '48px 1fr',
   gap: '10px',
   padding: '1px 12px',
  },
 },

 messageRowGrouped: {
  paddingTop: '0px',
  paddingBottom: '0px',
 },

 messageRowNotGrouped: {
  marginTop: '15px',

  '@media (max-width: 768px)': {
   marginTop: '12px',
  },
 },

 // Avatar Column
 avatarColumn: {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '2px',
 },

 avatarContainer: {
  position: 'relative',
  width: '45px',
  height: '45px',
  cursor: 'pointer',
  flexShrink: 0,

  '@media (max-width: 768px)': {
   width: '42px',
   height: '42px',
  },
 },

 avatar: {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',

  '@media (max-width: 768px)': {
   width: '42px',
   height: '42px',
  },
 },

 // Content Column
 contentColumn: {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
 },

 // Message Header
 messageHeader: {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginBottom: '4px',
  flexWrap: 'wrap',
 },

 username: {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--chat-username)',
  lineHeight: 1.3,

  '@media (max-width: 768px)': {
   fontSize: '15px',
  },
 },

 timestamp: {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: 400,
  lineHeight: 1.3,

  '@media (max-width: 768px)': {
   fontSize: '11px',
  },
 },

 // Message Content
 messageContent: {
  fontSize: '16px',
  lineHeight: 1.4,
  color: 'var(--chat-username)',
  wordWrap: 'break-word',
  wordBreak: 'break-word',

  '@media (pointer: coarse)': {
   userSelect: 'none',
   WebkitUserSelect: 'none',
   MozUserSelect: 'none',
   msUserSelect: 'none',
   WebkitTouchCallout: 'none',
  },

  '@media (max-width: 768px)': {
   fontSize: '16px',
   lineHeight: 1.45,
  },
 },

 // Reaction Popup (desktop hover)
 reactionPopup: {
  position: 'absolute',
  bottom: '100%',
  right: '335px',
  marginBottom: '35px',
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.15s ease',
  zIndex: 1000,

  '@media (max-width: 768px)': {
   right: 'auto',
   left: '50%',
   top: '-70px',
   transform: 'translateX(-50%)',
  },
 },

 reactionPopupVisible: {
  opacity: 1,
  pointerEvents: 'all',
 },

 // Messages Container
 messagesContainer: {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 0px',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-primary)',
  scrollBehavior: 'auto',
  WebkitOverflowScrolling: 'touch',
  transform: 'translateZ(0)',
  willChange: 'scroll-position',
  overflowAnchor: 'none',
  position: 'relative',
  transition: 'opacity 0.15s ease-in',

  '@media (max-width: 768px)': {
   padding: '8px 0px',
  },
 },

 messagesContainerHidden: {
  opacity: '0 !important',
 },

 emptyMessages: {
  textAlign: 'center',
  color: 'var(--text-secondary)',
  fontSize: '16px',
  padding: '60px 24px',
  margin: 'auto 0',
  animationName: 'fadeIn',
  animationDuration: '0.5s',
  animationTimingFunction: 'ease',

  '@media (max-width: 768px)': {
   padding: '40px 20px',
   fontSize: '15px',
  },
 },

 // Media Content
 mediaContent: {
  marginTop: '8px',
  display: 'flex',
  alignItems: 'flex-start',
 },

 videoWrapper: {
  maxWidth: '400px',
  borderRadius: '12px',
  overflow: 'hidden',

  '@media (max-width: 768px)': {
   maxWidth: '300px',
  },
 },

 // Audio Player
 audioPlayer: {
  maxWidth: '350px',
  background: 'var(--file-bg)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',

  '@media (max-width: 768px)': {
   maxWidth: '280px',
  },
 },

 audioHeader: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
 },

 audioIcon: {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  flexShrink: 0,

  '@media (max-width: 768px)': {
   width: '38px',
   height: '38px',
   fontSize: '16px',
  },
 },

 audioInfo: {
  flex: 1,
  minWidth: 0,
 },

 audioTitle: {
  fontWeight: 500,
  fontSize: '14px',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '2px',

  '@media (max-width: 768px)': {
   fontSize: '13px',
  },
 },

 audioSubtitle: {
  fontSize: '12px',
  color: 'var(--text-secondary)',
 },

 audioDownloadBtn: {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '6px 10px',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  fontWeight: 500,
  flexShrink: 0,

  ':hover': {
   background: 'var(--bg-tertiary)',
   borderColor: 'var(--button-primary)',
   color: 'var(--button-primary)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },
 },

 audioDownloadBtnTextHidden: {
  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 audioControls: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
 },

 audioPlayBtn: {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'var(--button-primary)',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  flexShrink: 0,

  ':hover': {
   background: 'var(--button-primary-hover)',
   transform: 'scale(1.05)',
  },

  ':active': {
   transform: 'scale(0.95)',
  },

  '@media (max-width: 768px)': {
   width: '32px',
   height: '32px',
   fontSize: '12px',
  },
 },

 audioProgress: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
 },

 audioProgressBar: {
  width: '100%',
  height: '10px',
  background: 'var(--border)',
  borderRadius: '15px',
  cursor: 'pointer',
  position: 'relative',
 },

 audioProgressFill: {
  height: '100%',
  background: 'var(--button-primary)',
  borderRadius: '15px',
  transition: 'width 0.1s linear',
 },

 audioTime: {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  display: 'flex',
  justifyContent: 'space-between',
 },

 // File Container
 fileContainer: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  background: 'var(--file-bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  maxWidth: '350px',
  marginTop: '4px',

  ':hover': {
   background: 'var(--file-bg-hover)',
   boxShadow: '0 2px 8px var(--shadow-light)',
  },

  '@media (max-width: 768px)': {
   maxWidth: '280px',
  },
 },

 fileIconWrapper: {
  fontSize: '28px',
  minWidth: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  '@media (max-width: 768px)': {
   fontSize: '24px',
  },
 },

 fileDetails: {
  flex: 1,
  minWidth: 0,
 },

 fileName: {
  fontWeight: 500,
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '14px',
  marginBottom: '2px',
 },

 fileSize: {
  fontSize: '12px',
  color: 'var(--text-secondary)',
 },

 fileDownloadBtn: {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '7px 12px',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  flexShrink: 0,

  ':hover': {
   background: 'var(--button-primary)',
   borderColor: 'var(--button-primary)',
   color: 'white',
  },

  ':active': {
   transform: 'scale(0.97)',
  },

  '@media (max-width: 768px)': {
   padding: '7px 10px',
  },
 },

 fileDownloadBtnTextHidden: {
  '@media (max-width: 768px)': {
   display: 'none',
  },
 },

 // Deleted message
 deletedMessage: {
  fontStyle: 'italic',
  color: 'var(--text-muted)',
  padding: '12px 16px',
  borderRadius: '18px',
  fontSize: '14px',
  lineHeight: 1.4,
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  opacity: 0.9,
  marginBottom: '6px',
 },

 // Image/GIF content
 messageImage: {
  margin: '4px 0',
  borderRadius: '8px',
  overflow: 'hidden',
  maxWidth: '300px',
  width: '100%',
  position: 'relative',

  '@media (max-width: 768px)': {
   maxWidth: '250px',
  },
 },

 sharedImage: {
  width: '100%',
  height: 'auto',
  maxHeight: '400px',
  objectFit: 'cover',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  borderRadius: '25px',
  backgroundColor: 'var(--bg-secondary)',
  background: 'var(--bg-tertiary)',
  border: '10px solid #ccc',

  ':hover': {
   opacity: 0.9,
  },

  '@media (max-width: 768px)': {
   maxHeight: '300px',
   border: '12px solid #ccc',
  },

  '@media (prefers-color-scheme: dark)': {
   border: '12px solid #4a4a4a',
  },
 },

 sharedImageLoaded: {
  minHeight: 'auto',
 },
});