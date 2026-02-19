import * as stylex from '@stylexjs/stylex';

export const AttachmentPreviewStyles = stylex.create({
 container: {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '10px 14px',
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'var(--border)',
  backgroundColor: 'var(--bg-secondary)',
 },

 item: {
  position: 'relative',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-tertiary)',
  flexShrink: 0,
 },

 imageItem: {
  width: '80px',
  height: '80px',
 },

 fileItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  maxWidth: '200px',
  height: '52px',
 },

 thumbnail: {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
 },

 fileIcon: {
  fontSize: '22px',
  flexShrink: 0,
  color: 'var(--button-primary)',
 },

 fileInfo: {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
 },

 fileName: {
  fontSize: '12px',
  fontWeight: '500',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '120px',
 },

 fileSize: {
  fontSize: '11px',
  color: 'var(--text-secondary)',
 },

 cancelBtn: {
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  padding: 0,
  lineHeight: 1,
  zIndex: 2,
  ':hover': {
   backgroundColor: 'rgba(220,38,38,0.85)',
  },
 },

 cancelBtnFile: {
  position: 'relative',
  top: 'unset',
  right: 'unset',
  flexShrink: 0,
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  ':hover': {
   backgroundColor: 'transparent',
   color: '#dc2626',
  },
 },

 progressOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '4px',
  backgroundColor: 'rgba(0,0,0,0.2)',
  zIndex: 3,
 },

 progressBar: {
  height: '100%',
  backgroundColor: 'var(--button-primary)',
  transitionProperty: 'width',
  transitionDuration: '0.2s',
  transitionTimingFunction: 'ease',
 },

 uploadingOverlay: {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
 },

 errorOverlay: {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(220,38,38,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  fontSize: '10px',
  color: '#fff',
  padding: '4px',
  textAlign: 'center',
 },
});