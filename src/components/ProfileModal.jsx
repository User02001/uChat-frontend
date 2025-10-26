import { createPortal } from 'react-dom';
import { useState } from 'react';
import { API_BASE_URL } from '../config';
import './ProfileModal.css';

const ProfileModal = ({
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
 const [quickMessage, setQuickMessage] = useState('');
 const isCurrentUser = user.id === currentUserId;
 const isOnline = onlineUsers.includes(user.id);
 const userStatus = userStatuses[user.id];

 const formatLastSeen = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return "Unknown";

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp + "Z");
  const diffMs = now - lastSeen;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // New: full timestamp formatting (no leading 0 in hour)
  const fullDate = lastSeen.toLocaleDateString(undefined, {
   month: '2-digit',
   day: '2-digit',
   year: 'numeric'
  });
  const fullTime = lastSeen.toLocaleTimeString(undefined, {
   hour: 'numeric', // <-- removes the leading zero
   minute: '2-digit',
   hour12: true     // ensures 12-hour format with AM/PM
  });

  if (diffMinutes < 2) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return `yesterday at ${fullTime}`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffDays < 8)
   return `on ${fullDate} at ${fullTime} (${diffDays} days ago)`;

  return `on ${fullDate} at ${fullTime}`;
 };

 const getStatusText = () => {
  if (isCurrentUser) {
   return userStatus === "away" ? "Inactive" : "Available Now";
  }

  if (userStatus === "away") {
   return "Inactive";
  }

  if (isOnline) {
   return "Available Now";
  }

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
   setQuickMessage('');
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
   /media\d*\.giphy\.com/i
  ];
  return gifPatterns.some(pattern => pattern.test(text));
 };

 const formatMessagePreview = (msg) => {
  if (!msg) return null;

  if (isGifUrl(msg)) {
   return "Sent a GIF";
  }

  if (msg.length > 35) return msg.substring(0, 35) + '...';
  return msg;
 };

 return createPortal(
  <div className="profile-modal-overlay-pm" onClick={onClose}>
   <div className="profile-modal-content-pm" onClick={(e) => e.stopPropagation()}>
    <button className="profile-modal-close-pm" onClick={onClose}>×</button>

    <div className="profile-modal-header-pm">
     <div className="profile-modal-avatar-container-pm">
      <img
       src={
        user.avatar_url
         ? `${API_BASE_URL}${user.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt={user.username}
       className="profile-modal-avatar-pm"
       draggable="false"
      />
      <div className={`profile-modal-status-dot-pm ${getStatusColor()}`}></div>
     </div>

     <h2 className="profile-modal-username-pm">
      {user.username}
      {!user.is_verified && (
       <img
        src="/resources/icons/unverified.svg"
        alt="Unverified"
        className="profile-modal-unverified-icon-pm"
        draggable="false"
       />
      )}
     </h2>

     {!isCurrentUser && (
      <div className="profile-modal-actions-pm">
       <button
        className="profile-modal-action-btn-pm chat-btn-pm"
        onClick={() => {
         onOpenChat?.(user); // open the chat for this user
        }}
        title="DM This User"
       >
        <svg
         width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
       </button>
       <button
        className="profile-modal-action-btn-pm call-btn-pm"
        onClick={() => {
         if (onStartCall) onStartCall();
         onClose();
        }}
        title="Audio call"
       >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
       </button>
       <button
        className="profile-modal-action-btn-pm video-btn-pm"
        onClick={() => {
         if (onStartVideoCall) onStartVideoCall();
         onClose();
        }}
        title="Video call"
       >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <polygon points="23 7 16 12 23 17 23 7"></polygon>
         <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
       </button>
      </div>
     )}
    </div>

    <div className="profile-modal-body-pm">
     <div className="profile-modal-section-pm">
      <div className="profile-modal-status-item-pm">
       <div className={`profile-modal-status-indicator-pm ${getStatusColor()}`}></div>
       <div className="profile-modal-status-info-pm">
        <span className="profile-modal-status-label-pm">{getStatusText()}</span>
        {userStatus === "away" && user.last_seen && (
         <span className="profile-modal-last-seen-pm">
          Inactive since {formatLastSeen(user.last_seen)}
         </span>
        )}
        {!isOnline && userStatus !== "away" && user.last_seen && (
         <span className="profile-modal-last-seen-pm">
          Last seen {formatLastSeen(user.last_seen)}
         </span>
        )}
       </div>
      </div>
     </div>

     <div className="profile-modal-section-pm">
      <h3 className="profile-modal-section-title-pm">Contact Information</h3>
      <div className="profile-modal-info-item-pm">
       <svg className="profile-modal-info-icon-pm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
       </svg>
       <div className="profile-modal-info-content-pm">
        <span className="profile-modal-info-label-pm">Display Name</span>
        <span className="profile-modal-info-value-pm">{user.username}</span>
       </div>
      </div>
      <div className="profile-modal-info-item-pm">
       <svg
        className="profile-modal-info-icon-pm"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
       >
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
       </svg>
       <div className="profile-modal-info-content-pm">
        <span className="profile-modal-info-label-pm">Handle</span>
        <span className="profile-modal-info-value-pm">@{user.handle}</span>
       </div>
      </div>
      <div className="profile-modal-info-item-pm">
       <img
        src={user.is_verified ? "/resources/icons/verified.svg" : "/resources/icons/unverified.svg"}
        alt={user.is_verified ? "Verified" : "Unverified"}
        className="profile-modal-info-icon-img-pm"
        draggable="false"
       />
       <div className="profile-modal-info-content-pm">
        <span className="profile-modal-info-label-pm">Verification Status</span>
        <span className={`profile-modal-info-value-pm ${user.is_verified ? 'verified-pm' : 'unverified-pm'}`}>
         {user.is_verified ? 'Verified Account' : 'Unverified Account'}
        </span>
       </div>
      </div>
     </div>

     {lastMessage && (
      <div className="profile-modal-section-pm">
       <h3 className="profile-modal-section-title-pm">Last Message</h3>
       <div className="profile-modal-last-message-pm">
        <span className="profile-modal-message-sender-pm">
         {lastMessageSenderId === currentUserId ? 'You: ' : `${user.username}: `}
        </span>
        <span className="profile-modal-message-content-pm">
         {formatMessagePreview(lastMessage)}
        </span>
       </div>
      </div>
     )}

     {!isCurrentUser && (
      <div className="profile-modal-section-pm">
       <h3 className="profile-modal-section-title-pm">Send Quick Message</h3>
       <form onSubmit={handleSendQuickMessage} className="profile-modal-quick-message-pm">
        <input
         type="text"
         placeholder={`Message ${user.username}...`}
         value={quickMessage}
         onChange={(e) => setQuickMessage(e.target.value)}
         className="profile-modal-message-input-pm"
        />
        <button
         type="submit"
         className="profile-modal-send-btn-pm"
         disabled={!quickMessage.trim()}
        >
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
         </svg>
        </button>
       </form>
      </div>
     )}

     {isCurrentUser && (
      <div className="profile-modal-current-user-notice-pm">
       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
       </svg>
       <span>This is your own profile</span>
      </div>
     )}
    </div>
   </div>
  </div>,
  document.body
 );
};

export default ProfileModal;