import { createPortal } from "react-dom";
import * as stylex from "@stylexjs/stylex";
import { ModalForUnverifiedUsersStyles as styles } from "../styles/modal_for_unverified_users";

const ModalForUnverifiedUsers = ({ onClose }) => {
 return createPortal(
  <div {...stylex.props(styles.verificationModalOverlay)}>
   <div
    {...stylex.props(styles.verificationModalContent)}
    onClick={(e) => e.stopPropagation()}
   >
    <div {...stylex.props(styles.modalHeader)}>
     <i
      className="fas fa-exclamation-triangle"
      style={{ marginRight: "10px", color: "#f59e0b", fontSize: "28px" }}
     ></i>
     <h3 {...stylex.props(styles.modalHeaderTitle)}>Email Verification Required</h3>
    </div>

    <div {...stylex.props(styles.modalBody)}>
     <p {...stylex.props(styles.mainMessage)}>
      Your account is currently{" "}
      <strong className={stylex.props(styles.mainMessageStrong).className}>
       unverified
      </strong>
      . Please verify your email address to unlock all features and ensure account security.
     </p>

     <div {...stylex.props(styles.benefitsBox)}>
      <h4 {...stylex.props(styles.benefitsTitle)}>If you verify:</h4>
      <ul {...stylex.props(styles.benefitsList)}>
       <li {...stylex.props(styles.benefitsItem)}>
        <i
         className={"fas fa-check-circle " + stylex.props(styles.benefitsItemIcon).className}
        ></i>
        Have more trust with users.
       </li>
       <li {...stylex.props(styles.benefitsItem)}>
        <i
         className={"fas fa-check-circle " + stylex.props(styles.benefitsItemIcon).className}
        ></i>
        Less likely to falsely get flagged as a bot/scammer
       </li>
       <li {...stylex.props(styles.benefitsItem)}>
        <i
         className={"fas fa-check-circle " + stylex.props(styles.benefitsItemIcon).className}
        ></i>
        Will not see this popup again
       </li>
       <li {...stylex.props(styles.benefitsItem, styles.benefitsItemLast)}>
        <i
         className={"fas fa-check-circle " + stylex.props(styles.benefitsItemIcon).className}
        ></i>
        You will not seen as sketchy.
       </li>
      </ul>
     </div>

     <p {...stylex.props(styles.warningText)}>
      <i className="fas fa-info-circle" style={{ marginRight: "6px" }}></i>
      This popup will continue to appear until you verify your email!
     </p>
     <p {...stylex.props(styles.warningText)}>
      <i className="fas fa-info-circle" style={{ marginRight: "6px" }}></i>
      Unfortunately, the email can take 5 or even more minutes to arrive, sorry for that :(
     </p>
    </div>

    <div {...stylex.props(styles.modalActions)}>
     <button {...stylex.props(styles.modalClose)} onClick={onClose} type="button">
      <i className="fas fa-times" style={{ marginRight: "6px" }}></i>Later
     </button>
     <a href="/verify" {...stylex.props(styles.modalVerify)}>
      <i className="fas fa-envelope-open-text" style={{ marginRight: "6px" }}></i>Verify Now
     </a>
    </div>
   </div>
  </div>,
  document.body
 );
};

export default ModalForUnverifiedUsers;
