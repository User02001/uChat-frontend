import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Reply from './components/Reply';
import { API_BASE_URL, SOCKET_URL } from './config';
import useCalls from './hooks/useCalls';
import MessagesSkeleton from './components/MessagesSkeleton';
import ContactsSkeleton from './components/ContactsSkeleton';
import Reaction from './components/Reaction';
import './pages/downloads-recommend.css'
import DeleteModal from './components/DeleteModal';
import './index.css'
import './pages/calls.css'
import UnverifiedModal from './components/UnverifiedModal';

const App = () => {
 const navigate = useNavigate();
 const socketRef = useRef(null);

 // Define ALL state first
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [contacts, setContacts] = useState([]);
 const [activeContact, setActiveContact] = useState(null);
 const [messages, setMessages] = useState([]);
 const [messageText, setMessageText] = useState('');
 const [onlineUsers, setOnlineUsers] = useState([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState([]);
 const [showSearch, setShowSearch] = useState(false);
 const [typingUsers, setTypingUsers] = useState(new Set());
 const [error, setError] = useState(''); // <- setError is now defined
 const [showUserMenu, setShowUserMenu] = useState(false);
 const [showMobileSearch, setShowMobileSearch] = useState(false);
 const [searchExiting, setSearchExiting] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [showMobileChat, setShowMobileChat] = useState(false);
 const [replyingTo, setReplyingTo] = useState(null);
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [showChatContent, setShowChatContent] = useState(false);
 const [contactsLoading, setContactsLoading] = useState(true);
 const [isTyping, setIsTyping] = useState(false);
 const [messageReactions, setMessageReactions] = useState({});
 const [showReactionPopup, setShowReactionPopup] = useState(null); // stores messageId
 const [socketConnected, setSocketConnected] = useState(false);
 const [reconnectAttempts, setReconnectAttempts] = useState(0);
 const reconnectTimeoutRef = useRef(null);
 const maxReconnectAttempts = 10;
 const fileInputRef = useRef(null);
 const [dragOver, setDragOver] = useState(false);
 const [deleteConfirm, setDeleteConfirm] = useState(null);
 const [showDownloadRecommendation, setShowDownloadRecommendation] = useState(false);
 const [sessionDismissed, setSessionDismissed] = useState(false);
 const [showVerificationBanner, setShowVerificationBanner] = useState(false);
 const [showUnverifiedModal, setShowUnverifiedModal] = useState(null);
 const [isOffline, setIsOffline] = useState(false);

 const messagesEndRef = useRef(null);
 const typingTimeoutRef = useRef(null);

 const activeContactRef = useRef(null);
 const userRef = useRef(null);
 const contactsRef = useRef([]);

 // NOW call useCalls after setError exists
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
  enableAudio
 } = useCalls(socketRef, setError);

 // Keep refs in sync with state
 useEffect(() => {
  activeContactRef.current = activeContact;
 }, [activeContact]);

 // Show verification banner for unverified users
 useEffect(() => {
  if (user && !user.is_verified) {
   setShowVerificationBanner(true);
   document.body.classList.add('with-verification-banner');
  } else {
   setShowVerificationBanner(false);
   document.body.classList.remove('with-verification-banner');
  }

  // Add cleanup function to remove the class when component unmounts
  return () => {
   document.body.classList.remove('with-verification-banner');
  };
 }, [user]);

 useEffect(() => {
  userRef.current = user;
 }, [user]);

 useEffect(() => {
  contactsRef.current = contacts;
 }, [contacts]);

 // Check if device is mobile on window resize
 useEffect(() => {
  const checkMobile = () => {
   setIsMobile(window.innerWidth <= 768);
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
 }, []);

 // Handle clicks outside dropdowns to close them
 useEffect(() => {
  const handleClickOutside = (event) => {
   if (showUserMenu && !event.target.closest('.user-profile') && !event.target.closest('.mobile-avatar')) {
    setShowUserMenu(false);
   }
   if (showMobileSearch && !event.target.closest('.mobile-search-container')) {
    setShowMobileSearch(false);
    setSearchQuery('');
    setSearchResults([]);
   }
   if (showSearch && !event.target.closest('.search-section')) {
    setShowSearch(false);
    setShowMobileSearch(false);
    setSearchQuery('');
    setSearchResults([]);
   }
   if (showReactionPopup && !event.target.closest('.reaction-modal') && !event.target.closest('.message-reaction-btn')) {
    setShowReactionPopup(null);
   }
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
 }, [showUserMenu, showSearch, showReactionPopup]);

 // Listen for network status changes from Electron
 useEffect(() => {
  if (window.require) {
   try {
    const { ipcRenderer } = window.require('electron');

    // Check initial status
    ipcRenderer.invoke('get-network-status').then(online => {
     setIsOffline(!online);
    });

    // Listen for status changes
    ipcRenderer.on('network-status-changed', (event, online) => {
     console.log('Network status update:', online ? 'ONLINE' : 'OFFLINE');
     setIsOffline(!online);

     // If coming back online, cache will be cleared by webView reload
     // which happens automatically in offline-manager.js
    });

    return () => {
     ipcRenderer.removeAllListeners('network-status-changed');
    };
   } catch (e) {
    console.log('Electron IPC not available for network status');
   }
  }
 }, []);

 // Add this useEffect to detect Windows and manage refresh counter
 useEffect(() => {
  const detectWindowsAndManageDisplay = () => {
   const userAgent = navigator.userAgent;
   const isWindows = userAgent.includes('Windows');
   const isElectron = userAgent.toLowerCase().includes('electron');

   // Don't show if running in Electron
   if (isElectron) {
    return;
   }

   // Check if user already has the app (permanent dismissal)
   const userHasApp = localStorage.getItem('uchat-user-has-desktop-app');

   if (!isWindows || userHasApp === 'true') {
    return; // Don't show if not Windows or user already has app
   }

   // Get current refresh count and last reset time
   const refreshData = JSON.parse(localStorage.getItem('uchat-refresh-tracker') || '{"count": 0, "lastReset": 0}');
   const now = Date.now();
   const oneDayMs = 600000; // 5 mins in milliseconds

   // Reset counter if it's been more than 5 hours since last reset
   if (now - refreshData.lastReset > oneDayMs) {
    refreshData.count = 0;
    refreshData.lastReset = now;
   }

   // Increment refresh count
   refreshData.count += 1;
   localStorage.setItem('uchat-refresh-tracker', JSON.stringify(refreshData));

   // Show recommendation every 5 refreshes (and not dismissed in this session)
   if (refreshData.count % 3 === 0 && !sessionDismissed) {
    setTimeout(() => {
     setShowDownloadRecommendation(true);
    }, 3000);
   }
  };

  detectWindowsAndManageDisplay();
 }, [sessionDismissed]);

 // Add this function to handle dismissing the recommendation (session only)
 const dismissDownloadRecommendation = () => {
  setShowDownloadRecommendation(false);
  setSessionDismissed(true); // Only dismiss for this session
 };

 // Add this function to handle "I already have it" checkbox
 const handleAlreadyHaveApp = () => {
  setShowDownloadRecommendation(false);
  localStorage.setItem('uchat-user-has-desktop-app', 'true');
 };

 // Initialize authentication check on component mount
 useEffect(() => {
  checkAuth();
 }, []);

 // Scroll to and highlight original message
 const scrollToMessage = (messageId) => {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
   const rect = messageElement.getBoundingClientRect();
   const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

   if (isInView) {
    // Find the element to highlight - could be .message-bubble, .message-content, or .deleted-message
    const targetElement = messageElement.querySelector('.message-bubble') ||
     messageElement.querySelector('.deleted-message') ||
     messageElement.querySelector('.message-content');

    if (targetElement) {
     targetElement.classList.add('message-highlighted');
     setTimeout(() => {
      targetElement.classList.remove('message-highlighted');
     }, 800);
    }
   } else {
    messageElement.scrollIntoView({
     behavior: 'smooth',
     block: 'center'
    });

    let scrollTimeout;
    const handleScrollEnd = () => {
     clearTimeout(scrollTimeout);
     scrollTimeout = setTimeout(() => {
      const targetElement = messageElement.querySelector('.message-bubble') ||
       messageElement.querySelector('.deleted-message') ||
       messageElement.querySelector('.message-content');

      if (targetElement) {
       targetElement.classList.add('message-highlighted');
       setTimeout(() => {
        targetElement.classList.remove('message-highlighted');
       }, 800);
      }

      document.removeEventListener('scroll', handleScrollEnd, true);
     }, 150);
    };

    document.addEventListener('scroll', handleScrollEnd, true);
   }
  }
 };

 // Handle local video setup for both caller and receiver
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   console.log('Setting up local video from useEffect:', callState.localStream.id);
   localVideoRef.current.srcObject = callState.localStream;
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.style.transform = 'scaleX(-1)';
   localVideoRef.current.play().catch(e => console.log('Local video play error:', e));
  }
 }, [callState.localStream, callState.isActive, callState.isIncoming]);

 // Update document title and favicon based on active contact
 useEffect(() => {
  if (activeContact) {
   document.title = `${activeContact.username} | uChat`;
  } else {
   document.title = "uChat";
  }

  const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = "resources/favicon.png";
  document.head.appendChild(favicon);
 }, [activeContact]);

 // Check user authentication status
 const checkAuth = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setUser(data.user);
    initializeSocket();
    loadContacts();
   } else {
    navigate('/login', { replace: true });
    return;
   }
  } catch (error) {
   console.error('Auth check failed:', error);
   navigate('/login', { replace: true });
   return;
  } finally {
   setLoading(false);
  }
 };

 // Save last selected contact (desktop only)
 const saveLastContact = (contact) => {
  if (!isMobile && contact) {
   localStorage.setItem('lastSelectedContact', JSON.stringify({
    id: contact.id,
    username: contact.username,
    avatar_url: contact.avatar_url
   }));
  }
 };

 // Load last selected contact (desktop only)
 const loadLastContact = () => {
  if (!isMobile) {
   try {
    const saved = localStorage.getItem('lastSelectedContact');
    if (saved) {
     return JSON.parse(saved);
    }
   } catch (error) {
    console.error('Failed to load last contact:', error);
   }
  }
  return null;
 };

 // Format timestamp to human readable format
 const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp + 'Z');
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return time.toLocaleDateString();
 };

 const formatLastSeen = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return 'Offline';

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp + 'Z');
  const diffMs = now - lastSeen;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 2) return 'Last seen just now';
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  if (diffDays === 1) return 'Last seen yesterday';
  if (diffDays < 7) return `Last seen ${diffDays}d ago`;
  return 'Last seen long ago';
 };

 // File size formatter
 const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
 };

 // Get file icon based on extension
 const getFileIcon = (fileType) => {
  const iconMap = {
   // Documents
   pdf: 'fas fa-file-pdf',
   doc: 'fas fa-file-word',
   docx: 'fas fa-file-word',
   txt: 'fas fa-file-alt',
   rtf: 'fas fa-file-alt',

   // Archives
   zip: 'fas fa-file-archive',
   rar: 'fas fa-file-archive',
   '7z': 'fas fa-file-archive',
   tar: 'fas fa-file-archive',
   gz: 'fas fa-file-archive',

   // Media
   mp4: 'fas fa-file-video',
   avi: 'fas fa-file-video',
   mkv: 'fas fa-file-video',
   mov: 'fas fa-file-video',
   wmv: 'fas fa-file-video',
   mp3: 'fas fa-file-audio',
   wav: 'fas fa-file-audio',
   flac: 'fas fa-file-audio',
   aac: 'fas fa-file-audio',

   // Spreadsheets
   xlsx: 'fas fa-file-excel',
   xls: 'fas fa-file-excel',
   csv: 'fas fa-file-csv',

   // Presentations
   pptx: 'fas fa-file-powerpoint',
   ppt: 'fas fa-file-powerpoint',

   // Code files
   js: 'fas fa-file-code',
   html: 'fas fa-file-code',
   css: 'fas fa-file-code',
   py: 'fas fa-file-code',
   java: 'fas fa-file-code',
   cpp: 'fas fa-file-code',
   c: 'fas fa-file-code',
   php: 'fas fa-file-code',

   // Executables
   exe: 'fas fa-cog',
   msi: 'fas fa-cog',
   app: 'fas fa-cog',
   deb: 'fas fa-cog',

   default: 'fas fa-file'
  };
  return iconMap[fileType?.toLowerCase()] || iconMap.default;
 };

 const initializeSocket = () => {
  if (socketRef.current) {
   socketRef.current.removeAllListeners();
   socketRef.current.off();
   socketRef.current.disconnect();
   socketRef.current = null;
  }

  const socket = io(SOCKET_URL, {
   withCredentials: true,
   transports: ['websocket', 'polling'],
   timeout: 20000,
   forceNew: true,
   reconnection: true,
   reconnectionAttempts: Infinity,
   reconnectionDelay: 1000,
   reconnectionDelayMax: 5000,
  });

  socketRef.current = socket;

  socket.on('connect', () => {
   setSocketConnected(true);
   setReconnectAttempts(0);

   const currentActiveContact = activeContactRef.current;
   if (currentActiveContact) {
    socket.emit('join_chat', { contact_id: currentActiveContact.id });
   }

   // REQUEST FULL CONTACTS UPDATE on reconnect
   socket.emit('request_contacts_update');
  });

  // ADD THIS NEW HANDLER:
  socket.on('online_users_update', (data) => {
   console.log('Received online users update:', data.online_users);
   setOnlineUsers(data.online_users || []);
  });

  socket.on('disconnect', (reason) => {
   setSocketConnected(false);
  });

  socket.on('connect_error', (error) => {
   setSocketConnected(false);
  });

  socket.on('user_status', (data) => {
   setOnlineUsers(prev => {
    if (data.status === 'online') {
     return [...prev, data.user_id].filter((id, index, arr) => arr.indexOf(id) === index);
    } else {
     return prev.filter(id => id !== data.user_id);
    }
   });
  });

  socket.on('new_message', (data) => {
   const message = data.message;
   const currentActiveContact = activeContactRef.current;
   const currentUser = userRef.current;

   if (currentActiveContact && currentUser &&
    ((message.sender_id === currentActiveContact.id && message.receiver_id === currentUser.id) ||
     (message.sender_id === currentUser.id && message.receiver_id === currentActiveContact.id))) {

    setMessages(prev => {
     const exists = prev.some(m => m.id === message.id);
     if (exists) return prev;
     return [...prev, message];
    });
   }

   setTypingUsers(prev => {
    const newSet = new Set(prev);
    newSet.delete(message.sender_id);
    return newSet;
   });

   // ALWAYS send notification for messages from others (not sent by current user)
   if (message.sender_id !== currentUser?.id) {
    const senderName = message.sender_username || message.username || 'Unknown User';
    const avatarFromMessage = message.sender_avatar || message.avatar_url || message.avatar;
    let senderAvatarUrl = avatarFromMessage;

    if (!senderAvatarUrl) {
     const currentContacts = contactsRef.current;
     const senderContact = currentContacts.find(contact => contact.id === message.sender_id);
     senderAvatarUrl = senderContact?.avatar_url || senderContact?.avatar || null;
    }

    // **ADD THIS: Check for Android first**
    if (window.AndroidBridge && typeof window.AndroidBridge.postMessage === 'function') {
     try {
      window.AndroidBridge.postMessage(JSON.stringify({
       type: 'new_message',
       data: {
        message: {
         id: message.id,
         sender_id: message.sender_id,
         receiver_id: message.receiver_id,
         content: message.content,
         sender_username: senderName,
         sender_avatar: senderAvatarUrl,
         file_url: message.file_url,
         file_name: message.file_name,
         timestamp: message.timestamp,
         message_type: message.message_type
        }
       }
      }));
      console.log('[Android] Notification sent to AndroidBridge');
     } catch (e) {
      console.error('[Android] Failed to send notification:', e);
     }
    }
    // Then check for Electron
    else if (window.require) {
     try {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('web-notification', {
       type: 'new_message',
       data: {
        message: {
         id: message.id,
         sender_id: message.sender_id,
         receiver_id: message.receiver_id,
         content: message.content,
         sender_username: senderName,
         sender_avatar: senderAvatarUrl,
         file_url: message.file_url,
         file_name: message.file_name,
         timestamp: message.timestamp,
         message_type: message.message_type
        }
       }
      });
     } catch (e) { }
    }
   }
  });

  socket.on('message_deleted', (data) => {
   setMessages(prev =>
    prev.map(m => {
     if (m.id === data.message_id) {
      return { ...m, deleted: true, content: null, file_path: null, file_name: null };
     } else if (m.original_message && m.original_message.id === data.message_id) {
      return {
       ...m,
       original_message: {
        ...m.original_message,
        deleted: true,
        content: null,
        file_path: null,
        file_name: null
       }
      };
     }
     return m;
    })
   );

   setReplyingTo(prev => {
    if (prev && prev.id === data.message_id) {
     return {
      ...prev,
      deleted: true,
      content: null,
      file_path: null,
      file_name: null
     };
    }
    return prev;
   });
  });

  socket.on('contact_updated', (data) => {
   setContacts(prev => prev.map(contact =>
    contact.id === data.contact_id
     ? {
      ...contact,
      lastMessage: data.lastMessage,
      lastMessageTime: data.lastMessageTime,
      unread: data.unread
     }
     : contact
   ));
  });

  socket.on('typing_status', (data) => {
   const currentActiveContact = activeContactRef.current;

   if (currentActiveContact && data.user_id === currentActiveContact.id) {
    setTypingUsers(prev => {
     const newSet = new Set(prev);
     if (data.is_typing) {
      newSet.add(data.user_id);
     } else {
      newSet.delete(data.user_id);
     }
     return newSet;
    });
   }
  });

  socket.on('reaction_added', (data) => {
   setMessageReactions(prev => ({
    ...prev,
    [data.message_id]: {
     ...prev[data.message_id],
     [data.reaction_type]: {
      count: data.count,
      users: data.users
     }
    }
   }));
  });

  socket.on('reaction_removed', (data) => {
   setMessageReactions(prev => ({
    ...prev,
    [data.message_id]: {
     ...prev[data.message_id],
     [data.reaction_type]: {
      count: data.count,
      users: data.users
     }
    }
   }));
  });

  setupSocketListeners();
 };

 const uploadFile = async (file, receiverId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('receiver_id', receiverId);

  try {
   const response = await fetch(`${API_BASE_URL}/api/upload-file`, {
    method: 'POST',
    credentials: 'include',
    body: formData
   });

   if (!response.ok) {
    const error = await response.json();
    setError(error.error || 'Upload failed');
   }
  } catch (error) {
   setError('Upload failed');
  }
 };

 const handleFileSelect = (files) => {
  if (!activeContact) return;

  Array.from(files).forEach(file => {
   uploadFile(file, activeContact.id);
  });
 };

 const handlePaste = (e) => {
  const items = e.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
   if (items[i].type.indexOf('image') !== -1) {
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

 // Handle page visibility changes and browser sleep/wake
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (document.visibilityState === 'visible') {
    if (socketRef.current && !socketRef.current.connected) {
     initializeSocket();
    }
   }
  };

  const handleFocus = () => {
   if (socketRef.current && !socketRef.current.connected) {
    initializeSocket();
   }
  };

  const handleOnline = () => {
   initializeSocket();
  };

  const heartbeat = setInterval(() => {
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.volatile.emit('ping');
   } else if (socketRef.current && !socketRef.current.connected) {
    initializeSocket();
   }
  }, 15000);

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('online', handleOnline);

  return () => {
   clearInterval(heartbeat);
   document.removeEventListener('visibilitychange', handleVisibilityChange);
   window.removeEventListener('focus', handleFocus);
   window.removeEventListener('online', handleOnline);
  };
 }, []);

 useEffect(() => {
  const syncContacts = () => {
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit('request_contacts_update');
   }
  };

  // Sync every 10 seconds when tab is visible
  const interval = setInterval(() => {
   if (document.visibilityState === 'visible') {
    syncContacts();
   }
  }, 10000);

  // Sync when tab becomes visible
  const handleVisibility = () => {
   if (document.visibilityState === 'visible') {
    syncContacts();
   }
  };

  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
   clearInterval(interval);
   document.removeEventListener('visibilitychange', handleVisibility);
  };
 }, []);

 // Load user contacts and online status
 const loadContacts = async () => {
  try {
   setContactsLoading(true);
   const response = await fetch(`${API_BASE_URL}/api/contacts`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    // Add 1 second delay to show skeleton
    setTimeout(() => {
     setContacts(data.contacts);
     setOnlineUsers(data.online_users);
     setContactsLoading(false);
    }, 1000);
   } else if (response.status === 401) {
    navigate('/login', { replace: true });
   }
  } catch (error) {
   console.error('Failed to load contacts:', error);
   setContactsLoading(false);
  }
 };

 // Restore last selected contact on desktop after contacts are loaded
 useEffect(() => {
  if (contacts.length > 0 && !isMobile && !activeContact) {
   const lastContact = loadLastContact();
   if (lastContact) {
    const contact = contacts.find(c => c.id === lastContact.id);
    if (contact) {
     selectContact(contact);
    }
   }
  }
 }, [contacts, isMobile, activeContact]);

 // Load messages for a specific contact
 const loadMessages = async (contactId) => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/messages/${contactId}`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setMessages(data.messages);

    // Load reactions for these messages
    const reactionsData = {};
    data.messages.forEach(message => {
     if (message.reactions && Object.keys(message.reactions).length > 0) {
      reactionsData[message.id] = message.reactions;
     }
    });
    setMessageReactions(reactionsData);
   } else if (response.status === 401) {
    navigate('/login', { replace: true });
   }
  } catch (error) {
   console.error('Failed to load messages:', error);
  }
 };

 // Search for users by query string
 const searchUsers = async (query) => {
  if (!query.trim()) {
   setSearchResults([]);
   return;
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/search_users?q=${encodeURIComponent(query)}`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setSearchResults(data.users);
   } else if (response.status === 401) {
    navigate('/login', { replace: true });
   }
  } catch (error) {
   console.error('Search failed:', error);
  }
 };

 // Add a user to contacts list
 const addContact = async (userId) => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/add_contact/${userId}`, {
    method: 'POST',
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setContacts(prev => [...prev, data.contact]);
    setSearchResults([]);
    setSearchQuery('');
    setShowSearch(false);
   } else if (response.status === 401) {
    navigate('/login', { replace: true });
   } else {
    const errorData = await response.json();
    setError(errorData.error);
   }
  } catch (error) {
   console.error('Failed to add contact:', error);
   setError('Failed to add contact');
  }
 };

 // Select a contact and load their messages
 const selectContact = (contact) => {
  if (activeContact?.id !== contact.id) {
   if (activeContact && socketRef.current) {
    socketRef.current.emit('leave_chat', { contact_id: activeContact.id });
   }

   if (isMobile) {
    setActiveContact(null);
    setMessages([]);
    setShowChatContent(false);
    setShowMobileChat(true);

    setTimeout(() => {
     setActiveContact(contact);
     saveLastContact(contact);
     setTypingUsers(new Set());
     setIsTyping(false);

     if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_chat', { contact_id: contact.id });
     } else if (socketRef.current) {
      initializeSocket();
      setTimeout(() => {
       if (socketRef.current) {
        socketRef.current.emit('join_chat', { contact_id: contact.id });
       }
      }, 500);
     }

     setTimeout(() => {
      setShowChatContent(true);
     }, 100);

     setTimeout(() => {
      loadMessages(contact.id);
     }, 1000);
    }, 350);
   } else {
    setActiveContact(contact);
    saveLastContact(contact);
    setMessages([]);
    setTypingUsers(new Set());

    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('join_chat', { contact_id: contact.id });
    } else if (socketRef.current) {
     initializeSocket();
     setTimeout(() => {
      if (socketRef.current) {
       socketRef.current.emit('join_chat', { contact_id: contact.id });
      }
     }, 500);
    }

    loadMessages(contact.id);
   }
  }
 };

 // Handle back button on mobile to return to contacts list
 const handleBackToContacts = () => {
  setShowMobileChat(false);
  setActiveContact(null);
  setMessages([]);
  setTypingUsers(new Set());
  setShowChatContent(false); // Add this line

  if (activeContact && socketRef.current) {
   socketRef.current.emit('leave_chat', { contact_id: activeContact.id });
  }
 };

 // Handle reply to message
 const handleReplyToMessage = (message) => {
  setReplyingTo({
   ...message,
   currentUserId: user.id
  });
 };

 const handleAddReaction = (messageId, reactionType) => {
  if (!socketRef.current) return;

  socketRef.current.emit('add_reaction', {
   message_id: messageId,
   reaction_type: reactionType
  });
 };

 const handleRemoveReaction = (messageId, reactionType) => {
  if (!socketRef.current) return;

  socketRef.current.emit('remove_reaction', {
   message_id: messageId,
   reaction_type: reactionType
  });
 };

 // Cancel reply
 const handleCancelReply = () => {
  setReplyingTo(null);
 };

 const sendMessage = (e) => {
  e.preventDefault();

  if (!messageText.trim() || !activeContact || !socketRef.current) return;

  socketRef.current.emit('send_message', {
   receiver_id: activeContact.id,
   content: messageText.trim(),
   reply_to: replyingTo ? replyingTo.id : null
  });

  setMessageText('');
  setReplyingTo(null);
  setIsTyping(false);

  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
   typingTimeoutRef.current = null;
  }

  if (socketRef.current && socketRef.current.connected) {
   socketRef.current.emit('typing', {
    receiver_id: activeContact.id,
    is_typing: false
   });
  }
 };

 // Emit typing status to other users
 const handleTyping = (isTyping) => {
  if (!activeContact || !socketRef.current) return;

  socketRef.current.emit('typing', {
   receiver_id: activeContact.id,
   is_typing: isTyping
  });
 };

 const handleMessageInputChange = (e) => {
  const newValue = e.target.value;
  setMessageText(newValue);

  if (!activeContact || !socketRef.current || !socketRef.current.connected) return;

  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
  }

  const shouldBeTyping = newValue.trim().length > 0;

  if (shouldBeTyping) {
   if (!isTyping) {
    setIsTyping(true);
    socketRef.current.emit('typing', {
     receiver_id: activeContact.id,
     is_typing: true
    });
   }

   typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('typing', {
      receiver_id: activeContact.id,
      is_typing: false
     });
    }
   }, 3000);
  } else {
   if (isTyping) {
    setIsTyping(false);
    socketRef.current.emit('typing', {
     receiver_id: activeContact.id,
     is_typing: false
    });
   }
  }
 };

 useEffect(() => {
  return () => {
   if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
   }
   if (socketRef.current) {
    socketRef.current.disconnect();
   }
   if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
   }
  };
 }, []);

 // Add periodic online status refresh
 setInterval(() => {
  if (socketRef.current && socketRef.current.connected) {
   socketRef.current.emit('request_online_users');
  }
 }, 5000); // Check every 5 seconds

 // Handle user logout
 const handleLogout = async () => {
  try {
   await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include'
   });

   if (socketRef.current) {
    socketRef.current.disconnect();
   }

   navigate('/login', { replace: true });
  } catch (error) {
   console.error('Logout failed:', error);
   navigate('/login', { replace: true });
  }
 };

 // Close mobile search overlay with animation
 const closeMobileSearch = () => {
  setSearchExiting(true);
  setTimeout(() => {
   setShowMobileSearch(false);
   setSearchExiting(false);
   setSearchQuery('');
   setSearchResults([]);
  }, 200);
 };

 // Auto-scroll to bottom when new messages arrive or contact changes
 useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
 }, [messages, activeContact]);

 // Debounced search when query changes
 useEffect(() => {
  const timeoutId = setTimeout(() => {
   searchUsers(searchQuery);
  }, 300);

  return () => clearTimeout(timeoutId);
 }, [searchQuery]);

 // Auto-clear error messages after 3 seconds
 useEffect(() => {
  if (error) {
   const timeoutId = setTimeout(() => setError(''), 3000);
   return () => clearTimeout(timeoutId);
  }
 }, [error]);

 // Set theme based on user preference
 useEffect(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleThemeChange);
  return () => mediaQuery.removeEventListener('change', handleThemeChange);
 }, []);

 // Cleanup resources on component unmount
 useEffect(() => {
  return () => {
   if (socketRef.current) {
    socketRef.current.disconnect();
   }
   if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
   }
  };
 }, []);

 if (loading) {
  return (
   <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading uChat...</p>
   </div>
  );
 }

 return (
  <div className={`app-container ${isMobile && showMobileChat ? 'mobile-chat-open' : ''}`}>
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

   <div className={showVerificationBanner ? 'app-content with-banner' : 'app-content'}>
   <Sidebar showMobileChat={showMobileChat} onLogout={handleLogout} />

   <div className="sidebar">
    <div className="sidebar-header">
     <div className="user-profile">
      <div className="contact-avatar-container">
       <img
        src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"}
        alt="Profile"
        className="profile-avatar"
        draggable="false"
       />
       <div className="status-indicator online"></div>
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
           setSearchQuery('');
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
        {searchResults.map(result => (
         <div key={result.id} className="search-result">
          <img
           src={result.avatar_url ? `${API_BASE_URL}${result.avatar_url}` : "/resources/default_avatar.png"}
           alt={result.username}
           className="search-avatar"
          />
          <div className="search-user-info">
           <span className="search-username">{result.username}</span>
           <span className="search-handle">@{result.handle}</span>
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
       <img draggable="false" src="/resources/favicon.png" alt="uChat Logo" className="mobile-logo-icon" />
       <span className="mobile-logo-text">uChat</span>
     </div>
     <div className="mobile-header-actions">
      <div className="contact-avatar-container" onClick={() => setShowUserMenu(!showUserMenu)}>
       <img src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"} alt="Profile" draggable="false" className="mobile-avatar" />
       <div className="status-indicator online"></div>
      </div>
     </div>
     {showUserMenu && (
      <div className="user-menu mobile-user-menu">
       <button onClick={handleLogout}>Logout</button>
      </div>
     )}
    </div>

    <div className="mobile-search-trigger" onClick={() => setShowMobileSearch(true)}>
     <input
      type="text"
      placeholder="Search..."
      readOnly
      style={{
       width: '100%',
       padding: '8px 16px',
       borderRadius: '20px',
       border: '1px solid var(--border)',
       background: 'var(--bg-tertiary)',
       fontSize: '14px',
       color: 'var(--text-primary)',
       cursor: 'pointer'
      }}
     />
    </div>

    {showMobileSearch && (
     <div className={`mobile-search-overlay ${searchExiting ? 'exiting' : 'entering'}`}>
      <div className="mobile-search-header">
       <button
        className="mobile-search-back"
        onClick={closeMobileSearch}
       >
       </button>
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
         {searchResults.map(result => (
          <div key={result.id} className="search-result">
           <img draggable="false" src={result.avatar_url ? `${API_BASE_URL}${result.avatar_url}` : "/resources/default_avatar.png"} alt={result.username} className="search-avatar" />
           <div className="search-user-info">
            <span className="search-username">{result.username}</span>
            <span className="search-handle">@{result.handle}</span>
           </div>
           <button className="add-contact-btn" onClick={() => {
            addContact(result.id);
            setShowMobileSearch(false);
            setSearchQuery('');
            setSearchResults([]);
           }}>Add</button>
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
      contacts.map(contact => (
       <div
        key={contact.id}
        className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''}`}
        onClick={() => selectContact(contact)}
       >
        <div className="contact-avatar-container">
         <img
          src={contact.avatar_url ? `${API_BASE_URL}${contact.avatar_url}` : "/resources/default_avatar.png"}
          alt={contact.username}
          className="contact-avatar"
          draggable="false"
         />
         <div className={`status-indicator ${onlineUsers.includes(contact.id) ? 'online' : 'offline'}`}></div>
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
           {contact.lastMessageTime ? (() => {
            const now = new Date();
            const messageTime = new Date(contact.lastMessageTime + 'Z');
            const isToday = now.toDateString() === messageTime.toDateString();

            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = yesterday.toDateString() === messageTime.toDateString();

            const timeString = messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

            // Mobile: show only time relative format (e.g., "3d")
            if (window.innerWidth <= 768) {
             if (isToday) {
              return timeString;
             } else if (isYesterday) {
              return '1d';
             } else {
              const days = Math.floor((now - messageTime) / 86400000);
              return `${days}d`;
             }
            }

            // Desktop: show full format
            if (isToday) {
             return `Today at ${timeString}`;
            } else if (isYesterday) {
             return `Yesterday at ${timeString}`;
            } else {
             const days = Math.floor((now - messageTime) / 86400000);
             return `${days}d ago at ${timeString}`;
            }
           })() : ''}
          </span>
         </div>
         <span className={`contact-preview ${contact.unread && activeContact?.id !== contact.id ? 'unread' : ''}`}>
          {contact.lastMessage ?
           `${contact.lastSenderId === user?.id ? 'You: ' : ''}${contact.lastMessage.length > 15 ? contact.lastMessage.substring(0, 15) + '...' : contact.lastMessage} · ${contact.lastMessageTime ? formatTimeAgo(contact.lastMessageTime) : ''}`
           : 'There are no messages yet'}
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
      <div className={`chat-header ${isMobile ? (showChatContent ? 'fade-in' : 'fade-out') : ''}`}>
       {isMobile && (
        <button className="mobile-back-btn" onClick={handleBackToContacts}>
        </button>
       )}
       <div className="contact-avatar-container">
        <img draggable="false" src={activeContact.avatar_url ? `${API_BASE_URL}${activeContact.avatar_url}` : "/resources/default_avatar.png"} alt={activeContact.username} className="chat-avatar" />
        <div className={`status-indicator ${onlineUsers.includes(activeContact.id) ? 'online' : 'offline'}`}></div>
       </div>
       <div className="chat-user-info">
        <div className="chat-username-container">
           <span className="chat-username">{activeContact.username}</span>
           {!activeContact.is_verified && (
            <img
             src="/resources/broken-lock.svg"
             alt="Unverified"
             className="unverified-icon"
             onClick={() => setShowUnverifiedModal(activeContact.username)}
             title="Unverified user - Click for more info"
            />
           )}
           <span className="chat-aka">aka</span>
           <span className="chat-handle">@{activeContact.handle}</span>
        </div>
        <span className="chat-status">
         {onlineUsers.includes(activeContact.id)
          ? 'Available Now'
          : formatLastSeen(activeContact.last_seen)
         }
        </span>
       </div>
       <div className="call-buttons">
        <button
         className="call-btn audio-call"
         onClick={() => startCall(activeContact, 'audio')}
         disabled={callState.isActive}
        >
        </button>
        <button
         className="call-btn video-call"
         onClick={() => startCall(activeContact, 'video')}
         disabled={callState.isActive}
        >
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

          messages.map(message => (
           <div
            id={`message-${message.id}`}
            key={message.id}
            className={`message ${message.sender_id === user.id ? 'sent' : 'received'} ${message.reply_to ? 'reply' : ''}`}
           >
            {message.sender_id !== user.id && (
             <div className="message-avatar-container">
              <img
               src={activeContact.avatar_url ? `${API_BASE_URL}${activeContact.avatar_url}` : "/resources/default_avatar.png"}
               alt={activeContact.username}
               className="message-avatar"
               draggable="false"
              />
              <div className={`status-indicator ${onlineUsers.includes(activeContact.id) ? 'online' : 'offline'}`}></div>
             </div>
            )}
            <div className="message-bubble">
             {message.original_message && (
              <div
               className="reply-inside"
               onClick={() => !message.original_message.deleted && scrollToMessage(message.original_message.id)}
               style={message.original_message.deleted ? { cursor: 'default' } : { cursor: 'pointer' }}
              >
               <span className="reply-sender-inside">
                {message.original_message.sender_id === user.id ? 'You' : message.original_message.sender_username}
               </span>
               <span className="reply-content-inside">
                {message.original_message.deleted ? (
                 <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  This message has been DELETED
                 </em>
                ) : (
                 (() => {
                  const orig = message.original_message?.content || '';
                  return orig.length > 40 ? orig.substring(0, 40) + '...' : orig;
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
             ) : message.message_type === 'image' ? (
              <div className="message-image">
               <img src={`${API_BASE_URL}${message.file_path}`} alt="Shared image" className="shared-image" />
              </div>
             ) : message.message_type === 'file' ? (
              <div className="message-file" onClick={() => window.open(`${API_BASE_URL}${message.file_path}`, '_blank')}>
               <div className="file-icon"><i className={getFileIcon(message.file_type)}></i></div>
               <div className="file-info">
                <div className="file-name">{message.file_name}</div>
                <div className="file-size">{formatFileSize(message.file_size)}</div>
               </div>
               <div className="file-download"><i className="fas fa-download"></i></div>
              </div>
             ) : (
              <div className="message-content">
               {message.content}
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
               const messageTime = new Date(message.timestamp + 'Z');
               const now = new Date();
               const diffMs = now - messageTime;
               const diffMinutes = Math.floor(diffMs / 60000);

               if (diffMinutes < 1) {
                return 'Just now';
               } else {
                return messageTime.toLocaleTimeString([], {
                 hour: 'numeric',
                 minute: '2-digit',
                 hour12: true
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
               onClick={() => setShowReactionPopup(showReactionPopup === message.id ? null : message.id)}
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
             const res = await fetch(`${API_BASE_URL}/api/messages/${messageId}/delete`, {
              method: 'POST',
              credentials: 'include'
             });

             if (res.ok) {
              setMessages(prev => prev.map(m =>
               m.id === messageId ? { ...m, deleted: true, content: null, file_path: null, file_name: null } : m
              ));
             } else {
              const err = await res.json();
              setError(err.error || 'Delete failed');
             }
            } catch (e) {
             setError('Delete failed');
            }
           }}
          />
         )}
      </div>

      <div
       className={`message-input-area ${dragOver ? 'drag-over' : ''} ${isMobile ? (showChatContent ? 'fade-in' : 'fade-out') : ''}`}
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
       <form onSubmit={isOffline ? (e) => e.preventDefault() : sendMessage} className="message-input-container">
        <input
         type="file"
         ref={fileInputRef}
         onChange={(e) => handleFileSelect(e.target.files)}
         style={{ display: 'none' }}
         multiple
         accept="*/*"
        />
        <button
         type="button"
         className="attachment-button"
         onClick={() => fileInputRef.current?.click()}
         title={isOffline ? "Offline - can't send files" : "Attach file"}
         disabled={isOffline}
         style={isOffline ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
        >
         <i className="fas fa-paperclip"></i>
        </button>
        <input
         type="text"
         value={messageText}
         onChange={handleMessageInputChange}
         onPaste={handlePaste}
         placeholder={isOffline ? "You're offline - can't send messages" : "Type a message..."}
         className="message-input"
         autoComplete="off"
         autoCapitalize="sentences"
         autoCorrect="on"
         spellCheck="true"
         data-form-type="other"
         disabled={isOffline}
         style={isOffline ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
        />
        <button
         type="submit"
         className="send-button"
         disabled={!messageText.trim() || isOffline}
        >
         <i className="fas fa-paper-plane"></i>
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
     <div style={{ display: 'none' }}></div>
    )}
   </div>

   {error && (
    <div className="error-toast">
     {error}
    </div>
   )}

   {callState.isIncoming && (
    <div className="incoming-call-notification">
     <div className="incoming-call-content">
      <div className="incoming-call-info">
       <img
        draggable="false"
        src={callState.contact?.avatar_url ? `${API_BASE_URL}${callState.contact.avatar_url}` : "/resources/default_avatar.png"}
        alt={callState.contact?.username}
        className="incoming-call-avatar"
       />
       <div className="incoming-call-text">
        <h4>{callState.contact?.username}</h4>
        <p>Incoming {callState.type === 'video' ? 'video' : 'audio'} call</p>
       </div>
      </div>
      <div className="incoming-call-actions">
       <button
        className="decline-btn-small"
        onClick={() => answerCall(false)}
        title="Decline"
       >
       </button>
       <button
        className="accept-btn-small"
        onClick={() => answerCall(true)}
        title="Accept"
       >
       </button>
      </div>
     </div>
    </div>
   )}

   {(callState.isOutgoing || callState.isActive) && !callState.isIncoming && (
    <div className="call-overlay">
     <div className="active-call">
      {(callState.isOutgoing || callState.isActive) && callState.contact && (
       <div className="call-status-overlay">
        <h3>
         {callState.isOutgoing ? `Calling ${callState.contact.username}...` : callState.contact.username}
        </h3>
       </div>
      )}

      {callState.type === 'video' ? (
       <div className="video-container">
        <video
         ref={remoteVideoRef}
         className="remote-video"
         autoPlay
         playsInline
         controls={false}
         muted={false}
         style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
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
          transform: 'scaleX(-1)',
          width: '200px',
          height: '150px',
          position: 'absolute',
          top: '20px',
          right: '20px',
          borderRadius: '8px',
          border: '2px solid white'
         }}
        />
       </div>
      ) : (
       <div className="audio-call-ui">
        <img
         src={callState.contact?.avatar_url ? `${API_BASE_URL}${callState.contact.avatar_url}` : "/resources/default_avatar.png"}
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
         style={{ display: 'none' }}
        />
        {/* Local audio stream (usually not needed for UI) */}
        <audio
         ref={localVideoRef}
         autoPlay
         muted={true}
         style={{ display: 'none' }}
        />
       </div>
      )}

      <div className="call-controls">
       <button className="end-call-btn" onClick={endCall}></button>
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
        <p>Download our desktop app for Windows for improved performance and features</p>
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
        onClick={() => window.open('/downloads', '_blank')}
        title="Download"
       >
        <i className="fas fa-download"></i>
       </button>
      </div>
     </div>
     <div className="download-recommendation-footer">
      <label className="already-have-checkbox">
       <input
        type="checkbox"
        onChange={handleAlreadyHaveApp}
       />
       <span className="checkmark"></span>
       I already have the desktop app
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
   <audio
    ref={ringtoneRef}
    preload="none"
   >
    <source src="/resources/ringtones/default_ringtone.mp3" type="audio/mpeg" />
    <source src="/resources/ringtones/default_ringtone.wav" type="audio/wav" />
    </audio>
    </div>
   </>
  </div>
 );
};

export default App;