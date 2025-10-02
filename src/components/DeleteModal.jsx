import { createPortal } from 'react-dom';
import './DeleteModal.css';

const DeleteModal = ({ messageId, onClose, onConfirm }) => {
 const handleDelete = async () => {
  await onConfirm(messageId);
  onClose();
 };

 return createPortal(
  <div className="delete-modal-overlay" onClick={onClose}>
   <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
    <h3>Delete Message</h3>
    <p>Are you sure you want to delete this message?</p>
    <p className="delete-warning">The message will be permanently DELETED, and this action is NOT reversible.</p>
    <div className="modal-actions">
     <button className="modal-cancel" onClick={onClose}>
      Cancel
     </button>
     <button className="modal-delete" onClick={handleDelete}>
      Delete
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default DeleteModal;