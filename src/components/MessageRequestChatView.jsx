import React, { useState, useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { styles } from '../styles/message_requests';
import { API_BASE_URL, CDN_BASE_URL } from '../config';
import Message from './Message';
import ImageMessage from './message_types/ImageMessage';
import VideoMessage from './message_types/VideoMessage';
import AudioMessage from './message_types/AudioMessage';
import FileMessage from './message_types/FileMessage';
import GifMessage from './message_types/GifMessage';
import { useFormatters } from '../hooks/useFormatters';
import { styles as chatStyles } from '../styles/chat';

const MessageRequestChatView = ({
 request,
 user,
 onAccept,
 onBlock,
 onBack
}) => {
 const [messages, setMessages] = useState([]);
 const [loading, setLoading] = useState(true);
 const [processing, setProcessing] = useState(false);
 const messagesEndRef = useRef(null);
 const { formatFileSize, getFileIcon } = useFormatters();

 useEffect(() => {
  if (request?.sender_id) {
   loadMessages();
  }
 }, [request?.sender_id]);

 const loadMessages = async () => {
  setLoading(true);
  try {
   const response = await fetch(
    `${API_BASE_URL}/api/message-requests/${request.sender_id}/messages`,
    { credentials: 'include' }
   );

   if (response.ok) {
    const data = await response.json();
    setMessages(data.messages);
   }
  } catch (error) {
   console.error('Failed to load messages:', error);
  } finally {
   setLoading(false);
  }
 };

 const handleAccept = async () => {
  setProcessing(true);
  await onAccept(request.id);
 };

 const handleBlock = async () => {
  setProcessing(true);
  await onBlock(request.id);
 };

 useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 return (
  <div {...stylex.props(styles.chatView)}>
   <div {...stylex.props(chatStyles.chatHeader)}>
    <button
     {...stylex.props(styles.mobileBackBtn)}
     onClick={onBack}
    >
     <i className="fas fa-arrow-left"></i>
    </button>
    <div style={{ position: 'relative', flexShrink: 0 }}>
     <img
      src={
       request.sender?.avatar_url
        ? `${CDN_BASE_URL}${request.sender.avatar_url}`
        : '/resources/default_avatar.png'
      }
      alt={request.sender?.username}
      {...stylex.props(chatStyles.chatAvatar)}
      draggable="false"
     />
     <div className="status-indicator offline"></div>
    </div>
    <div {...stylex.props(chatStyles.chatUserInfo)}>
     <div {...stylex.props(chatStyles.chatUsernameContainer)}>
      <span {...stylex.props(chatStyles.chatUsername)}>
       <span {...stylex.props(chatStyles.chatUsernameText)}>
        {request.sender?.username}
       </span>
      </span>
      <span {...stylex.props(chatStyles.chatAka)}>aka</span>
      <span {...stylex.props(chatStyles.chatHandle)}>@{request.sender?.handle}</span>
     </div>
     <span {...stylex.props(chatStyles.chatStatus)}>
      <span {...stylex.props(chatStyles.chatStatusText)}>
       Message Request
      </span>
     </span>
    </div>
   </div>

   <div {...stylex.props(chatStyles.messagesContainer)}>
    {loading ? (
     <div {...stylex.props(styles.loadingContainer)}>
      <div className="loading-spinner"></div>
     </div>
    ) : (
     <>
      <div {...stylex.props(styles.requestWarning)}>
       <i className="fas fa-info-circle" {...stylex.props(styles.requestWarningIcon)}></i>
       <span>
        <strong>{request.sender?.username}</strong> isn't in your contacts. Only accept if you know them. Be very cautious!!
       </span>
      </div>
      {messages.map((message, index) => {
       const prevMessage = messages[index - 1];
       const isSameSenderAsPrev = prevMessage && prevMessage.sender_id === message.sender_id;

       return (
        <Message
         key={message.id}
         message={message}
         user={user}
         activeContact={request.sender}
         onlineUsers={[]}
         userStatuses={{}}
         isGrouped={isSameSenderAsPrev}
         showHeader={!isSameSenderAsPrev}
         onProfileClick={() => { }}
         onAddReaction={() => { }}
         onRemoveReaction={() => { }}
         messageReactions={{}}
         isMobile={false}
         showReactionPopup={null}
         setShowReactionPopup={() => { }}
         onLongPress={() => { }}
         onReply={() => { }}
         onDelete={() => { }}
         onReport={() => { }}
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
             ? 'You have deleted this message.'
             : 'This message has been deleted.'}
           </em>
          </div>
         ) : message.message_type === 'image' ? (
          <ImageMessage
           message={message}
           API_BASE_URL={API_BASE_URL}
           onOpenViewer={() => { }}
          />
         ) : message.message_type === 'file' && message.file_type && ['mp4', 'webm', 'ogg', 'mov'].includes(message.file_type.toLowerCase()) ? (
          <VideoMessage
           message={message}
           API_BASE_URL={API_BASE_URL}
           onOpenViewer={() => { }}
          />
         ) : message.message_type === 'file' && message.file_type && ['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(message.file_type.toLowerCase()) ? (
          <AudioMessage
           message={message}
           API_BASE_URL={API_BASE_URL}
          />
         ) : message.message_type === 'file' ? (
          <FileMessage
           message={message}
           API_BASE_URL={API_BASE_URL}
           formatFileSize={formatFileSize}
           getFileIcon={getFileIcon}
          />
         ) : message.content && (message.content.startsWith('https://media.tenor.com/') || message.content.startsWith('https://media.giphy.com/')) ? (
          <GifMessage
           message={message}
           onOpenViewer={() => { }}
          />
         ) : (
          <div>{message.content}</div>
         )}
        </Message>
       );
      })}
      <div ref={messagesEndRef} />
     </>
    )}
   </div>

   <div {...stylex.props(styles.actionButtons)}>
    <button
     {...stylex.props(styles.blockButton)}
     onClick={handleBlock}
     disabled={processing}
    >
     <i className="fas fa-ban" {...stylex.props(styles.buttonIcon)}></i>
     Block
    </button>
    <button
     {...stylex.props(styles.acceptButton)}
     onClick={handleAccept}
     disabled={processing}
    >
     <i className="fas fa-check" {...stylex.props(styles.buttonIcon)}></i>
     Accept
    </button>
   </div>
  </div>
 );
};

export default MessageRequestChatView;