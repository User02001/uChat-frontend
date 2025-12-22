import { createPortal } from "react-dom";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { API_BASE_URL } from "../config";
import { QuickProfileModalStyles as styles } from "../styles/quick_profile_modal";
import Icon from './Icon';

const QuickProfileModal = ({
 user,
 onClose,
 currentUserId,
 onlineUsers,
 userStatuses,
 onSendMessage,
 onStartCall,
 onStartVideoCall,
 lastMessage,
 lastMessageSenderId,
 onOpenChat,
}) => {
 const [quickMessage, setQuickMessage] = useState("");
 const isCurrentUser = user.id === currentUserId;
 const isOnline = (onlineUsers || []).includes(user.id);
 const userStatus = (userStatuses || {})[user.id];

 const formatLastSeen = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return "Unknown";

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp + "Z");
  const diffMs = now - lastSeen;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const fullDate = lastSeen.toLocaleDateString(undefined, {
   month: "2-digit",
   day: "2-digit",
   year: "numeric",
  });
  const fullTime = lastSeen.toLocaleTimeString(undefined, {
   hour: "numeric",
   minute: "2-digit",
   hour12: true,
  });

  if (diffMinutes < 2) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return `yesterday at ${fullTime}`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffDays < 8) return `on ${fullDate} at ${fullTime} (${diffDays} days ago)`;
  return `on ${fullDate} at ${fullTime}`;
 };

 const getStatusText = () => {
  if (isCurrentUser) {
   return userStatus === "away" ? "Inactive" : "Available Now";
  }
  if (userStatus === "away") return "Inactive";
  if (isOnline) return "Available Now";
  return "Offline";
 };

 const getStatusColor = () => {
  if (userStatus === "away") return "away";
  if (isOnline) return "online";
  return "offline";
 };

 const handleSendQuickMessage = (e) => {
  e.preventDefault();
  if (quickMessage.trim() && onSendMessage) {
   onSendMessage(quickMessage.trim());
   setQuickMessage("");
   onClose();
  }
 };

 const isGifUrl = (text) => {
  if (!text) return false;
  const gifPatterns = [
   /tenor\.com\/view\//i,
   /giphy\.com\/gifs\//i,
   /\.gif(\?|$)/i,
   /media\.tenor\.com/i,
   /media\d*\.giphy\.com/i,
  ];
  return gifPatterns.some((pattern) => pattern.test(text));
 };

 const formatMessagePreview = (msg) => {
  if (!msg) return null;
  if (isGifUrl(msg)) return "Sent a GIF";
  if (msg.length > 35) return msg.substring(0, 35) + "...";
  return msg;
 };

 const statusColor = getStatusColor();

 return createPortal(
  <div {...stylex.props(styles.overlay)} onClick={onClose}>
   <div {...stylex.props(styles.content)} onClick={(e) => e.stopPropagation()}>
    <button {...stylex.props(styles.closeButton)} onClick={onClose} type="button">
     ×
    </button>

    <div {...stylex.props(styles.header)}>
     <div {...stylex.props(styles.avatarContainer)}>
      <img
       src={
        user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"
       }
       alt={user.username}
       {...stylex.props(styles.avatar)}
       draggable="false"
      />
      <div
       {...stylex.props(
        styles.statusDotBase,
        statusColor === "online" && styles.statusDotOnline,
        statusColor === "offline" && styles.statusDotOffline,
        statusColor === "away" && styles.statusDotAway
       )}
      />
     </div>

     <h2 {...stylex.props(styles.username)}>
      {user.username}
      {!user.is_verified && (
       <Icon
        name="unverified"
        alt="Unverified"
        className={stylex.props(styles.unverifiedIcon).className}
        draggable="false"
       />
      )}
     </h2>

     {!isCurrentUser && (
      <div {...stylex.props(styles.actionsRow)}>
       <button
        {...stylex.props(styles.actionButton)}
        onClick={() => {
         onOpenChat?.(user);
        }}
        title="DM This User"
        type="button"
       >
        <svg
         width="20"
         height="20"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
        >
         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
       </button>

       <button
        {...stylex.props(styles.actionButton)}
        onClick={() => {
         if (onStartCall) onStartCall();
         onClose();
        }}
        title="Audio call"
        type="button"
       >
        <svg
         width="20"
         height="20"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
        >
         <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
       </button>

       <button
        {...stylex.props(styles.actionButton)}
        onClick={() => {
         if (onStartVideoCall) onStartVideoCall();
         onClose();
        }}
        title="Video call"
        type="button"
       >
        <svg
         width="20"
         height="20"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
        >
         <polygon points="23 7 16 12 23 17 23 7" />
         <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
       </button>
      </div>
     )}
    </div>

    <div {...stylex.props(styles.body)}>
     <div {...stylex.props(styles.section)}>
      <div {...stylex.props(styles.statusItem)}>
       <div
        {...stylex.props(
         styles.statusIndicatorBase,
         statusColor === "online" && styles.statusIndicatorOnline,
         statusColor === "offline" && styles.statusIndicatorOffline,
         statusColor === "away" && styles.statusIndicatorAway
        )}
       />
       <div {...stylex.props(styles.statusInfo)}>
        <span {...stylex.props(styles.statusLabel)}>{getStatusText()}</span>

        {userStatus === "away" && user.last_seen && (
         <span {...stylex.props(styles.lastSeen)}>
          Inactive since {formatLastSeen(user.last_seen)}
         </span>
        )}

        {!isOnline && userStatus !== "away" && user.last_seen && (
         <span {...stylex.props(styles.lastSeen)}>Last seen {formatLastSeen(user.last_seen)}</span>
        )}
       </div>
      </div>
     </div>

     <div {...stylex.props(styles.section)}>
      <h3 {...stylex.props(styles.sectionTitle)}>Contact Information</h3>

      <div {...stylex.props(styles.infoItem)}>
       <svg
        className={stylex.props(styles.infoIcon).className}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
       >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
       </svg>
       <div {...stylex.props(styles.infoContent)}>
        <span {...stylex.props(styles.infoLabel)}>Display Name</span>
        <span {...stylex.props(styles.infoValue)}>{user.username}</span>
       </div>
      </div>

      <div {...stylex.props(styles.infoItem)}>
       <svg
        className={stylex.props(styles.infoIcon).className}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
       >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
       </svg>
       <div {...stylex.props(styles.infoContent)}>
        <span {...stylex.props(styles.infoLabel)}>Handle</span>
        <span {...stylex.props(styles.infoValue)}>@{user.handle}</span>
       </div>
      </div>

      <div {...stylex.props(styles.infoItem)}>
       <Icon
        name={user.is_verified ? "verified" : "unverified"}
        alt={user.is_verified ? "Verified" : "Unverified"}
        {...stylex.props(styles.infoIconImg)}
        draggable="false"
       />
       <div {...stylex.props(styles.infoContent)}>
        <span {...stylex.props(styles.infoLabel)}>Verification Status</span>
        <span
         {...stylex.props(
          styles.infoValue,
          user.is_verified ? styles.verifiedValue : styles.unverifiedValue
         )}
        >
         {user.is_verified ? "Verified Account" : "Unverified Account"}
        </span>
       </div>
      </div>
     </div>

     {lastMessage && (
      <div {...stylex.props(styles.section)}>
       <h3 {...stylex.props(styles.sectionTitle)}>Last Message</h3>
       <div {...stylex.props(styles.lastMessageBox)}>
        <span {...stylex.props(styles.messageSender)}>
         {lastMessageSenderId === currentUserId ? "You: " : `${user.username}: `}
        </span>
        <span {...stylex.props(styles.messageContent)}>{formatMessagePreview(lastMessage)}</span>
       </div>
      </div>
     )}

     {!isCurrentUser && (
      <div {...stylex.props(styles.section)}>
       <h3 {...stylex.props(styles.sectionTitle)}>Send Quick Message</h3>
       <form onSubmit={handleSendQuickMessage} {...stylex.props(styles.quickMessageRow)}>
        <input
         type="text"
         placeholder={`Message ${user.username}...`}
         value={quickMessage}
         onChange={(e) => setQuickMessage(e.target.value)}
         {...stylex.props(styles.messageInput)}
        />
        <button
         type="submit"
         {...stylex.props(styles.sendButton)}
         disabled={!quickMessage.trim()}
        >
         <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
         >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
         </svg>
        </button>
       </form>
      </div>
     )}

     {isCurrentUser && (
      <div {...stylex.props(styles.currentUserNotice)}>
       <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
       >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
       </svg>
       <span {...stylex.props(styles.currentUserNoticeText)}>This is your own profile</span>
      </div>
     )}
    </div>
   </div>
  </div>,
  document.body
 );
};

export default QuickProfileModal;
