import React from 'react';
import styles from '../../index.module.css';

const IncomingCallNotification = ({ callState, API_BASE_URL, onAnswer, onDecline }) => {
 return (
  <div className={styles.incomingCallNotification}>
   <div className={styles.incomingCallContent}>
    <div className={styles.incomingCallInfo}>
     <img
      draggable="false"
      src={
       callState.contact?.avatar_url
        ? `${API_BASE_URL}${callState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={callState.contact?.username}
      className={styles.incomingCallAvatar}
     />
     <div className={styles.incomingCallText}>
      <h4>{callState.contact?.username}</h4>
      <p>
       Incoming {callState.type === "video" ? "video" : "audio"} call
      </p>
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

export default IncomingCallNotification;