import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { styles } from '../styles/message_requests';
import { CDN_BASE_URL } from '../config';
import { useFormatters } from '../hooks/useFormatters';

const MessageRequestsSidebar = ({
 requests,
 onBack,
 onSelectRequest,
 activeRequest,
 loading
}) => {
 const { formatContactTime } = useFormatters();

 return (
  <div {...stylex.props(styles.requestsSidebar)}>
   <div {...stylex.props(styles.requestsHeader)}>
    <button
     {...stylex.props(styles.backButton)}
     onClick={onBack}
     aria-label="Back to chats"
    >
     <i className="fas fa-arrow-left"></i>
    </button>
    <h2 {...stylex.props(styles.requestsTitle)}>Message Requests</h2>
   </div>

   <div {...stylex.props(styles.requestsList)}>
    {loading ? (
     <div {...stylex.props(styles.loadingContainer)}>
      <div className="loading-spinner"></div>
     </div>
    ) : requests.length === 0 ? (
     <div {...stylex.props(styles.emptyState)}>
      <div {...stylex.props(styles.emptyIcon)}>
       <i className="fas fa-inbox"></i>
      </div>
      <h3 {...stylex.props(styles.emptyTitle)}>No message requests</h3>
      <p {...stylex.props(styles.emptyText)}>
       When someone who isn't in your contacts sends you a message, it'll appear here.
      </p>
     </div>
    ) : (
     requests.map((request) => (
      <div
       key={request.id}
       {...stylex.props(
        styles.requestItem,
        activeRequest?.id === request.id && styles.requestItemActive
       )}
       onClick={() => onSelectRequest(request)}
      >
       <img
        src={
         request.sender?.avatar_url
          ? `${CDN_BASE_URL}${request.sender.avatar_url}`
          : '/resources/default_avatar.png'
        }
        alt={request.sender?.username}
        {...stylex.props(styles.requestAvatar)}
        draggable="false"
       />
       <div {...stylex.props(styles.requestInfo)}>
        <div {...stylex.props(styles.requestMain)}>
         <span {...stylex.props(styles.requestName)}>
          {request.sender?.username}
         </span>
         <span {...stylex.props(styles.requestTime)}>
          {formatContactTime(request.created_at, false)}
         </span>
        </div>
        <span {...stylex.props(styles.requestPreview)}>
         {request.first_message_preview}
        </span>
       </div>
      </div>
     ))
    )}
   </div>
  </div>
 );
};

export default MessageRequestsSidebar;