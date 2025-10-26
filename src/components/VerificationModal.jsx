import { createPortal } from 'react-dom';
import styles from './VerificationModal.module.css';

const VerificationModal = ({ onClose }) => {
 return createPortal(
  <div className={styles.verificationModalOverlay}>
   <div className={styles.verificationModalContent} onClick={(e) => e.stopPropagation()}>
    <div className={styles.modalHeader}>
     <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px', color: '#f59e0b', fontSize: '28px' }}></i>
     <h3>Email Verification Required</h3>
    </div>

    <div className={styles.modalBody}>
     <p className={styles.mainMessage}>
      Your account is currently <strong>unverified</strong>. Please verify your email address to unlock all features and ensure account security.
     </p>

     <div className={styles.benefitsBox}>
      <h4>Benefits of verification:</h4>
      <ul>
       <li><i className="fas fa-check-circle"></i> More trust with users</li>
       <li><i className="fas fa-check-circle"></i> Less likely to falsely get flagged as a bot/scammer</li>
       <li><i className="fas fa-check-circle"></i> Will not see this popup again</li>
       <li><i className="fas fa-check-circle"></i> Priority support</li>
      </ul>
     </div>

     <p className={styles.warningText}>
      <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
      This popup will continue to appear until you verify your email.
     </p>
    </div>

    <div className={styles.modalActions}>
     <button className={styles.modalClose} onClick={onClose}>
      <i className="fas fa-times" style={{ marginRight: '6px' }}></i>Later
     </button>
     <a href="/verify" className={styles.modalVerify}>
      <i className="fas fa-envelope-open-text" style={{ marginRight: '6px' }}></i>Verify Now
     </a>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default VerificationModal;