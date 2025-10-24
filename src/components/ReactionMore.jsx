import React from 'react';
import './ReactionMore.css';

const ReactionMore = ({ messageId, onAddReaction, onClose, position }) => {
 // Map emojis to the reaction types expected by the backend
 const reactions = [
  { emoji: '👍', type: 'like' },
  { emoji: '❤️', type: 'love' },
  { emoji: '😂', type: 'happy' },
  { emoji: '😢', type: 'sad' },
  { emoji: '😡', type: 'angry' },
  { emoji: '👎', type: 'dislike' },
  { emoji: '💀', type: 'skull' }
 ];

 const handleReactionClick = (reactionType) => {
  onAddReaction(messageId, reactionType);
  onClose();
 };

 const isMobile = window.innerWidth <= 768;

 const getAdjustedPosition = () => {
  // On mobile, always center horizontally
  if (isMobile) {
   return {
    x: window.innerWidth / 2,
    y: position.y,
    transform: 'translate(-50%, calc(-100% - 12px))'
   };
  }

  // Desktop: edge detection
  const popupWidth = 420;
  const popupHeight = 80;
  const padding = 15;

  let adjustedX = position.x;
  let adjustedY = position.y;
  let transform = 'translate(-50%, calc(-100% - 12px))';

  // Calculate actual left and right edges after centering
  const leftEdge = adjustedX - (popupWidth / 2);
  const rightEdge = adjustedX + (popupWidth / 2);

  // Check and fix right edge overflow
  if (rightEdge > window.innerWidth - padding) {
   const overflow = rightEdge - (window.innerWidth - padding);
   adjustedX = adjustedX - overflow;
  }

  // Check and fix left edge overflow
  if (leftEdge < padding) {
   const overflow = padding - leftEdge;
   adjustedX = adjustedX + overflow;
  }

  // Check top edge - if popup would go above screen, show below instead
  if (adjustedY - popupHeight - 24 < padding) {
   transform = 'translate(-50%, 12px)';
  }

  return { x: adjustedX, y: adjustedY, transform };
 };

 const adjustedPos = getAdjustedPosition();

 return (
  <div
   className="reaction-more-overlay"
   onClick={onClose}
  >
   <div
    className="reaction-more-popup"
    style={{
     position: 'fixed',
     left: `${adjustedPos.x}px`,
     top: `${adjustedPos.y}px`,
     transform: adjustedPos.transform
    }}
    onClick={(e) => e.stopPropagation()}
   >
    <div className="reaction-more-grid">
     {reactions.map((reaction, index) => (
      <button
       key={index}
       className="reaction-more-btn"
       onClick={() => handleReactionClick(reaction.type)}
       title={`React with ${reaction.emoji}`}
      >
       {reaction.emoji}
      </button>
     ))}
    </div>
   </div>
  </div>
 );
};

export default ReactionMore;