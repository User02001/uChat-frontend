import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
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
 }
});