import * as stylex from '@stylexjs/stylex';

const spin = stylex.keyframes({
 '0%': { transform: 'rotate(0deg)' },
 '100%': { transform: 'rotate(360deg)' },
});

const mobile = '@media (max-width: 768px)';
const tablet = '@media (max-width: 1024px)';
const desktop = '@media (max-width: 2000px)';

export const styles = stylex.create({
 loadingSpinner: {
  width: 'min(50vmin, 420px)',
  height: 'min(50vmin, 420px)',
  willChange: 'contents',
  transform: 'translateZ(0)',
  '@media (max-width: 768px)': {
   width: 'min(85vmin, 420px)',
   height: 'min(85vmin, 420px)',
   marginBottom: '125px',
  },
 },
 loadingSpinnerCanvas: {
  willChange: 'transform',
 },
 loadingSpinnerNoTransition: {
  transitionProperty: 'none',
  transitionDuration: '0s',
  transitionTimingFunction: 'ease',
  transitionDelay: '0s',
 },
 splashBranding: {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'clamp(6px, 1.5vh, 10px)',
  padding: '0 20px',
  width: '100%',
  boxSizing: 'border-box',
  bottom: {
   default: null,
   [desktop]: '5vh',
   [tablet]: '8vh',
   [mobile]: '12vh',
  },
 },
 splashBrandingText: {
  fontSize: 'clamp(10px, 2.5vw, 14px)',
  color: '#808080',
  fontWeight: 400,
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'nowrap',
 },
 splashBrandingLogo: {
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(4px, 1.5vw, 8px)',
  justifyContent: 'center',
  flexWrap: 'nowrap',
  '@media (max-width: 768px)': {
   marginBottom: '50px',
  },
 },
 splashBrandingIcon: {
  width: 'clamp(20px, 5vw, 32px)',
  height: 'clamp(20px, 5vw, 32px)',
  flexShrink: 0,
 },
 splashBrandingName: {
  fontSize: 'clamp(14px, 3.5vw, 20px)',
  fontWeight: 600,
  color: '#808080',
  margin: 0,
  whiteSpace: 'nowrap',
  '@media (max-width: 768px)': {
   fontSize: 'clamp(16px, 4.5vw, 24px)',
  },
 },

 paginationSpinnerWrapper: {
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  pointerEvents: 'none',
 },
 paginationSpinner: {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  borderTop: '2px solid var(--button-primary)',
  borderRight: '2px solid transparent',
  borderBottom: '2px solid transparent',
  borderLeft: '2px solid transparent',
  animationName: spin,
  animationDuration: '0.7s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
 },
});