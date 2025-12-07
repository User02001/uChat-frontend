import React from 'react';

const GifMessage = ({ message, onExpand }) => {
 return (
  <div
   onClick={() => onExpand({
    url: message.content,
    name: 'GIF',
    type: 'image'
   })}
   style={{
    cursor: 'pointer',
    maxWidth: '300px',
    margin: '8px 0'
   }}
  >
   <img
    src={message.content}
    alt="GIF"
    style={{
     width: '100%',
     height: 'auto',
     borderRadius: '8px',
     display: 'block'
    }}
   />
  </div>
 );
};

export default GifMessage;