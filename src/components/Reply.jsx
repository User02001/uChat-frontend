import React, { useEffect, useState } from 'react';
import './Reply.css';
import { API_BASE_URL } from '../config';

const Reply = ({
 replyingTo,
 onCancelReply,
 activeContact,
 isInsideMessage,
 onScrollToMessage
}) => {
 const [content, setContent] = useState('');

 useEffect(() => {
  if (replyingTo && typeof replyingTo.content === 'string') {
   setContent(replyingTo.content);
  } else {
   setContent('');
  }
 }, [replyingTo]);

 if (!replyingTo) return null;

 const truncateMessage = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
 };

 if (isInsideMessage) {
  const senderData = {
   username:
    replyingTo.sender_username ||
    (replyingTo.sender_id === replyingTo.currentUserId
     ? 'You'
     : activeContact?.username),
   avatar_url:
    replyingTo.sender_avatar ||
    (replyingTo.sender_id === replyingTo.currentUserId
     ? replyingTo.currentUserAvatar
     : activeContact?.avatar_url)
  };

  return (
   <div
    className="reply-inside-discord"
    onClick={() =>
     onScrollToMessage && onScrollToMessage(replyingTo.id)
    }
   >
    <div className="reply-curve-line"></div>

    <img
     src={
      senderData.avatar_url
       ? `${API_BASE_URL}${senderData.avatar_url}`
       : '/resources/default_avatar.png'
     }
     alt={senderData.username}
     className="reply-avatar-small"
     draggable="false"
    />

    <div className="reply-text-content">
     <span className="reply-username-small">
      {senderData.username}
     </span>

     <span className="reply-message-small">
      {replyingTo.deleted ? (
       <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Message deleted
       </em>
      ) : (
       content
      )}
     </span>
    </div>
   </div>
  );
 }

 // Input area preview
 return (
  <div className="reply-preview">
   <div className="reply-content">
    <div className="reply-icon">
     <i className="fas fa-reply"></i>
    </div>

    <div className="reply-info">
     <div className="reply-header">
      <span className="reply-text">Replying to</span>
      <span className="reply-sender">
       {replyingTo.sender_id === replyingTo.currentUserId
        ? 'Yourself'
        : activeContact?.username}
      </span>
     </div>

     <div className="reply-message">
      {replyingTo.deleted ? (
       <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
        This message has been deleted
       </em>
      ) : (
       truncateMessage(content)
      )}
     </div>
    </div>
   </div>

   <button className="reply-cancel" onClick={onCancelReply}>
    <i className="fas fa-times"></i>
   </button>
  </div>
 );
};

export default Reply;
