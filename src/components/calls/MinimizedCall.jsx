import React from 'react';
import '../../pages/calls.css';

const MinimizedCall = ({
 callState,
 API_BASE_URL,
 callPosition,
 isDragging,
 isMobile,
 localVideoRef,
 remoteVideoRef,
 onDragStart,
 onMaximize,
 onEnd,
 onClick
}) => {
 return (
  <div
   className="modern-minimized-call"
   style={{
    left: `${callPosition.x}px`,
    top: `${callPosition.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab'
   }}
   onMouseDown={onDragStart}
   onTouchStart={onDragStart}
   onClick={onClick}
  >
   <div className="modern-minimized-header">
    <div className="modern-minimized-info">
     <img
      src={
       callState.contact?.avatar_url
        ? `${API_BASE_URL}${callState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={callState.contact?.username}
      className="modern-minimized-avatar"
      draggable="false"
     />
     <div className="modern-minimized-user">
      <h4>{callState.contact?.username}</h4>
      <p>{callState.type === "video" ? "Video Call" : "Audio Call"}</p>
     </div>
    </div>
   </div>

   {callState.type === "video" ? (
    <div className="modern-minimized-video">
     <video
      ref={remoteVideoRef}
      className="modern-minimized-remote-video"
      autoPlay
      playsInline
      muted={false}
     />
    </div>
   ) : (
    <div className="modern-minimized-audio">
     <div className="modern-minimized-audio-wave"></div>
    </div>
   )}

   <div className="modern-minimized-controls">
    <button
     className="modern-minimized-btn modern-minimized-maximize"
     onClick={(e) => {
      e.stopPropagation();
      onMaximize();
     }}
     title="Maximize"
    >
     <i className="fas fa-expand"></i>
    </button>
    <button
     className="modern-minimized-btn modern-minimized-end"
     onClick={(e) => {
      e.stopPropagation();
      onEnd();
     }}
     title="End call"
    >
     <i className="fas fa-phone"></i>
    </button>
   </div>

   <audio
    ref={callState.type === "audio" ? remoteVideoRef : null}
    autoPlay
    muted={false}
    style={{ display: "none" }}
   />
  </div>
 );
};

export default MinimizedCall;