import React from "react";
import * as stylex from "@stylexjs/stylex";
import { StartOfChatStyles as styles } from "../styles/start_of_chat";

const StartOfChat = ({ contact, onProfileClick, API_BASE_URL }) => {
 return (
  <div {...stylex.props(styles.startOfChat)}>
   <div {...stylex.props(styles.avatar)} onClick={() => onProfileClick(contact)}>
    <img
     src={
      contact.avatar_url
       ? `${API_BASE_URL}${contact.avatar_url}`
       : "/resources/default_avatar.png"
     }
     alt={contact.username}
     {...stylex.props(styles.avatarImg)}
    />
   </div>

   <h1 {...stylex.props(styles.username)}>{contact.username}</h1>
   <p {...stylex.props(styles.handle)}>@{contact.handle}</p>
   <p {...stylex.props(styles.message)}>
    Your conversation with {contact.username} has started here!
   </p>
   <div {...stylex.props(styles.separator)} />
  </div>
 );
};

export default StartOfChat;
