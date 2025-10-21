import { createPortal } from 'react-dom';
import './DeleteModal.css';

const DeleteModal = ({ message, onClose, onConfirm }) => {
 const handleDelete = async () => {
  await onConfirm(message.id);
  onClose();
 };

 const preview =
  message?.deleted
   ? 'This message has been DELETED.'
   : message?.message_type === 'file'
    ? (message.file_name ? `📎 ${message.file_name}` : '📎 File')
    : message?.message_type === 'image'
     ? '📷 Image'
     : (message?.content ?? '').trim().length > 0
      ? message.content.length > 120
       ? message.content.substring(0, 120) + '...'
       : message.content
      : '[Empty message]';

 return createPortal(
  <div className="delete-modal-overlay" onClick={onClose}>
   <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
    <h3>
     <i className="fas fa-trash-alt" style={{ marginRight: '8px', color: '#ff4757' }}></i>
     Delete Message
    </h3>
    <p>Are you sure you want to delete this message?</p>

    <div className="delete-preview-box">
     <div className="delete-preview-content">{preview}</div>
    </div>

    <p className="delete-warning">
     The message will be permanently DELETED, and this is NOT reversible.
    </p>

    <div className="modal-actions">
     <button className="modal-cancel" onClick={onClose}>
      <i className="fas fa-times" style={{ marginRight: '6px' }}></i>Cancel
     </button>
     <button className="modal-delete" onClick={handleDelete}>
      <i className="fas fa-trash" style={{ marginRight: '6px' }}></i>Delete
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default DeleteModal;
