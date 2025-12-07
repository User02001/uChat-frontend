import React from 'react';
import { API_BASE_URL } from '../../config';
import VideoPlayer from '../VideoPlayer';

const VideoMessage = ({ message, onExpand }) => {
 return (
  <div style={{
   margin: '8px 0',
   aspectRatio: message.media_width && message.media_height
    ? `${message.media_width} / ${message.media_height}`
    : '16 / 9',
   backgroundColor: 'var(--bg-tertiary)',
   borderRadius: '12px',
   overflow: 'hidden'
  }}>
   <VideoPlayer
    src={`${API_BASE_URL}${message.file_path}`}
    inChat={true}
    onExpand={() => onExpand({
     url: message.file_path,
     name: message.file_name || 'Video',
     type: 'video'
    })}
   />
  </div>
 );
};

export default VideoMessage;