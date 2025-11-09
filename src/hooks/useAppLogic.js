import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from "../config";
import sodium from "libsodium-wrappers-sumo";
import { ensureDeviceKeypair, getPublicKeyB64 } from "../crypto/cryptoKeys";
import { encryptFor, decryptMaybe } from "../crypto/e2ee";

export const useAppLogic = () => {
 const navigate = useNavigate();
 const socketRef = useRef(null);
 const messagesEndRef = useRef(null);
 const messagesContainerRef = useRef(null);
 const typingTimeoutRef = useRef(null);
 const reconnectTimeoutRef = useRef(null);
 const fileInputRef = useRef(null);

 // State definitions
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [contacts, setContacts] = useState([]);
 const [activeContact, setActiveContact] = useState(null);
 const [messages, setMessages] = useState([]);
 const [messageText, setMessageText] = useState("");
 const [onlineUsers, setOnlineUsers] = useState([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [searchResults, setSearchResults] = useState([]);
 const [showSearch, setShowSearch] = useState(false);
 const [typingUsers, setTypingUsers] = useState(new Set());
 const [error, setError] = useState("");
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
 const [showReactionPopup, setShowReactionPopup] = useState(null);
 const [reactionPopupPosition, setReactionPopupPosition] = useState({ x: 0, y: 0 });
 const [socketConnected, setSocketConnected] = useState(false);
 const [reconnectAttempts, setReconnectAttempts] = useState(0);
 const [showGifPicker, setShowGifPicker] = useState(false);
 const [dragOver, setDragOver] = useState(false);
 const [deleteConfirm, setDeleteConfirm] = useState(null);
 const [showDownloadRecommendation, setShowDownloadRecommendation] = useState(false);
 const [sessionDismissed, setSessionDismissed] = useState(false);
 const [showVerificationBanner, setShowVerificationBanner] = useState(false);
 const [showUnverifiedModal, setShowUnverifiedModal] = useState(null);
 const [isOffline, setIsOffline] = useState(false);
 const [callMinimized, setCallMinimized] = useState(false);
 const [screenshareMinimized, setScreenshareMinimized] = useState(false);
 const [userStatuses, setUserStatuses] = useState({}); // Track user statuses (online/away/offline)
 const [showProfileModal, setShowProfileModal] = useState(null);
 const [isLoadingMessages, setIsLoadingMessages] = useState(null);
 const [callPosition, setCallPosition] = useState({ x: 20, y: 20 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
 const [messageCache, setMessageCache] = useState({});
 const [showMediaViewer, setShowMediaViewer] = useState(null);
 const [showMessageOptionsPhone, setShowMessageOptionsPhone] = useState(null);
 const [messagesContainerVisible, setMessagesContainerVisible] = useState(true);
 const [showPinModal, setShowPinModal] = useState(null); // 'setup' or 'unlock'
 const messageCacheRef = useRef({});
 const activityTimeoutRef = useRef(null);

 // Refs for keeping state in sync
 const activeContactRef = useRef(null);
 const userRef = useRef(null);
 const contactsRef = useRef([]);

 const maxReconnectAttempts = 10;

 // Sync refs with state
 useEffect(() => {
  activeContactRef.current = activeContact;
 }, [activeContact]);

 useEffect(() => {
  userRef.current = user;
 }, [user]);

 useEffect(() => {
  contactsRef.current = contacts;
 }, [contacts]);

 // Check mobile on mount and resize
 useEffect(() => {
  const checkMobile = () => {
   setIsMobile(window.innerWidth <= 768);
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
 }, []);

 // Verify user and initialize socket
 const checkAuth = useCallback(async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: "include",
   });

   if (response.ok) {
    const data = await response.json();
    setUser(data.user);
    initializeSocket(messagesContainerRef);
    loadContacts();

    // DON'T call ensureDeviceKeypair here - wait for PIN modal

    // Delay to let splash animation play fully
    setTimeout(() => {
     setLoading(false);
    }, 1300);
   } else {
    navigate("/login", { replace: true });
   }
  } catch (error) {
   console.error("Auth check failed:", error);
   navigate("/login", { replace: true });
  }
 }, [navigate]);

 // In checkPinStatus callback - around line 130
 const checkPinStatus = useCallback(async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/keys/my-device`, {
    credentials: "include",
   });

   if (response.status === 404) {
    setShowPinModal('setup');
    return;
   } else if (response.ok) {
    const data = await response.json();
    if (data.encrypted_private_key) {
     // Check if we have a cached DERIVED KEY (not PIN!)
     const cachedKey = localStorage.getItem('uchat_session_master_key');
     if (cachedKey) {
      console.log('[PIN] Found cached key, auto-unlocking...');
      try {
       await ensureDeviceKeypair(); // Will use cached key
       console.log('[PIN] Auto-unlock successful');
       // Don't show PIN modal - we're already unlocked
      } catch (err) {
       console.error('[PIN] Auto-unlock failed:', err);
       // Clear invalid cached key
       localStorage.removeItem('uchat_session_master_key');
       setShowPinModal('unlock');
      }
     } else {
      setShowPinModal('unlock');
     }
    }
   }
  } catch (err) {
   // SILENCE - don't log 404s
  }
 }, []);

 const handlePinSubmit = useCallback(async (pin) => {
  console.log('[PIN] Submitting PIN, mode:', showPinModal, 'pin length:', pin?.length);

  try {
   if (showPinModal === 'setup') {
    console.log('[PIN] Creating new keypair...');
    const { createAndSaveKeypair } = await import("../crypto/cryptoKeys");
    await createAndSaveKeypair(pin);
    console.log('[PIN] Keypair created successfully');
    setShowPinModal(null);
   } else {
    console.log('[PIN] Unlocking with existing keypair...');
    const { ensureDeviceKeypair } = await import("../crypto/cryptoKeys");
    await ensureDeviceKeypair(pin); // This will save the derived key to localStorage
    console.log('[PIN] Unlocked successfully');
    setShowPinModal(null);

    // RE-DECRYPT ALL MESSAGES AFTER UNLOCK
    if (messages.length > 0) {
     console.log('[PIN] Re-decrypting', messages.length, 'messages...');
     const { decryptMaybe } = await import("../crypto/e2ee");
     const decryptedMessages = await Promise.all(
      messages.map(async (m) => ({
       ...m,
       content: typeof m.content === "string" ? await decryptMaybe(m.content) : m.content
      }))
     );
     setMessages(decryptedMessages);
     console.log('[PIN] Messages re-decrypted');
    }

    // RE-DECRYPT ALL CONTACT PREVIEWS
    if (contacts.length > 0) {
     console.log('[PIN] Re-decrypting', contacts.length, 'contact previews...');
     const { decryptMaybe } = await import("../crypto/e2ee");
     const decryptedContacts = await Promise.all(
      contacts.map(async (c) => ({
       ...c,
       lastMessage: typeof c.lastMessage === "string" ? await decryptMaybe(c.lastMessage) : c.lastMessage
      }))
     );
     setContacts(decryptedContacts);
     console.log('[PIN] Contact previews re-decrypted');
    }
   }
  } catch (err) {
   console.error('[PIN] Error:', err);
   throw err; // Re-throw so PinForEnc can show the error
  }
 }, [showPinModal, messages, contacts]);

 // Initialize Socket.IO connection
 const initializeSocket = useCallback((messagesContainerRefParam) => {
  if (socketRef.current) {
   socketRef.current.removeAllListeners();
   socketRef.current.off();
   socketRef.current.disconnect();
   socketRef.current = null;
  }

  const socket = io(SOCKET_URL, {
   withCredentials: true,
   transports: ["websocket", "polling"],
   timeout: 20000,
   forceNew: true,
   reconnection: true,
   reconnectionAttempts: Infinity,
   reconnectionDelay: 1000,
   reconnectionDelayMax: 5000,
  });

  socketRef.current = socket;

  socket.on("connect", () => {
   setSocketConnected(true);
   setReconnectAttempts(0);

   const currentActiveContact = activeContactRef.current;
   if (currentActiveContact) {
    socket.emit("join_chat", { contact_id: currentActiveContact.id });
   }

   // Immediately refresh data and mark this session as active
   socket.emit("request_contacts_update");
   socket.emit("request_online_users");
   emitActivity(); // <-- ping activity on connect so status shows ONLINE right away
  });

  socket.on("online_users_update", (data) => {
   setOnlineUsers(data.online_users || []);
  });

  socket.on("disconnect", () => {
   setSocketConnected(false);
  });

  socket.on("connect_error", () => {
   setSocketConnected(false);
  });

  socket.on("user_status", (data) => {
   // Update user statuses map
   setUserStatuses((prev) => ({
    ...prev,
    [data.user_id]: data.status
   }));

   setOnlineUsers((prev) => {
    if (data.status === "online" || data.status === "away") {
     return [...prev, data.user_id].filter(
      (id, index, arr) => arr.indexOf(id) === index
     );
    } else {
     return prev.filter((id) => id !== data.user_id);
    }
   });

   // ALWAYS update last_seen for this user, regardless of status
   if (data.last_seen) {
    setContacts((prev) =>
     prev.map((contact) =>
      contact.id === data.user_id
       ? { ...contact, last_seen: data.last_seen }
       : contact
     )
    );

    // Also update active contact if it's the same user
    setActiveContact((prev) =>
     prev && prev.id === data.user_id
      ? { ...prev, last_seen: data.last_seen }
      : prev
    );
   }
  });

  socket.on("new_message", async (data) => {
   let message = data.message;
   const currentActiveContact = activeContactRef.current;
   const currentUser = userRef.current;

   // Decrypt BEFORE doing anything else
   try {
    if (typeof message.content === "string") {
     const decrypted = await decryptMaybe(message.content);
     message = { ...message, content: decrypted };
    }
   } catch { /* leave as-is on failure */ }

   // If this message belongs to the currently open chat, append it
   if (
    currentActiveContact &&
    currentUser &&
    (
     (message.sender_id === currentActiveContact.id && message.receiver_id === currentUser.id) ||
     (message.sender_id === currentUser.id && message.receiver_id === currentActiveContact.id)
    )
   ) {
    setMessages((prev) => {
     const exists = prev.some((m) => m.id === message.id);
     if (exists) return prev;
     const updated = [...prev, message];
     if (currentActiveContact) {
      messageCacheRef.current[currentActiveContact.id] = updated.slice(-100);
     }
     return updated;
    });
   }

   // KEEP THE PREVIEW IN SYNC (always decrypted)
   if (currentUser) {
    const peerId = (message.sender_id === currentUser.id)
     ? message.receiver_id
     : message.sender_id;

    const previewText =
     message.message_type === "image"
      ? "📷 Sent an image"
      : message.message_type === "file"
       ? `📎 ${message.file_name || "File"}`
       : (typeof message.content === "string" ? message.content : "");

    setContacts((prev) =>
     prev.map((c) =>
      c.id === peerId
       ? {
        ...c,
        lastMessage: previewText || c.lastMessage,
        lastMessageTime: message.timestamp || c.lastMessageTime,
        lastSenderId: message.sender_id,
       }
       : c
     )
    );
   }

   // housekeeping (same as before)
   setTypingUsers((prev) => {
    const s = new Set(prev);
    s.delete(message.sender_id);
    return s;
   });

   handleMessageNotification(message);
  });

  socket.on('messages_loaded', async (data) => {
   const { messages: newMessages, has_more, contact_id } = data;

   if (socketRef.current._loadingTimer) {
    clearTimeout(socketRef.current._loadingTimer);
    socketRef.current._loadingTimer = null;
   }

   setHasMoreMessages(has_more);
   const wasLoadingMore = loadingMoreMessages;
   setLoadingMoreMessages(false);

   // Decrypt batch (including original_message content for replies)
   let decrypted = newMessages;
   try {
    decrypted = await Promise.all(
     newMessages.map(async (m) => {
      const decryptedMessage = {
       ...m,
       content: typeof m.content === "string" ? await decryptMaybe(m.content) : m.content
      };

      // Also decrypt original_message content if it exists (for replies)
      if (m.original_message && typeof m.original_message.content === "string") {
       decryptedMessage.original_message = {
        ...m.original_message,
        content: await decryptMaybe(m.original_message.content)
       };
      }

      return decryptedMessage;
     })
    );
   } catch { /* ignore and show what we have */ }

   if (decrypted.length > 0) {
    setIsLoadingMessages(null);

    setMessages((prev) => {
     const combined = [...decrypted, ...prev];
     const unique = combined.filter((msg, i, self) => i === self.findIndex((x) => x.id === msg.id));
     const sorted = unique.sort((a, b) => a.id - b.id);

     if (contact_id) {
      messageCacheRef.current[contact_id] = sorted.slice(-100);
     }

     if (prev.length === 0 && !wasLoadingMore && messagesContainerRefParam?.current) {
      messagesContainerRefParam.current.style.opacity = "0";
      messagesContainerRefParam.current.scrollTop = messagesContainerRefParam.current.scrollHeight;
      setTimeout(() => {
       if (messagesContainerRefParam.current) messagesContainerRefParam.current.style.opacity = "1";
      }, 100);
     }
     return sorted;
    });

    const reactionsData = {};
    decrypted.forEach((m) => {
     if (m.reactions && Object.keys(m.reactions).length > 0) {
      reactionsData[m.id] = m.reactions;
     }
    });
    setMessageReactions((prev) => ({ ...prev, ...reactionsData }));
   } else {
    setIsLoadingMessages(false);
   }
  });

  socket.on("desktop_notification", async (data) => {
   const currentActiveContact = activeContactRef.current;
   const message = { ...data.message };

   try {
    if (typeof message.content === "string") {
     message.content = await decryptMaybe(message.content);
    }
   } catch { }

   if (!currentActiveContact || currentActiveContact.id !== message.sender_id) {
    handleMessageNotification(message);
   }
  });

  socket.on("message_deleted", (data) => {
   setMessages((prev) =>
    prev.map((m) => {
     if (m.id === data.message_id) {
      return {
       ...m,
       deleted: true,
       content: null,
       file_path: null,
       file_name: null,
      };
     } else if (
      m.original_message &&
      m.original_message.id === data.message_id
     ) {
      return {
       ...m,
       original_message: {
        ...m.original_message,
        deleted: true,
        content: null,
        file_path: null,
        file_name: null,
       },
      };
     }
     return m;
    })
   );

   setReplyingTo((prev) => {
    if (prev && prev.id === data.message_id) {
     return {
      ...prev,
      deleted: true,
      content: null,
      file_path: null,
      file_name: null,
     };
    }
    return prev;
   });
  });

  socket.on("contact_updated", async (data) => {
   const currentActive = activeContactRef.current;

   // Decrypt lastMessage if it's encrypted
   let decryptedLastMessage = data.lastMessage;
   if (decryptedLastMessage && typeof decryptedLastMessage === 'string') {
    decryptedLastMessage = await decryptMaybe(decryptedLastMessage);
   }

   setContacts((prev) =>
    prev.map((contact) => {
     if (contact.id === data.contact_id) {
      const isActive =
       currentActive && currentActive.id === data.contact_id;

      return {
       ...contact,
       lastMessage: decryptedLastMessage,
       lastMessageTime: data.lastMessageTime,
       last_seen: data.last_seen || contact.last_seen,
       unread: isActive ? false : data.unread,
       username: data.username || contact.username,
       avatar_url: data.avatar_url || contact.avatar_url,
       handle: data.handle || contact.handle,
       is_verified:
        data.is_verified !== undefined
         ? data.is_verified
         : contact.is_verified,
      };
     }
     return contact;
    })
   );
  });

  socket.on("typing_status", (data) => {
   const currentActiveContact = activeContactRef.current;

   if (currentActiveContact && data.user_id === currentActiveContact.id) {
    setTypingUsers((prev) => {
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

  socket.on("reaction_added", (data) => {
   setMessageReactions((prev) => ({
    ...prev,
    [data.message_id]: {
     ...prev[data.message_id],
     [data.reaction_type]: {
      count: data.count,
      users: data.users,
     },
    },
   }));
  });

  socket.on("reaction_removed", (data) => {
   setMessageReactions((prev) => ({
    ...prev,
    [data.message_id]: {
     ...prev[data.message_id],
     [data.reaction_type]: {
      count: data.count,
      users: data.users,
     },
    },
   }));
  });
 }, []);

 // Load contacts from server
 const loadContacts = useCallback(async () => {
  try {
   setContactsLoading(true);
   const response = await fetch(`${API_BASE_URL}/api/contacts`, {
    credentials: "include",
   });

   if (response.ok) {
    const data = await response.json();

    // Decrypt lastMessage for each contact
    const decryptedContacts = await Promise.all(
     data.contacts.map(async (contact) => {
      if (contact.lastMessage && typeof contact.lastMessage === 'string') {
       contact.lastMessage = await decryptMaybe(contact.lastMessage);
      }
      return contact;
     })
    );

    setContacts(decryptedContacts);
    setOnlineUsers(data.online_users);
    setContactsLoading(false);
   } else if (response.status === 401) {
    navigate("/login", { replace: true });
   }
  } catch (error) {
   console.error("Failed to load contacts:", error);
   setContactsLoading(false);
  }
 }, [navigate]);

 const loadMessages = useCallback((contactId, beforeId = null) => {
  if (!socketRef.current) return;

  if (!beforeId && messageCacheRef.current[contactId]) {
   console.log('Loading from cache for contact:', contactId);
   setMessages(messageCacheRef.current[contactId]);
   setIsLoadingMessages(false);

   if (socketRef.current.connected) {
    socketRef.current.emit("load_messages", {
     contact_id: contactId,
     before_id: null,
     limit: 30
    });
   } else {
    const onConnectOnce = () => {
     socketRef.current.emit("load_messages", {
      contact_id: contactId,
      before_id: null,
      limit: 30
     });
     socketRef.current.off("connect", onConnectOnce);
    };
    socketRef.current.on("connect", onConnectOnce);
   }
   return;
  }

  if (!beforeId) {
   if (socketRef.current._loadingTimer) {
    clearTimeout(socketRef.current._loadingTimer);
   }

   const loadingTimer = setTimeout(() => {
    setIsLoadingMessages(true);
   }, 1500);

   socketRef.current._loadingTimer = loadingTimer;
  }

  if (socketRef.current.connected) {
   socketRef.current.emit("load_messages", {
    contact_id: contactId,
    before_id: beforeId,
    limit: 30
   });
  } else {
   const onConnectOnce = () => {
    socketRef.current.emit("load_messages", {
     contact_id: contactId,
     before_id: beforeId,
     limit: 30
    });
    socketRef.current.off("connect", onConnectOnce);
   };
   socketRef.current.on("connect", onConnectOnce);
  }
 }, []);

 const [hasMoreMessages, setHasMoreMessages] = useState(true);
 const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

 // Search for users
 const searchUsers = useCallback(async (query) => {
  if (!query.trim()) {
   setSearchResults([]);
   return;
  }

  try {
   const response = await fetch(
    `${API_BASE_URL}/api/search_users?q=${encodeURIComponent(query)}`,
    {
     credentials: "include",
    }
   );

   if (response.ok) {
    const data = await response.json();
    setSearchResults(data.users);
   } else if (response.status === 401) {
    navigate("/login", { replace: true });
   }
  } catch (error) {
   console.error("Search failed:", error);
  }
 }, [navigate]);

 const addContact = useCallback(async (userId) => {
  try {
   const response = await fetch(
    `${API_BASE_URL}/api/add_contact/${userId}`,
    {
     method: "POST",
     credentials: "include",
    }
   );

   if (response.ok) {
    const data = await response.json();
    let contact = data.contact;

    // Ensure previews never show enc:v1:...
    if (contact && typeof contact.lastMessage === "string") {
     try {
      contact = {
       ...contact,
       lastMessage: await decryptMaybe(contact.lastMessage),
      };
     } catch {
      // keep as-is if anything goes wrong
     }
    }

    setContacts((prev) => [...prev, contact]);
    setSearchResults([]);
    setSearchQuery("");
    setShowSearch(false);
   } else if (response.status === 401) {
    navigate("/login", { replace: true });
   } else {
    const errorData = await response.json();
    setError(errorData.error);
   }
  } catch (error) {
   console.error("Failed to add contact:", error);
   setError("Failed to add contact");
  }
 }, [navigate]);

 // Select a contact and load messages
 const selectContact = useCallback(
  (contact) => {
   if (activeContact?.id !== contact.id) {
    if (activeContact && socketRef.current) {
     socketRef.current.emit("leave_chat", {
      contact_id: activeContact.id,
     });
    }

    setContacts((prev) =>
     prev.map((c) =>
      c.id === contact.id ? { ...c, unread: false } : c
     )
    );

    // CLEAR MESSAGES FIRST - IMPORTANT!
    setMessages([]);
    setHasMoreMessages(true);

    if (isMobile) {
     setActiveContact(null);
     setShowChatContent(false);
     setShowMobileChat(true);

     setTimeout(() => {
      setActiveContact(contact);

      if (!isMobile && contact) {
       localStorage.setItem(
        "lastSelectedContact",
        JSON.stringify({
         id: contact.id,
         username: contact.username,
         avatar_url: contact.avatar_url,
        })
       );
      }
      setTypingUsers(new Set());

      if (socketRef.current && socketRef.current.connected) {
       socketRef.current.emit("join_chat", { contact_id: contact.id });
       socketRef.current.emit("mark_as_read", { contact_id: contact.id });
      } else if (socketRef.current) {
       initializeSocket(messagesContainerRef);
       setTimeout(() => {
        if (socketRef.current) {
         socketRef.current.emit("join_chat", {
          contact_id: contact.id,
         });
         socketRef.current.emit("mark_as_read", {
          contact_id: contact.id,
         });
        }
       }, 500);
      }

      setTimeout(() => {
       setShowChatContent(true);
      }, 100);

      loadMessages(contact.id, null);
     }, 350);
    } else {
     setActiveContact(contact);
     if (!isMobile && contact) {
      localStorage.setItem(
       "lastSelectedContact",
       JSON.stringify({
        id: contact.id,
        username: contact.username,
        avatar_url: contact.avatar_url,
       })
      );
     }
     setTypingUsers(new Set());

     if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("join_chat", { contact_id: contact.id });
      socketRef.current.emit("mark_as_read", { contact_id: contact.id });
     } else if (socketRef.current) {
      initializeSocket(messagesContainerRef);
      setTimeout(() => {
       if (socketRef.current) {
        socketRef.current.emit("join_chat", { contact_id: contact.id });
        socketRef.current.emit("mark_as_read", {
         contact_id: contact.id,
        });
       }
      }, 500);
     }

     loadMessages(contact.id, null);
    }
   }
  },
  [activeContact, isMobile, initializeSocket, loadMessages]
 );

 // Handle back button on mobile
 const handleBackToContacts = useCallback(() => {
  setShowMobileChat(false);
  setActiveContact(null);
  setMessages([]);
  setTypingUsers(new Set());
  setShowChatContent(false);

  if (activeContact && socketRef.current) {
   socketRef.current.emit("leave_chat", { contact_id: activeContact.id });
  }
 }, [activeContact]);

 // Send message
 const sendMessage = useCallback(async () => {
  console.log('[SEND] sendMessage called');
  console.log('[SEND] socketRef.current:', !!socketRef.current);
  console.log('[SEND] activeContact:', activeContact?.username);
  console.log('[SEND] messageText:', messageText);

  if (!socketRef.current || !activeContact || !messageText.trim()) {
   console.log('[SEND] Validation failed - returning early');
   return;
  }

  const plaintext = messageText.trim();
  console.log('[SEND] Attempting to send message:', plaintext);

  try {
   console.log('[SEND] Fetching recipient keys for user:', activeContact.id);
   const res = await fetch(`${API_BASE_URL}/api/keys/${activeContact.id}`, { credentials: "include" });
   const { devices } = await res.json();
   const target = devices?.[0];

   console.log('[SEND] Recipient public key:', target?.public_key_b64?.substring(0, 20) + '...');

   if (target?.public_key_b64) {
    const { encryptMessageDouble } = await import("../crypto/e2ee");
    console.log('[SEND] Encrypting message...');
    const { content_receiver, content_sender } = await encryptMessageDouble(plaintext, target.public_key_b64);

    console.log('[SEND] Encrypted for receiver:', content_receiver?.substring(0, 50) + '...');
    console.log('[SEND] Encrypted for sender:', content_sender?.substring(0, 50) + '...');

    console.log('[SEND] Emitting to socket...');
    socketRef.current.emit("send_message", {
     receiver_id: activeContact.id,
     content_receiver,
     content_sender,
     reply_to: replyingTo?.id || null,
    });
    console.log('[SEND] Message sent successfully');
   } else {
    console.error('[SEND] No public key found for recipient');
   }
  } catch (err) {
   console.error("[SEND] Encryption failed:", err);
  }

  setMessageText("");
  setReplyingTo(null);
 }, [socketRef, activeContact, messageText, replyingTo]);

 // Handle typing indicator with debouncing
 const lastTypingEmit = useRef(0);
 const typingEmitCooldown = 1000; // Only emit once per second

 const handleMessageInputChange = useCallback(
  (e) => {
   const newValue = e.target.value;
   setMessageText(newValue);

   if (!activeContact || !socketRef.current || !socketRef.current.connected)
    return;

   if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
   }

   const shouldBeTyping = newValue.trim().length > 0;
   const now = Date.now();

   if (shouldBeTyping) {
    // Only emit typing event if cooldown has passed
    if (!isTyping || (now - lastTypingEmit.current) > typingEmitCooldown) {
     setIsTyping(true);
     lastTypingEmit.current = now;
     socketRef.current.emit("typing", {
      receiver_id: activeContact.id,
      is_typing: true,
     });
    }

    typingTimeoutRef.current = setTimeout(() => {
     setIsTyping(false);
     if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("typing", {
       receiver_id: activeContact.id,
       is_typing: false,
      });
     }
    }, 3000);
   } else {
    if (isTyping) {
     setIsTyping(false);
     socketRef.current.emit("typing", {
      receiver_id: activeContact.id,
      is_typing: false,
     });
    }
   }
  },
  [activeContact, isTyping]
 );

 // Logout
 const handleLogout = useCallback(async () => {
  try {
   await fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
   });

   if (socketRef.current) {
    socketRef.current.disconnect();
   }

   // Clear stored derived key on logout
   localStorage.removeItem('uchat_session_master_key');

   navigate("/login", { replace: true });
  } catch (error) {
   console.error("Logout failed:", error);
   localStorage.removeItem('uchat_session_master_key');
   navigate("/login", { replace: true });
  }
 }, [navigate]);

 // Save last contact to localStorage
 const saveLastContact = useCallback((contact) => {
  if (!isMobile && contact) {
   localStorage.setItem(
    "lastSelectedContact",
    JSON.stringify({
     id: contact.id,
     username: contact.username,
     avatar_url: contact.avatar_url,
    })
   );
  }
 }, [isMobile]);

 // Load last contact from localStorage
 const loadLastContact = useCallback(() => {
  if (!isMobile) {
   try {
    const saved = localStorage.getItem("lastSelectedContact");
    if (saved) {
     return JSON.parse(saved);
    }
   } catch (error) {
    console.error("Failed to load last contact:", error);
   }
  }
  return null;
 }, [isMobile]);

 // Emit user activity to backend
 const emitActivity = useCallback(() => {
  if (socketRef.current && socketRef.current.connected) {
   socketRef.current.emit("user_activity");
  }
 }, []);

 // Handle message notification
 const handleMessageNotification = useCallback((message) => {
  const currentUser = userRef.current;

  if (message.sender_id !== currentUser?.id) {
   const senderName =
    message.sender_username || message.username || "Unknown User";
   const avatarFromMessage =
    message.sender_avatar || message.avatar_url || message.avatar;
   let senderAvatarUrl = avatarFromMessage;

   if (!senderAvatarUrl) {
    const currentContacts = contactsRef.current;
    const senderContact = currentContacts.find(
     (contact) => contact.id === message.sender_id
    );
    senderAvatarUrl =
     senderContact?.avatar_url || senderContact?.avatar || null;
   }

   if (
    window.AndroidBridge &&
    typeof window.AndroidBridge.postMessage === "function"
   ) {
    try {
     window.AndroidBridge.postMessage(
      JSON.stringify({
       type: "new_message",
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
         message_type: message.message_type,
        },
       },
      })
     );
    } catch (e) {
     console.error("[Android] Failed to send notification:", e);
    }
   } else if (window.require) {
    try {
     const { ipcRenderer } = window.require("electron");
     ipcRenderer.send("web-notification", {
      type: "new_message",
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
        message_type: message.message_type,
       },
      },
     });
    } catch (e) { }
   } else {
    if ("Notification" in window) {
     if (Notification.permission === "granted") {
      const notificationTitle = senderName;
      const notificationBody =
       message.message_type === "image"
        ? "📷 Sent an image"
        : message.message_type === "file"
         ? `📎 ${message.file_name}`
         : message.content || "New message";

      const notification = new Notification(notificationTitle, {
       body: notificationBody,
       icon: senderAvatarUrl
        ? `${API_BASE_URL}${senderAvatarUrl}`
        : "/resources/default_avatar.png",
       tag: `message-${message.id}`,
       requireInteraction: false,
      });

      notification.onclick = () => {
       window.focus();
       notification.close();
      };
     } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
     }
    }
   }
  }
 }, []);

 // Handle clicks outside dropdowns
 useEffect(() => {
  const handleClickOutside = (event) => {
   if (
    showUserMenu &&
    !event.target.closest(".user-profile") &&
    !event.target.closest(".mobile-avatar")
   ) {
    setShowUserMenu(false);
   }
   if (
    showMobileSearch &&
    !event.target.closest(".mobile-search-overlay") &&
    !event.target.closest(".mobile-search-back")
   ) {
    setShowMobileSearch(false);
    setSearchQuery("");
    setSearchResults([]);
   }
   if (showSearch && !event.target.closest(".search-section")) {
    setShowSearch(false);
    setShowMobileSearch(false);
    setSearchQuery("");
    setSearchResults([]);
   }
   if (
    showReactionPopup &&
    !event.target.closest(".reaction-modal") &&
    !event.target.closest(".message-reaction-btn")
   ) {
    setShowReactionPopup(null);
   }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
 }, [showUserMenu, showSearch, showReactionPopup, showMobileSearch]);

 // Network status
 useEffect(() => {
  if (window.require) {
   try {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.invoke("get-network-status").then((online) => {
     setIsOffline(!online);
    });

    ipcRenderer.on("network-status-changed", (event, online) => {
     setIsOffline(!online);
    });

    return () => {
     ipcRenderer.removeAllListeners("network-status-changed");
    };
   } catch (e) {
    console.log("Electron IPC not available for network status");
   }
  }
 }, []);

 // Download recommendation
 useEffect(() => {
  const detectWindowsAndManageDisplay = () => {
   const userAgent = navigator.userAgent;
   const isWindows = userAgent.includes("Windows");
   const isElectron = userAgent.toLowerCase().includes("electron");

   if (isElectron) {
    return;
   }

   const userHasApp = localStorage.getItem("uchat-user-has-desktop-app");

   if (!isWindows || userHasApp === "true") {
    return;
   }

   const refreshData = JSON.parse(
    localStorage.getItem("uchat-refresh-tracker") ||
    '{"count": 0, "lastReset": 0}'
   );
   const now = Date.now();
   const oneDayMs = 600000;

   if (now - refreshData.lastReset > oneDayMs) {
    refreshData.count = 0;
    refreshData.lastReset = now;
   }

   refreshData.count += 1;
   localStorage.setItem(
    "uchat-refresh-tracker",
    JSON.stringify(refreshData)
   );

   if (refreshData.count % 3 === 0 && !sessionDismissed) {
    setTimeout(() => {
     setShowDownloadRecommendation(true);
    }, 3000);
   }
  };

  detectWindowsAndManageDisplay();
 }, [sessionDismissed]);

 // Initialize auth on mount
 useEffect(() => {
  checkAuth();
 }, [checkAuth]);

 // Check PIN status ONCE after user loads
 useEffect(() => {
  if (user && showPinModal === null) {
   checkPinStatus();
  }
 }, [user]); // Remove checkPinStatus from dependencies

 // Request notification permission
 useEffect(() => {
  if ("Notification" in window && Notification.permission === "default") {
   if (!window.require && !window.AndroidBridge) {
    Notification.requestPermission().then((permission) => {
     console.log("Notification permission:", permission);
    });
   }
  }
 }, []);

 // Page visibility and reconnection
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (document.visibilityState === "visible") {
    if (socketRef.current && !socketRef.current.connected) {
     initializeSocket(messagesContainerRef);
    }
   }
  };

  const handleFocus = () => {
   if (socketRef.current && !socketRef.current.connected) {
    initializeSocket(messagesContainerRef);
   }
  };

  const handleOnline = () => {
   initializeSocket(messagesContainerRef);
  };

  const heartbeat = setInterval(() => {
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.volatile.emit("ping");
   } else if (socketRef.current && !socketRef.current.connected) {
    initializeSocket(messagesContainerRef);
   }
  }, 15000);

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("online", handleOnline);

  return () => {
   clearInterval(heartbeat);
   document.removeEventListener("visibilitychange", handleVisibilityChange);
   window.removeEventListener("focus", handleFocus);
   window.removeEventListener("online", handleOnline);
  };
 }, [initializeSocket]);

 // Sync contacts
 useEffect(() => {
  const syncContacts = () => {
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit("request_contacts_update");
   }
  };

  const interval = setInterval(() => {
   if (document.visibilityState === "visible") {
    syncContacts();
   }
  }, 10000);

  return () => {
   clearInterval(interval);
  };
 }, []);

 // Restore last contact
 useEffect(() => {
  if (contacts.length > 0 && !isMobile && !activeContact) {
   const lastContact = loadLastContact();
   if (lastContact) {
    const contact = contacts.find((c) => c.id === lastContact.id);
    if (contact) {
     selectContact(contact);
    }
   }
  }
 }, [contacts, isMobile, activeContact, loadLastContact, selectContact]);

 // Debounced search
 useEffect(() => {
  const timeoutId = setTimeout(() => {
   searchUsers(searchQuery);
  }, 300);

  return () => clearTimeout(timeoutId);
 }, [searchQuery, searchUsers]);

 // Auto-clear errors
 useEffect(() => {
  if (error) {
   const timeoutId = setTimeout(() => setError(""), 3000);
   return () => clearTimeout(timeoutId);
  }
 }, [error]);

 // Set theme
 useEffect(() => {
  const prefersDark = window.matchMedia(
   "(prefers-color-scheme: dark)"
  ).matches;
  document.documentElement.setAttribute(
   "data-theme",
   prefersDark ? "dark" : "light"
  );

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute(
    "data-theme",
    e.matches ? "dark" : "light"
   );
  };

  mediaQuery.addEventListener("change", handleThemeChange);
  return () => mediaQuery.removeEventListener("change", handleThemeChange);
 }, []);

 // Activity tracking with debouncing - only emit every 30 seconds max
 useEffect(() => {
  let lastEmit = 0;
  const EMIT_COOLDOWN = 10000; // 10 seconds

  const handleActivity = () => {
   const now = Date.now();
   if (now - lastEmit > EMIT_COOLDOWN) {
    lastEmit = now;
    emitActivity();
   }
  };

  // Track meaningful user activities (removed mousemove to avoid constant triggers)
  window.addEventListener('keydown', handleActivity);
  window.addEventListener('click', handleActivity);
  window.addEventListener('scroll', handleActivity);
  window.addEventListener('touchstart', handleActivity);

  return () => {
   window.removeEventListener('keydown', handleActivity);
   window.removeEventListener('click', handleActivity);
   window.removeEventListener('scroll', handleActivity);
   window.removeEventListener('touchstart', handleActivity);
  };
 }, [emitActivity]);

 // Cleanup on unmount
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

 return {
  // State
  user,
  setUser,
  loading,
  setLoading,
  contacts,
  setContacts,
  activeContact,
  setActiveContact,
  messages,
  setMessages,
  messageText,
  setMessageText,
  onlineUsers,
  setOnlineUsers,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  showSearch,
  setShowSearch,
  typingUsers,
  setTypingUsers,
  error,
  setError,
  showUserMenu,
  setShowUserMenu,
  showMobileSearch,
  setShowMobileSearch,
  searchExiting,
  setSearchExiting,
  isMobile,
  setIsMobile,
  showMobileChat,
  setShowMobileChat,
  replyingTo,
  setReplyingTo,
  isTransitioning,
  setIsTransitioning,
  showChatContent,
  setShowChatContent,
  contactsLoading,
  setContactsLoading,
  isTyping,
  setIsTyping,
  messageReactions,
  setMessageReactions,
  showReactionPopup,
  setShowReactionPopup,
  reactionPopupPosition,
  setReactionPopupPosition,
  socketConnected,
  setSocketConnected,
  reconnectAttempts,
  setReconnectAttempts,
  showGifPicker,
  setShowGifPicker,
  dragOver,
  setDragOver,
  deleteConfirm,
  setDeleteConfirm,
  showDownloadRecommendation,
  setShowDownloadRecommendation,
  sessionDismissed,
  setSessionDismissed,
  showVerificationBanner,
  setShowVerificationBanner,
  showUnverifiedModal,
  setShowUnverifiedModal,
  isOffline,
  setIsOffline,
  callMinimized,
  setCallMinimized,
  screenshareMinimized,
  setScreenshareMinimized,
  userStatuses,
  setUserStatuses,
  showProfileModal,
  setShowProfileModal,
  hasMoreMessages,
  setHasMoreMessages,
  loadingMoreMessages,
  setLoadingMoreMessages,
  isLoadingMessages,
  setIsLoadingMessages,
  callPosition,
  setCallPosition,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
  messageCache,
  setMessageCache,
  showMediaViewer,
  setShowMediaViewer,
  showMessageOptionsPhone,
  setShowMessageOptionsPhone,
  messagesContainerVisible,
  setMessagesContainerVisible,
  checkPinStatus,
  handlePinSubmit,
  showPinModal,
  setShowPinModal,

  // Refs
  socketRef,
  messagesEndRef,
  messagesContainerRef,
  typingTimeoutRef,
  reconnectTimeoutRef,
  fileInputRef,
  activeContactRef,
  userRef,
  contactsRef,

  // Callbacks
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
  emitActivity,
 };
};