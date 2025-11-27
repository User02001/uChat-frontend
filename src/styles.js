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