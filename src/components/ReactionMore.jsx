import React from 'react';
import './ReactionMore.css';

const ReactionMore = ({ messageId, onAddReaction, onClose, position, onReply, message }) => {
 // Map emojis to the reaction types expected by the backend
 const reactions = [
  { emoji: '👍', type: 'like' },
  { emoji: '❤️', type: 'love' },
  { emoji: '😂', type: 'happy' },
  { emoji: '😢', type: 'sad' },
  { emoji: '😡', type: 'angry' },
  { emoji: '👎', type: 'dislike' },
  { emoji: '💀', type: 'skull' },
  { icon: 'fa-reply', type: 'reply' }
 ];

 const handleReactionClick = (reactionType) => {
  onAddReaction(messageId, reactionType);
  onClose();
 };

 const handleReplyClick = () => {
  onReply(message);
  onClose();
 };

 const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

 const getAdjustedPosition = () => {
  // On mobile, center horizontally
  if (isTouchDevice) {
   return {
    x: window.innerWidth / 2,
    y: position.y,
    transform: 'translate(-50%, 0)'
   };
  }
  // Desktop: position to the right of message, aligned with top
  const popupWidth = 280;
  const popupHeight = 60;
  const padding = 12;
  let adjustedX = position.x;
  let adjustedY = position.y;
  let transform = 'translate(0, -100%)';

  // Check if it overflows right edge
  if (adjustedX + popupWidth + padding > window.innerWidth) {
   // Position to the left of the message instead
   const messageRect = document.querySelector(`[data-message-id]`)?.getBoundingClientRect();
   if (messageRect) {
    adjustedX = messageRect.left - 10;
    transform = 'translate(-100%, -100%)';
   }
  }

  // Check if it overflows bottom
  if (adjustedY + popupHeight > window.innerHeight - padding) {
   adjustedY = window.innerHeight - padding - popupHeight;
  }

  // Check if it overflows top
  if (adjustedY < padding) {
   adjustedY = padding;
  }

  return { x: adjustedX, y: adjustedY, transform };
 };

 const adjustedPos = getAdjustedPosition();

 return (
  <div
   className="reaction-more-popup"
   onClick={(e) => e.stopPropagation()}
   role="dialog"
   aria-label="Add reaction"
  >
   <div className="reaction-more-grid">
    {reactions.map((reaction, index) => (
     <button
      key={index}
      className="reaction-more-btn"
      onClick={() => reaction.type === 'reply' ? handleReplyClick() : handleReactionClick(reaction.type)}
      title={reaction.emoji ? `React with ${reaction.emoji}` : 'Reply'}
      aria-label={reaction.emoji ? `React with ${reaction.emoji}` : 'Reply'}
      type="button"
     >
      {reaction.emoji || <i className="fas fa-reply"></i>}
     </button>
    ))}
   </div>
  </div>
 );
};

export default ReactionMore;
