import React, { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { API_BASE_URL } from "../config";
import { ReplyStyles as styles } from "../styles/reply";

const Reply = ({ replyingTo, onCancelReply, activeContact, isInsideMessage, onScrollToMessage }) => {
 const [content, setContent] = useState("");

 useEffect(() => {
  if (replyingTo && typeof replyingTo.content === "string") {
   setContent(replyingTo.content);
  } else {
   setContent("");
  }
 }, [replyingTo]);

 if (!replyingTo) return null;

 const truncateMessage = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
 };

 if (isInsideMessage) {
  const senderData = {
   username:
    replyingTo.sender_username ||
    (replyingTo.sender_id === replyingTo.currentUserId ? "You" : activeContact?.username),
   avatar_url:
    replyingTo.sender_avatar ||
    (replyingTo.sender_id === replyingTo.currentUserId
     ? replyingTo.currentUserAvatar
     : activeContact?.avatar_url),
  };

  return (
   <div
    {...stylex.props(styles.replyInsideDiscord)}
    onClick={() => onScrollToMessage && onScrollToMessage(replyingTo.id)}
   >
    <div {...stylex.props(styles.replyCurveLine)} />

    <img
     src={
      senderData.avatar_url
       ? `${API_BASE_URL}${senderData.avatar_url}`
       : "/resources/default_avatar.png"
     }
     alt={senderData.username}
     {...stylex.props(styles.replyAvatarSmall)}
     draggable="false"
    />

    <div {...stylex.props(styles.replyTextContent)}>
     <span {...stylex.props(styles.replyUsernameSmall)}>{senderData.username}</span>

     <span {...stylex.props(styles.replyMessageSmall)}>
      {replyingTo.deleted ? (
       <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Message deleted</em>
      ) : (
       content
      )}
     </span>
    </div>
   </div>
  );
 }

 return (
  <div {...stylex.props(styles.replyPreview)}>
   <div {...stylex.props(styles.replyContent)}>
    <div {...stylex.props(styles.replyIcon)}>
     <i className="fas fa-reply"></i>
    </div>

    <div {...stylex.props(styles.replyInfo)}>
     <div {...stylex.props(styles.replyHeader)}>
      <span {...stylex.props(styles.replyText)}>Replying to</span>
      <span {...stylex.props(styles.replySender)}>
       {replyingTo.sender_id === replyingTo.currentUserId ? "Yourself" : activeContact?.username}
      </span>
     </div>

     <div {...stylex.props(styles.replyMessage)}>
      {replyingTo.deleted ? (
       <em style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
        This message has been deleted
       </em>
      ) : (
       truncateMessage(content)
      )}
     </div>
    </div>
   </div>

   <button {...stylex.props(styles.replyCancel)} onClick={onCancelReply} type="button">
    <i className="fas fa-times"></i>
   </button>
  </div>
 );
};

export default Reply;
