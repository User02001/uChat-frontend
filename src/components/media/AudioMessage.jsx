import React from 'react';
import { AudioPlayer } from '../Message';

const AudioMessage = ({ message, API_BASE_URL }) => {
 return (
  <div style={{ margin: '8px 0' }}>
   <AudioPlayer
    src={`${API_BASE_URL}${message.file_path}`}
    fileName={message.file_name}
   />
  </div>
 );
};

export default AudioMessage;