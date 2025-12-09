import React from 'react';
import VideoPlayer from '../VideoPlayer';

const VideoMessage = ({ message, API_BASE_URL, onOpenViewer }) => {
 return (
  <div style={{ margin: '8px 0' }}>
   <VideoPlayer
    src={`${API_BASE_URL}${message.file_path}`}
    inChat={true}
    onExpand={() => onOpenViewer({
     url: message.file_path,
     name: message.file_name || 'Video',
     type: 'video'
    })}
   />
  </div>
 );
};

export default VideoMessage;