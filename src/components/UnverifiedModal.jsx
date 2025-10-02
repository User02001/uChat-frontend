import { createPortal } from 'react-dom';
import './UnverifiedModal.css';

const UnverifiedModal = ({ username, onClose }) => {
 return createPortal(
  <div className="unverified-modal-overlay" onClick={onClose}>
   <div className="unverified-modal-content" onClick={(e) => e.stopPropagation()}>
    <h3>
     <img
      src="/resources/broken-lock.svg"
      alt="Unverified"
      className="unverified-icon"
     />
     Unverified User
    </h3>
    <p><strong>{username}</strong> has not verified their email address.</p>
    <div className="unverified-warning-box">
     <p><strong>What does this mean?</strong></p>
     <ul>
      <li>This user hasn't confirmed their email address</li>
      <li>They can't be trusted</li>
      <li>This could be a bot/scam account</li>
      <li>Don't give them ANY personal information or such unless you know them</li>
     </ul>
    </div>
    <p className="unverified-info">
     Verified users won't have this broken lock (
     <img
      src="/resources/broken-lock.svg"
      alt="Unverified"
      className="unverified-icon-modal1"
     />
     ) icon in their contact. Learn more at the help page.
    </p>
    <div className="modal-actions">
     <button className="modal-close" onClick={onClose}>
      Got it
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default UnverifiedModal;