import { createPortal } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import { NewDeviceModalStyles as styles } from "../styles/new_device_modal";

const NewDeviceModal = ({ session, onAcknowledge, onRevoke }) => {
 return createPortal(
  <div {...stylex.props(styles.overlay)}>
   <div
    {...stylex.props(styles.modal)}
    onClick={(e) => e.stopPropagation()}
   >
    <div {...stylex.props(styles.header)}>
     <i className={`fa-solid fa-question ${stylex.props(styles.headerIcon).className}`} />
     <h3 {...stylex.props(styles.headerTitle)}>New Device Detected</h3>
    </div>

    <div {...stylex.props(styles.body)}>
     <p {...stylex.props(styles.description)}>
      Someone just logged into your account from a new device. If this was you, you can safely dismiss this. If not, log them out immediately!
     </p>

     <div {...stylex.props(styles.infoBox)}>
      <div {...stylex.props(styles.infoRow)}>
       <i className={`fas fa-desktop ${stylex.props(styles.infoIcon).className}`} />
       <span {...stylex.props(styles.infoLabel)}>Device:</span>
       <span {...stylex.props(styles.infoValue)}>
        {session?.user_agent || "Unknown Device"}
       </span>
      </div>
      {session?.ip_address && (
       <div {...stylex.props(styles.infoRow, styles.infoRowLast)}>
        <i className={`fas fa-map-marker-alt ${stylex.props(styles.infoIcon).className}`} />
        <span {...stylex.props(styles.infoLabel)}>IP Address:</span>
        <span {...stylex.props(styles.infoValue)}>{session.ip_address}</span>
       </div>
      )}
     </div>

     <p {...stylex.props(styles.warningText)}>
      <i className="fas fa-info-circle" />
      Revoking will immediately log that device out.
     </p>
    </div>

    <div {...stylex.props(styles.actions)}>
     <button
      {...stylex.props(styles.btnBase, styles.btnAcknowledge)}
      onClick={() => onAcknowledge(session?.id)}
      type="button"
     >
      <i className="fas fa-check" />
      Yes, it was me
     </button>
     <button
      {...stylex.props(styles.btnBase, styles.btnRevoke)}
      onClick={() => onRevoke(session?.id)}
      type="button"
     >
      <i className="fas fa-ban" />
      Not me! Log them out!
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default NewDeviceModal;