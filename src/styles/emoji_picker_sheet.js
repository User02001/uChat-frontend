import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const slideUp = stylex.keyframes({ from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } });
const slideDown = stylex.keyframes({ from: { transform: 'translateY(0)' }, to: { transform: 'translateY(100%)' } });

export const EmojiPickerSheetStyles = stylex.create({
 overlay: {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 10000,
  animationName: fadeIn, animationDuration: '0.15s', animationFillMode: 'forwards',
 },
 overlayClosing: {
  animationName: fadeOut, animationDuration: '0.2s', animationFillMode: 'forwards',
 },

 sheet: {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  backgroundColor: 'var(--bg-secondary)',
  borderTopLeftRadius: 24, borderTopRightRadius: 24,
  zIndex: 10001,
  // Use dvh so the browser's own chrome (address bar etc.) is accounted for
  height: '82dvh',
  // Fallback for browsers without dvh
  // height: '82vh',
  display: 'flex', flexDirection: 'column',
  animationName: slideUp,
  animationDuration: '0.25s',
  animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  animationFillMode: 'forwards',
  // NO overflow:hidden here — that was killing the scroll area height measurement
 },
 sheetClosing: {
  animationName: slideDown, animationDuration: '0.2s',
  animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  animationFillMode: 'forwards',
 },

 handleArea: {
  paddingTop: 12, paddingBottom: 8, flexShrink: 0,
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  cursor: 'grab', touchAction: 'none', userSelect: 'none',
  ':active': { cursor: 'grabbing' },
 },
 handle: {
  width: 48, height: 5,
  backgroundColor: 'var(--text-muted)',
  borderRadius: 3, opacity: 0.5,
 },

 header: {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingBottom: 10, paddingLeft: 16, paddingRight: 16, flexShrink: 0,
 },
 title: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
 closeBtn: {
  width: 32, height: 32, borderRadius: '50%',
  borderWidth: 0, borderStyle: 'solid',
  backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 14,
  ':active': { backgroundColor: 'var(--border)' },
 },

 searchWrap: {
  paddingBottom: 8, paddingLeft: 16, paddingRight: 16, flexShrink: 0,
 },
 searchInput: {
  width: '100%', padding: '9px 14px 9px 36px',
  borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
  backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: '12px center',
  transition: 'border-color 0.15s ease',
  '::placeholder': { color: 'var(--text-muted)' },
  ':focus': { borderColor: 'var(--button-primary)' },
 },

 categoryTabs: {
  display: 'flex', overflowX: 'auto',
  paddingLeft: 8, paddingRight: 8, paddingBottom: 6,
  gap: 2, flexShrink: 0, scrollbarWidth: 'none',
  borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)',
  '::-webkit-scrollbar': { display: 'none' },
 },
 catTab: {
  width: 36, height: 36, borderWidth: 0, borderStyle: 'solid',
  borderRadius: 8, backgroundColor: 'transparent',
  fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, transition: 'background 0.15s',
  ':active': { backgroundColor: 'var(--bg-tertiary)' },
 },
 catTabActive: { backgroundColor: 'var(--bg-tertiary)' },

 // flex:1 + minHeight:0 is the correct way to make a flex child scrollable
 scrollArea: {
  flex: 1,
  minHeight: 0,       // <-- THIS is what was missing. Without it, flex children
  //     don't shrink below their content size, so the area
  //     expands past the sheet and gets clipped.
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--border) transparent',
 },

 categoryHeader: {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 12px',
  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--border)',
  cursor: 'pointer', userSelect: 'none',
 },

 emojiBtn: {
  // No fixed width — flex:1 on the <li> + width:100% on the button fills the row
  height: 46,
  borderWidth: 0, borderStyle: 'solid',
  backgroundColor: 'transparent',
  borderRadius: 8, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.1s ease, transform 0.12s ease',
  ':active': { backgroundColor: 'var(--bg-tertiary)', transform: 'scale(0.85)' },
 },
});