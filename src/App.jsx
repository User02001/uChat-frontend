import { useEffect, useRef, useState } from 'react';
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

 const messagesEndRef = useRef(null);
 const typingTimeoutRef = useRef(null);

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

 // Add this useEffect to detect Windows and manage refresh counter
 useEffect(() => {
  const detectWindowsAndManageDisplay = () => {
   const userAgent = navigator.userAgent;
   const isWindows = userAgent.includes('Windows');

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
   // Check if element is already in view
   const rect = messageElement.getBoundingClientRect();
   const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

   if (isInView) {
    // No scrolling needed, highlight immediately
    const messageBubble = messageElement.querySelector('.message-bubble');
    if (messageBubble) {
     messageBubble.classList.add('message-highlighted');

     setTimeout(() => {
      messageBubble.classList.remove('message-highlighted');
     }, 800);
    }
   } else {
    // Scrolling needed, wait for scroll to finish
    messageElement.scrollIntoView({
     behavior: 'smooth',
     block: 'center'
    });

    let scrollTimeout;
    const handleScrollEnd = () => {
     clearTimeout(scrollTimeout);
     scrollTimeout = setTimeout(() => {
      const messageBubble = messageElement.querySelector('.message-bubble');
      if (messageBubble) {
       messageBubble.classList.add('message-highlighted');

       setTimeout(() => {
        messageBubble.classList.remove('message-highlighted');
       }, 400);
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
   socketRef.current.disconnect();
  }

  socketRef.current = io(SOCKET_URL, {
   withCredentials: true,
   transports: ['websocket', 'polling'],
   timeout: 20000,
   forceNew: true,
   reconnection: true,
   reconnectionAttempts: maxReconnectAttempts,
   reconnectionDelay: 1000,
   reconnectionDelayMax: 30000,
   maxReconnectionAttempts: maxReconnectAttempts
  });

  const socket = socketRef.current;

  socket.on('connect', () => {
   setSocketConnected(true);
   setReconnectAttempts(0);

   // Rejoin active chat if there is one
   if (activeContact) {
    socket.emit('join_chat', { contact_id: activeContact.id });
   }
  });

  socket.on('disconnect', (reason) => {
   console.log('Socket disconnected:', reason);
   setSocketConnected(false);

   // Only attempt manual reconnection for certain disconnect reasons
   if (reason === 'io server disconnect' || reason === 'transport close') {
    attemptReconnect();
   }
  });

  socket.on('connect_error', (error) => {
   console.error('Socket connection error:', error);
   setSocketConnected(false);
   attemptReconnect();
  });

  // Your existing socket event listeners
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

   console.log('=== FILTERING DEBUG START ===');
   console.log('TIMING CHECK - Handler execution time:', new Date().toISOString());

   // Capture current state values
   console.log('STATE VALUES AT FILTER TIME:');
   console.log('  activeContact:', activeContact);
   console.log('  activeContact?.id:', activeContact?.id, '(type:', typeof activeContact?.id, ')');
   console.log('  user:', user);
   console.log('  user?.id:', user?.id, '(type:', typeof user?.id, ')');

   console.log('MESSAGE DATA:');
   console.log('  message.sender_id:', message.sender_id, '(type:', typeof message.sender_id, ')');
   console.log('  message.receiver_id:', message.receiver_id, '(type:', typeof message.receiver_id, ')');

   console.log('CONDITION CHECKS:');
   console.log('  activeContact exists:', !!activeContact);
   console.log('  user exists:', !!user);

   if (activeContact && user) {
    const condition1 = message.sender_id === activeContact.id && message.receiver_id === user.id;
    const condition2 = message.sender_id === user.id && message.receiver_id === activeContact.id;

    console.log('  RECEIVING condition (sender=contact, receiver=user):', condition1);
    console.log('    message.sender_id === activeContact.id:', message.sender_id, '===', activeContact.id, '=', message.sender_id === activeContact.id);
    console.log('    message.receiver_id === user.id:', message.receiver_id, '===', user.id, '=', message.receiver_id === user.id);

    console.log('  SENDING condition (sender=user, receiver=contact):', condition2);
    console.log('    message.sender_id === user.id:', message.sender_id, '===', user.id, '=', message.sender_id === user.id);
    console.log('    message.receiver_id === activeContact.id:', message.receiver_id, '===', activeContact.id, '=', message.receiver_id === activeContact.id);

    const overallCondition = condition1 || condition2;
    console.log('  OVERALL CONDITION (should add message):', overallCondition);

    // TYPE COERCION TEST
    const condition1_coerced = Number(message.sender_id) === Number(activeContact.id) && Number(message.receiver_id) === Number(user.id);
    const condition2_coerced = Number(message.sender_id) === Number(user.id) && Number(message.receiver_id) === Number(activeContact.id);
    const overallCondition_coerced = condition1_coerced || condition2_coerced;
    console.log('  WITH TYPE COERCION:', overallCondition_coerced);

    if (overallCondition) {
     console.log('  ✅ MESSAGE WILL BE ADDED TO CHAT');
     setMessages(prev => [...prev, message]);
    } else {
     console.log('  ❌ MESSAGE REJECTED - DOES NOT BELONG TO ACTIVE CHAT');
     console.log('  🔄 TESTING WITH TYPE COERCION...');
     if (overallCondition_coerced) {
      console.log('  ✅ TYPE COERCION WORKED - ADDING MESSAGE');
      setMessages(prev => [...prev, message]);
     } else {
      console.log('  ❌ EVEN TYPE COERCION FAILED');
     }
    }
   } else {
    console.log('  ❌ MISSING STATE - activeContact or user is null/undefined');
    console.log('  📝 Adding message anyway for debugging...');
    setMessages(prev => [...prev, message]);
   }

   console.log('=== FILTERING DEBUG END ===');

   setTypingUsers(prev => {
    const newSet = new Set(prev);
    newSet.delete(message.sender_id);
    return newSet;
   });

   // Show notification if message is from someone else AND not from currently active contact
   if (message.sender_id !== user?.id &&
    (!activeContact || message.sender_id !== activeContact.id)) {
    console.log('NOTIFICATION: Processing notification for message from', message.sender_id);

    const senderName = message.sender_username || message.username || 'Unknown User';
    const avatarFromMessage = message.sender_avatar || message.avatar_url || message.avatar;
    let senderAvatarUrl = avatarFromMessage;

    if (!senderAvatarUrl) {
     const senderContact = contacts.find(contact => contact.id === message.sender_id);
     senderAvatarUrl = senderContact?.avatar_url || senderContact?.avatar || null;
    }

    if (window.require) {
     try {
      const { ipcRenderer } = window.require('electron');
      const cleanMessage = {
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
      };

      ipcRenderer.send('web-notification', {
       type: 'new_message',
       data: { message: cleanMessage }
      });
     } catch (e) {
      console.log('Electron IPC not available:', e);
     }
    }
   } else {
    console.log('NOTIFICATION: Skipped - message from current user or active contact');
   }
  });

  socket.on('message_deleted', (data) => {
   // mark message deleted in local state (UI updates instantly; server also broadcasts)
   setMessages(prev =>
    prev.map(m =>
     m.id === data.message_id ? { ...m, deleted: true, content: null } : m
    )
   );
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
   setTypingUsers(prev => {
    const newSet = new Set(prev);
    if (data.is_typing) {
     newSet.add(data.user_id);
    } else {
     newSet.delete(data.user_id);
    }
    return newSet;
   });
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

 const attemptReconnect = () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
   console.log('Max reconnection attempts reached');
   return;
  }

  if (reconnectTimeoutRef.current) {
   clearTimeout(reconnectTimeoutRef.current);
  }

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1})`);

  reconnectTimeoutRef.current = setTimeout(() => {
   setReconnectAttempts(prev => prev + 1);
   initializeSocket();
  }, delay);
 };

 // Handle page visibility changes and browser sleep/wake
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (document.visibilityState === 'visible') {
    // Page became visible, check socket connection
    if (socketRef.current && !socketRef.current.connected) {
     console.log('Page visible, reconnecting socket...');
     initializeSocket();
    }
   }
  };

  const handleFocus = () => {
   // Window gained focus, ensure socket is connected
   if (socketRef.current && !socketRef.current.connected) {
    console.log('Window focused, reconnecting socket...');
    initializeSocket();
   }
  };

  const handleOnline = () => {
   // Network came back online
   console.log('Network online, reconnecting socket...');
   initializeSocket();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('online', handleOnline);

  return () => {
   document.removeEventListener('visibilitychange', handleVisibilityChange);
   window.removeEventListener('focus', handleFocus);
   window.removeEventListener('online', handleOnline);
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
    // Clear current contact immediately to avoid showing "Welcome to uChat"
    setActiveContact(null);
    setMessages([]);
    setShowChatContent(false); // Add this line

    // START the transition FIRST (like back button does)
    setShowMobileChat(true);

    // Wait for the full transition duration before setting new contact
    setTimeout(() => {
     setActiveContact(contact);
     saveLastContact(contact);
     setTypingUsers(new Set());
     setIsTyping(false); // Add this line

     if (socketRef.current) {
      socketRef.current.emit('join_chat', { contact_id: contact.id });
     }

     // Show chat content with opacity animation
     setTimeout(() => {
      setShowChatContent(true);
     }, 100);

     // Add 1 second delay before loading messages to show skeleton
     setTimeout(() => {
      loadMessages(contact.id);
     }, 1000);
    }, 350); // Add 50ms buffer after transition
   } else {
    setActiveContact(contact);
    saveLastContact(contact);
    setMessages([]);
    setTypingUsers(new Set());

    if (socketRef.current) {
     socketRef.current.emit('join_chat', { contact_id: contact.id });
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
  setReplyingTo(null); // Clear reply after sending

  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
  }
  socketRef.current.emit('typing', {
   receiver_id: activeContact.id,
   is_typing: false
  });
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

  if (!activeContact || !socketRef.current) return;

  // Clear any existing timeout
  if (typingTimeoutRef.current) {
   clearTimeout(typingTimeoutRef.current);
  }

  const wasTyping = isTyping;
  const shouldBeTyping = newValue.trim().length > 0;

  // Only emit if the typing state actually changed
  if (wasTyping !== shouldBeTyping) {
   setIsTyping(shouldBeTyping);
   socketRef.current.emit('typing', {
    receiver_id: activeContact.id,
    is_typing: shouldBeTyping
   });
  }

  // If user is typing, set the stop-typing timeout
  if (shouldBeTyping) {
   typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    socketRef.current.emit('typing', {
     receiver_id: activeContact.id,
     is_typing: false
    });
   }, 3000);
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
          <span className="contact-name">{contact.username}</span>
          <span className="contact-time">
           {contact.lastMessageTime ? (() => {
            const now = new Date();
            const messageTime = new Date(contact.lastMessageTime + 'Z');
            const isToday = now.toDateString() === messageTime.toDateString();

            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = yesterday.toDateString() === messageTime.toDateString();

            const timeString = messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

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
               onClick={() => scrollToMessage(message.original_message.id)}
              >
               <span className="reply-sender-inside">
                {message.original_message.sender_id === user.id ? 'You' : message.original_message.sender_username}
               </span>
               <span className="reply-content-inside">
                {(() => {
                 const orig = message.original_message?.content || '';
                 return orig.length > 40 ? orig.substring(0, 40) + '...' : orig;
                })()}
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
            {message.sender_id === user.id && !message.deleted && (
             <button
              className="message-delete-btn"
              onClick={() => setDeleteConfirm(message.id)}
              title="Delete message"
             >
              <i className="fas fa-trash"></i>
             </button>
            )}
           </div>
          ))
       )}

       <div ref={messagesEndRef} />
       {deleteConfirm && (
        <div className="delete-modal">
         <div className="delete-modal-backdrop" onClick={() => setDeleteConfirm(null)} />
         <div className="delete-modal-content">
          <p>Are you sure you want to delete this message?</p>
          <div className="modal-actions">
           <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
           <button
            onClick={async () => {
             try {
              const res = await fetch(`${API_BASE_URL}/api/messages/${deleteConfirm}/delete`, {
               method: 'POST',
               credentials: 'include'
              });

              if (res.ok) {
               // immediate local optimistic update; server will also broadcast
               setMessages(prev => prev.map(m => m.id === deleteConfirm ? { ...m, deleted: true, content: null } : m));
              } else {
               const err = await res.json();
               setError(err.error || 'Delete failed');
              }
             } catch (e) {
              setError('Delete failed');
             } finally {
              setDeleteConfirm(null);
             }
            }}
           >
            Delete
           </button>
          </div>
         </div>
        </div>
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
       <form onSubmit={sendMessage} className="message-input-container">
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
         title="Attach file"
        >
         <i className="fas fa-paperclip"></i>
        </button>
        <input
         type="text"
         value={messageText}
         onChange={handleMessageInputChange}
         onPaste={handlePaste}
         placeholder="Type a message..."
         className="message-input"
         autoComplete="off"
         autoCapitalize="sentences"
         autoCorrect="on"
         spellCheck="true"
         data-form-type="other"
        />
        <button
         type="submit"
         className="send-button"
         disabled={!messageText.trim()}
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
   <audio
    ref={ringtoneRef}
    preload="none"
   >
    <source src="/resources/ringtones/default_ringtone.mp3" type="audio/mpeg" />
    <source src="/resources/ringtones/default_ringtone.wav" type="audio/wav" />
   </audio>
  </div>
 );
};

export default App;