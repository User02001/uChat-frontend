import React from 'react';

const GifMessage = ({ message, onOpenViewer }) => {
 return (
  <div
   onClick={() => onOpenViewer({
    url: message.content,
    name: 'GIF',
    type: 'image'
   })}
   style={{
    cursor: 'pointer',
    margin: '8px 0',
    position: 'relative',
    width: message.media_width && message.media_height
     ? `${Math.min(message.media_width, 500)}px`
     : '300px',
    height: message.media_width && message.media_height
     ? `${Math.min(message.media_width, 500) * (message.media_height / message.media_width)}px`
     : '300px',
    background: 'linear-gradient(90deg, var(--border) 25%, var(--border-light) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonLoading 1.5s infinite',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0
   }}
  >
   <img
    src={message.content}
    alt="GIF"
    onLoad={(e) => {
     e.target.style.opacity = '1';
     e.target.parentElement.style.animation = 'none';
     e.target.parentElement.style.background = 'transparent';
    }}
    style={{
     width: '100%',
     height: '100%',
     objectFit: 'cover',
     borderRadius: '8px',
     display: 'block',
     opacity: 0,
     transition: 'opacity 0.3s ease'
    }}
   />
  </div>
 );
};

export default GifMessage;