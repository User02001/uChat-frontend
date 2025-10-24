import React from 'react';
import './MessageOptions.css';

const MessageOptions = ({
 message,
 isOwnMessage,
 onReply,
 onReact,
 onDelete,
 isDeleted
}) => {
 if (isDeleted) return null;

 return (
  <div className={`message-options ${isOwnMessage ? 'own-message' : 'other-message'}`}>
   {/* Reply Button */}
   <button
    className="message-option-btn reply-btn"
    onClick={() => onReply(message)}
    title="Reply to this message"
   >
    <i className="fas fa-reply"></i>
   </button>

   {/* React Button */}
   <button
    className="message-option-btn react-btn"
    onClick={(e) => onReact(e, message.id)}
    title="React to this message"
   >
    <i className="fas fa-smile"></i>
   </button>

   {/* Delete Button (only for own messages) */}
   {isOwnMessage && (
    <button
     className="message-option-btn delete-btn"
     onClick={() => onDelete(message)}
     title="Delete message"
    >
     <i className="fas fa-trash"></i>
    </button>
   )}
  </div>
 );
};

export default MessageOptions;