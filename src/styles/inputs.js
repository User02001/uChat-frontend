import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({

 messageInputArea: {
  position: 'relative',
  transitionProperty: 'all',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',
 },

 messageInputContainer: {
  display: 'flex',
  alignItems: 'center',
  paddingTop: '5px',
  paddingRight: '16px',
  paddingBottom: '5px',
  paddingLeft: '16px',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'var(--border)',
  backgroundColor: 'var(--bg-primary)',

  '@media (max-width: 768px)': {
   paddingTop: '8px',
   paddingRight: '8px',
   paddingBottom: '8px',
   paddingLeft: '8px',
   gap: '4px',
  },
 },

 attachmentButton: {
  backgroundColor: 'transparent',
  borderWidth: '0px',
  borderStyle: 'none',
  paddingTop: '8px',
  paddingRight: '8px',
  paddingBottom: '8px',
  paddingLeft: '8px',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  marginRight: '5px',
  transitionProperty: 'background-color, transform',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',

  ':hover': {
   backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },

  ':active': {
   backgroundColor: 'rgba(128, 128, 128, 0.7)',
   transform: 'scale(0.95)',
  },

  ':disabled': {
   cursor: 'not-allowed',
   opacity: 0.4,
  },

  '@media (max-width: 768px)': {
   width: '38px',
   height: '38px',
   paddingTop: '7px',
   paddingRight: '7px',
   paddingBottom: '7px',
   paddingLeft: '7px',
   marginRight: '0px',
   marginLeft: '0px',
  },
 },

 gifButton: {
  backgroundColor: 'transparent',
  borderWidth: '0px',
  borderStyle: 'none',
  paddingTop: '8px',
  paddingRight: '8px',
  paddingBottom: '8px',
  paddingLeft: '8px',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  transitionProperty: 'background-color, transform',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',

  ':hover': {
   backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },

  ':active': {
   backgroundColor: 'rgba(128, 128, 128, 0.7)',
   transform: 'scale(0.95)',
  },

  ':disabled': {
   cursor: 'not-allowed',
   opacity: 0.4,
  },

  '@media (max-width: 768px)': {
   width: '38px',
   height: '38px',
   paddingTop: '7px',
   paddingRight: '7px',
   paddingBottom: '7px',
   paddingLeft: '7px',
   marginRight: '0px',
   marginLeft: '0px',
  },
 },

 messageInput: {
  flex: 1,
  paddingTop: '10px',
  paddingRight: '16px',
  paddingBottom: '10px',
  paddingLeft: '16px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: '24px',

  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--chat-username)',
  fontSize: '14px',

  outline: 'none',

  marginLeft: '14px',
  marginRight: '14px',

  transitionProperty: 'border-color',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',

  '::placeholder': {
   color: 'var(--text-secondary)',
  },

  '@media (max-width: 768px)': {
   marginLeft: '4px',
   marginRight: '4px',
   paddingTop: '10px',
   paddingRight: '12px',
   paddingBottom: '10px',
   paddingLeft: '12px',
  },
 },

 sendButton: {
  backgroundColor: 'transparent',
  borderWidth: '0px',
  borderStyle: 'none',
  paddingTop: '8px',
  paddingRight: '8px',
  paddingBottom: '8px',
  paddingLeft: '8px',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '46px',
  height: '46px',
  transitionProperty: 'background-color, transform',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',

  ':hover': {
   backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },

  ':active': {
   backgroundColor: 'rgba(128, 128, 128, 0.7)',
   transform: 'scale(0.95)',
  },

  ':disabled': {
   cursor: 'not-allowed',
   opacity: 0.4,
  },

  '@media (max-width: 768px)': {
   width: '38px',
   height: '38px',
   paddingTop: '7px',
   paddingRight: '7px',
   paddingBottom: '7px',
   paddingLeft: '7px',
   marginLeft: '0px',
   marginRight: '0px',
  },
 },
});