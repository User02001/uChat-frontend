import React, { useEffect, useState } from 'react';
import './Reply.css';
import { API_BASE_URL } from '../config';
import { decryptMaybe } from '../crypto/e2ee';

const Reply = ({ replyingTo, onCancelReply, activeContact, isInsideMessage, onScrollToMessage }) => {
 const [decryptedContent, setDecryptedContent] = useState('');

 useEffect(() => {
  const decrypt = async () => {
   if (replyingTo && replyingTo.content && typeof replyingTo.content === 'string') {
    const decrypted = await decryptMaybe(replyingTo.content);
    setDecryptedContent(decrypted);
   } else {
    setDecryptedContent(replyingTo?.content || '');
   }
  };
  decrypt();
 }, [replyingTo]);

 if (!replyingTo) return null;

 const truncateMessage = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
 };


 if (isInsideMessage) {
  const senderData = {
   username: replyingTo.sender_username || (replyingTo.sender_id === replyingTo.currentUserId ? 'You' : activeContact?.username),
   avatar_url: replyingTo.sender_avatar || (replyingTo.sender_id === replyingTo.currentUserId ? replyingTo.currentUserAvatar : activeContact?.avatar_url)
  };

  return (
   <div
    className="reply-inside-discord"
    onClick={() => onScrollToMessage && onScrollToMessage(replyingTo.id)}
   >
    <div className="reply-curve-line"></div>
    <img
     src={
      senderData.avatar_url
       ? `${API_BASE_URL}${senderData.avatar_url}`
       : "/resources/default_avatar.png"
     }
     alt={senderData.username}
     className="reply-avatar-small"
     draggable="false"
    />
    <div className="reply-text-content">
     <span className="reply-username-small">{senderData.username}</span>
     <span className="reply-message-small">
      {replyingTo.deleted ? (
       <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Message deleted
       </em>
      ) : (
       decryptedContent || ''
      )}
     </span>
    </div>
   </div>
  );
 }

 // Input area preview (existing style)
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
       {replyingTo.sender_id === replyingTo.currentUserId ? 'Yourself' : activeContact?.username}
      </span>
     </div>
     <div className="reply-message">
      {replyingTo.deleted ? (
       <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
        This message has been deleted
       </em>
      ) : (
       truncateMessage(decryptedContent || '')
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