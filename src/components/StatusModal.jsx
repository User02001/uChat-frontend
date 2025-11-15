import React from 'react';
import styles from './StatusModal.module.css';

const StatusModal = ({ onClose, onSelectStatus, currentStatus }) => {
 const statuses = [
  {
   value: 'online',
   label: 'Available',
   icon: 'circle',
   iconType: 'fa',
   color: '#4caf50',
   description: 'Ready to chat'
  },
  {
   value: 'away',
   label: 'Inactive',
   icon: '/resources/icons/away-icon.svg',
   iconType: 'svg',
   color: '#ff9800',
   description: 'Not doing anything (AFK)'
  },
  {
   value: 'offline',
   label: 'Appear Offline',
   icon: 'circle',
   iconType: 'fa-outline',
   color: '#9e9e9e',
   description: 'Invisible to other people'
  }
 ];

 return (
  <div className={styles.modalOverlay} onClick={onClose}>
   <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
    <div className={styles.modalHeader}>
     <h3>Set Your Status</h3>
     <button className={styles.closeBtn} onClick={onClose}>
      <i className="fas fa-times"></i>
     </button>
    </div>
    <div className={styles.statusList}>
     {statuses.map((status) => (
      <button
       key={status.value}
       className={`${styles.statusItem} ${currentStatus === status.value ? styles.active : ''}`}
       onClick={() => {
        onSelectStatus(status.value);
        onClose();
       }}
      >
       <div className={styles.statusIcon}>
        {status.iconType === 'svg' ? (
         <img src={status.icon} alt={status.label} style={{ width: '24px', height: '24px' }} />
        ) : status.iconType === 'fa-outline' ? (
         <i className="fas fa-circle" style={{ color: status.color, fontSize: '20px', opacity: 0.5 }}></i>
        ) : (
         <i className={`fas fa-${status.icon}`} style={{ color: status.color, fontSize: '20px' }}></i>
        )}
       </div>
       <div className={styles.statusInfo}>
        <div className={styles.statusLabel}>{status.label}</div>
        <div className={styles.statusDescription}>{status.description}</div>
       </div>
       {currentStatus === status.value && (
        <i className="fas fa-check" style={{ color: 'var(--button-primary)', marginLeft: 'auto' }}></i>
       )}
      </button>
     ))}
    </div>
   </div>
  </div>
 );
};

export default StatusModal;