import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useAppLogic } from "./hooks/useAppLogic";
import { styles as sx } from "./styles";
import lottie from 'lottie-web';
import WarningForModeration from "./components/WarningForModeration";
import Sidebar from "./components/Sidebar";
import Reply from "./components/Reply";
import { API_BASE_URL, SOCKET_URL } from "./config";
import useCalls from "./hooks/useCalls";
import MessagesSkeleton from "./components/MessagesSkeleton";
import ContactsSkeleton from "./components/ContactsSkeleton";
import Reaction from "./components/Reaction";
import ReactionMore from "./components/ReactionMore";
import DeleteModal from "./components/DeleteModal";
import ReportModal from "./components/ReportModal";
import VerificationModal from "./components/VerificationModal";
import UnverifiedModal from "./components/UnverifiedModal";
import linkify from "./hooks/linkify.jsx";
import Gifs from "./components/Gifs";
import ProfileModal from "./components/ProfileModal";
import MessageOptions from "./components/MessageOptions";
import MessageOptionsPhone from "./components/MessageOptionsPhone";
import styles from "./index.module.css";
import "./pages/downloads-recommend.css";
import "./pages/calls.css";
import MediaViewer from "./components/MediaViewer";
import VideoPlayer from "./components/VideoPlayer";
import Message from "./components/Message";
import ImageMessage from "./components/media/ImageMessage";
import VideoMessage from "./components/media/VideoMessage";
import AudioMessage from "./components/media/AudioMessage";
import FileMessage from "./components/media/FileMessage";
import GifMessage from "./components/media/GifMessage";
import StartOfChat from "./components/StartOfChat";
import StatusModal from "./components/StatusModal";
import { useFormatters } from "./hooks/useFormatters";
import { useMessageScroll } from "./hooks/useMessageScroll";
import SVG from 'react-inlinesvg';
import 'virtual:stylex.css'
import { styles as chatStyles } from './styles/chat';
import { styles as inputStyles } from './styles/inputs';
import IncomingCallNotification from "./components/calls/IncomingCallNotification";
import MinimizedCall from "./components/calls/MinimizedCall";
import ActiveCall from "./components/calls/ActiveCall";
import IncomingScreenshareNotification from "./components/calls/IncomingScreenshareNotification";
import MinimizedScreenshare from "./components/calls/MinimizedScreenshare";
import ActiveScreenshare from "./components/calls/ActiveScreenshare";

