import React from 'react';
import '../../pages/calls.css';

const ActiveScreenshare = ({
 screenshareState,
 screenshareLocalVideoRef,
 screenshareRemoteVideoRef,
 onMinimize,
 onEnd,
 onOverlayClick
}) => {
 return (
  <div className="modern-screenshare-overlay" onClick={onOverlayClick}>
   <div className="modern-screenshare-active">
    <div className="modern-screenshare-header">
     <div className="modern-screenshare-info">
      <div className="modern-screenshare-icon">
       <i className="fas fa-desktop"></i>
      </div>
      <div className="modern-screenshare-user">
       <h3>
        {screenshareState.isSharing
         ? `Sharing with ${screenshareState.contact?.username}`
         : screenshareState.contact?.username}
       </h3>
       <p>
        {screenshareState.isSharing
         ? "Screen Share Active"
         : "Viewing Screen Share"}
       </p>
      </div>
     </div>
     <button
      className="modern-screenshare-minimize-btn"
      onClick={(e) => {
       e.stopPropagation();
       onMinimize();
      }}
      title="Minimize"
     >
      <i className="fas fa-minus"></i>
     </button>
    </div>

    <div className="modern-screenshare-container">
     {screenshareState.isViewing && (
      <video
       ref={screenshareRemoteVideoRef}
       className="modern-screenshare-video"
       autoPlay
       playsInline
       controls={false}
      />
     )}
     {screenshareState.isSharing && (
      <video
       ref={screenshareLocalVideoRef}
       className="modern-screenshare-video"
       autoPlay
       playsInline
       muted
      />
     )}
    </div>

    <div className="modern-screenshare-controls-wrapper visible">
     <div className="modern-screenshare-controls">
      <button
       className="modern-screenshare-end-btn"
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
   </div>
  </div>
 );
};

export default ActiveScreenshare;