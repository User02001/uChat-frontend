import * as stylex from '@stylexjs/stylex';

const fadeIn = stylex.keyframes({
 '0%': { opacity: 0 },
 '100%': { opacity: 1 },
});

const slideIn = stylex.keyframes({
 '0%': { opacity: 0, transform: 'translateY(-30px) scale(0.9)' },
 '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const pulse = stylex.keyframes({
 '0%, 100%': { opacity: 1 },
 '50%': { opacity: 0.5 },
});

export const styles = stylex.create({
 // Container
 container: {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontFamily: '"Google Sans Flex", system-ui, sans-serif',
  fontOpticalSizing: 'auto',
  fontWeight: 600,
  fontStyle: 'normal',
 },

 // Sidebar
 sidebar: {
  width: '288px',
  backgroundColor: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width: 768px)': {
   width: '100%',
   height: 'auto',
  },
 },

 sidebarHeader: {
  padding: '24px',
  borderBottom: '1px solid var(--border)',
 },

 sidebarBrand: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  userSelect: 'none',
 },

 sidebarLogo: {
  width: '32px',
  height: '32px',
  flexShrink: 0,
 },

 sidebarTitle: {
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
 },

 sidebarSubtitle: {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  margin: '4px 0 0 0',
 },

 // Navigation
 nav: {
  flex: 1,
  padding: '16px',
 },

 navList: {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  '@media (max-width: 768px)': {
   display: 'flex',
   overflowX: 'auto',
   gap: '8px',
  },
 },

 navItem: {
  marginBottom: '8px',
  '@media (max-width: 768px)': {
   marginBottom: 0,
   flexShrink: 0,
  },
 },

 navButton: {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: 'var(--text-secondary)',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',
  textDecoration: 'none',
  fontFamily: 'inherit',
  fontSize: '14px',
  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   color: 'var(--text-primary)',
  },
 },

 navButtonActive: {
  backgroundColor: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  boxShadow: '0 2px 4px var(--shadow)',
 },

 navButtonDanger: {
  color: '#ff4757',
  ':hover': {
   backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
 },

 navLabel: {
  fontWeight: 500,
 },

 // Sidebar Footer
 sidebarFooter: {
  padding: '16px',
  borderTop: '1px solid var(--border)',
 },

 sidebarUser: {
  display: 'flex',
  alignItems: 'center',
 },

 sidebarAvatar: {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--border)',
 },

 sidebarUserInfo: {
  marginLeft: '12px',
 },

 sidebarUsername: {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  margin: 0,
 },

 sidebarHandle: {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  margin: 0,
 },

 // Main Content
 main: {
  flex: 1,
  overflow: 'hidden',
 },

 mainHeader: {
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
  padding: '24px 32px',
  '@media (max-width: 768px)': {
   padding: '16px 20px',
  },
 },

 headerContent: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '@media (max-width: 768px)': {
   flexDirection: 'column',
   alignItems: 'flex-start',
   gap: '16px',
  },
 },

 headerInfo: {
  flex: 1,
 },

 headerTitle: {
  fontSize: '24px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
 },

 headerSubtitle: {
  color: 'var(--text-secondary)',
  margin: '4px 0 0 0',
  fontSize: '14px',
 },

 editButton: {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  backgroundColor: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px var(--shadow)',
  ':hover': {
   backgroundColor: 'var(--button-primary-hover)',
  },
 },

 // Content Area
 contentArea: {
  padding: '32px',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 140px)',
  '@media (max-width: 768px)': {
   padding: '20px',
  },
 },

 contentWrapper: {
  maxWidth: '1024px',
 },

 // Section Card
 sectionCard: {
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '16px',
  padding: '32px',
  marginBottom: '32px',
  border: '1px solid var(--border)',
  boxShadow: '0 2px 8px var(--shadow-light)',
 },

 sectionTitle: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: '0 0 24px 0',
 },

 // Profile Picture Section
 pictureContent: {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  '@media (max-width: 768px)': {
   flexDirection: 'column',
   textAlign: 'center',
   gap: '24px',
  },
 },

 avatarContainer: {
  position: 'relative',
 },

 avatar: {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '4px solid var(--border)',
 },

 avatarEditButton: {
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  backgroundColor: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  border: 'none',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 8px var(--shadow)',
  fontSize: '14px',
  ':hover': {
   backgroundColor: 'var(--button-primary-hover)',
  },
 },

 pictureInfo: {
  flex: 1,
 },

 pictureTitle: {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: '0 0 8px 0',
 },

 pictureSubtitle: {
  color: 'var(--text-secondary)',
  margin: '0 0 16px 0',
  fontSize: '14px',
 },

 onlineStatus: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
 },

 statusIndicator: {
  width: '12px',
  height: '12px',
  backgroundColor: 'var(--online-indicator)',
  borderRadius: '50%',
  animationName: pulse,
  animationDuration: '2s',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
 },

 statusText: {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
 },

 // Form Fields
 infoGrid: {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  '@media (min-width: 768px)': {
   gridTemplateColumns: '1fr 1fr',
  },
 },

 fullWidth: {
  '@media (min-width: 768px)': {
   gridColumn: '1 / -1',
  },
 },

 fieldLabel: {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '8px',
 },

 fieldInput: {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  ':focus': {
   outline: 'none',
   borderColor: 'var(--button-primary)',
   boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)',
  },
 },

 fieldDisplay: {
  padding: '12px 16px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '16px',
 },

 // Action Buttons
 actionButtons: {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '16px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid var(--border)',
  '@media (max-width: 768px)': {
   flexDirection: 'column',
  },
 },

 actionButton: {
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 500,
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
 },

 cancelButton: {
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   color: 'var(--text-primary)',
  },
 },

 saveButton: {
  backgroundColor: 'var(--button-primary)',
  color: 'var(--button-primary-text)',
  boxShadow: '0 2px 4px var(--shadow)',
  ':hover': {
   backgroundColor: 'var(--button-primary-hover)',
  },
 },

 // Stats Section
 statsGrid: {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  '@media (min-width: 768px)': {
   gridTemplateColumns: 'repeat(3, 1fr)',
  },
 },

 statCard: {
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid var(--border)',
  textAlign: 'center',
  boxShadow: '0 2px 8px var(--shadow-light)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  ':hover': {
   boxShadow: '0 4px 16px var(--shadow)',
   transform: 'translateY(-2px)',
  },
 },

 statNumber: {
  fontSize: '32px',
  fontWeight: 700,
  color: 'var(--button-primary)',
  marginBottom: '8px',
 },

 statLabel: {
  color: 'var(--text-secondary)',
  fontSize: '14px',
 },

 // Modal
 modalOverlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  animationName: fadeIn,
  animationDuration: '0.3s',
  animationTimingFunction: 'ease-out',
 },

 modal: {
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0 25px 80px var(--shadow)',
  position: 'relative',
  animationName: slideIn,
  animationDuration: '0.3s',
  animationTimingFunction: 'ease-out',
 },

 modalHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderBottom: '1px solid var(--border)',
 },

 modalTitle: {
  margin: 0,
  color: '#ff4757',
  fontSize: '1.5rem',
  fontWeight: 700,
 },

 modalClose: {
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '5px',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
  ':hover': {
   backgroundColor: 'var(--bg-tertiary)',
   color: 'var(--text-primary)',
  },
 },

 modalContent: {
  padding: '20px',
 },

 warningSection: {
  textAlign: 'center',
  marginBottom: '30px',
 },

 warningTitle: {
  color: '#ff4757',
  margin: '0 0 15px 0',
  fontSize: '1.2rem',
  fontWeight: 700,
 },

 warningText: {
  color: 'var(--text-secondary)',
  marginBottom: '15px',
  fontSize: '14px',
 },

 warningList: {
  textAlign: 'left',
  color: 'var(--text-secondary)',
  margin: 0,
  paddingLeft: '20px',
  fontSize: '14px',
 },

 warningListItem: {
  marginBottom: '8px',
 },

 confirmationSection: {
  marginBottom: '20px',
 },

 confirmationLabel: {
  display: 'block',
  marginBottom: '10px',
  color: 'var(--text-primary)',
  fontWeight: 500,
  fontSize: '14px',
 },

 confirmationInput: {
  width: '100%',
  padding: '12px 16px',
  border: '2px solid var(--border)',
  borderRadius: '8px',
  fontSize: '1rem',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
  ':focus': {
   outline: 'none',
   borderColor: '#ff4757',
  },
 },

 modalActions: {
  display: 'flex',
  gap: '15px',
  padding: '20px',
  borderTop: '1px solid var(--border)',
 },

 modalButton: {
  flex: 1,
  padding: '12px 20px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
 },

 modalCancelButton: {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  ':hover:not(:disabled)': {
   backgroundColor: 'var(--bg-tertiary)',
  },
 },

 modalConfirmButton: {
  backgroundColor: '#ff4757',
  color: 'white',
  ':hover:not(:disabled)': {
   backgroundColor: '#ff3838',
  },
  ':disabled': {
   backgroundColor: '#ccc',
   cursor: 'not-allowed',
   opacity: 0.6,
  },
 },
});