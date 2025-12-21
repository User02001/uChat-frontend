// src/components/UnverifiedUserWarningModal.jsx
import { createPortal } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import { UnverifiedUserWarningModalStyles as styles } from "../styles/unverified_user_warning_modal";
import Icon from "./Icon";

const UnverifiedUserWarningModal = ({ username, onClose }) => {
 return createPortal(
  <div {...stylex.props(styles.unverifiedModalOverlay)} onClick={onClose}>
   <div
    {...stylex.props(styles.unverifiedModalContent)}
    onClick={(e) => e.stopPropagation()}
   >
    <h3 {...stylex.props(styles.title)}>
     <Icon
      name="unverified"
      alt="Unverified"
      className={stylex.props(styles.unverifiedIcon).className}
     />
     Unverified User
    </h3>

    <p {...stylex.props(styles.paragraph)}>
     <strong>{username}</strong> has not verified their email address.
    </p>

    <div {...stylex.props(styles.unverifiedWarningBox)}>
     <p {...stylex.props(styles.warningBoxTitle)}>
      <strong>Here is what it means:</strong>
     </p>

     <ul {...stylex.props(styles.warningList)}>
      <li {...stylex.props(styles.warningListItem)}>
       This user hasn't verified their email address.
      </li>
      <li {...stylex.props(styles.warningListItem)}>This person could be sketchy.</li>
      <li {...stylex.props(styles.warningListItem)}>
       This could be a bot/scam account.
      </li>
      <li {...stylex.props(styles.warningListItem)}>
       You should not give them ANY personal information or such unless you know them
       personally!
      </li>
     </ul>
    </div>

    <p {...stylex.props(styles.unverifiedInfo)}>
     Verified users won't have that broken lock icon in their contact. Learn more at the help
     page.
    </p>

    <div {...stylex.props(styles.modalActions)}>
     <button {...stylex.props(styles.modalClose)} onClick={onClose}>
      Got it
     </button>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default UnverifiedUserWarningModal;
