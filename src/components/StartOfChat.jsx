import React from 'react';
import styles from './StartOfChat.module.css';

const StartOfChat = ({ contact, onProfileClick, API_BASE_URL }) => {
 return (
  <div className={styles.startOfChat}>
   <div
    className={styles.avatar}
    onClick={() => onProfileClick(contact)}
   >
    <img
     src={
      contact.avatar_url
       ? `${API_BASE_URL}${contact.avatar_url}`
       : "/resources/default_avatar.png"
     }
     alt={contact.username}
    />
   </div>
   <h1 className={styles.username}>{contact.username}</h1>
   <p className={styles.handle}>@{contact.handle}</p>
   <p className={styles.message}>
    Your conversation with {contact.username} has started here!
   </p>
   <div className={styles.separator}></div>
  </div>
 );
};

export default StartOfChat;