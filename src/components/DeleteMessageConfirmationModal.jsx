import { createPortal } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import { DeleteMessageConfirmationModalStyles as styles } from "../styles/delete_message_confirmation_modal";

const DeleteMessageConfirmationModal = ({ message, onClose, onConfirm }) => {
 const handleDelete = async () => {
  await onConfirm(message.id);
  onClose();
 };

 const preview =
  message?.deleted
   ? "This message has been deleted."
   : message?.message_type === "file"
    ? message.file_name
     ? `📎 ${message.file_name}`
     : "📎 File"
    : message?.message_type === "image"
     ? "📷 Image"
     : (message?.content ?? "").trim().length > 0
      ? message.content.length > 120
       ? message.content.substring(0, 120) + "..."
       : message.content
      : "[Empty message]";

 return createPortal(
  <div {...stylex.props(styles.overlay)} onClick={onClose}>
   <div {...stylex.props(styles.content)} onClick={(e) => e.stopPropagation()}>
    <h3 {...stylex.props(styles.title)}>
     <i
      className={
       stylex.props(styles.iconTrashAlt).className + " fas fa-trash-alt"
      }
     />
     Delete Message
    </h3>

    <p {...stylex.props(styles.paragraph)}>Are you sure you want to delete this message?</p>

    <div {...stylex.props(styles.previewBox)}>
     <div {...stylex.props(styles.previewContent)}>{preview}</div>
    </div>

    <p {...stylex.props(styles.warning)}>
     This message will be permanently deleted, and this action is NOT reversible. Keep in mind the other person can still see that you have deleted a message!
    </p>

    <div {...stylex.props(styles.actions)}>
     <button
      {...stylex.props(styles.buttonBase, styles.cancel)}
      onClick={onClose}
      type="button"
     >
      <i
       className={stylex.props(styles.iconInline).className + " fas fa-times"}
      />
      Cancel
     </button>

     <button
      {...stylex.props(styles.buttonBase, styles.delete)}
      onClick={handleDelete}
      type="button"
     >
      <i
       className={stylex.props(styles.iconInline).className + " fas fa-trash"}
      />
      Delete
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default DeleteMessageConfirmationModal;
