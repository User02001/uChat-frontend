import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import { API_BASE_URL, SOCKET_URL } from './config';
import useCalls from './hooks/useCalls';

const App = () => {
 const navigate = useNavigate();
 const socketRef = useRef(null);

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
 const [error, setError] = useState('');
 const [showUserMenu, setShowUserMenu] = useState(false);
 const [showMobileSearch, setShowMobileSearch] = useState(false);
 const [searchExiting, setSearchExiting] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [showMobileChat, setShowMobileChat] = useState(false);

 const messagesEndRef = useRef(null);
 const typingTimeoutRef = useRef(null);

 // Initialize calls hook
 const {
  callState,
  localVideoRef,
  remoteVideoRef,
  startCall,
  answerCall,
  endCall,
  setupSocketListeners
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
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
 }, [showUserMenu, showSearch]);

 // Initialize authentication check on component mount
 useEffect(() => {
  checkAuth();
 }, []);

 // Handle local video setup only
 useEffect(() => {
  if (callState.localStream && localVideoRef.current && !localVideoRef.current.srcObject) {
   console.log('Setting up local video from useEffect:', callState.localStream.id);
   localVideoRef.current.srcObject = callState.localStream;
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.play().catch(e => console.log('Local video play error:', e));
  }
 }, [callState.localStream]);

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

 // Initialize socket connection and event listeners
 const initializeSocket = () => {
  socketRef.current = io(SOCKET_URL, {
   withCredentials: true,
   transports: ['websocket', 'polling']
  });

  const socket = socketRef.current;

  socket.on('connect', () => {
   console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
   console.log('Socket disconnected');
  });

  socket.on('user_status', (data) => {
   console.log('User status update:', data);
   setOnlineUsers(prev => {
    if (data.status === 'online') {
     return [...prev, data.user_id].filter((id, index, arr) => arr.indexOf(id) === index);
    } else {
     return prev.filter(id => id !== data.user_id);
    }
   });
  });

  socket.on('new_message', (data) => {
   console.log('New message received:', data);
   const message = data.message;
   setMessages(prev => [...prev, message]);
   setTypingUsers(prev => {
    const newSet = new Set(prev);
    newSet.delete(message.sender_id);
    return newSet;
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
   console.log('Typing status:', data);
   setTypingUsers(prev => {
    const newSet = new Set(prev);
    if (data.is_typing) {
     newSet.add(data.user_id);
    } else {
     newSet.delete(data.user_id);
    }
    return newSet;
   });

   if (data.is_typing) {
    setTimeout(() => {
     setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.user_id);
      return newSet;
     });
    }, 3000);
   }
  });

  // Setup call-related socket listeners
  setupSocketListeners();
 };

 // Load user contacts and online status
 const loadContacts = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/contacts`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setContacts(data.contacts);
    setOnlineUsers(data.online_users);
   } else if (response.status === 401) {
    navigate('/login', { replace: true });
   }
  } catch (error) {
   console.error('Failed to load contacts:', error);
  }
 };

 // Load messages for a specific contact
 const loadMessages = async (contactId) => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/messages/${contactId}`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setMessages(data.messages);
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

   setActiveContact(contact);
   setMessages([]);
   setTypingUsers(new Set());
   loadMessages(contact.id);

   if (socketRef.current) {
    socketRef.current.emit('join_chat', { contact_id: contact.id });
   }

   if (isMobile) {
    setShowMobileChat(true);
   }
  }
 };

 // Handle back button on mobile to return to contacts list
 const handleBackToContacts = () => {
  setShowMobileChat(false);
  setActiveContact(null);
  setMessages([]);
  setTypingUsers(new Set());

  if (activeContact && socketRef.current) {
   socketRef.current.emit('leave_chat', { contact_id: activeContact.id });
  }
 };

 // Send a message to the active contact
 const sendMessage = (e) => {
  e.preventDefault();

  if (!messageText.trim() || !activeContact || !socketRef.current) return;

  socketRef.current.emit('send_message', {
   receiver_id: activeContact.id,
   content: messageText.trim()
  });

  setMessageText('');

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

 // Handle message input changes and typing indicators
 const handleMessageInputChange = (e) => {
  setMessageText(e.target.value);

  if (e.target.value.trim()) {
   handleTyping(true);
   clearTimeout(typingTimeoutRef.current);
   typingTimeoutRef.current = setTimeout(() => {
    handleTyping(false);
   }, 1000);
  } else {
   handleTyping(false);
  }
 };

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

 // Auto-scroll to bottom when new messages arrive
 useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

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
   <Sidebar showMobileChat={showMobileChat} />

   <div className="sidebar">
    <div className="sidebar-header">
     <div className="user-profile">
      <img
       src="/resources/default_avatar.png"
       alt="Profile"
       className="profile-avatar"
      />
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
           src="/resources/default_avatar.png"
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
      <img src="/resources/default_avatar.png" alt="Profile" className="mobile-avatar" onClick={() => setShowUserMenu(!showUserMenu)} />
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
           <img src="/resources/default_avatar.png" alt={result.username} className="search-avatar" />
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
     {contacts.length === 0 ? (
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
          src="/resources/default_avatar.png"
          alt={contact.username}
          className="contact-avatar"
         />
         {onlineUsers.includes(contact.id) && (
          <div className="online-indicator"></div>
         )}
        </div>
        <div className="contact-info">
         <div className="contact-main">
          <span className="contact-name">{contact.username}</span>
          <span className="contact-time">
           {contact.lastMessageTime ? new Date(contact.lastMessageTime + 'Z').toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
           }) : ''}
          </span>
         </div>
         <span className={`contact-preview ${contact.unread && activeContact?.id !== contact.id ? 'unread' : ''}`}>
          {contact.lastMessage ?
           `${contact.lastSenderId === user?.id ? 'You: ' : ''}${contact.lastMessage} · ${contact.lastMessageTime ? formatTimeAgo(contact.lastMessageTime) : ''}`
           : 'No messages yet'}
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
      <div className="chat-header">
       {isMobile && (
        <button className="mobile-back-btn" onClick={handleBackToContacts}>
        </button>
       )}
       <img src="/resources/default_avatar.png" alt={activeContact.username} className="chat-avatar" />
       <div className="chat-user-info">
        <span className="chat-username">{activeContact.username}</span>
        <span className="chat-status">
         {onlineUsers.includes(activeContact.id) ? 'Online' : 'Offline'}
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
       {messages.length === 0 ? (
        <div className="empty-messages">
         <p>Start a conversation with {activeContact.username}</p>
        </div>
       ) : (
        messages.map(message => (
         <div
          key={message.id}
          className={`message ${message.sender_id === user.id ? 'sent' : 'received'}`}
         >
          {message.sender_id !== user.id && (
           <img
            src="/resources/default_avatar.png"
            alt={activeContact.username}
            className="message-avatar"
           />
          )}
          <div className="message-bubble">
           <div className="message-content">
            {message.content}
           </div>
           <div className="message-time">
            {new Date(message.timestamp + 'Z').toLocaleTimeString([], {
             hour: '2-digit',
             minute: '2-digit'
            })}
           </div>
          </div>
         </div>
        ))
       )}

       {Array.from(typingUsers).filter(id => id !== user?.id && id === activeContact?.id).length > 0 && (
        <div className="typing-indicator">
         <span>{activeContact.username} is typing...</span>
        </div>
       )}

       <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-container">
       <input
        type="text"
        value={messageText}
        onChange={handleMessageInputChange}
        placeholder="Type a message..."
        className="message-input"
       />
       <button
        type="submit"
        className="send-button"
        disabled={!messageText.trim()}
       >
        Send
       </button>
      </form>
     </>
    ) : (
     <div className="no-chat-selected">
      <h2>Welcome to uChat</h2>
      <p>Select a contact to start chatting</p>
     </div>
    )}
   </div>

   {error && (
    <div className="error-toast">
     {error}
    </div>
   )}

   {callState.isIncoming && (
    <div className="call-overlay">
     <div className="incoming-call">
      <img src="/resources/default_avatar.png" alt={callState.contact?.username} />
      <h3>{callState.contact?.username} is calling</h3>
      <p>{callState.type === 'video' ? 'Video Call' : 'Audio Call'}</p>
      <div className="call-actions">
       <button
        className="decline-btn"
        onClick={() => answerCall(false)}
       >
       </button>
       <button
        className="accept-btn"
        onClick={() => answerCall(true)}
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
         src="/resources/default_avatar.png"
         alt={callState.contact?.username}
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
  </div>
 );
};

export default App;