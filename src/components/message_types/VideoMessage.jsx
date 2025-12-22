import React, { useRef, useEffect } from 'react';
import VideoPlayer from '../media_viewer/VideoPlayer';

const VideoMessage = ({ message, API_BASE_URL, onOpenViewer }) => {
 const videoPlayerRef = useRef(null);
 const returnStateRef = useRef(null);

 useEffect(() => {
  if (returnStateRef.current && videoPlayerRef.current) {
   const { time, playing } = returnStateRef.current;
   videoPlayerRef.current.seek(time);
   if (playing) {
    setTimeout(() => {
     videoPlayerRef.current.play();
    }, 50);
   }
   returnStateRef.current = null;
  }
 });

 const handleExpand = (currentTime, isPlaying) => {
  onOpenViewer({
   url: message.file_path,
   name: message.file_name || 'Video',
   type: 'video',
   startTime: currentTime,
   autoplay: isPlaying,
   messageId: message.id,
   onReturn: (returnTime, returnPlaying) => {
    returnStateRef.current = {
     time: returnTime,
     playing: returnPlaying
    };
   }
  });
 };

 return (
  <div style={{ margin: '8px 0' }}>
   <VideoPlayer
    ref={videoPlayerRef}
    src={`${API_BASE_URL}${message.file_path}`}
    inChat={true}
    onExpand={handleExpand}
    key={message.id}
   />
  </div>
 );
};

export default VideoMessage;