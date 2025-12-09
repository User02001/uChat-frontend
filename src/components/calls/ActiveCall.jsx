import React from 'react';
import '../../pages/calls.css';

const ActiveCall = ({
 callState,
 API_BASE_URL,
 localVideoRef,
 remoteVideoRef,
 isMicMuted,
 isCameraOff,
 onToggleMic,
 onToggleCamera,
 onMinimize,
 onEnd,
 onOverlayClick
}) => {
 return (
  <div className="modern-call-overlay" onClick={onOverlayClick}>
   <div className="modern-active-call">
    <div className="modern-call-header">
     <div className="modern-call-info">
      <img
       src={
        callState.contact?.avatar_url
         ? `${API_BASE_URL}${callState.contact.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt={callState.contact?.username}
       className="modern-call-avatar"
       draggable="false"
      />
      <div className="modern-call-user">
       <h3>{callState.contact?.username}</h3>
       <p>
        {callState.isOutgoing
         ? "Calling..."
         : callState.type === "video"
          ? "Video Call"
          : "Audio Call"}
       </p>
      </div>
     </div>
     <button
      className="modern-minimize-btn"
      onClick={(e) => {
       e.stopPropagation();
       onMinimize();
      }}
      title="Minimize"
     >
      <i className="fas fa-minus"></i>
     </button>
    </div>

    {callState.type === "video" ? (
     <div className="modern-video-container">
      <video
       ref={remoteVideoRef}
       className="modern-remote-video"
       autoPlay
       playsInline
       controls={false}
       muted={false}
      />
      <video
       ref={localVideoRef}
       className="modern-local-video"
       autoPlay
       playsInline
       controls={false}
       muted={true}
      />
     </div>
    ) : (
     <div className="modern-audio-call-ui">
      <div className="modern-audio-avatar-wrapper">
       <img
        src={
         callState.contact?.avatar_url
          ? `${API_BASE_URL}${callState.contact.avatar_url}`
          : "/resources/default_avatar.png"
        }
        alt={callState.contact?.username}
        draggable="false"
        className="modern-audio-avatar"
       />
       <div className="modern-audio-pulse"></div>
      </div>
      <h3>{callState.contact?.username}</h3>
      <p>{callState.isOutgoing ? "Calling..." : "Audio Call"}</p>
      <audio
       ref={remoteVideoRef}
       autoPlay
       muted={false}
       style={{ display: "none" }}
      />
      <audio
       ref={localVideoRef}
       autoPlay
       muted={true}
       style={{ display: "none" }}
      />
     </div>
    )}

    <div className="modern-call-controls-wrapper">
     <div className="modern-call-controls">
      <button
       className={`modern-control-btn modern-mute-btn ${isMicMuted ? 'muted' : ''}`}
       onClick={(e) => {
        e.stopPropagation();
        onToggleMic();
       }}
       title={isMicMuted ? "Unmute" : "Mute"}
      >
       <i className={`fas fa-microphone${isMicMuted ? '-slash' : ''}`}></i>
      </button>
      {callState.type === "video" && (
       <button
        className={`modern-control-btn modern-camera-btn ${isCameraOff ? 'camera-off' : ''}`}
        onClick={(e) => {
         e.stopPropagation();
         onToggleCamera();
        }}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
       >
        <i className={`fas fa-video${isCameraOff ? '-slash' : ''}`}></i>
       </button>
      )}
      <button
       className="modern-end-call-btn"
       onClick={(e) => {
        e.stopPropagation();
        onEnd();
       }}
       title="End call"
      >
       <i className="fas fa-phone"></i>
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ActiveCall;