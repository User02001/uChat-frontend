import React from 'react';
import '../../pages/calls.css';

const MinimizedScreenshare = ({
 screenshareState,
 callPosition,
 isDragging,
 screenshareLocalVideoRef,
 screenshareRemoteVideoRef,
 onDragStart,
 onMaximize,
 onEnd
}) => {
 return (
  <div
   className="modern-minimized-screenshare"
   style={{
    left: `${callPosition.x}px`,
    top: `${callPosition.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab'
   }}
   onMouseDown={onDragStart}
   onTouchStart={onDragStart}
  >
   <div className="modern-minimized-header">
    <div className="modern-minimized-info">
     <div className="modern-minimized-screenshare-icon">
      <i className="fas fa-desktop"></i>
     </div>
     <div className="modern-minimized-user">
      <h4>{screenshareState.contact?.username}</h4>
      <p>
       {screenshareState.isSharing ? "Sharing Screen" : "Viewing Screen"}
      </p>
     </div>
    </div>
   </div>

   <div className="modern-minimized-screenshare-preview">
    {screenshareState.isViewing && (
     <video
      ref={screenshareRemoteVideoRef}
      className="modern-minimized-screenshare-video"
      autoPlay
      playsInline
     />
    )}
    {screenshareState.isSharing && (
     <video
      ref={screenshareLocalVideoRef}
      className="modern-minimized-screenshare-video"
      autoPlay
      playsInline
      muted
     />
    )}
   </div>

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
     title="Stop sharing"
    >
     <i className="fas fa-times"></i>
    </button>
   </div>
  </div>
 );
};

export default MinimizedScreenshare;