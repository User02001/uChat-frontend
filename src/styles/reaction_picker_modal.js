import * as stylex from "@stylexjs/stylex";

export const ReactionPickerStyles = stylex.create({
 picker: {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
  width: 380,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10000,
  overflow: 'hidden',
 },

 searchBar: {
  padding: '10px 10px 6px',
  flexShrink: 0,
 },

 searchInput: {
  width: '100%',
  padding: '7px 12px 7px 32px',
  borderRadius: 10,
  border: '1.5px solid var(--border)',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '10px center',
  transition: 'border-color 0.15s ease',

  '::placeholder': {
   color: 'var(--text-muted)',
  },

  ':focus': {
   borderColor: 'var(--button-primary)',
   backgroundColor: 'var(--bg-primary)',
  },
 },

 scrollArea: {
  overflowY: 'auto',
  overflowX: 'hidden',
  height: 400,
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--border) transparent',
 },

 emojiBtn: {
  width: 40,
  height: 40,
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  transition: 'background 0.1s ease, transform 0.12s ease',
  position: 'relative',
  flexShrink: 0,
  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   transform: 'scale(1.2)',
   zIndex: 1,
  },
  ':active': {
   transform: 'scale(0.9)',
  },
 },

 categoryHeader: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 10px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  cursor: 'pointer',
  userSelect: 'none',
  borderTop: '1px solid var(--border)',
  transition: 'color 0.15s ease',

  ':hover': {
   color: 'var(--text-primary)',
  },
 },

 emptyState: {
  padding: '40px 16px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: 13,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
 },

 emptyIcon: {
  fontSize: 28,
  lineHeight: 1,
 },
});