const App = () => {
 // Block ALL heavy operations during splash
 const [splashComplete, setSplashComplete] = useState(false);

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
  hasMoreMessages, setHasMoreMessages,
  loadingMoreMessages, setLoadingMoreMessages,
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
  reactionPopupPosition, setReactionPopupPosition,
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
  showProfileModal, setShowProfileModal,
  callPosition, setCallPosition,
  isDragging, setIsDragging,
  dragOffset, setDragOffset,
  messageCache, setMessageCache,
  isLoadingMessages, setIsLoadingMessages,
  showMediaViewer, setShowMediaViewer,
  showMessageOptionsPhone, setShowMessageOptionsPhone,
  messagesContainerVisible, setMessagesContainerVisible,
  showStatusModal, setShowStatusModal,
  userForcedStatus, setUserForcedStatus,
  showReportModal, setShowReportModal,
  showWarning, setShowWarning,

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
  handleSetStatus,
  handleReportMessage,
  handleSubmitReport,
  checkForWarnings,
 } = useAppLogic();

 const { formatTimeAgo, formatInactiveTime, formatLastSeen, formatContactTime, formatFileSize, getFileIcon } = useFormatters();

 const {
  callState,
  localVideoRef,
  remoteVideoRef,
  ringtoneRef,
  startCall,
  answerCall,
  endCall,
  audioEnabled,
  enableAudio,
  screenshareState,
  screenshareLocalVideoRef,
  screenshareRemoteVideoRef,
  startScreenshare,
  answerScreenshare,
  endScreenshare,
  isMicMuted,
  isCameraOff,
  toggleMic,
  toggleCamera,
  setupCallListeners
 } = useCalls(socketRef, setError, callMinimized, screenshareMinimized);

 const handleDragStart = (e) => {
  const isTouchEvent = e.type === 'touchstart';
  const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
  const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

  const rect = e.currentTarget.getBoundingClientRect();
  setDragOffset({
   x: clientX - rect.left,
   y: clientY - rect.top
  });
  setIsDragging(true);
 };

 const handleDragMove = useCallback((e) => {
  if (!isDragging) return;

  const isTouchEvent = e.type === 'touchmove';
  const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
  const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

  const newX = clientX - dragOffset.x;
  const newY = clientY - dragOffset.y;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const isMobileView = windowWidth <= 768;
  const elementWidth = isMobileView ? 200 : 380;
  const elementHeight = isMobileView ? 180 : 300;

  const clampedX = Math.max(0, Math.min(newX, windowWidth - elementWidth));
  const clampedY = Math.max(0, Math.min(newY, windowHeight - elementHeight));

  setCallPosition({ x: clampedX, y: clampedY });
 }, [isDragging, dragOffset]);

 const handleDragEnd = () => {
  setIsDragging(false);
 };

 useEffect(() => {
  if (!isDragging) return;

  const events = ['mousemove', 'touchmove', 'mouseup', 'touchend'];
  const handlers = { mousemove: handleDragMove, touchmove: handleDragMove, mouseup: handleDragEnd, touchend: handleDragEnd };

  events.forEach(event => window.addEventListener(event, handlers[event]));
  return () => events.forEach(event => window.removeEventListener(event, handlers[event]));
 }, [isDragging, handleDragMove]);

 // Expose a safe quick-reply bridge for the Electron main process
 useEffect(() => {
  if (typeof window !== "undefined") {
   window.socketRef = socketRef;

   window.quickReply = async (receiverId, message) => {
    if (!socketRef.current || !socketRef.current.connected) {
     initializeSocket();
     await new Promise(r => setTimeout(r, 600));
    }

    const content = (message ?? "").toString();

    // Server handles encryption - just send plaintext
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit("send_message", {
      receiver_id: receiverId,
      content,
      reply_to: null
     });
     return true;
    }
    return false;
   };
  }
 }, [socketRef, initializeSocket]);

 // Handle socket events and page visibility
 useEffect(() => {
  if (!socketRef.current) return;

  const handleReconnect = () => {
   socketRef.current.emit('sync_state', { active_contact_id: activeContact?.id });
   socketRef.current.emit('request_contacts_update');
   socketRef.current.emit('request_online_users');
   if (activeContact) loadMessages(activeContact.id);
  };

  const handleMessagesSnced = (data) => {
   if (data.contact_id === activeContact?.id) setMessages(data.messages);
  };

  const handleVisibilityChange = () => {
   if (!document.hidden && socketRef.current?.connected) {
    socketRef.current.emit('request_online_users');
   }
  };

  socketRef.current.on('reconnect', handleReconnect);
  socketRef.current.on('messages_synced', handleMessagesSnced);
  socketRef.current.on('force_contacts_refresh', loadContacts);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (setupCallListeners) {
   console.log('[APP] Setting up call listeners from App.jsx');
   setupCallListeners();
  }

  return () => {
   if (socketRef.current) {
    socketRef.current.off('reconnect', handleReconnect);
    socketRef.current.off('messages_synced', handleMessagesSnced);
    socketRef.current.off('force_contacts_refresh', loadContacts);
   }
   document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
 }, [activeContact, loadMessages, loadContacts, setupCallListeners]);

 // Auto-hide call UI after 4 seconds
 useEffect(() => {
  if (callState.isActive && !callState.isIncoming && !callMinimized) {
   const timer = setTimeout(() => {
    const header = document.querySelector('.modern-call-header');
    const controls = document.querySelector('.modern-call-controls-wrapper');
    const localVideo = document.querySelector('.modern-local-video');

    if (header && controls) {
     header.classList.add('hidden');
     controls.classList.add('hidden');
     if (localVideo) localVideo.classList.add('ui-hidden');
    }
   }, 4000);

   return () => clearTimeout(timer);
  }
 }, [callState.isActive, callState.isIncoming, callMinimized]);

 // Intersection Observer for lazy loading images
 const [visibleMessages, setVisibleMessages] = useState(new Set());
 const observerRef = useRef(null);

 useEffect(() => {
  observerRef.current = new IntersectionObserver(
   (entries) => {
    entries.forEach((entry) => {
     if (entry.isIntersecting) {
      const messageId = entry.target.dataset.messageId;
      if (messageId) {
       setVisibleMessages((prev) => new Set([...prev, parseInt(messageId)]));
      }
     }
    });
   },
   {
    root: messagesContainerRef.current,
    rootMargin: '200px',
    threshold: 0.01,
   }
  );

  return () => {
   if (observerRef.current) {
    observerRef.current.disconnect();
   }
  };
 }, []);

 useEffect(() => {
  if (!observerRef.current) return;

  const messageElements = messagesContainerRef.current?.querySelectorAll('[data-message-id]');
  messageElements?.forEach((el) => {
   observerRef.current.observe(el);
  });

  return () => {
   if (observerRef.current) {
    observerRef.current.disconnect();
   }
  };
 }, [messages]);

 // Show verification modal for unverified users
 useEffect(() => {
  if (user && !user.is_verified) {
   setShowVerificationBanner(true);
  } else {
   setShowVerificationBanner(false);
  }
 }, [user]);

 // Handle screenshare stream setup
 useEffect(() => {
  if (screenshareState.localStream && screenshareLocalVideoRef.current && screenshareState.isSharing) {
   screenshareLocalVideoRef.current.srcObject = screenshareState.localStream;
   screenshareLocalVideoRef.current.muted = true;
   screenshareLocalVideoRef.current.autoplay = true;
   screenshareLocalVideoRef.current.playsInline = true;
   screenshareLocalVideoRef.current.play().catch(console.error);
  }

  if (screenshareState.remoteStream && screenshareRemoteVideoRef.current && screenshareState.isViewing) {
   screenshareRemoteVideoRef.current.srcObject = screenshareState.remoteStream;
   screenshareRemoteVideoRef.current.muted = false;
   screenshareRemoteVideoRef.current.play().catch(console.error);
  }
 }, [screenshareState.localStream, screenshareState.remoteStream, screenshareState.isSharing, screenshareState.isViewing, screenshareMinimized]);

 // Utility functions
 const dismissDownloadRecommendation = () => {
  setShowDownloadRecommendation(false);
  sessionStorage.setItem("uchat-download-dismissed", "true");
 };

 const handleAlreadyHaveApp = () => {
  setShowDownloadRecommendation(false);
  localStorage.setItem("uchat-user-has-desktop-app", "true");
 };

 const scrollToMessage = (messageId) => {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
   const rect = messageElement.getBoundingClientRect();
   const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

   if (isInView) {
    const targetElement =
     messageElement.querySelector(`.${styles.messageBubble}`) ||
     messageElement.querySelector(`.${styles.deletedMessage}`) ||
     messageElement.querySelector(`.${styles.messageContent}`);

    if (targetElement) {
     targetElement.classList.add('message-highlighted');
     setTimeout(() => {
      targetElement.classList.remove('message-highlighted');
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
       messageElement.querySelector(`.${styles.messageBubble}`) ||
       messageElement.querySelector(`.${styles.deletedMessage}`) ||
       messageElement.querySelector(`.${styles.messageContent}`);

      if (targetElement) {
       targetElement.classList.add('message-highlighted');
       setTimeout(() => {
        targetElement.classList.remove('message-highlighted');
       }, 800);
      }

      document.removeEventListener("scroll", handleScrollEnd, true);
     }, 150);
    };

    document.addEventListener("scroll", handleScrollEnd, true);
   }
  }
 };

 // Handle video stream setup for calls
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   localVideoRef.current.srcObject = callState.localStream;
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.style.transform = "scaleX(-1)";
   localVideoRef.current.play().catch(console.error);
  }

  if (callState.remoteStream && remoteVideoRef.current) {
   remoteVideoRef.current.srcObject = callState.remoteStream;
   remoteVideoRef.current.muted = false;
   remoteVideoRef.current.play().catch(console.error);
  }
 }, [callState.localStream, callState.remoteStream, callState.isActive, callState.isIncoming, callMinimized]);

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

 const messagesContainerRef = useRef(null);

 const { handleScroll, userScrollLockRef } = useMessageScroll({
  messages,
  activeContact,
  user,
  loadingMoreMessages,
  hasMoreMessages,
  loadMessages,
  messagesContainerRef,
  setLoadingMoreMessages,
  setMessagesContainerVisible,
  setHasMoreMessages
 });

 // Force visibility for empty chats (StartOfChat scenario)
 useEffect(() => {
  if (messagesContainerRef.current && messages.length === 0 && isLoadingMessages === false) {
   messagesContainerRef.current.style.visibility = 'visible';
   setMessagesContainerVisible(true);
  }
 }, [messages.length, isLoadingMessages, activeContact?.id]);

 const splashRef = useRef(null);
 const animRef = useRef(null);

 useEffect(() => {
  if (loading && splashRef.current && !animRef.current) {
   // Render on animation frame for better performance
   requestAnimationFrame(() => {
    animRef.current = lottie.loadAnimation({
     container: splashRef.current,
     renderer: 'canvas',
     loop: true,
     autoplay: true,
     path: '/splash.json',
     rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      clearCanvas: true,
      progressiveLoad: true,
      hideOnTransparent: true
     }
    });
   });

   return () => {
    if (animRef.current) {
     animRef.current.destroy();
     animRef.current = null;
    }
   };
  } else if (!loading && !splashComplete) {
   // Mark splash as complete
   setSplashComplete(true);
  }
 }, [loading, splashComplete]);

 return (
  <>
   {loading && (
    <div className={styles.appLoading} style={{
     position: 'fixed',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 999999,
     pointerEvents: 'all'
    }}>
     <div ref={splashRef} className={styles.loadingSpinner}></div>
     <div className={styles.splashBranding}>
      <div className={styles.splashBrandingLogo}>
       <SVG
        src="/resources/icons/ufonic.svg"
        alt="UFOnic"
        className={styles.splashBrandingIcon}
        draggable="false"
       />
       <span className={styles.splashBrandingName}>UFOnic</span>
      </div>
     </div>
    </div>
   )}
   {showVerificationBanner && (
    <VerificationModal
     onClose={() => setShowVerificationBanner(false)}
    />
   )}

   <div
    className={`${styles.appContainer} ${isMobile && showMobileChat ? "mobile-chat-open" : ""} ${showVerificationBanner ? "with-banner" : ""}`}
   >
    <div
     className={`${styles.appContent} ${showVerificationBanner ? "with-banner" : ""}`}
    >
     <Sidebar
      showMobileChat={showMobileChat}
      showMobileSearch={showMobileSearch}
      onLogout={handleLogout}
      contacts={contacts}
      onSelectContact={selectContact}
      activeContact={activeContact}
      API_BASE_URL={API_BASE_URL}
     />

     <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
       <div className={styles.userProfile}>
        <div className={styles.contactAvatarContainer}>
         <img
          src={
           user?.avatar_url
            ? `${API_BASE_URL}${user.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt="Profile"
          className={styles.profileAvatar}
          onClick={() => setShowProfileModal(user)}
          style={{ cursor: 'pointer' }}
          draggable="false"
          title="View Your Own Profile"
         />
         <div className={`status-indicator ${user?.forced_status === 'offline' ? 'offline' :
          user?.forced_status === 'away' ? 'away' :
           userStatuses[user?.id] === 'away' ? 'away' : 'online'
          }`}></div>
        </div>
        <div className={styles.userInfo}>
         <span className={styles.username}>
          {user?.username}
         </span>
         <span className={styles.handle}>@{user?.handle}</span>
        </div>
        <button
         className={styles.userMenuBtn}
         onClick={(e) => {
          e.stopPropagation();
          setShowUserMenu(!showUserMenu);
         }}
        >
         <i className="fas fa-chevron-down"></i>
        </button>
        {showUserMenu && (
         <div className={styles.userMenu}>
          <button onClick={() => {
           setShowProfileModal(user);
           setShowUserMenu(false);
          }}>
           <i className="fas fa-user" style={{ marginRight: '8px', width: '14px', display: 'inline-flex', justifyContent: 'center' }}></i>
           My Profile
          </button>
          <button onClick={() => {
           setShowStatusModal(true);
           setShowUserMenu(false);
          }}>
           {userStatuses[user?.id] === 'away' ? (
            <span style={{ width: '14px', marginRight: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
             <SVG
              src="/resources/icons/away-icon.svg"
              alt="Status"
              style={{ width: '18px', height: '18px' }}
             />
            </span>
           ) : (
            <span style={{ width: '14px', marginRight: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
             <i className="fas fa-circle" style={{ fontSize: '14px', color: '#4caf50' }}></i>
            </span>
           )}
           Set Status
          </button>
          <button onClick={handleLogout} style={{ color: '#ff4757' }}>
           <i className="fas fa-sign-out-alt" style={{ marginRight: '8px', width: '14px', display: 'inline-flex', justifyContent: 'center' }}></i>
           Logout
          </button>
         </div>
        )}
       </div>

       <div className={styles.searchSection}>
        <div className={styles.searchInputContainer}>
         <input
          type="text"
          placeholder="Search for people..."
          value={searchQuery}
          onChange={(e) => {
           setSearchQuery(e.target.value);
           setShowSearch(true);
          }}
          onFocus={() => setShowSearch(true)}
          {...stylex.props(sx.searchInput)}
         />
         {showSearch && (
          <button
           {...stylex.props(sx.searchClose)}
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
         <div className={styles.searchResults}>
          {searchResults.map((result) => (
           <div key={result.id} className={styles.searchResult}>
            <img
             src={
              result.avatar_url
               ? `${API_BASE_URL}${result.avatar_url}`
               : `${API_BASE_URL}/api/avatars?user=${btoa(`avatar_${result.id}_${result.handle}`)}`
             }
             alt={result.username}
             className={styles.searchAvatar}
            />
            <div className={styles.searchUserInfo}>
             <span className={styles.searchUsername}>
              {result.username}
             </span>
             <span className={styles.searchHandle}>
              @{result.handle}
             </span>
            </div>
            <button
             {...stylex.props(sx.addContactBtn)}
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

      <div className={styles.mobileHeader}>
       <div className={styles.mobileLogo}>
        <img
         draggable="false"
         src="/resources/favicon.png"
         alt="uChat Logo"
         className={styles.mobileLogoIcon}
        />
        <span className={styles.mobileLogoText}>uChat</span>
       </div>
       <div className={styles.mobileHeaderActions}>
        <button
         className={styles.userMenuBtn}
         onClick={(e) => {
          e.stopPropagation();
          setShowUserMenu(!showUserMenu);
         }}
         style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
         <div className={styles.contactAvatarContainer}>
          <img
           src={
            user?.avatar_url
             ? `${API_BASE_URL}${user.avatar_url}`
             : "/resources/default_avatar.png"
           }
           alt="Profile"
           draggable="false"
           className={styles.mobileAvatar}
          />
          <div className={`status-indicator ${user?.forced_status === 'offline' ? 'offline' :
           user?.forced_status === 'away' ? 'away' :
            userStatuses[user?.id] === 'away' ? 'away' : 'online'
           }`}></div>
         </div>
         <i className="fas fa-chevron-down" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}></i>
        </button>
       </div>
       {showUserMenu && (
        <div className={`${styles.userMenu} ${styles.mobileUserMenu}`}>
         <button onClick={() => {
          setShowProfileModal(user);
          setShowUserMenu(false);
         }}>
          <i className="fas fa-user" style={{ marginRight: '8px', width: '14px', display: 'inline-flex', justifyContent: 'center' }}></i>
          My Profile
         </button>
         <button onClick={() => {
          setShowStatusModal(true);
          setShowUserMenu(false);
         }}>
          {userStatuses[user?.id] === 'away' ? (
           <span style={{ width: '14px', marginRight: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
            <SVG
             src="/resources/icons/away-icon.svg"
             alt="Status"
             style={{ width: '18px', height: '18px' }}
            />
           </span>
          ) : (
           <span style={{ width: '14px', marginRight: '8px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
            <i className="fas fa-circle" style={{ fontSize: '14px', color: '#4caf50' }}></i>
           </span>
          )}
          Set Status
         </button>
         <button onClick={() => {
          handleLogout();
          setShowUserMenu(false);
         }} style={{ color: '#ff4757' }}>
          <i className="fas fa-sign-out-alt" style={{ marginRight: '8px', width: '14px', display: 'inline-flex', justifyContent: 'center' }}></i>
          Logout
         </button>
        </div>
       )}
      </div>

      <div className={styles.mobileSearchTrigger}>
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
        className={`${styles.mobileSearchOverlay} ${searchExiting ? "exiting" : "entering"}`}
       >
        <div className={styles.mobileSearchHeader}>
         <button
          className={styles.mobileSearchBack}
          onClick={closeMobileSearch}
         ></button>
         <div className={styles.searchInputContainer}>
          <input
           type="text"
           placeholder="Search users..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className={styles.mobileSearchInput}
           autoFocus
          />
         </div>
        </div>
        <div className={styles.mobileSearchContent}>
         {searchResults.length > 0 ? (
          <div className={styles.searchResults}>
           {searchResults.map((result) => (
            <div key={result.id} className={styles.searchResult}>
             <img
              draggable="false"
              src={
               result.avatar_url
                ? `${API_BASE_URL}${result.avatar_url}`
                : `${API_BASE_URL}/api/avatars?user=${btoa(`avatar_${result.id}_${result.handle}`)}`
              }
              alt={result.username}
              className={styles.searchAvatar}
             />
             <div className={styles.searchUserInfo}>
              <span className={styles.searchUsername}>
               {result.username}
              </span>
              <span className={styles.searchHandle}>
               @{result.handle}
              </span>
             </div>
             <button
              className={styles.addContactBtn}
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
          <div className={styles.noSearchResults}>
           <p>No users found</p>
          </div>
         ) : (
          <div className={styles.searchPlaceholder}>
           <p>Start typing to search for users...</p>
          </div>
         )}
        </div>
       </div>
      )}

      <div className={styles.contactsList}>
       {contactsLoading ? (
        <ContactsSkeleton />
       ) : contacts.length === 0 ? (
        <div className={styles.emptyContacts}>
         <p>No contacts yet</p>
         <p>Search for users to start chatting</p>
        </div>
       ) : (
        contacts.map((contact) => (
         <div
          key={contact.id}
          className={`${styles.contactItem} ${activeContact?.id === contact.id ? styles.contactItemActive : ""}`}
          onClick={() => selectContact(contact)}
         >
          <div className={styles.contactAvatarContainer}>
           <img
            src={
             contact.avatar_url
              ? `${API_BASE_URL}${contact.avatar_url}`
              : "/resources/default_avatar.png"
            }
            alt={contact.username}
            onClick={(e) => {
             e.stopPropagation();
             setShowProfileModal(contact);
            }}
            style={{ cursor: 'pointer' }}
            className={styles.contactAvatar}
            draggable="false"
            title={`View ${contact.username}'s Profile`}
           />
           <div
            className={`status-indicator ${userStatuses[contact.id] === "away" ? "away" :
             onlineUsers.includes(contact.id) ? "online" : "offline"
             }`}
           ></div>
          </div>
          <div className={styles.contactInfo}>
           <div className={styles.contactMain}>
            <span className={styles.contactName}>
             {contact.username}
             {!contact.is_verified && (
              <SVG
               src="/resources/icons/unverified.svg"
               alt="Unverified"
               className={styles.unverifiedIcon}
               onClick={(e) => {
                e.stopPropagation();
                setShowUnverifiedModal(contact.username);
               }}
               title="Unverified user"
              />
             )}
            </span>
            <span className={styles.contactTime}>
             {formatContactTime(contact.lastMessageTime, isMobile)}
            </span>
           </div>
           <span
            className={`${styles.contactPreview} ${contact.unread && activeContact?.id !== contact.id
             ? styles.contactPreviewUnread
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

     <div className={styles.chatContainer}>
      {activeContact ? (
       <>
        <div
         {...stylex.props(chatStyles.chatHeader)}
        >
         {isMobile && (
          <button
           className={styles.mobileBackBtn}
           onClick={handleBackToContacts}
          ></button>
         )}
         <div className={styles.contactAvatarContainer}>
          <img
           draggable="false"
           src={
            activeContact.avatar_url
             ? `${API_BASE_URL}${activeContact.avatar_url}`
             : "/resources/default_avatar.png"
           }
           alt={activeContact.username}
           onClick={() => setShowProfileModal(activeContact)}
           style={{ cursor: 'pointer' }}
           {...stylex.props(chatStyles.chatAvatar)}
           title={`View ${activeContact.username}'s Profile`}
          />
          <div
           className={`status-indicator ${userStatuses[activeContact.id] === "away" ? "away" :
            onlineUsers.includes(activeContact.id) ? "online" : "offline"
            }`}
          ></div>
         </div>
         <div {...stylex.props(chatStyles.chatUserInfo)}>
          <div {...stylex.props(chatStyles.chatUsernameContainer)}>
           <span {...stylex.props(chatStyles.chatUsername)}>
            {activeContact.username}
           </span>
           {!activeContact.is_verified && (
            <SVG
             src="/resources/icons/unverified.svg"
             alt="Unverified"
             {...stylex.props(chatStyles.chatUnverifiedIcon)}
             onClick={() =>
              setShowUnverifiedModal(activeContact.username)
             }
             title="Unverified user - Click for more info"
            />
           )}
           {!(isMobile && showMobileChat) && (
            <>
             <span {...stylex.props(chatStyles.chatAka)}>aka</span>
             <span {...stylex.props(chatStyles.chatHandle)}>@{activeContact.handle}</span>
            </>
           )}
          </div>
          <span {...stylex.props(chatStyles.chatStatus)}>
           {userStatuses[activeContact.id] === "online"
            ? "Available Now"
            : userStatuses[activeContact.id] === "away"
             ? formatInactiveTime(activeContact.last_seen)
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

        <div
         {...stylex.props(chatStyles.messagesContainer, isLoadingMessages === true && messages.length === 0 && styles.messagesContainerHidden)}
         ref={messagesContainerRef}
         onScroll={handleScroll}
         style={isLoadingMessages === false && messages.length === 0 ? { visibility: 'visible', opacity: 1 } : undefined}
        >
         {isLoadingMessages === true && messages.length === 0 && (
          <div style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           height: '100%',
           color: 'var(--text-secondary)'
          }}>
           <div className={styles.loadingSpinner}></div>
          </div>
         )}
         {((isLoadingMessages === false && messages.length === 0) || (!hasMoreMessages && messages.length > 0 && !loadingMoreMessages)) && (
          <StartOfChat
           contact={activeContact}
           onProfileClick={setShowProfileModal}
           API_BASE_URL={API_BASE_URL}
          />
         )}
         {loadingMoreMessages && (
          <div style={{
           position: 'absolute',
           top: '10px',
           left: '50%',
           transform: 'translateX(-50%)',
           zIndex: 10,
           pointerEvents: 'none'
          }}>
           <div className={styles.loadingSpinner} style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--button-primary)',
            marginBottom: '0',
            borderRadius: '50%'
           }}></div>
          </div>
         )}
         {messages.length > 0 && (
          messages.map((message, index) => {
           const prevMessage = messages[index - 1];
           const isSameSenderAsPrev = prevMessage && prevMessage.sender_id === message.sender_id && !prevMessage.deleted && !message.deleted;
           const showHeader = !isSameSenderAsPrev;

           return (
            <Message
             key={message.id}
             message={message}
             user={user}
             activeContact={activeContact}
             onlineUsers={onlineUsers}
             userStatuses={userStatuses}
             isGrouped={isSameSenderAsPrev}
             showHeader={showHeader}
             onProfileClick={(userData) => setShowProfileModal(userData)}
             onAddReaction={handleAddReaction}
             onRemoveReaction={handleRemoveReaction}
             messageReactions={messageReactions}
             isMobile={isMobile}
             showReactionPopup={showReactionPopup}
             setShowReactionPopup={setShowReactionPopup}
             onLongPress={(msg) => setShowMessageOptionsPhone(msg)}
             onReply={handleReplyToMessage}
             onDelete={setDeleteConfirm}
             onReport={handleReportMessage}
             allMessages={messages}
            >
             {message.deleted ? (
              <div style={{
               fontStyle: 'italic',
               color: 'var(--text-muted)',
               padding: '8px 0'
              }}>
               <em>
                {message.sender_id === user.id
                 ? "You have DELETED this message."
                 : "This message has been DELETED."}
               </em>
              </div>
             ) : message.message_type === "image" ? (
              <ImageMessage
               message={message}
               API_BASE_URL={API_BASE_URL}
               onOpenViewer={setShowMediaViewer}
              />
             ) : message.message_type === "file" && message.file_type && ['mp4', 'webm', 'ogg', 'mov'].includes(message.file_type.toLowerCase()) ? (
              <VideoMessage
               message={message}
               API_BASE_URL={API_BASE_URL}
               onOpenViewer={setShowMediaViewer}
              />
             ) : message.message_type === "file" && message.file_type && ['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(message.file_type.toLowerCase()) ? (
              <AudioMessage
               message={message}
               API_BASE_URL={API_BASE_URL}
              />
             ) : message.message_type === "file" ? (
              <FileMessage
               message={message}
               API_BASE_URL={API_BASE_URL}
               formatFileSize={formatFileSize}
               getFileIcon={getFileIcon}
              />
             ) : message.content && (message.content.startsWith('https://media.tenor.com/') || message.content.startsWith('https://media.giphy.com/')) ? (
              <GifMessage
               message={message}
               onOpenViewer={setShowMediaViewer}
              />
             ) : (
              <div>{message.content}</div>
             )}
            </Message>
           );
          })
         )}

         <div ref={messagesEndRef} />
         {deleteConfirm && (
          <DeleteModal
           message={deleteConfirm}
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
         {...stylex.props(inputStyles.messageInputArea, dragOver && styles.dragOver)}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
        >
         {typingUsers.has(activeContact?.id) && (
          <div {...stylex.props(chatStyles.typingIndicatorFloating)}>
           <span>{activeContact.username} is typing...</span>
          </div>
         )}
         <Reply
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
          activeContact={activeContact}
         />
         <form
          onSubmit={(e) => {
           e.preventDefault();
           if (!isOffline) sendMessage();
          }}
          {...stylex.props(inputStyles.messageInputContainer)}
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
           {...stylex.props(inputStyles.attachmentButton)}
           onClick={() => fileInputRef.current?.click()}
           title={isOffline ? "Offline - can't send files" : "Attach file"}
           disabled={isOffline}
          >
           <SVG src="/resources/icons/attachment.svg" alt="Attach" draggable="false" style={{ width: '24px', height: '24px' }} />
          </button>
          <button
           type="button"
           {...stylex.props(inputStyles.gifButton)}
           onClick={() => setShowGifPicker(true)}
           title={isOffline ? "Offline - can't send GIFs" : "Send GIF"}
           disabled={isOffline}
          >
           <SVG src="/resources/icons/gif.svg" alt="GIF" draggable="false" style={{ width: '24px', height: '24px' }} />
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
           {...stylex.props(inputStyles.messageInput)}
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
           {...stylex.props(inputStyles.sendButton)}
           disabled={!messageText.trim() || isOffline}
          >
           <SVG src="/resources/icons/send.svg" alt="Send" draggable="false" style={{ width: '24px', height: '24px' }} />
          </button>
         </form>
        </div>
       </>
      ) : !isMobile ? (
       <div {...stylex.props(chatStyles.noChatSelected)}>
        <h2>Welcome to uChat</h2>
        <p>Select a contact to start chatting</p>
       </div>
      ) : (
       <div style={{ display: "none" }}></div>
      )}
     </div>

     {(error &&
      !(typeof error === "string" &&
       !callState.isActive &&
       (error.toLowerCase().includes("call connection failed") ||
        error.toLowerCase().includes("connection failed")))) && (
       <div className={styles.errorToast}>{error}</div>
      )}

     {callState.isIncoming && (
      <IncomingCallNotification
       callState={callState}
       API_BASE_URL={API_BASE_URL}
       onAnswer={() => answerCall(true)}
       onDecline={() => answerCall(false)}
      />
     )}

     {screenshareState.isIncoming && (
      <IncomingScreenshareNotification
       screenshareState={screenshareState}
       API_BASE_URL={API_BASE_URL}
       onAnswer={() => answerScreenshare(true)}
       onDecline={() => answerScreenshare(false)}
      />
     )}

     {(screenshareState.isActive || screenshareState.isSharing) && (
      <>
       {screenshareMinimized ? (
        <MinimizedScreenshare
         screenshareState={screenshareState}
         callPosition={callPosition}
         isDragging={isDragging}
         screenshareLocalVideoRef={screenshareLocalVideoRef}
         screenshareRemoteVideoRef={screenshareRemoteVideoRef}
         onDragStart={handleDragStart}
         onMaximize={() => setScreenshareMinimized(false)}
         onEnd={endScreenshare}
        />
       ) : (
        <ActiveScreenshare
         screenshareState={screenshareState}
         screenshareLocalVideoRef={screenshareLocalVideoRef}
         screenshareRemoteVideoRef={screenshareRemoteVideoRef}
         onMinimize={() => setScreenshareMinimized(true)}
         onEnd={endScreenshare}
         onOverlayClick={() => {
          const controls = document.querySelector('.modern-screenshare-controls-wrapper');
          if (controls) {
           controls.classList.toggle('visible');
           setTimeout(() => {
            if (controls.classList.contains('visible')) {
             controls.classList.remove('visible');
            }
           }, 3000);
          }
         }}
        />
       )}
      </>
     )}
     {(callState.isOutgoing || callState.isActive) &&
      !callState.isIncoming && (
       <>
        {callMinimized ? (
         <MinimizedCall
          callState={callState}
          API_BASE_URL={API_BASE_URL}
          callPosition={callPosition}
          isDragging={isDragging}
          isMobile={isMobile}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onDragStart={handleDragStart}
          onMaximize={() => setCallMinimized(false)}
          onEnd={endCall}
          onClick={(e) => {
           if (!isDragging && isMobile) {
            e.stopPropagation();
            setCallMinimized(false);
           }
          }}
         />
        ) : (
         <ActiveCall
          callState={callState}
          API_BASE_URL={API_BASE_URL}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isMicMuted={isMicMuted}
          isCameraOff={isCameraOff}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onMinimize={() => setCallMinimized(true)}
          onEnd={endCall}
          onOverlayClick={(e) => {
           if (e.target.closest('button')) return;

           const header = document.querySelector('.modern-call-header');
           const controls = document.querySelector('.modern-call-controls-wrapper');
           const localVideo = document.querySelector('.modern-local-video');

           if (header && controls) {
            const isCurrentlyHidden = header.classList.contains('hidden');

            if (isCurrentlyHidden) {
             header.classList.remove('hidden');
             controls.classList.remove('hidden');
             if (localVideo) localVideo.classList.remove('ui-hidden');

             const hideTime = Date.now() + 4000;
             header.setAttribute('data-hide-time', hideTime);

             setTimeout(() => {
              const currentHideTime = parseInt(header.getAttribute('data-hide-time'));
              if (currentHideTime && Date.now() >= currentHideTime) {
               header.classList.add('hidden');
               controls.classList.add('hidden');
               if (localVideo) localVideo.classList.add('ui-hidden');
              }
             }, 4000);
            } else {
             header.classList.add('hidden');
             controls.classList.add('hidden');
             if (localVideo) localVideo.classList.add('ui-hidden');
            }
           }
          }}
         />
        )}
       </>
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
   </div>
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
   {showProfileModal && (
    <ProfileModal
     user={contacts.find(c => c.id === showProfileModal.id) || showProfileModal}
     onClose={() => setShowProfileModal(null)}
     currentUserId={user.id}
     onlineUsers={onlineUsers}
     userStatuses={userStatuses}
     onSendMessage={(message) => {
      if (socketRef.current && showProfileModal) {
       socketRef.current.emit("send_message", {
        receiver_id: showProfileModal.id,
        content: message,
        reply_to: null
       });
      }
     }}
     onStartCall={() => {
      if (showProfileModal && startCall) {
       startCall(showProfileModal, "audio");
      }
     }}
     onStartVideoCall={() => {
      if (showProfileModal && startCall) {
       startCall(showProfileModal, "video");
      }
     }}
     onOpenChat={(u) => {
      setShowProfileModal(false);
      selectContact(u);
     }}
     lastMessage={contacts.find(c => c.id === showProfileModal.id)?.lastMessage || showProfileModal?.lastMessage}
     lastMessageSenderId={contacts.find(c => c.id === showProfileModal.id)?.lastSenderId || showProfileModal?.lastSenderId}
    />
   )}
   {showReactionPopup && (
    <ReactionMore
     messageId={showReactionPopup}
     onAddReaction={handleAddReaction}
     onClose={() => setShowReactionPopup(null)}
     position={reactionPopupPosition}
     onReply={handleReplyToMessage}
     message={messages.find(m => m.id === showReactionPopup)}
    />
   )}
   {showMediaViewer && (
    <MediaViewer
     media={showMediaViewer}
     onClose={() => setShowMediaViewer(null)}
    />
   )}
   {showMessageOptionsPhone && isMobile && (
    <MessageOptionsPhone
     message={showMessageOptionsPhone}
     isOwnMessage={showMessageOptionsPhone.sender_id === user.id}
     onReply={handleReplyToMessage}
     onAddReaction={handleAddReaction}
     onRemoveReaction={handleRemoveReaction}
     onDelete={setDeleteConfirm}
     onReport={handleReportMessage}
     onClose={() => setShowMessageOptionsPhone(null)}
     currentUserReactions={
      messageReactions[showMessageOptionsPhone.id]
       ? Object.entries(messageReactions[showMessageOptionsPhone.id])
        .filter(([type, data]) => data.users?.includes(user.id))
        .map(([type]) => type)
       : []
     }
    />
   )}
   {showStatusModal && (
    <StatusModal
     onClose={() => setShowStatusModal(false)}
     onSelectStatus={handleSetStatus}
     currentStatus={
      user?.forced_status === 'offline' ? 'offline' :
       user?.forced_status === 'away' ? 'away' :
        userForcedStatus === 'offline' ? 'offline' :
         userForcedStatus === 'away' ? 'away' :
          userStatuses[user?.id] === 'away' ? 'away' :
           'online'
     }
    />
   )}
   {showReportModal && (
    <ReportModal
     message={showReportModal}
     onClose={() => setShowReportModal(null)}
     onSubmit={handleSubmitReport}
    />
   )}
   {showWarning && (
    <WarningForModeration onClose={() => setShowWarning(false)} />
   )}
  </>
 );
};

export default App;