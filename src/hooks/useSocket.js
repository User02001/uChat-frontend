import { useRef, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config';

// Show browser notification for new messages
const showNotification = (senderName, messageContent) => {
 if (
  'Notification' in window &&
  Notification.permission === 'granted' &&
  document.visibilityState === 'hidden' &&
  !isMobile
 ) {
  const notification = new Notification(`${senderName} texted:`, {
   body: messageContent,
   icon: 'resources/message_received.png',
   badge: 'resources/message_received.png',
   tag: `uchat-${Date.now()}-${senderName}`, // More unique tag
   requireInteraction: true, // This makes it stick longer
   silent: false,
   renotify: true // Forces it to show even if similar notification exists
  });

  setTimeout(() => notification.close(), 5000);

  notification.onclick = () => {
   window.focus();
   notification.close();
  };
 }
};

const getNotificationContent = (message) => {
 if (message.file_url) {
  return `Sent a file: ${message.file_name || 'attachment'}`;
 }
 if (message.content) {
  return message.content.length > 100
   ? message.content.substring(0, 100) + '...'
   : message.content;
 }
 return 'Sent a message';
};