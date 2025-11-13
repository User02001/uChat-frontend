import React from 'react';
import styles from './MessageDiscord.module.css';
import { API_BASE_URL } from '../config';
import ReactionMore from './ReactionMore';
import Reaction from './Reaction';
import Reply from './Reply'

const MessageDiscord = ({
 message,
 user,
 activeContact,
 onlineUsers,
 userStatuses,
 isGrouped,
 showHeader,
 onProfileClick,
 onAddReaction,
 onRemoveReaction,
 messageReactions,
 isMobile,
 onLongPress,
 onReply,
 allMessages,
 children
}) => {
 const isSent = message.sender_id === user.id;
 const senderData = isSent ? user : activeContact;
 const longPressTimerRef = React.useRef(null);
 const [pressing, setPressing] = React.useState(false);
 const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

 const handleTouchStart = (e) => {
  if (!isMobile) return;
  setPressing(true);
  longPressTimerRef.current = setTimeout(() => {
   if (onLongPress) {
    onLongPress(message);
    navigator.vibrate?.(50);
   }
  }, 500);
 };

 const handleTouchEnd = () => {
  if (!isMobile) return;
  setPressing(false);
  if (longPressTimerRef.current) {
   clearTimeout(longPressTimerRef.current);
  }
 };

 const handleTouchMove = () => {
  if (!isMobile) return;
  setPressing(false);
  if (longPressTimerRef.current) {
   clearTimeout(longPressTimerRef.current);
  }
 };

 React.useEffect(() => {
  return () => {
   if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
   }
  };
 }, []);

 return (
  <div
   className={`${styles.messageRow} ${isGrouped ? styles.grouped : ''}`}
   id={`message-${message.id}`}
   data-message-id={message.id}
   onTouchStart={handleTouchStart}
   onTouchEnd={handleTouchEnd}
   onTouchMove={handleTouchMove}
   style={pressing ? { background: 'var(--bg-tertiary)' } : {}}
  >
   <div className={styles.avatarColumn}>
    {showHeader && (
     <div
      className={styles.avatarContainer}
      onClick={() => onProfileClick(senderData)}
     >
      <img
       src={
        senderData.avatar_url
         ? `${API_BASE_URL}${senderData.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt={senderData.username}
       className={styles.avatar}
       draggable="false"
      />
      <div
       className={`status-indicator ${userStatuses[senderData.id] === "away"
        ? "away"
        : onlineUsers.includes(senderData.id)
         ? "online"
         : "offline"
        }`}
      ></div>
     </div>
    )}
   </div>
   <div className={styles.contentColumn}>
    {showHeader && !message.deleted && (
     <div className={styles.messageHeader}>
      <span className={styles.username}>
       {senderData.username}
       {senderData?.email?.toLowerCase() === 'ufonic.official@gmail.com' && (
        <span
         style={{
          marginLeft: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#6b7280',
          color: '#fff',
          padding: '1px 6px',
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1
         }}
        >
         <img
          src="/resources/icons/lightning.svg"
          alt=""
          style={{ width: 12, height: 12, display: 'inline-block' }}
          draggable="false"
         />
         <span>CEO</span>
        </span>
       )}
      </span>
      <span className={styles.timestamp}>
       {new Date(message.timestamp + "Z").toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
       })}
      </span>
     </div>
    )}
    <div className={styles.messageContent}>
     {message.reply_to && (() => {
      const replyToMessage = allMessages?.find(m => m.id === message.reply_to);
      if (!replyToMessage) return null;

      return (
       <Reply
        replyingTo={{
         ...replyToMessage,
         currentUserId: user.id,
         currentUserAvatar: user.avatar_url,
         sender_username: replyToMessage.sender_id === user.id ? 'You' : activeContact?.username,
         sender_avatar: replyToMessage.sender_id === user.id ? user.avatar_url : activeContact?.avatar_url
        }}
        activeContact={activeContact}
        isInsideMessage={true}
        onScrollToMessage={(replyId) => {
         const el = document.getElementById(`message-${replyId}`);
         if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
           const target = el.querySelector('[class*="messageContent"]');
           if (target) {
            target.classList.add('message-highlighted');
            setTimeout(() => target.classList.remove('message-highlighted'), 800);
           }
          }, 500);
         }
        }}
       />
      );
     })()}
     {children}
     <Reaction
      messageId={message.id}
      reactions={messageReactions?.[message.id] || {}}
      onAddReaction={onAddReaction}
      onRemoveReaction={onRemoveReaction}
      currentUserId={user.id}
     />
    </div>
   </div>
   {!message.deleted && !isTouchDevice && (
    <div className={styles.reactionPopup}>
     <ReactionMore
      messageId={message.id}
      onAddReaction={onAddReaction}
      onClose={() => { }}
      position={{ x: 0, y: 0 }}
      onReply={onReply}
      message={message}
     />
    </div>
   )}
  </div>
 );
};

export default MessageDiscord;