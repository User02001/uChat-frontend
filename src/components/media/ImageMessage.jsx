import React from 'react';

const ImageMessage = ({ message, API_BASE_URL, onOpenViewer }) => {
 const maxWidth = 280;
 const imageWidth = message.media_width || 300;
 const imageHeight = message.media_height || 225;
 const aspectRatio = imageHeight / imageWidth;

 return (
  <div
   onClick={() => onOpenViewer({
    url: message.file_path,
    name: message.file_name || 'Image',
    type: 'image'
   })}
   style={{
    cursor: 'pointer',
    margin: '8px 0',
    position: 'relative',
    width: '100%',
    maxWidth: `${maxWidth}px`,
    aspectRatio: message.media_width && message.media_height ? `${imageWidth} / ${imageHeight}` : undefined,
    height: message.media_width && message.media_height ? undefined : '200px',
    background: 'linear-gradient(90deg, var(--border) 25%, var(--border-light) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonLoading 1.5s infinite',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0
   }}
  >
   <img
    src={`${API_BASE_URL}${message.file_path}`}
    alt="Shared image"
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

export default ImageMessage;