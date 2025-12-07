import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';

export const useMessageScroll = ({
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
}) => {
 const lastMessageIdRef = useRef(null);
 const userScrollLockRef = useRef(false);
 const previousScrollHeight = useRef(0);
 const hasScrolledInitiallyRef = useRef(false);
 const mediaLoadTimeoutRef = useRef(null);

 // Reset on contact change
 useEffect(() => {
  lastMessageIdRef.current = null;
  userScrollLockRef.current = false;
  previousScrollHeight.current = 0;
  hasScrolledInitiallyRef.current = false;

  if (messagesContainerRef.current) {
   messagesContainerRef.current.style.visibility = 'hidden';
   setMessagesContainerVisible(false);
  }
 }, [activeContact?.id, messagesContainerRef, setMessagesContainerVisible]);

 // Scroll handler for lazy loading
 const handleScroll = useCallback(() => {
  const container = messagesContainerRef.current;
  if (!container || !activeContact) return;

  const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

  const LOCK_AT = 200;
  const UNLOCK_AT = 8;

  if (distanceFromBottom > LOCK_AT) {
   if (!userScrollLockRef.current) {
    userScrollLockRef.current = true;
   }
  } else if (distanceFromBottom <= UNLOCK_AT) {
   if (userScrollLockRef.current) {
    userScrollLockRef.current = false;
   }
  }

  if (!loadingMoreMessages && hasMoreMessages && container.scrollTop < 50 && messages.length > 0) {
   const oldestMessage = messages[0];
   if (oldestMessage) {
    setLoadingMoreMessages(true);
    previousScrollHeight.current = container.scrollHeight;

    setTimeout(() => {
     loadMessages(activeContact.id, oldestMessage.id);
    }, 300);
   }
  }
 }, [activeContact, messages, hasMoreMessages, loadingMoreMessages, loadMessages, messagesContainerRef, setLoadingMoreMessages]);

 // Main scroll effect
 useLayoutEffect(() => {
  if (!messages || messages.length === 0) return;

  const container = messagesContainerRef.current;
  if (!container) return;

  // Handle "load more" scroll preservation
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

  const isInitialLoad = !hasScrolledInitiallyRef.current;

  lastMessageIdRef.current = newLastId;

  if (isInitialLoad) {
   // Clear any existing timeout
   if (mediaLoadTimeoutRef.current) {
    clearTimeout(mediaLoadTimeoutRef.current);
   }

   const performInitialScroll = () => {
    container.style.visibility = 'hidden';
    container.offsetHeight; // Force reflow

    // Scroll instantly while invisible
    container.scrollTop = container.scrollHeight + 9999;

    // Make visible on next frame
    requestAnimationFrame(() => {
     container.style.visibility = 'visible';
     setMessagesContainerVisible(true);
     hasScrolledInitiallyRef.current = true;
    });
   };

   // Find all media elements
   const mediaElements = container.querySelectorAll('img, video');
   const mediaArray = Array.from(mediaElements);

   if (mediaArray.length === 0) {
    // No media, scroll immediately
    performInitialScroll();
    return;
   }

   // Wait for media to load with timeout
   let loadedCount = 0;
   const totalMedia = mediaArray.length;
   let hasScrolled = false;

   const checkAllLoaded = () => {
    loadedCount++;
    if (loadedCount >= totalMedia && !hasScrolled) {
     hasScrolled = true;
     if (mediaLoadTimeoutRef.current) {
      clearTimeout(mediaLoadTimeoutRef.current);
     }
     // Wait a bit for layout to settle
     requestAnimationFrame(() => {
      requestAnimationFrame(() => {
       performInitialScroll();
      });
     });
    }
   };

   mediaArray.forEach((media) => {
    if (media.tagName === 'IMG') {
     if (media.complete) {
      checkAllLoaded();
     } else {
      media.addEventListener('load', checkAllLoaded, { once: true });
      media.addEventListener('error', checkAllLoaded, { once: true });
     }
    } else if (media.tagName === 'VIDEO') {
     if (media.readyState >= 2) {
      checkAllLoaded();
     } else {
      media.addEventListener('loadeddata', checkAllLoaded, { once: true });
      media.addEventListener('error', checkAllLoaded, { once: true });
     }
    }
   });

   // Fallback timeout: scroll after 2 seconds max
   mediaLoadTimeoutRef.current = setTimeout(() => {
    if (!hasScrolled) {
     hasScrolled = true;
     performInitialScroll();
    }
   }, 2000);

   return;
  }

  // Ensure visibility is set for empty chats with StartOfChat
  if (messages.length === 0 && container.style.visibility === 'hidden') {
   container.style.visibility = 'visible';
   setMessagesContainerVisible(true);
  }

  const canAutoScroll =
   (lastChanged && isMine && !userScrollLockRef.current) ||
   (lastChanged && nearBottom && !userScrollLockRef.current);

  if (canAutoScroll) {
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
     if (container) {
      container.scrollTop = container.scrollHeight + 9999;
     }
    });
   });
  }
 }, [messages, user, loadingMoreMessages, messagesContainerRef, setMessagesContainerVisible]);

 // Cleanup
 useEffect(() => {
  return () => {
   if (mediaLoadTimeoutRef.current) {
    clearTimeout(mediaLoadTimeoutRef.current);
   }
  };
 }, []);

 return {
  handleScroll,
  userScrollLockRef
 };
};