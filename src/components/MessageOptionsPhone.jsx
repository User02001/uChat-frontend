import React, { useState, useRef, useEffect } from 'react';
import styles from './MessageOptionsPhone.module.css';

const MessageOptionsPhone = ({
 message,
 isOwnMessage,
 onReply,
 onAddReaction,
 onRemoveReaction,
 onDelete,
 onReport,
 onClose,
 currentUserReactions
}) => {
 const [isClosing, setIsClosing] = useState(false);
 const [dragStartY, setDragStartY] = useState(0);
 const sheetRef = useRef(null);

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
  const isActive = currentUserReactions?.includes(reactionType);

  if (isActive) {
   onRemoveReaction(message.id, reactionType);
  } else {
   onAddReaction(message.id, reactionType);
  }

  handleClose();
 };

 const handleReply = () => {
  onReply(message);
  handleClose();
 };

 const handleDelete = () => {
  onDelete(message);
  handleClose();
 };

 const handleCopy = async () => {
  try {
   let textToCopy = message.content;

   if (textToCopy) {
    await navigator.clipboard.writeText(textToCopy);
   }
   handleClose();
  } catch (err) {
   console.error('Failed to copy:', err);
  }
 };

 const hasLink = message.content && (
  message.content.includes('http://') ||
  message.content.includes('https://') ||
  message.content.includes('www.')
 );

 const handleOpenLink = () => {
  let url = message.content;

  const urlMatch = url.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/i);
  if (urlMatch) {
   url = urlMatch[0];
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
   url = 'https://' + url;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  handleClose();
 };

 const hasText = message.content && message.message_type !== 'image' && message.message_type !== 'file';

 const handleClose = () => {
  setIsClosing(true);
  setTimeout(() => {
   onClose();
  }, 200);
 };

 useEffect(() => {
  const sheet = sheetRef.current;
  if (!sheet) return;

  let startY = 0;
  let currentTranslate = 0;
  let isDragging = false;

  const handlePointerDown = (e) => {
   // Only allow dragging from the handle area
   if (!e.target.closest(`.${styles.handleArea}`)) return;

   isDragging = true;
   startY = e.clientY;
   currentTranslate = 0;
   sheet.style.transition = 'none';
   e.preventDefault();
  };

  const handlePointerMove = (e) => {
   if (!isDragging) return;

   const deltaY = e.clientY - startY;
   if (deltaY > 0) {
    currentTranslate = deltaY;
    sheet.style.transform = `translateY(${deltaY}px)`;
   }
  };

  const handlePointerUp = () => {
   if (!isDragging) return;

   isDragging = false;

   if (currentTranslate > 100) {
    handleClose();
   } else {
    sheet.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sheet.style.transform = 'translateY(0)';
   }
  };

  sheet.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);

  return () => {
   sheet.removeEventListener('pointerdown', handlePointerDown);
   window.removeEventListener('pointermove', handlePointerMove);
   window.removeEventListener('pointerup', handlePointerUp);
   window.removeEventListener('pointercancel', handlePointerUp);
  };
 }, []);

 return (
  <>
   <div
    className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
    onClick={handleClose}
    style={{ pointerEvents: 'auto' }}
   />
   <div
    ref={sheetRef}
    className={`${styles.bottomSheet} ${isClosing ? styles.bottomSheetClosing : ''}`}
   >
    <div className={styles.handleArea}>
     <div className={styles.handle} />
    </div>

    <div className={styles.reactionsSection}>
     {reactions.map((reaction) => {
      const isActive = currentUserReactions?.includes(reaction.type);
      return (
       <button
        key={reaction.type}
        className={`${styles.reactionButton} ${isActive ? styles.reactionActive : ''}`}
        onClick={() => handleReactionClick(reaction.type)}
       >
        {reaction.emoji}
       </button>
      );
     })}
    </div>

    <div className={styles.actionsSection}>
     <button className={styles.actionButton} onClick={handleReply}>
      <i className="fas fa-reply"></i>
      <span>Reply</span>
     </button>

     {hasText && (
      <button className={styles.actionButton} onClick={handleCopy}>
       <i className="fas fa-copy"></i>
       <span>Copy Text</span>
      </button>
     )}

     {hasLink && (
      <button className={styles.actionButton} onClick={handleOpenLink}>
       <i className="fas fa-external-link-alt"></i>
       <span>Open in Browser</span>
      </button>
     )}

     {isOwnMessage ? (
      <button className={`${styles.actionButton} ${styles.deleteAction}`} onClick={handleDelete}>
       <i className="fas fa-trash"></i>
       <span>Delete</span>
      </button>
     ) : (
      <button className={`${styles.actionButton} ${styles.reportAction}`} onClick={() => {
       if (onReport) onReport(message);
       handleClose();
      }}>
       <i className="fas fa-flag"></i>
       <span>Report</span>
      </button>
     )}
    </div>
   </div>
  </>
 );
};

export default MessageOptionsPhone;