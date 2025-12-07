import React from 'react';
import { API_BASE_URL } from '../../config';

const ImageMessage = ({ message, onExpand }) => {
 return (
  <div
   onClick={() => onExpand({
    url: message.file_path,
    name: message.file_name || 'Image',
    type: 'image'
   })}
   style={{
    cursor: 'pointer',
    maxWidth: '300px',
    margin: '8px 0',
    aspectRatio: message.media_width && message.media_height
     ? `${message.media_width} / ${message.media_height}`
     : '16 / 9',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
    overflow: 'hidden'
   }}
  >
   <img
    src={`${API_BASE_URL}${message.file_path}`}
    alt="Shared image"
    style={{
     width: '100%',
     height: '100%',
     objectFit: 'cover',
     display: 'block'
    }}
   />
  </div>
 );
};

export default ImageMessage;