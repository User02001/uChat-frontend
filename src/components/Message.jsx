import React, { useState, useRef, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { styles } from '../styles/message';
import { API_BASE_URL } from '../config';
import ReactionMore from './ReactionMore';
import Reaction from './Reaction';
import Reply from './Reply';
import VideoPlayer from './VideoPlayer';

const Message = ({
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
 onDelete,
 onReport,
 allMessages,
 children,
 onMediaExpand,
 formatFileSize,
 getFileIcon
}) => {
 const isSent = message.sender_id === user.id;
 const senderData = isSent ? user : activeContact;
 const longPressTimerRef = useRef(null);
 const [pressing, setPressing] = useState(false);
 const [isHovered, setIsHovered] = useState(false);
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

 useEffect(() => {
  return () => {
   if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
   }
  };
 }, []);

 return (
  <div
   {...stylex.props(
    styles.messageRow,
    isGrouped ? styles.messageRowGrouped : styles.messageRowNotGrouped
   )}
   id={`message-${message.id}`}
   data-message-id={message.id}
   onTouchStart={handleTouchStart}
   onTouchEnd={handleTouchEnd}
   onTouchMove={handleTouchMove}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
   style={pressing ? { background: 'var(--bg-tertiary)' } : {}}
  >
   <div {...stylex.props(styles.avatarColumn)}>
    {showHeader && (
     <div
      {...stylex.props(styles.avatarContainer)}
      onClick={() => onProfileClick(senderData)}
     >
      <img
       src={
        senderData.avatar_url
         ? `${API_BASE_URL}${senderData.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt={senderData.username}
       {...stylex.props(styles.avatar)}
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
   <div {...stylex.props(styles.contentColumn)}>
    {showHeader && !message.deleted && (
     <div {...stylex.props(styles.messageHeader)}>
      <span {...stylex.props(styles.username)}>
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
      <span {...stylex.props(styles.timestamp)}>
       {new Date(message.timestamp + "Z").toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
       })}
      </span>
     </div>
    )}
    <div {...stylex.props(styles.messageContent)}>
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
    <div {...stylex.props(
     styles.reactionPopup,
     isHovered && styles.reactionPopupVisible
    )}>
     <ReactionMore
      messageId={message.id}
      onAddReaction={onAddReaction}
      onClose={() => { }}
      position={{ x: 0, y: 0 }}
      onReply={onReply}
      onDelete={onDelete}
      onReport={onReport}
      message={message}
      isOwnMessage={message.sender_id === user.id}
     />
    </div>
   )}
  </div>
 );
};

// Custom Audio Player Component
export const AudioPlayer = ({ src, fileName }) => {
 const audioRef = useRef(null);
 const [isPlaying, setIsPlaying] = useState(false);
 const [currentTime, setCurrentTime] = useState(0);
 const [duration, setDuration] = useState(0);

 useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleLoadedMetadata = () => setDuration(audio.duration);
  const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
  const handleEnded = () => setIsPlaying(false);

  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('ended', handleEnded);

  return () => {
   audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
   audio.removeEventListener('timeupdate', handleTimeUpdate);
   audio.removeEventListener('ended', handleEnded);
  };
 }, []);

 const togglePlay = () => {
  if (audioRef.current) {
   if (isPlaying) {
    audioRef.current.pause();
   } else {
    audioRef.current.play();
   }
   setIsPlaying(!isPlaying);
  }
 };

 const handleProgressClick = (e) => {
  const bounds = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - bounds.left;
  const percentage = x / bounds.width;
  const newTime = percentage * duration;
  if (audioRef.current) {
   audioRef.current.currentTime = newTime;
   setCurrentTime(newTime);
  }
 };

 const formatTime = (time) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 };

 return (
  <div {...stylex.props(styles.audioPlayer)}>
   <div {...stylex.props(styles.audioHeader)}>
    <div {...stylex.props(styles.audioIcon)}>
     <i className="fas fa-music"></i>
    </div>
    <div {...stylex.props(styles.audioInfo)}>
     <div {...stylex.props(styles.audioTitle)}>{fileName || 'Audio File'}</div>
     <div {...stylex.props(styles.audioSubtitle)}>Audio • {formatTime(duration)}</div>
    </div>
    <button
     {...stylex.props(styles.audioDownloadBtn)}
     onClick={() => window.open(src, '_blank')}
     title="Download"
    >
     <i className="fas fa-download"></i>
    </button>
   </div>
   <div {...stylex.props(styles.audioControls)}>
    <button {...stylex.props(styles.audioPlayBtn)} onClick={togglePlay}>
     <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
    </button>
    <div {...stylex.props(styles.audioProgress)}>
     <div {...stylex.props(styles.audioProgressBar)} onClick={handleProgressClick}>
      <div
       {...stylex.props(styles.audioProgressFill)}
       style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
      ></div>
     </div>
     <div {...stylex.props(styles.audioTime)}>
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
     </div>
    </div>
   </div>
   <audio ref={audioRef} src={src} preload="metadata" />
  </div>
 );
};

export default Message;