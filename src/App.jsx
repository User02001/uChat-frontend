import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import lottie from 'lottie-web';
import { useAppLogic } from "./hooks/useAppLogic";
import Sidebar from "./components/Sidebar";
import Reply from "./components/Reply";
import { API_BASE_URL, SOCKET_URL } from "./config";
import useCalls from "./hooks/useCalls";
import MessagesSkeleton from "./components/MessagesSkeleton";
import ContactsSkeleton from "./components/ContactsSkeleton";
import Reaction from "./components/Reaction";
import ReactionMore from "./components/ReactionMore";
import DeleteModal from "./components/DeleteModal";
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
import { encryptFor } from "./crypto/e2ee";

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
  if (isDragging) {
   window.addEventListener('mousemove', handleDragMove);
   window.addEventListener('mouseup', handleDragEnd);
   window.addEventListener('touchmove', handleDragMove);
   window.addEventListener('touchend', handleDragEnd);

   return () => {
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
   };
  }
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

    let content = (message ?? "").toString();
    try {
     const res = await fetch(`${API_BASE_URL}/api/keys/${receiverId}`, { credentials: "include" });
     const { devices } = await res.json();
     const target = devices?.[0];
     if (target?.public_key_b64) {
      content = await encryptFor(target.public_key_b64, content);
     }
    } catch { /* fallback to plaintext if anything fails */ }

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

 // Handle socket reconnection and sync
 useEffect(() => {
  if (!socketRef.current) return;

  const handleReconnect = () => {
   console.log('[SYNC] Socket reconnected - syncing state...');

   socketRef.current.emit('sync_state', {
    active_contact_id: activeContact?.id
   });

   socketRef.current.emit('request_contacts_update');
   socketRef.current.emit('request_online_users');

   if (activeContact) {
    loadMessages(activeContact.id);
   }
  };

  const handleMessagesSnced = (data) => {
   if (data.contact_id === activeContact?.id) {
    setMessages(data.messages);
   }
  };

  const handleForceContactsRefresh = () => {
   loadContacts();
  };

  socketRef.current.on('reconnect', handleReconnect);
  socketRef.current.on('messages_synced', handleMessagesSnced);
  socketRef.current.on('force_contacts_refresh', handleForceContactsRefresh);

  return () => {
   if (socketRef.current) {
    socketRef.current.off('reconnect', handleReconnect);
    socketRef.current.off('messages_synced', handleMessagesSnced);
    socketRef.current.off('force_contacts_refresh', handleForceContactsRefresh);
   }
  };
 }, [activeContact, loadMessages, loadContacts]);

 // Handle page visibility changes - NO SCROLL TAMPERING
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (!document.hidden && socketRef.current && socketRef.current.connected) {
    socketRef.current.emit('request_online_users');
   }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
   document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
 }, [activeContact]);

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
  toggleCamera
 } = useCalls(socketRef, setError, callMinimized, screenshareMinimized);

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

 // Handle screenshare local video setup
 useEffect(() => {
  if (
   screenshareState.localStream &&
   screenshareLocalVideoRef.current &&
   screenshareState.isSharing
  ) {
   console.log("Setting up local screenshare video:", screenshareState.localStream.id);
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
  setSessionDismissed(true);
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

 // Handle local video setup for both caller and receiver
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   console.log("Setting up local video from useEffect:", callState.localStream.id);
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

 // Re-assign video streams when minimized state changes
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   localVideoRef.current.srcObject = callState.localStream;
   localVideoRef.current.muted = true;
   localVideoRef.current.play().catch(console.error);
  }

  if (callState.remoteStream && remoteVideoRef.current) {
   remoteVideoRef.current.srcObject = callState.remoteStream;
   remoteVideoRef.current.muted = false;
   remoteVideoRef.current.play().catch(console.error);
  }
 }, [callMinimized]);

 // Re-assign screenshare streams when minimized state changes
 useEffect(() => {
  if (screenshareState.localStream && screenshareLocalVideoRef.current && screenshareState.isSharing) {
   screenshareLocalVideoRef.current.srcObject = screenshareState.localStream;
   screenshareLocalVideoRef.current.muted = true;
   screenshareLocalVideoRef.current.play().catch(console.error);
  }

  if (screenshareState.remoteStream && screenshareRemoteVideoRef.current && screenshareState.isViewing) {
   screenshareRemoteVideoRef.current.srcObject = screenshareState.remoteStream;
   screenshareRemoteVideoRef.current.muted = false;
   screenshareRemoteVideoRef.current.play().catch(console.error);
  }
 }, [screenshareMinimized]);

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
   pdf: "fas fa-file-pdf",
   doc: "fas fa-file-word",
   docx: "fas fa-file-word",
   txt: "fas fa-file-alt",
   rtf: "fas fa-file-alt",
   zip: "fas fa-file-archive",
   rar: "fas fa-file-archive",
   "7z": "fas fa-file-archive",
   tar: "fas fa-file-archive",
   gz: "fas fa-file-archive",
   mp4: "fas fa-file-video",
   avi: "fas fa-file-video",
   mkv: "fas fa-file-video",
   mov: "fas fa-file-video",
   wmv: "fas fa-file-video",
   mp3: "fas fa-file-audio",
   wav: "fas fa-file-audio",
   flac: "fas fa-file-audio",
   aac: "fas fa-file-audio",
   xlsx: "fas fa-file-excel",
   xls: "fas fa-file-excel",
   csv: "fas fa-file-csv",
   pptx: "fas fa-file-powerpoint",
   ppt: "fas fa-file-powerpoint",
   js: "fas fa-file-code",
   html: "fas fa-file-code",
   css: "fas fa-file-code",
   py: "fas fa-file-code",
   java: "fas fa-file-code",
   cpp: "fas fa-file-code",
   c: "fas fa-file-code",
   php: "fas fa-file-code",
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

 // Handle scroll for lazy loading
 const messagesContainerRef = useRef(null);
 const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
 const previousScrollHeight = useRef(0);

 const userScrollLockRef = useRef(false);
 const clearLockTimeoutRef = useRef(null);

 const handleScroll = useCallback(() => {
  const container = messagesContainerRef.current;
  if (!container || !activeContact) return;

  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

  const LOCK_AT = 200;
  const UNLOCK_AT = 8;

  if (distanceFromBottom > LOCK_AT) {
   if (!userScrollLockRef.current) {
    userScrollLockRef.current = true;
    setShouldScrollToBottom(false);
   }
  } else if (distanceFromBottom <= UNLOCK_AT) {
   if (userScrollLockRef.current) {
    userScrollLockRef.current = false;
    setShouldScrollToBottom(true);
   }
  }

  if (!loadingMoreMessages && hasMoreMessages && container.scrollTop < 150 && messages.length > 0) {
   const oldestMessage = messages[0];
   if (oldestMessage) {
    setLoadingMoreMessages(true);
    previousScrollHeight.current = container.scrollHeight;
    loadMessages(activeContact.id, oldestMessage.id);
   }
  }
 }, [activeContact, messages, hasMoreMessages, loadingMoreMessages, loadMessages]);

 const lastMessageIdRef = useRef(null);

 useEffect(() => {
  if (!messages || messages.length === 0) return;

  const container = messagesContainerRef.current;
  if (!container) return;

  if (!loadingMoreMessages && previousScrollHeight.current) {
   const delta = container.scrollHeight - previousScrollHeight.current;
   container.scrollTop = container.scrollTop + delta;
   previousScrollHeight.current = 0;
   return;
  }

  const lastMsg = messages[messages.length - 1];
  const isMine = user && lastMsg && lastMsg.sender_id === user.id;

  const prevLastId = lastMessageIdRef.current;
  const newLastId = lastMsg?.id ?? null;
  const lastChanged = prevLastId !== newLastId;

  const nearBottom =
   container.scrollHeight - container.scrollTop - container.clientHeight < 80;

  const isInitialLoad = prevLastId === null;

  lastMessageIdRef.current = newLastId;

  if (isInitialLoad) {
   if (container && container.scrollHeight > 0) {
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => {
     setMessagesContainerVisible(true);
    });
   }
   return;
  }

  const canAutoScroll =
   (lastChanged && isMine && !userScrollLockRef.current) || (lastChanged && nearBottom && !userScrollLockRef.current);

  if (canAutoScroll) {
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
     if (container) {
      container.scrollTop = container.scrollHeight;
     }
    });
   });
  }
 }, [messages, user, loadingMoreMessages]);

 // Reset scroll tracking when switching contacts
 useEffect(() => {
  lastMessageIdRef.current = null;
  userScrollLockRef.current = false;
  setShouldScrollToBottom(true);
  setHasMoreMessages(true);
  previousScrollHeight.current = 0;
 }, [activeContact?.id]);

 const splashRef = useRef(null);
 const animRef = useRef(null);

 useEffect(() => {
  if (loading && splashRef.current && !animRef.current) {
   animRef.current = lottie.loadAnimation({
    container: splashRef.current,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/splash.json'
   });

   return () => {
    if (animRef.current) {
     animRef.current.destroy();
     animRef.current = null;
    }
   };
  }
 }, [loading]);

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
      <p className={styles.splashBrandingText}>Made by</p>
      <div className={styles.splashBrandingLogo}>
       <img
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
     <Sidebar showMobileChat={showMobileChat} showMobileSearch={showMobileSearch} onLogout={handleLogout} />

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
         <div className={`status-indicator ${userStatuses[user?.id] === "away" ? "away" : "online"}`}></div>
        </div>
        <div className={styles.userInfo}>
         <span className={styles.username}>{user?.username}</span>
         <span className={styles.handle}>@{user?.handle}</span>
        </div>
        <button
         className={styles.userMenuBtn}
         onClick={() => setShowUserMenu(!showUserMenu)}
        >
         ⋮
        </button>
        {showUserMenu && (
         <div className={styles.userMenu}>
          <button onClick={handleLogout}>Logout</button>
         </div>
        )}
       </div>

       <div className={styles.searchSection}>
        <div className={styles.searchInputContainer}>
         <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSearch(true)}
          className={styles.searchInput}
         />
         {showSearch && (
          <button
           className={styles.searchClose}
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
               : "/resources/default_avatar.png"
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
        <div
         className={styles.contactAvatarContainer}
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
          className={styles.mobileAvatar}
         />
         <div className={`status-indicator ${userStatuses[user?.id] === "away" ? "away" : "online"}`}></div>
        </div>
       </div>
       {showUserMenu && (
        <div className={`${styles.userMenu} ${styles.mobileUserMenu}`}>
         <button onClick={handleLogout}>Logout</button>
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
                : "/resources/default_avatar.png"
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
              <img
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
         className={`${styles.chatHeader} ${isMobile ? (showChatContent ? styles.fadeIn : styles.fadeOut) : ""}`}
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
           className={styles.chatAvatar}
           title={`View ${activeContact.username}'s Profile`}
          />
         <div
          className={`status-indicator ${userStatuses[activeContact.id] === "away" ? "away" :
           onlineUsers.includes(activeContact.id) ? "online" : "offline"
           }`}
         ></div>
         </div>
         <div className={styles.chatUserInfo}>
          <div className={styles.chatUsernameContainer}>
           <span className={styles.chatUsername}>
            {activeContact.username}
           </span>
           {!activeContact.is_verified && (
            <img
             src="/resources/icons/unverified.svg"
             alt="Unverified"
             className={styles.unverifiedIcon}
             onClick={() =>
              setShowUnverifiedModal(activeContact.username)
             }
             title="Unverified user - Click for more info"
            />
           )}
           {!(isMobile && showMobileChat) && (
            <>
             <span className={styles.chatAka}>aka</span>
             <span className={styles.chatHandle}>@{activeContact.handle}</span>
            </>
           )}
          </div>
          <span className={styles.chatStatus}>
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
         className={`${styles.messagesContainer} ${messages.length === 0 || !messagesContainerVisible ? styles.messagesContainerHidden : ''}`}
         ref={messagesContainerRef}
         onScroll={handleScroll}
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
         {isLoadingMessages === false && messages.length === 0 && (
          <div className={styles.emptyMessages}>
           <p>This is the beginning of your chat with {activeContact.username}. Say hi!</p>
          </div>
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
           const nextMessage = messages[index + 1];

           const isSameSenderAsPrev = prevMessage && prevMessage.sender_id === message.sender_id && !prevMessage.deleted && !message.deleted;
           const isSameSenderAsNext = nextMessage && nextMessage.sender_id === message.sender_id && !nextMessage.deleted && !message.deleted;

           const isGrouped = !message.deleted && (isSameSenderAsPrev || isSameSenderAsNext);
           const isFirstInGroup = isGrouped && !isSameSenderAsPrev;
           const isLastInGroup = isGrouped && !isSameSenderAsNext;
           const isMiddleInGroup = isGrouped && !isFirstInGroup && !isLastInGroup;

           let groupClass = '';
           if (isGrouped) {
            if (isFirstInGroup) groupClass = 'opener';
            else if (isLastInGroup) groupClass = 'closer';
            else groupClass = 'middle';
           }

           const showAvatar = message.sender_id !== user.id && (!isGrouped || isLastInGroup);

           return (
            <div
             id={`message-${message.id}`}
             key={message.id}
             data-message-id={message.id}
             className={`${styles.message} ${message.sender_id === user.id ? "sent" : "received"} ${message.reply_to ? "reply" : ""} ${groupClass ? `in-group ${groupClass}` : ''}`}
             onTouchStart={(e) => {
              if (message.deleted) return;

              const touch = e.touches[0];
              const startY = touch.clientY;
              const startX = touch.clientX;
              let longPressTriggered = false;

              const longPressTimer = setTimeout(() => {
               longPressTriggered = true;
               setShowMessageOptionsPhone(message);
               if (navigator.vibrate) {
                navigator.vibrate(50);
               }
              }, 400);

              const handleTouchMove = (moveEvent) => {
               const moveTouch = moveEvent.touches[0];
               const moveY = Math.abs(moveTouch.clientY - startY);
               const moveX = Math.abs(moveTouch.clientX - startX);

               if (moveY > 10 || moveX > 10) {
                clearTimeout(longPressTimer);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
               }
              };

              const handleTouchEnd = () => {
               clearTimeout(longPressTimer);
               document.removeEventListener('touchmove', handleTouchMove);
               document.removeEventListener('touchend', handleTouchEnd);
              };

              document.addEventListener('touchmove', handleTouchMove);
              document.addEventListener('touchend', handleTouchEnd);
             }}
            >
             {message.sender_id !== user.id && (
              <div className={styles.messageAvatarContainer} style={!showAvatar ? { visibility: 'hidden' } : {}}>
               <img
                src={
                 activeContact.avatar_url
                  ? `${API_BASE_URL}${activeContact.avatar_url}`
                  : "/resources/default_avatar.png"
                }
                alt={activeContact.username}
                className={styles.messageAvatar}
                onClick={(e) => {
                 e.stopPropagation();
                 setShowProfileModal(activeContact);
                }}
                draggable="false"
                title="View Profile"
               />
               <div
                className={`status-indicator ${userStatuses[activeContact.id] === "away" ? "away" :
                 onlineUsers.includes(activeContact.id) ? "online" : "offline"
                 }`}
               ></div>
              </div>
             )}
             <div
              className={styles.messageBubble}
              title={new Date(message.timestamp + "Z").toLocaleString()}
              data-show-title="false"
             >
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

              {message.deleted ? (
               <div className={styles.deletedMessage}>
                <em>
                 {message.sender_id === user.id
                  ? "You have DELETED this message."
                  : "This message has been DELETED."}
                </em>
               </div>
              ) : message.message_type === "image" ? (
               (() => {
                const maxWidth = 300;
                const maxHeight = 400;
                let displayWidth = maxWidth;
                let displayHeight = maxHeight;
                let aspectRatio = '16 / 9';

                if (message.media_width && message.media_height) {
                 const mediaAspect = message.media_width / message.media_height;
                 aspectRatio = `${message.media_width} / ${message.media_height}`;

                 if (message.media_width > maxWidth) {
                  displayWidth = maxWidth;
                  displayHeight = maxWidth / mediaAspect;
                 } else {
                  displayWidth = message.media_width;
                  displayHeight = message.media_height;
                 }

                 if (displayHeight > maxHeight) {
                  displayHeight = maxHeight;
                  displayWidth = maxHeight * mediaAspect;
                 }
                }

                return (
                 <div
                  className={styles.messageImage}
                  onClick={() => setShowMediaViewer({
                   url: message.file_path,
                   name: message.file_name || 'Image',
                   type: 'image'
                  })}
                  style={{
                   cursor: 'pointer',
                   aspectRatio: aspectRatio,
                   width: `${displayWidth}px`,
                   maxWidth: `${maxWidth}px`,
                   background: 'var(--bg-tertiary)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   borderRadius: '12px',
                   overflow: 'hidden',
                   position: 'relative'
                  }}
                 >
                  {visibleMessages.has(message.id) ? (
                   <img
                    src={`${API_BASE_URL}${message.file_path}`}
                    alt="Shared image"
                    className={styles.sharedImage}
                    style={{
                     width: '100%',
                     height: '100%',
                     objectFit: 'cover',
                     opacity: 0,
                     transition: 'opacity 0.3s ease'
                    }}
                    onLoad={(e) => {
                     e.target.style.opacity = '1';
                    }}
                    onError={(e) => {
                     e.target.parentElement.innerHTML = '<div style="color: var(--text-muted); padding: 20px; font-size: 12px; text-align: center;">Failed to load image</div>';
                    }}
                   />
                  ) : (
                   <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--border) 25%, var(--border-light) 50%, var(--border) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeletonLoading 1.5s infinite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '32px'
                   }}>
                    📷
                   </div>
                  )}
                 </div>
                );
               })()
               ) : message.message_type === "file" ? (
                (() => {
                 const fileType = message.file_type?.toLowerCase();
                 const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(fileType);
                 const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(fileType);

                  if (isVideo) {
                   const maxWidth = 400;
                   const maxHeight = 400;
                   let displayWidth = maxWidth;
                   let displayHeight = maxHeight;
                   let aspectRatio = '16 / 9';

                   if (message.media_width && message.media_height) {
                    const mediaAspect = message.media_width / message.media_height;
                    aspectRatio = `${message.media_width} / ${message.media_height}`;

                    if (message.media_width > maxWidth) {
                     displayWidth = maxWidth;
                     displayHeight = maxWidth / mediaAspect;
                    } else {
                     displayWidth = message.media_width;
                     displayHeight = message.media_height;
                    }

                    if (displayHeight > maxHeight) {
                     displayHeight = maxHeight;
                     displayWidth = maxHeight * mediaAspect;
                    }
                   }

                   return (
                    <div className={styles.messageVideo} style={{
                     aspectRatio: aspectRatio,
                     width: `${displayWidth}px`,
                     maxWidth: `${maxWidth}px`,
                     background: 'var(--bg-tertiary)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     position: 'relative'
                    }}>
                     {visibleMessages.has(message.id) ? (
                      <VideoPlayer
                       src={`${API_BASE_URL}${message.file_path}`}
                       inChat={true}
                       onExpand={() => setShowMediaViewer({
                        url: message.file_path,
                        name: message.file_name,
                        type: 'video'
                       })}
                      />
                     ) : (
                      <div style={{
                       width: '100%',
                       height: '100%',
                       background: 'linear-gradient(90deg, var(--border) 25%, var(--border-light) 50%, var(--border) 75%)',
                       backgroundSize: '200% 100%',
                       animation: 'skeletonLoading 1.5s infinite',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'var(--text-muted)',
                       fontSize: '12px',
                       textAlign: 'center'
                      }}>
                       <i className="fas fa-video" style={{ fontSize: '32px', marginBottom: '8px' }}></i>
                       <div>Video</div>
                      </div>
                     )}
                    </div>
                   );
                  }

                 if (isAudio) {
                  return (
                   <div
                    className={styles.messageAudio}
                    onClick={() => setShowMediaViewer({
                     url: message.file_path,
                     name: message.file_name,
                     type: 'audio'
                    })}
                    style={{ cursor: 'pointer' }}
                   >
                    <div className={styles.audioIcon}>
                     <i className="fas fa-music"></i>
                    </div>
                    <div className={styles.audioInfo}>
                     <div className={styles.audioName}>
                      {message.file_name}
                     </div>
                     <div className={styles.audioSize}>
                      {formatFileSize(message.file_size)}
                     </div>
                    </div>
                    <div className={styles.audioPlay}>
                     <i className="fas fa-play"></i>
                    </div>
                   </div>
                  );
                 }

                 return (
                  <div
                   className={styles.messageFile}
                   onClick={() =>
                    window.open(
                     `${API_BASE_URL}${message.file_path}`,
                     "_blank"
                    )
                   }
                  >
                   <div className={styles.fileIcon}>
                    <i
                     className={getFileIcon(message.file_type)}
                    ></i>
                   </div>
                   <div className={styles.fileInfo}>
                    <div className={styles.fileName}>
                     {message.file_name}
                    </div>
                    <div className={styles.fileSize}>
                     {formatFileSize(message.file_size)}
                    </div>
                   </div>
                   <div className={styles.fileDownload}>
                    <i className="fas fa-download"></i>
                   </div>
                  </div>
                 );
                })()
                ) : message.content &&
                 message.content.match(/\.(gif)(\?.*)?$/i) ? (
                 (() => {
                  const maxWidth = 250;
                  const maxHeight = 300;
                  let displayWidth = maxWidth;
                  let displayHeight = maxHeight;
                  let aspectRatio = '1 / 1';

                  if (message.media_width && message.media_height) {
                   const mediaAspect = message.media_width / message.media_height;
                   aspectRatio = `${message.media_width} / ${message.media_height}`;

                   if (message.media_width > maxWidth) {
                    displayWidth = maxWidth;
                    displayHeight = maxWidth / mediaAspect;
                   } else {
                    displayWidth = message.media_width;
                    displayHeight = message.media_height;
                   }

                   if (displayHeight > maxHeight) {
                    displayHeight = maxHeight;
                    displayWidth = maxHeight * mediaAspect;
                   }
                  }

                  return (
                   <div
                    className={styles.messageImage}
                    onClick={() => setShowMediaViewer({
                     url: message.content.startsWith("http") ? message.content : message.content,
                     name: 'GIF',
                     type: 'image'
                    })}
                    style={{
                     cursor: 'pointer',
                     aspectRatio: aspectRatio,
                     width: `${displayWidth}px`,
                     maxWidth: `${maxWidth}px`,
                     background: 'var(--bg-tertiary)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     position: 'relative'
                    }}
                   >
                    {visibleMessages.has(message.id) ? (
                     <img
                      src={message.content.startsWith("http")
                       ? message.content
                       : `${API_BASE_URL}${message.content}`}
                      alt="Shared GIF"
                      className={styles.sharedImage}
                      style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover',
                       opacity: 0,
                       transition: 'opacity 0.3s ease'
                      }}
                      onLoad={(e) => {
                       e.target.style.opacity = '1';
                      }}
                      onError={(e) => {
                       e.target.parentElement.innerHTML = '<div style="color: var(--text-muted); padding: 20px; font-size: 12px; text-align: center;">Failed to load GIF</div>';
                      }}
                     />
                    ) : (
                     <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--border) 25%, var(--border-light) 50%, var(--border) 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'skeletonLoading 1.5s infinite',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '24px'
                     }}>
                      GIF
                     </div>
                    )}
                   </div>
                  );
                 })()
              ) : (
               <div className={styles.messageContent}>
                {linkify(message.content)}
               </div>
              )}

              <Reaction
               messageId={message.id}
               reactions={messageReactions[message.id] || {}}
               onAddReaction={handleAddReaction}
               onRemoveReaction={handleRemoveReaction}
               currentUserId={user.id}
              />
             </div>
             {!isMobile ? (
              <MessageOptions
               message={message}
               isOwnMessage={message.sender_id === user.id}
               onReply={handleReplyToMessage}
               onReact={(e, messageId) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const buttonRect = e.target.closest('.react-btn').getBoundingClientRect();
                setReactionPopupPosition({
                 x: buttonRect.left + buttonRect.width / 2,
                 y: buttonRect.top
                });
                setShowReactionPopup(
                 showReactionPopup === messageId ? null : messageId
                );
               }}
               onDelete={setDeleteConfirm}
               isDeleted={message.deleted}
              />
             ) : null}
            </div>
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
         className={`${styles.messageInputArea} ${dragOver ? styles.dragOver : ""} ${isMobile ? (showChatContent ? styles.fadeIn : styles.fadeOut) : ""}`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
        >
         {typingUsers.has(activeContact?.id) && (
          <div className={styles.typingIndicatorFloating}>
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
          className={styles.messageInputContainer}
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
           className={styles.attachmentButton}
           onClick={() => fileInputRef.current?.click()}
           title={isOffline ? "Offline - can't send files" : "Attach file"}
           disabled={isOffline}
          >
           <img src="/resources/icons/attachment.svg" alt="Attach" draggable="false" />
          </button>
          <button
           type="button"
           className={styles.gifButton}
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
           className={styles.messageInput}
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
           className={styles.sendButton}
           disabled={!messageText.trim() || isOffline}
          >
           <img src="/resources/icons/send.svg" alt="Send" draggable="false" />
          </button>
         </form>
        </div>
       </>
      ) : !isMobile ? (
       <div className={styles.noChatSelected}>
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
      <div className={styles.incomingCallNotification}>
       <div className={styles.incomingCallContent}>
        <div className={styles.incomingCallInfo}>
         <img
          draggable="false"
          src={
           callState.contact?.avatar_url
            ? `${API_BASE_URL}${callState.contact.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt={callState.contact?.username}
          className={styles.incomingCallAvatar}
         />
         <div className={styles.incomingCallText}>
          <h4>{callState.contact?.username}</h4>
          <p>
           Incoming {callState.type === "video" ? "video" : "audio"}{" "}
           call
          </p>
         </div>
        </div>
        <div className={styles.incomingCallActions}>
         <button
          className={styles.declineBtnSmall}
          onClick={() => answerCall(false)}
          title="Decline"
         ></button>
         <button
          className={styles.acceptBtnSmall}
          onClick={() => answerCall(true)}
          title="Accept"
         ></button>
        </div>
       </div>
      </div>
     )}

     {screenshareState.isIncoming && (
      <div className={styles.incomingCallNotification}>
       <div className={styles.incomingCallContent}>
        <div className={styles.incomingCallInfo}>
         <img
          draggable="false"
          src={
           screenshareState.contact?.avatar_url
            ? `${API_BASE_URL}${screenshareState.contact.avatar_url}`
            : "/resources/default_avatar.png"
          }
          alt={screenshareState.contact?.username}
          className={styles.incomingCallAvatar}
         />
         <div className={styles.incomingCallText}>
          <h4>{screenshareState.contact?.username}</h4>
          <p>Wants to share their screen</p>
         </div>
        </div>
        <div className={styles.incomingCallActions}>
         <button
          className={styles.declineBtnSmall}
          onClick={() => answerScreenshare(false)}
          title="Decline"
         ></button>
         <button
          className={styles.acceptBtnSmall}
          onClick={() => answerScreenshare(true)}
          title="Accept"
         ></button>
        </div>
       </div>
      </div>
     )}

     {(screenshareState.isActive || screenshareState.isSharing) && (
      <>
       {screenshareMinimized ? (
        <div
         className="modern-minimized-screenshare"
         style={{
          left: `${callPosition.x}px`,
          top: `${callPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
         }}
         onMouseDown={handleDragStart}
         onTouchStart={handleDragStart}
        >
         <div className="modern-minimized-header">
          <div className="modern-minimized-info">
           <div className="modern-minimized-screenshare-icon">
            <i className="fas fa-desktop"></i>
           </div>
           <div className="modern-minimized-user">
            <h4>{screenshareState.contact?.username}</h4>
            <p>
             {screenshareState.isSharing ? "Sharing Screen" : "Viewing Screen"}
            </p>
           </div>
          </div>
         </div>

         <div className="modern-minimized-screenshare-preview">
          {screenshareState.isViewing && (
           <video
            ref={screenshareRemoteVideoRef}
            className="modern-minimized-screenshare-video"
            autoPlay
            playsInline
           />
          )}
          {screenshareState.isSharing && (
           <video
            ref={screenshareLocalVideoRef}
            className="modern-minimized-screenshare-video"
            autoPlay
            playsInline
            muted
           />
          )}
         </div>

         <div className="modern-minimized-controls">
          <button
           className="modern-minimized-btn modern-minimized-maximize"
           onClick={(e) => {
            e.stopPropagation();
            setScreenshareMinimized(false);
           }}
           title="Maximize"
          >
           <i className="fas fa-expand"></i>
          </button>
          <button
           className="modern-minimized-btn modern-minimized-end"
           onClick={(e) => {
            e.stopPropagation();
            endScreenshare();
           }}
           title="Stop sharing"
          >
           <i className="fas fa-times"></i>
          </button>
         </div>
        </div>
       ) : (
        <div
         className="modern-screenshare-overlay"
         onClick={() => {
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
        >
         <div className="modern-screenshare-active">
          <div className="modern-screenshare-header">
           <div className="modern-screenshare-info">
            <div className="modern-screenshare-icon">
             <i className="fas fa-desktop"></i>
            </div>
            <div className="modern-screenshare-user">
             <h3>
              {screenshareState.isSharing
               ? `Sharing with ${screenshareState.contact?.username}`
               : screenshareState.contact?.username}
             </h3>
             <p>
              {screenshareState.isSharing
               ? "Screen Share Active"
               : "Viewing Screen Share"}
             </p>
            </div>
           </div>
           <button
            className="modern-screenshare-minimize-btn"
            onClick={(e) => {
             e.stopPropagation();
             setScreenshareMinimized(true);
            }}
            title="Minimize"
           >
            <i className="fas fa-minus"></i>
           </button>
          </div>

          <div className="modern-screenshare-container">
           {screenshareState.isViewing && (
            <video
             ref={screenshareRemoteVideoRef}
             className="modern-screenshare-video"
             autoPlay
             playsInline
             controls={false}
            />
           )}
           {screenshareState.isSharing && (
            <video
             ref={screenshareLocalVideoRef}
             className="modern-screenshare-video"
             autoPlay
             playsInline
             muted
            />
           )}
          </div>

          <div className="modern-screenshare-controls-wrapper visible">
           <div className="modern-screenshare-controls">
            <button
             className="modern-screenshare-end-btn"
             onClick={(e) => {
              e.stopPropagation();
              endScreenshare();
             }}
             title="Stop sharing"
            >
             <i className="fas fa-times"></i>
            </button>
           </div>
          </div>
         </div>
        </div>
       )}
      </>
     )}
     {(callState.isOutgoing || callState.isActive) &&
      !callState.isIncoming && (
       <>
        {callMinimized ? (
         <div
          className="modern-minimized-call"
          style={{
           left: `${callPosition.x}px`,
           top: `${callPosition.y}px`,
           cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={(e) => {
           if (!isDragging && isMobile) {
            e.stopPropagation();
            setCallMinimized(false);
           }
          }}
         >
          <div className="modern-minimized-header">
           <div className="modern-minimized-info">
            <img
             src={
              callState.contact?.avatar_url
               ? `${API_BASE_URL}${callState.contact.avatar_url}`
               : "/resources/default_avatar.png"
             }
             alt={callState.contact?.username}
             className="modern-minimized-avatar"
             draggable="false"
            />
            <div className="modern-minimized-user">
             <h4>{callState.contact?.username}</h4>
             <p>{callState.type === "video" ? "Video Call" : "Audio Call"}</p>
            </div>
           </div>
          </div>

          {callState.type === "video" ? (
           <div className="modern-minimized-video">
            <video
             ref={remoteVideoRef}
             className="modern-minimized-remote-video"
             autoPlay
             playsInline
             muted={false}
            />
           </div>
          ) : (
           <div className="modern-minimized-audio">
            <div className="modern-minimized-audio-wave"></div>
           </div>
          )}

          <div className="modern-minimized-controls">
           <button
            className="modern-minimized-btn modern-minimized-maximize"
            onClick={(e) => {
             e.stopPropagation();
             setCallMinimized(false);
            }}
            title="Maximize"
           >
            <i className="fas fa-expand"></i>
           </button>
           <button
            className="modern-minimized-btn modern-minimized-end"
            onClick={(e) => {
             e.stopPropagation();
             endCall();
            }}
            title="End call"
           >
            <i className="fas fa-phone"></i>
           </button>
          </div>

          <audio
           ref={callState.type === "audio" ? remoteVideoRef : null}
           autoPlay
           muted={false}
           style={{ display: "none" }}
          />
         </div>
        ) : (
         <div
          className="modern-call-overlay"
          onClick={(e) => {
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
         >
          <div className="modern-active-call">
           <div className="modern-call-header">
            <div className="modern-call-info">
             <img
              src={
               callState.contact?.avatar_url
                ? `${API_BASE_URL}${callState.contact.avatar_url}`
                : "/resources/default_avatar.png"
              }
              alt={callState.contact?.username}
              className="modern-call-avatar"
              draggable="false"
             />
             <div className="modern-call-user">
              <h3>{callState.contact?.username}</h3>
              <p>
               {callState.isOutgoing
                ? "Calling..."
                : callState.type === "video"
                 ? "Video Call"
                 : "Audio Call"}
              </p>
             </div>
            </div>
            <button
             className="modern-minimize-btn"
             onClick={(e) => {
              e.stopPropagation();
              setCallMinimized(true);
             }}
             title="Minimize"
            >
             <i className="fas fa-minus"></i>
            </button>
           </div>

           {callState.type === "video" ? (
            <div className="modern-video-container">
             <video
              ref={remoteVideoRef}
              className="modern-remote-video"
              autoPlay
              playsInline
              controls={false}
              muted={false}
             />
             <video
              ref={localVideoRef}
              className="modern-local-video"
              autoPlay
              playsInline
              controls={false}
              muted={true}
             />
            </div>
           ) : (
            <div className="modern-audio-call-ui">
             <div className="modern-audio-avatar-wrapper">
              <img
               src={
                callState.contact?.avatar_url
                 ? `${API_BASE_URL}${callState.contact.avatar_url}`
                 : "/resources/default_avatar.png"
               }
               alt={callState.contact?.username}
               draggable="false"
               className="modern-audio-avatar"
              />
              <div className="modern-audio-pulse"></div>
             </div>
             <h3>{callState.contact?.username}</h3>
             <p>{callState.isOutgoing ? "Calling..." : "Audio Call"}</p>
             <audio
              ref={remoteVideoRef}
              autoPlay
              muted={false}
              style={{ display: "none" }}
             />
             <audio
              ref={localVideoRef}
              autoPlay
              muted={true}
              style={{ display: "none" }}
             />
            </div>
           )}

           <div className="modern-call-controls-wrapper">
            <div className="modern-call-controls">
             <button
              className={`modern-control-btn modern-mute-btn ${isMicMuted ? 'muted' : ''}`}
              onClick={(e) => {
               e.stopPropagation();
               toggleMic();
              }}
              title={isMicMuted ? "Unmute" : "Mute"}
             >
              <i className={`fas fa-microphone${isMicMuted ? '-slash' : ''}`}></i>
             </button>
             {callState.type === "video" && (
              <button
               className={`modern-control-btn modern-camera-btn ${isCameraOff ? 'camera-off' : ''}`}
               onClick={(e) => {
                e.stopPropagation();
                toggleCamera();
               }}
               title={isCameraOff ? "Turn on camera" : "Turn off camera"}
              >
               <i className={`fas fa-video${isCameraOff ? '-slash' : ''}`}></i>
              </button>
             )}
             <button
              className="modern-end-call-btn"
              onClick={(e) => {
               e.stopPropagation();
               endCall();
              }}
              title="End call"
             >
              <i className="fas fa-phone"></i>
             </button>
            </div>
           </div>
          </div>
         </div>
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
     user={showProfileModal}
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
     lastMessage={showProfileModal?.lastMessage}
     lastMessageSenderId={showProfileModal?.lastSenderId}
    />
   )}
   {showReactionPopup && (
    <ReactionMore
     messageId={showReactionPopup}
     onAddReaction={handleAddReaction}
     onClose={() => setShowReactionPopup(null)}
     position={reactionPopupPosition}
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
  </>
 );
};

export default App;