import { createPortal } from "react-dom";
import styles from "./UnverifiedModal.module.css";

const UnverifiedModal = ({ username, onClose }) => {
 return createPortal(
  <div className={styles.unverifiedModalOverlay} onClick={onClose}>
   <div
    className={styles.unverifiedModalContent}
    onClick={(e) => e.stopPropagation()}
   >
    <h3>
     <img
      src="/resources/icons/unverified.svg"
      alt="Unverified"
      className={styles.unverifiedIcon}
     />
     Unverified User
    </h3>
    <p>
     <strong>{username}</strong> has not verified their email address.
    </p>
    <div className={styles.unverifiedWarningBox}>
     <p>
      <strong>What does this mean?</strong>
     </p>
     <ul>
      <li>This user hasn't confirmed their email address</li>
      <li>They can't be trusted</li>
      <li>This could be a bot/scam account</li>
      <li>
       Don't give them ANY personal information or such unless you know
       them
      </li>
     </ul>
    </div>
    <p className={styles.unverifiedInfo}>
     Verified users won't have this broken lock (
     <img
      src="/resources/icons/unverified.svg"
      alt="Unverified"
      className={styles.unverifiedIconModal1}
     />
     ) icon in their contact. Learn more at the help page.
    </p>
    <div className={styles.modalActions}>
     <button className={styles.modalClose} onClick={onClose}>
      Got it
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default UnverifiedModal;
