import React from 'react';
import styles from './StatusModal.module.css';
import Icon from './Icon';

const StatusModal = ({ onClose, onSelectStatus, currentStatus }) => {
 const statuses = [
  {
   value: 'online',
   label: 'Available',
   icon: {
    type: 'fa',
    name: 'circle'
   },
   color: '#4caf50',
   description: 'Ready to chat'
  },
  {
   value: 'away',
   label: 'Inactive',
   icon: {
    type: 'icon',
    name: 'away-icon' // maps to your Icon system
   },
   color: '#ff9800',
   description: 'Not doing anything (AFK)'
  },
  {
   value: 'offline',
   label: 'Appear Offline',
   icon: {
    type: 'fa-outline',
    name: 'circle'
   },
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
        <div className={styles.statusIcon}>
         {status.icon.type === 'icon' && (
          <Icon
           name={status.icon.name}
           alt={status.label}
           draggable={false}
           style={{ width: 24, height: 24 }}
          />
         )}

         {status.icon.type === 'fa' && (
          <i
           className={`fas fa-${status.icon.name}`}
           style={{ color: status.color, fontSize: 20 }}
          />
         )}

         {status.icon.type === 'fa-outline' && (
          <i
           className={`fas fa-${status.icon.name}`}
           style={{ color: status.color, fontSize: 20, opacity: 0.5 }}
          />
         )}
        </div>
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