import React from 'react';
import styles from '../../index.module.css';

const IncomingScreenshareNotification = ({ screenshareState, API_BASE_URL, onAnswer, onDecline }) => {
 return (
  <div className={styles.incomingCallNotification}>
   <div className={styles.incomingCallContent}>
    <div className={styles.incomingCallInfo}>
     <img
      draggable="false"
      src={
       screenshareState.contact?.avatar_url
        ? `${API_BASE_URL}${screenshareState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={screenshareState.contact?.username}
      className={styles.incomingCallAvatar}
     />
     <div className={styles.incomingCallText}>
      <h4>{screenshareState.contact?.username}</h4>
      <p>Wants to share their screen</p>
     </div>
    </div>
    <div className={styles.incomingCallActions}>
     <button
      className={styles.declineBtnSmall}
      onClick={onDecline}
      title="Decline"
     ></button>
     <button
      className={styles.acceptBtnSmall}
      onClick={onAnswer}
      title="Accept"
     ></button>
    </div>
   </div>
  </div>
 );
};

export default IncomingScreenshareNotification;