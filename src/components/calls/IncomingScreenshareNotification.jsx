import React from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

const IncomingScreenshareNotification = ({ screenshareState, API_BASE_URL, onAnswer, onDecline }) => {
 return (
  <div {...stylex.props(styles.incomingCallNotification)}>
   <div {...stylex.props(styles.incomingCallContent)}>
    <div {...stylex.props(styles.incomingCallInfo)}>
     <img
      draggable="false"
      src={
       screenshareState.contact?.avatar_url
        ? `${API_BASE_URL}${screenshareState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={screenshareState.contact?.username}
      {...stylex.props(styles.incomingCallAvatar)}
     />
     <div {...stylex.props(styles.incomingCallText)}>
      <h4 {...stylex.props(styles.incomingCallTextH4)}>{screenshareState.contact?.username}</h4>
      <p {...stylex.props(styles.incomingCallTextP)}>is calling you!!</p>
     </div>
    </div>
    <div {...stylex.props(styles.incomingCallActions)}>
     <button
      {...stylex.props(styles.declineBtnSmall, styles.declineBtnSmallHover, styles.btnSmallActive)}
      onClick={onDecline}
      title="Decline"
     >
      <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
     </button>
     <button
      {...stylex.props(styles.acceptBtnSmall, styles.acceptBtnSmallHover, styles.btnSmallActive)}
      onClick={onAnswer}
      title="Accept"
     >
      <i className="fas fa-phone"></i>
     </button>
    </div>
   </div>
  </div>
 );
};

export default IncomingScreenshareNotification;