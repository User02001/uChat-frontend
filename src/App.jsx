import React, { useState, useEffect } from 'react';
import { useAppLogic } from "./hooks/useAppLogic";
import Sidebar from "./components/Sidebar";
import Reply from "./components/Reply";
import { API_BASE_URL, SOCKET_URL } from "./config";
import useCalls from "./hooks/useCalls";
import MessagesSkeleton from "./components/MessagesSkeleton";
import ContactsSkeleton from "./components/ContactsSkeleton";
import Reaction from "./components/Reaction";
import "./pages/downloads-recommend.css";
import DeleteModal from "./components/DeleteModal";
import "./index.css";
import "./pages/calls.css";
import UnverifiedModal from "./components/UnverifiedModal";
import linkify from "./hooks/linkify.jsx";
import Gifs from "./components/Gifs";

const App = () => {

 const {
  // State
  user, setUser,
  loading, setLoading,
  contacts, setContacts,
  activeContact, setActiveContact,
  messages, setMessages,
  messageText, setMessageText,
  onlineUsers, setOnlineUsers,
  searchQuery, setSearchQuery,
  searchResults, setSearchResults,
  showSearch, setShowSearch,
  typingUsers, setTypingUsers,
  error, setError,
  showUserMenu, setShowUserMenu,
  showMobileSearch, setShowMobileSearch,
  searchExiting, setSearchExiting,
  isMobile, setIsMobile,
  showMobileChat, setShowMobileChat,
  replyingTo, setReplyingTo,
  isTransitioning, setIsTransitioning,
  showChatContent, setShowChatContent,
  contactsLoading, setContactsLoading,
  isTyping, setIsTyping,
  messageReactions, setMessageReactions,
  showReactionPopup, setShowReactionPopup,
  socketConnected, setSocketConnected,
  reconnectAttempts, setReconnectAttempts,
  showGifPicker, setShowGifPicker,
  dragOver, setDragOver,
  deleteConfirm, setDeleteConfirm,
  showDownloadRecommendation, setShowDownloadRecommendation,
  sessionDismissed, setSessionDismissed,
  showVerificationBanner, setShowVerificationBanner,
  showUnverifiedModal, setShowUnverifiedModal,
  isOffline, setIsOffline,
  callMinimized, setCallMinimized,
  screenshareMinimized, setScreenshareMinimized,
  userStatuses, setUserStatuses,

  // Refs
  socketRef,
  messagesEndRef,
  typingTimeoutRef,
  reconnectTimeoutRef,
  fileInputRef,
  activeContactRef,
  userRef,
  contactsRef,

  // Functions
  checkAuth,
  initializeSocket,
  loadContacts,
  loadMessages,
  searchUsers,
  addContact,
  selectContact,
  handleBackToContacts,
  sendMessage,
  handleMessageInputChange,
  handleLogout,
  saveLastContact,
  loadLastContact,
  handleMessageNotification,
 } = useAppLogic();

 // Expose a safe quick-reply bridge for the Electron main process
 useEffect(() => {
  if (typeof window !== "undefined") {
   window.socketRef = socketRef;

   window.quickReply = async (receiverId, message) => {
    if (!socketRef.current || !socketRef.current.connected) {
     initializeSocket();
     await new Promise(r => setTimeout(r, 600));
    }

    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit("send_message", {
      receiver_id: receiverId,
      content: message,
      reply_to: null
     });
     return true;
    }
    return false;
   };
  }
 }, [socketRef, initializeSocket]);

 const {
  callState,
  localVideoRef,
  remoteVideoRef,
  ringtoneRef,
  startCall,
  answerCall,
  endCall,
  setupSocketListeners,
  audioEnabled,
  enableAudio,
  screenshareState,
  screenshareLocalVideoRef,
  screenshareRemoteVideoRef,
  startScreenshare,
  answerScreenshare,
  endScreenshare,
 } = useCalls(socketRef, setError);

 // Show verification banner for unverified users
 useEffect(() => {
  if (user && !user.is_verified) {
   setShowVerificationBanner(true);
   document.body.classList.add("with-verification-banner");
  } else {
   setShowVerificationBanner(false);
   document.body.classList.remove("with-verification-banner");
  }

  // Add cleanup function to remove the class when component unmounts
  return () => {
   document.body.classList.remove("with-verification-banner");
  };
 }, [user]);

 // Handle screenshare local video setup
 useEffect(() => {
  if (
   screenshareState.localStream &&
   screenshareLocalVideoRef.current &&
   screenshareState.isSharing
  ) {
   console.log(
    "Setting up local screenshare video:",
    screenshareState.localStream.id
   );
   screenshareLocalVideoRef.current.srcObject = screenshareState.localStream;
   screenshareLocalVideoRef.current.muted = true;
   screenshareLocalVideoRef.current.autoplay = true;
   screenshareLocalVideoRef.current.playsInline = true;
   screenshareLocalVideoRef.current
    .play()
    .catch((e) => console.log("Local screenshare play error:", e));
  }
 }, [screenshareState.localStream, screenshareState.isSharing]);

 // Add this function to handle dismissing the recommendation (session only)
 const dismissDownloadRecommendation = () => {
  setShowDownloadRecommendation(false);
  setSessionDismissed(true); // Only dismiss for this session
 };

 // Add this function to handle "I already have it" checkbox
 const handleAlreadyHaveApp = () => {
  setShowDownloadRecommendation(false);
  localStorage.setItem("uchat-user-has-desktop-app", "true");
 };

 // Scroll to and highlight original message
 const scrollToMessage = (messageId) => {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
   const rect = messageElement.getBoundingClientRect();
   const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

   if (isInView) {
    // Find the element to highlight - could be .message-bubble, .message-content, or .deleted-message
    const targetElement =
     messageElement.querySelector(".message-bubble") ||
     messageElement.querySelector(".deleted-message") ||
     messageElement.querySelector(".message-content");

    if (targetElement) {
     targetElement.classList.add("message-highlighted");
     setTimeout(() => {
      targetElement.classList.remove("message-highlighted");
     }, 800);
    }
   } else {
    messageElement.scrollIntoView({
     behavior: "smooth",
     block: "center",
    });

    let scrollTimeout;
    const handleScrollEnd = () => {
     clearTimeout(scrollTimeout);
     scrollTimeout = setTimeout(() => {
      const targetElement =
       messageElement.querySelector(".message-bubble") ||
       messageElement.querySelector(".deleted-message") ||
       messageElement.querySelector(".message-content");

      if (targetElement) {
       targetElement.classList.add("message-highlighted");
       setTimeout(() => {
        targetElement.classList.remove("message-highlighted");
       }, 800);
      }

      document.removeEventListener("scroll", handleScrollEnd, true);
     }, 150);
    };

    document.addEventListener("scroll", handleScrollEnd, true);
   }
  }
 };

 // Handle local video setup for both caller and receiver
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   console.log(
    "Setting up local video from useEffect:",
    callState.localStream.id
   );
   localVideoRef.current.srcObject = callState.localStream;
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.style.transform = "scaleX(-1)";
   localVideoRef.current
    .play()
    .catch((e) => console.log("Local video play error:", e));
  }
 }, [callState.localStream, callState.isActive, callState.isIncoming]);

 // Update document title and favicon based on active contact
 useEffect(() => {
  if (activeContact) {
   document.title = `${activeContact.username} | uChat`;
  } else {
   document.title = "uChat";
  }

  const favicon =
   document.querySelector("link[rel='icon']") ||
   document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = "resources/favicon.png";
  document.head.appendChild(favicon);
 }, [activeContact]);

 // Format timestamp to human readable format
 const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp + "Z");
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return time.toLocaleDateString();
 };

 const formatInactiveTime = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return "Inactive";

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp + "Z");
  const diffMs = now - lastSeen;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 2) return "Inactive just now";
  if (minutes < 60) return `Inactive for ${minutes}m`;
  if (hours < 24) return `Inactive for ${hours}h`;
  if (days < 7) return `Inactive for ${days}d`;
  return `Inactive for ${weeks}w`;
 };

 const formatLastSeen = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return "Offline";

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp + "Z");
  const diffMs = now - lastSeen;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 2) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  if (diffDays === 1) return "Last seen yesterday";
  if (diffDays < 7) return `Last seen ${diffDays}d ago`;
  if (diffWeeks < 4) return `Last seen ${diffWeeks}w ago`;
  if (diffMonths < 12) return `Last seen ${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  return `Last seen ${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
 };

 // File size formatter
 const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
 };

 // Get file icon based on extension
 const getFileIcon = (fileType) => {
  const iconMap = {
   // Documents
   pdf: "fas fa-file-pdf",
   doc: "fas fa-file-word",
   docx: "fas fa-file-word",
   txt: "fas fa-file-alt",
   rtf: "fas fa-file-alt",

   // Archives
   zip: "fas fa-file-archive",
   rar: "fas fa-file-archive",
   "7z": "fas fa-file-archive",
   tar: "fas fa-file-archive",
   gz: "fas fa-file-archive",

   // Media
   mp4: "fas fa-file-video",
   avi: "fas fa-file-video",
   mkv: "fas fa-file-video",
   mov: "fas fa-file-video",
   wmv: "fas fa-file-video",
   mp3: "fas fa-file-audio",
   wav: "fas fa-file-audio",
   flac: "fas fa-file-audio",
   aac: "fas fa-file-audio",

   // Spreadsheets
   xlsx: "fas fa-file-excel",
   xls: "fas fa-file-excel",
   csv: "fas fa-file-csv",

   // Presentations
   pptx: "fas fa-file-powerpoint",
   ppt: "fas fa-file-powerpoint",

   // Code files
   js: "fas fa-file-code",
   html: "fas fa-file-code",
   css: "fas fa-file-code",
   py: "fas fa-file-code",
   java: "fas fa-file-code",
   cpp: "fas fa-file-code",
   c: "fas fa-file-code",
   php: "fas fa-file-code",

   // Executables
   exe: "fas fa-cog",
   msi: "fas fa-cog",
   app: "fas fa-cog",
   deb: "fas fa-cog",

   default: "fas fa-file",
  };
  return iconMap[fileType?.toLowerCase()] || iconMap.default;
 };

 const uploadFile = async (file, receiverId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("receiver_id", receiverId);

  try {
   const response = await fetch(`${API_BASE_URL}/api/upload-file`, {
    method: "POST",
    credentials: "include",
    body: formData,
   });

   if (!response.ok) {
    const error = await response.json();
    setError(error.error || "Upload failed");
   }
  } catch (error) {
   setError("Upload failed");
  }
 };

 const handleFileSelect = (files) => {
  if (!activeContact) return;

  Array.from(files).forEach((file) => {
   uploadFile(file, activeContact.id);
  });
 };

 const handlePaste = (e) => {
  const items = e.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
   if (items[i].type.indexOf("image") !== -1) {
    e.preventDefault();
    const file = items[i].getAsFile();
    if (file && activeContact) {
     uploadFile(file, activeContact.id);
    }
    break;
   }
  }
 };

 const handleDragOver = (e) => {
  e.preventDefault();
  setDragOver(true);
 };

 const handleDragLeave = (e) => {
  e.preventDefault();
  setDragOver(false);
 };

 const handleDrop = (e) => {
  e.preventDefault();
  setDragOver(false);

  const files = e.dataTransfer.files;
  if (files.length > 0) {
   handleFileSelect(files);
  }
 };

 // Handle reply to message
 const handleReplyToMessage = (message) => {
  setReplyingTo({
   ...message,
   currentUserId: user.id,
  });
 };

 const handleAddReaction = (messageId, reactionType) => {
  if (!socketRef.current) return;

  socketRef.current.emit("add_reaction", {
   message_id: messageId,
   reaction_type: reactionType,
  });
 };

 const handleRemoveReaction = (messageId, reactionType) => {
  if (!socketRef.current) return;

  socketRef.current.emit("remove_reaction", {
   message_id: messageId,
   reaction_type: reactionType,
  });
 };

 // Cancel reply
 const handleCancelReply = () => {
  setReplyingTo(null);
 };

 // Emit typing status to other users
 const handleTyping = (isTyping) => {
  if (!activeContact || !socketRef.current) return;

  socketRef.current.emit("typing", {
   receiver_id: activeContact.id,
   is_typing: isTyping,
  });
 };

 // Close mobile search overlay with animation
 const closeMobileSearch = () => {
  setSearchExiting(true);
  setTimeout(() => {
   setShowMobileSearch(false);
   setSearchExiting(false);
   setSearchQuery("");
   setSearchResults([]);
  }, 200);
 };

 // Auto-scroll to bottom when new messages arrive or contact changes
 useEffect(() => {
  const scrollToBottom = () => {
   messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Immediate scroll
  scrollToBottom();

  // Delayed scroll to account for images loading
  const timeouts = [100, 300, 500, 1000].map((delay) =>
   setTimeout(scrollToBottom, delay)
  );

  return () => timeouts.forEach(clearTimeout);
 }, [messages, activeContact]);

 if (loading) {
  return (
   <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading uChat...</p>
   </div>
  );
 }

 return (
  <div
   className={`app-container ${isMobile && showMobileChat ? "mobile-chat-open" : ""
    }`}
  >
   <>
    {showVerificationBanner && (
     <div className="verification-banner">
      <i className="fas fa-exclamation-triangle"></i>
      You are {""}
      <a href="/help" className="unverified-link">
       unverified!
      </a>
      <a href="/verify" className="verification-link">
       Verify your email now
      </a>
     </div>
    )}

    <div
     className={
      showVerificationBanner ? "app-content with-banner" : "app-content"
     }
    >
     <Sidebar showMobileChat={showMobileChat} showMobileSearch={showMobileSearch} onLogout={handleLogout} />

     <div className="sidebar">
      <div className="sidebar-header">
       <div className="user-profile">
        <div className="contact-avatar-container">
         <img
          src={
           user?.avatar_url
            ? `${API_BASE_URL}${user.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt="Profile"
          className="profile-avatar"
          draggable="false"
         />
         <div className={`status-indicator ${userStatuses[user?.id] === "away" ? "away" : "online"}`}></div>
        </div>
        <div className="user-info">
         <span className="username">{user?.username}</span>
         <span className="handle">@{user?.handle}</span>
        </div>
        <button
         className="user-menu-btn"
         onClick={() => setShowUserMenu(!showUserMenu)}
        >
         ⋮
        </button>
        {showUserMenu && (
         <div className="user-menu">
          <button onClick={handleLogout}>Logout</button>
         </div>
        )}
       </div>

       <div className="search-section">
        <div className="search-input-container">
         <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSearch(true)}
          className="search-input"
         />
         {showSearch && (
          <button
           className="search-close"
           onClick={() => {
            setSearchExiting(true);
            setTimeout(() => {
             setShowMobileSearch(false);
             setSearchExiting(false);
             setSearchQuery("");
             setSearchResults([]);
            }, 200);
           }}
          >
           ×
          </button>
         )}
        </div>

        {showSearch && searchResults.length > 0 && (
         <div className="search-results">
          {searchResults.map((result) => (
           <div key={result.id} className="search-result">
            <img
             src={
              result.avatar_url
               ? `${API_BASE_URL}${result.avatar_url}`
               : "/resources/default_avatar.png"
             }
             alt={result.username}
             className="search-avatar"
            />
            <div className="search-user-info">
             <span className="search-username">
              {result.username}
             </span>
             <span className="search-handle">
              @{result.handle}
             </span>
            </div>
            <button
             className="add-contact-btn"
             onClick={() => addContact(result.id)}
            >
             Add
            </button>
           </div>
          ))}
         </div>
        )}
       </div>
      </div>

      <div className="mobile-header">
       <div className="mobile-logo">
        <img
         draggable="false"
         src="/resources/favicon.png"
         alt="uChat Logo"
         className="mobile-logo-icon"
        />
        <span className="mobile-logo-text">uChat</span>
       </div>
       <div className="mobile-header-actions">
        <div
         className="contact-avatar-container"
         onClick={() => setShowUserMenu(!showUserMenu)}
        >
         <img
          src={
           user?.avatar_url
            ? `${API_BASE_URL}${user.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt="Profile"
          draggable="false"
          className="mobile-avatar"
         />
         <div className={`status-indicator ${userStatuses[user?.id] === "away" ? "away" : "online"}`}></div>
        </div>
       </div>
       {showUserMenu && (
        <div className="user-menu mobile-user-menu">
         <button onClick={handleLogout}>Logout</button>
        </div>
       )}
      </div>

      <div className="mobile-search-trigger">
       <button
        type="button"
        onClick={(e) => {
         e.preventDefault();
         e.stopPropagation();
         setShowMobileSearch(true);
        }}
        style={{
         width: "100%",
         padding: "8px 16px",
         borderRadius: "20px",
         border: "1px solid var(--border)",
         background: "var(--bg-tertiary)",
         fontSize: "14px",
         color: "var(--text-secondary)",
         cursor: "pointer",
         textAlign: "left",
         fontFamily: "inherit",
         WebkitAppearance: "none",
         appearance: "none",
        }}
       >
        Search...
       </button>
      </div>

      {showMobileSearch && (
       <div
        className={`mobile-search-overlay ${searchExiting ? "exiting" : "entering"
         }`}
       >
        <div className="mobile-search-header">
         <button
          className="mobile-search-back"
          onClick={closeMobileSearch}
         ></button>
         <div className="search-input-container">
          <input
           type="text"
           placeholder="Search users..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="mobile-search-input"
           autoFocus
          />
         </div>
        </div>
        <div className="mobile-search-content">
         {searchResults.length > 0 ? (
          <div className="search-results">
           {searchResults.map((result) => (
            <div key={result.id} className="search-result">
             <img
              draggable="false"
              src={
               result.avatar_url
                ? `${API_BASE_URL}${result.avatar_url}`
                : "/resources/default_avatar.png"
              }
              alt={result.username}
              className="search-avatar"
             />
             <div className="search-user-info">
              <span className="search-username">
               {result.username}
              </span>
              <span className="search-handle">
               @{result.handle}
              </span>
             </div>
             <button
              className="add-contact-btn"
              onClick={() => {
               addContact(result.id);
               setShowMobileSearch(false);
               setSearchQuery("");
               setSearchResults([]);
              }}
             >
              Add
             </button>
            </div>
           ))}
          </div>
         ) : searchQuery.trim() ? (
          <div className="no-search-results">
           <p>No users found</p>
          </div>
         ) : (
          <div className="search-placeholder">
           <p>Start typing to search for users...</p>
          </div>
         )}
        </div>
       </div>
      )}

      <div className="contacts-list">
       {contactsLoading ? (
        <ContactsSkeleton />
       ) : contacts.length === 0 ? (
        <div className="empty-contacts">
         <p>No contacts yet</p>
         <p>Search for users to start chatting</p>
        </div>
       ) : (
        contacts.map((contact) => (
         <div
          key={contact.id}
          className={`contact-item ${activeContact?.id === contact.id ? "active" : ""
           }`}
          onClick={() => selectContact(contact)}
         >
          <div className="contact-avatar-container">
           <img
            src={
             contact.avatar_url
              ? `${API_BASE_URL}${contact.avatar_url}`
              : "/resources/default_avatar.png"
            }
            alt={contact.username}
            className="contact-avatar"
            draggable="false"
           />
           <div
            className={`status-indicator ${userStatuses[contact.id] === "away" ? "away" :
              onlineUsers.includes(contact.id) ? "online" : "offline"
             }`}
           ></div>
          </div>
          <div className="contact-info">
           <div className="contact-main">
            <span className="contact-name">
             {contact.username}
             {!contact.is_verified && (
              <img
               src="/resources/broken-lock.svg"
               alt="Unverified"
               className="unverified-icon"
               onClick={(e) => {
                e.stopPropagation();
                setShowUnverifiedModal(contact.username);
               }}
               title="Unverified user"
              />
             )}
            </span>
            <span className="contact-time">
             {contact.lastMessageTime
              ? (() => {
               const now = new Date();
               const messageTime = new Date(
                contact.lastMessageTime + "Z"
               );
               const isToday =
                now.toDateString() ===
                messageTime.toDateString();

               const yesterday = new Date(now);
               yesterday.setDate(now.getDate() - 1);
               const isYesterday =
                yesterday.toDateString() ===
                messageTime.toDateString();

               const timeString =
                messageTime.toLocaleTimeString([], {
                 hour: "numeric",
                 minute: "2-digit",
                 hour12: true,
                });

               // Mobile: show only time relative format (e.g., "3d")
               if (window.innerWidth <= 768) {
                if (isToday) {
                 return timeString;
                } else if (isYesterday) {
                 return "1d";
                } else {
                 const days = Math.floor(
                  (now - messageTime) / 86400000
                 );
                 return `${days}d`;
                }
               }

               // Desktop: show full format
               if (isToday) {
                return `Today at ${timeString}`;
               } else if (isYesterday) {
                return `Yesterday at ${timeString}`;
               } else {
                const days = Math.floor(
                 (now - messageTime) / 86400000
                );
                return `${days}d ago at ${timeString}`;
               }
              })()
              : ""}
            </span>
           </div>
           <span
            className={`contact-preview ${contact.unread && activeContact?.id !== contact.id
              ? "unread"
              : ""
             }`}
           >
            {contact.lastMessage
             ? `${contact.lastSenderId === user?.id ? "You: " : ""
             }${contact.lastMessage.length > 15
              ? contact.lastMessage.substring(0, 15) + "..."
              : contact.lastMessage
             } · ${contact.lastMessageTime
              ? formatTimeAgo(contact.lastMessageTime)
              : ""
             }`
             : "There are no messages yet"}
           </span>
          </div>
         </div>
        ))
       )}
      </div>
     </div>

     <div className="chat-container">
      {activeContact ? (
       <>
        <div
         className={`chat-header ${isMobile ? (showChatContent ? "fade-in" : "fade-out") : ""
          }`}
        >
         {isMobile && (
          <button
           className="mobile-back-btn"
           onClick={handleBackToContacts}
          ></button>
         )}
         <div className="contact-avatar-container">
          <img
           draggable="false"
           src={
            activeContact.avatar_url
             ? `${API_BASE_URL}${activeContact.avatar_url}`
             : "/resources/default_avatar.png"
           }
           alt={activeContact.username}
           className="chat-avatar"
          />
          <div
           className={`status-indicator ${userStatuses[activeContact.id] === "away" ? "away" :
             onlineUsers.includes(activeContact.id) ? "online" : "offline"
            }`}
          ></div>
         </div>
         <div className="chat-user-info">
          <div className="chat-username-container">
           <span className="chat-username">
            {activeContact.username}
           </span>
           {!activeContact.is_verified && (
            <img
             src="/resources/broken-lock.svg"
             alt="Unverified"
             className="unverified-icon"
             onClick={() =>
              setShowUnverifiedModal(activeContact.username)
             }
             title="Unverified user - Click for more info"
            />
           )}
           {!(isMobile && showMobileChat) && (
            <>
             <span className="chat-aka">aka</span>
             <span className="chat-handle">@{activeContact.handle}</span>
            </>
           )}
          </div>
          <span className="chat-status">
           {userStatuses[activeContact.id] === "away"
            ? formatInactiveTime(activeContact.last_seen)
            : onlineUsers.includes(activeContact.id)
             ? "Available Now"
             : formatLastSeen(activeContact.last_seen)}
          </span>
         </div>
         <div className="call-buttons">
          <button
           className="call-btn audio-call"
           onClick={() => startCall(activeContact, "audio")}
           disabled={callState.isActive}
          ></button>
          <button
           className="call-btn video-call"
           onClick={() => startCall(activeContact, "video")}
           disabled={callState.isActive}
          >
           <i className="fas fa-video"></i>
          </button>
          <button
           className="call-btn screenshare-call"
           onClick={() => startScreenshare(activeContact)}
           disabled={
            screenshareState.isActive || screenshareState.isSharing
           }
           title="Share screen"
          >
           <i className="fas fa-desktop"></i>
          </button>
         </div>
        </div>

        <div className="messages-container">
         {messages.length === 0 && isMobile ? (
          <MessagesSkeleton />
         ) : messages.length === 0 ? (
          <div className="empty-messages">
           <p>Start a conversation with {activeContact.username}</p>
          </div>
         ) : (
          // Only showing the relevant message rendering section that needs to be changed:

          messages.map((message) => (
           <div
            id={`message-${message.id}`}
            key={message.id}
            className={`message ${message.sender_id === user.id ? "sent" : "received"
             } ${message.reply_to ? "reply" : ""}`}
           >
            {message.sender_id !== user.id && (
             <div className="message-avatar-container">
              <img
               src={
                activeContact.avatar_url
                 ? `${API_BASE_URL}${activeContact.avatar_url}`
                 : "/resources/default_avatar.png"
               }
               alt={activeContact.username}
               className="message-avatar"
               draggable="false"
              />
              <div
               className={`status-indicator ${userStatuses[activeContact.id] === "away" ? "away" :
                 onlineUsers.includes(activeContact.id) ? "online" : "offline"
                }`}
              ></div>
             </div>
            )}
            <div className="message-bubble">
             {message.original_message && (
              <div
               className="reply-inside"
               onClick={() =>
                !message.original_message.deleted &&
                scrollToMessage(message.original_message.id)
               }
               style={
                message.original_message.deleted
                 ? { cursor: "default" }
                 : { cursor: "pointer" }
               }
              >
               <span className="reply-sender-inside">
                {message.original_message.sender_id === user.id
                 ? "You"
                 : message.original_message.sender_username}
               </span>
               <span className="reply-content-inside">
                {message.original_message.deleted ? (
                 <em
                  style={{
                   color: "var(--text-muted)",
                   fontStyle: "italic",
                  }}
                 >
                  This message has been DELETED
                 </em>
                ) : (
                 (() => {
                  const orig =
                   message.original_message?.content || "";
                  const truncated =
                   orig.length > 40
                    ? orig.substring(0, 40) + "..."
                    : orig;
                  return linkify(truncated);
                 })()
                )}
               </span>
              </div>
             )}

             {/* Message content based on type */}
             {/* Deleted-aware message rendering */}
             {message.deleted ? (
              <div className="deleted-message">
               <em>
                {message.sender_id === user.id
                 ? "You have DELETED this message."
                 : "This message has been DELETED."}
               </em>
              </div>
             ) : message.message_type === "image" ? (
              <div className="message-image">
               <img
                src={`${API_BASE_URL}${message.file_path}`}
                alt="Shared image"
                className="shared-image"
               />
              </div>
             ) : message.message_type === "file" ? (
              <div
               className="message-file"
               onClick={() =>
                window.open(
                 `${API_BASE_URL}${message.file_path}`,
                 "_blank"
                )
               }
              >
               <div className="file-icon">
                <i
                 className={getFileIcon(message.file_type)}
                ></i>
               </div>
               <div className="file-info">
                <div className="file-name">
                 {message.file_name}
                </div>
                <div className="file-size">
                 {formatFileSize(message.file_size)}
                </div>
               </div>
               <div className="file-download">
                <i className="fas fa-download"></i>
               </div>
              </div>
             ) : (
              <div className="message-content">
               {linkify(message.content)}
              </div>
             )}

             <Reaction
              messageId={message.id}
              reactions={messageReactions[message.id] || {}}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              currentUserId={user.id}
              showPopup={showReactionPopup === message.id}
              onClosePopup={() => setShowReactionPopup(null)}
             />
             <div className="message-time">
              {(() => {
               const messageTime = new Date(
                message.timestamp + "Z"
               );
               const now = new Date();
               const diffMs = now - messageTime;
               const diffMinutes = Math.floor(diffMs / 60000);

               if (diffMinutes < 1) {
                return "Just now";
               } else {
                return messageTime.toLocaleTimeString([], {
                 hour: "numeric",
                 minute: "2-digit",
                 hour12: true,
                });
               }
              })()}
             </div>
            </div>
            {!message.deleted && (
             <>
              <button
               className="message-reply-btn"
               onClick={() => handleReplyToMessage(message)}
               title="Reply to this message"
              >
               <i className="fas fa-reply"></i>
              </button>
              <button
               className="message-reaction-btn"
               onClick={() =>
                setShowReactionPopup(
                 showReactionPopup === message.id
                  ? null
                  : message.id
                )
               }
               title="React to this message"
              >
               <i className="fas fa-smile"></i>
              </button>
              {message.sender_id === user.id && (
               <button
                className="message-delete-btn"
                onClick={() => setDeleteConfirm(message.id)}
                title="Delete message"
               >
                <i className="fas fa-trash"></i>
               </button>
              )}
             </>
            )}
           </div>
          ))
         )}

         <div ref={messagesEndRef} />
         {deleteConfirm && (
          <DeleteModal
           messageId={deleteConfirm}
           onClose={() => setDeleteConfirm(null)}
           onConfirm={async (messageId) => {
            try {
             const res = await fetch(
              `${API_BASE_URL}/api/messages/${messageId}/delete`,
              {
               method: "POST",
               credentials: "include",
              }
             );

             if (res.ok) {
              setMessages((prev) =>
               prev.map((m) =>
                m.id === messageId
                 ? {
                  ...m,
                  deleted: true,
                  content: null,
                  file_path: null,
                  file_name: null,
                 }
                 : m
               )
              );
             } else {
              const err = await res.json();
              setError(err.error || "Delete failed");
             }
            } catch (e) {
             setError("Delete failed");
            }
           }}
          />
         )}
        </div>

        <div
         className={`message-input-area ${dragOver ? "drag-over" : ""
          } ${isMobile ? (showChatContent ? "fade-in" : "fade-out") : ""
          }`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
        >
         {typingUsers.has(activeContact?.id) && (
          <div className="typing-indicator-floating">
           <span>{activeContact.username} is typing...</span>
          </div>
         )}
         <Reply
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          activeContact={activeContact}
         />
         <form
          onSubmit={
           isOffline ? (e) => e.preventDefault() : sendMessage
          }
          className="message-input-container"
         >
          <input
           type="file"
           ref={fileInputRef}
           onChange={(e) => handleFileSelect(e.target.files)}
           style={{ display: "none" }}
           multiple
           accept="*/*"
          />
          <button
           type="button"
           className="attachment-button"
           onClick={() => fileInputRef.current?.click()}
           title={isOffline ? "Offline - can't send files" : "Attach file"}
           disabled={isOffline}
          >
           <img src="/resources/icons/attachment.svg" alt="Attach" draggable="false" />
          </button>
          <button
           type="button"
           className="gif-button"
           onClick={() => setShowGifPicker(true)}
           title={isOffline ? "Offline - can't send GIFs" : "Send GIF"}
           disabled={isOffline}
          >
           <img src="/resources/icons/gif.svg" alt="GIF" draggable="false" />
          </button>
          <input
           type="text"
           value={messageText}
           onChange={handleMessageInputChange}
           onPaste={handlePaste}
           placeholder={
            isOffline
             ? "You're offline - can't send messages"
             : "What u thinkin?"
           }
           className="message-input"
           autoComplete="off"
           autoCapitalize="sentences"
           autoCorrect="on"
           spellCheck="true"
           data-form-type="other"
           disabled={isOffline}
           style={
            isOffline ? { cursor: "not-allowed", opacity: 0.5 } : {}
           }
          />
          <button
 type="submit"
 className="send-button"
 disabled={!messageText.trim() || isOffline}
>
 <img src="/resources/icons/send.svg" alt="Send" draggable="false" />
</button>
         </form>
        </div>
       </>
      ) : !isMobile ? (
       <div className="no-chat-selected">
        <h2>Welcome to uChat</h2>
        <p>Select a contact to start chatting</p>
       </div>
      ) : (
       <div style={{ display: "none" }}></div>
      )}
     </div>

     {error && <div className="error-toast">{error}</div>}

     {callState.isIncoming && (
      <div className="incoming-call-notification">
       <div className="incoming-call-content">
        <div className="incoming-call-info">
         <img
          draggable="false"
          src={
           callState.contact?.avatar_url
            ? `${API_BASE_URL}${callState.contact.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt={callState.contact?.username}
          className="incoming-call-avatar"
         />
         <div className="incoming-call-text">
          <h4>{callState.contact?.username}</h4>
          <p>
           Incoming {callState.type === "video" ? "video" : "audio"}{" "}
           call
          </p>
         </div>
        </div>
        <div className="incoming-call-actions">
         <button
          className="decline-btn-small"
          onClick={() => answerCall(false)}
          title="Decline"
         ></button>
         <button
          className="accept-btn-small"
          onClick={() => answerCall(true)}
          title="Accept"
         ></button>
        </div>
       </div>
      </div>
     )}

     {screenshareState.isIncoming && (
      <div className="incoming-call-notification">
       <div className="incoming-call-content">
        <div className="incoming-call-info">
         <img
          draggable="false"
          src={
           screenshareState.contact?.avatar_url
            ? `${API_BASE_URL}${screenshareState.contact.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt={screenshareState.contact?.username}
          className="incoming-call-avatar"
         />
         <div className="incoming-call-text">
          <h4>{screenshareState.contact?.username}</h4>
          <p>Wants to share their screen</p>
         </div>
        </div>
        <div className="incoming-call-actions">
         <button
          className="decline-btn-small"
          onClick={() => answerScreenshare(false)}
          title="Decline"
         ></button>
         <button
          className="accept-btn-small"
          onClick={() => answerScreenshare(true)}
          title="Accept"
         ></button>
        </div>
       </div>
      </div>
     )}

     {(screenshareState.isActive || screenshareState.isSharing) && (
      <div
       className={`call-overlay screenshare-overlay ${screenshareMinimized
         ? "call-overlay-minimized-923847 screenshare-overlay-minimized-847392"
         : ""
        }`}
      >
       <div className="active-call">
        <div className="call-status-overlay">
         <h3>
          {screenshareState.isSharing
           ? `Sharing screen with ${screenshareState.contact?.username}`
           : `Viewing ${screenshareState.contact?.username}'s screen`}
         </h3>

         {!screenshareMinimized && (
          <button
           className="minimize-call-btn"
           onClick={() => setScreenshareMinimized(true)}
           title="Minimize"
          >
           <i className="fas fa-minus"></i>
          </button>
         )}
        </div>

        {/* --- VIDEO --- */}
        <div className="video-container">
         {screenshareState.isViewing && (
          <video
           ref={screenshareRemoteVideoRef}
           className="remote-video"
           autoPlay
           playsInline
           controls={false}
           style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#000",
           }}
          />
         )}
         {screenshareState.isSharing && (
          <video
           ref={screenshareLocalVideoRef}
           className="local-video"
           autoPlay
           playsInline
           muted
           style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#000",
           }}
          />
         )}
        </div>

        {/* --- CONTROLS --- */}
        <div
         className={
          screenshareMinimized
           ? "call-controls-minimized-192837"
           : "call-controls"
         }
        >
         <button
          className={
           screenshareMinimized
            ? "end-call-btn-minimized-482910"
            : "end-call-btn"
          }
          onClick={endScreenshare}
         ></button>

         {screenshareMinimized && (
          <button
           className="maximize-call-btn-573829"
           onClick={() => setScreenshareMinimized(false)}
           title="Maximize"
          >
           <i className="fas fa-expand"></i>
          </button>
         )}
        </div>
       </div>
      </div>
     )}

     {(callState.isOutgoing || callState.isActive) &&
      !callState.isIncoming && (
       <div
        className={`call-overlay ${callState.type === "video" ? "video-call" : "audio-call"
         } ${callMinimized ? "call-overlay-minimized-923847" : ""}`}
       >
        <div className="active-call">
         {(callState.isOutgoing || callState.isActive) &&
          callState.contact && (
           <div
            className={
             callMinimized
              ? "call-status-minimized-738291"
              : "call-status-overlay"
            }
           >
            <h3>
             {callState.isOutgoing
              ? `Calling ${callState.contact.username}...`
              : callState.contact.username}
            </h3>
            {!callMinimized && (
             <button
              className="minimize-call-btn"
              onClick={() => setCallMinimized(true)}
              title="Minimize"
             >
              <i className="fas fa-minus"></i>
             </button>
            )}
           </div>
          )}

         {callState.type === "video" ? (
          <div className="video-container">
           <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
            controls={false}
            muted={false}
            style={{
             width: "100%",
             height: "100%",
             objectFit: "cover",
            }}
           />
           <video
            ref={localVideoRef}
            className="local-video"
            autoPlay
            playsInline
            controls={false}
            muted={true}
            style={{
             transform: "scaleX(-1)",
             width: "200px",
             height: "150px",
             position: "absolute",
             top: "20px",
             right: "20px",
             borderRadius: "8px",
             border: "2px solid white",
            }}
           />
          </div>
         ) : (
          <div
           className={
            callMinimized
             ? "call-overlay-audio-minimized-847392"
             : "audio-call-ui"
           }
          >
           <img
            src={
             callState.contact?.avatar_url
              ? `${API_BASE_URL}${callState.contact.avatar_url}`
              : "/resources/default_avatar.png"
            }
            alt={callState.contact?.username}
            draggable="false"
           />
           <h3>{callState.contact?.username}</h3>
           <p>Audio Call</p>
           {/* Single audio element for remote stream */}
           <audio
            ref={remoteVideoRef}
            autoPlay
            muted={false}
            style={{ display: "none" }}
           />
           {/* Local audio stream (usually not needed for UI) */}
           <audio
            ref={localVideoRef}
            autoPlay
            muted={true}
            style={{ display: "none" }}
           />
          </div>
         )}

         <div
          className={
           callMinimized
            ? "call-controls-minimized-192837"
            : "call-controls"
          }
         >
          <button
           className={
            callMinimized
             ? "end-call-btn-minimized-482910"
             : "end-call-btn"
           }
           onClick={endCall}
          ></button>
          {callMinimized && (
           <button
            className="maximize-call-btn-573829"
            onClick={() => setCallMinimized(false)}
            title="Maximize"
           >
            <i className="fas fa-expand"></i>
           </button>
          )}
         </div>
        </div>
       </div>
      )}
     {showDownloadRecommendation && (
      <div className="download-recommendation-notification">
       <div className="download-recommendation-content">
        <div className="download-recommendation-info">
         <div className="download-icon">
          <i className="fas fa-download"></i>
         </div>
         <div className="download-recommendation-text">
          <h4>Better uChat Experience</h4>
          <p>
           Download our desktop app for Windows for improved
           performance and features
          </p>
         </div>
        </div>
        <div className="download-recommendation-actions">
         <button
          className="dismiss-btn-small"
          onClick={dismissDownloadRecommendation}
          title="Dismiss"
         >
          <i className="fas fa-times"></i>
         </button>
         <button
          className="download-btn-small"
          onClick={() => window.open("/downloads", "_blank")}
          title="Download"
         >
          <i className="fas fa-download"></i>
         </button>
        </div>
       </div>
       <div className="download-recommendation-footer">
        <label className="already-have-checkbox">
         <input type="checkbox" onChange={handleAlreadyHaveApp} />
         <span className="checkmark"></span>I already have the desktop
         app
        </label>
       </div>
      </div>
     )}
     {showUnverifiedModal && (
      <UnverifiedModal
       username={showUnverifiedModal}
       onClose={() => setShowUnverifiedModal(null)}
      />
     )}
     <audio ref={ringtoneRef} preload="none">
      <source
       src="/resources/ringtones/default_ringtone.mp3"
       type="audio/mpeg"
      />
      <source
       src="/resources/ringtones/default_ringtone.wav"
       type="audio/wav"
      />
     </audio>
    </div>
   </>
   {showGifPicker && (
    <Gifs
     onSelectGif={(gifUrl) => {
      if (socketRef.current && activeContact) {
       socketRef.current.emit("send_message", {
        receiver_id: activeContact.id,
        content: gifUrl,
        reply_to: replyingTo ? replyingTo.id : null,
       });
       setReplyingTo(null);
      }
     }}
     onClose={() => setShowGifPicker(false)}
    />
   )}
  </div>
 );
};

export default App;