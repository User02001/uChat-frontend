import React from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

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
   {...stylex.props(styles.modernMinimizedCall, styles.modernMinimizedCallHover, styles.modernMinimizedCallActive)}
   style={{
    left: `${callPosition.x}px`,
    top: `${callPosition.y}px`,
    cursor: isDragging ? "grabbing" : "grab"
   }}
   onMouseDown={onDragStart}
   onTouchStart={onDragStart}
   onClick={onClick}
  >
   <div {...stylex.props(styles.modernMinimizedHeader)}>
    <div {...stylex.props(styles.modernMinimizedInfo)}>
     <img
      src={
       callState.contact?.avatar_url
        ? `${API_BASE_URL}${callState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={callState.contact?.username}
      {...stylex.props(styles.modernMinimizedAvatar)}
      draggable="false"
     />
     <div {...stylex.props(styles.modernMinimizedUser)}>
      <h4 {...stylex.props(styles.modernMinimizedUserH4)}>{callState.contact?.username}</h4>
      <p {...stylex.props(styles.modernMinimizedUserP)}>{callState.type === "video" ? "Video Call" : "Audio Call"}</p>
     </div>
    </div>
   </div>

   {callState.type === "video" ? (
    <div {...stylex.props(styles.modernMinimizedVideo)}>
     <video
      ref={remoteVideoRef}
      {...stylex.props(styles.modernMinimizedRemoteVideo)}
      autoPlay
      playsInline
      muted={false}
     />
    </div>
   ) : (
    <div {...stylex.props(styles.modernMinimizedAudio)}>
     <div {...stylex.props(styles.modernMinimizedAudioWave, styles.modernMinimizedAudioWaveBefore)}></div>
    </div>
   )}

   <div {...stylex.props(styles.modernMinimizedControls)}>
    <button
     {...stylex.props(styles.modernMinimizedBtn, styles.modernMinimizedMaximize, styles.modernMinimizedMaximizeHover, styles.modernMinimizedBtnActive)}
     onClick={(e) => {
      e.stopPropagation();
      onMaximize();
     }}
     title="Maximize"
    >
     <i className="fas fa-expand"></i>
    </button>
    <button
     {...stylex.props(styles.modernMinimizedBtn, styles.modernMinimizedEnd, styles.modernMinimizedEndHover, styles.modernMinimizedBtnActive)}
     onClick={(e) => {
      e.stopPropagation();
      onEnd();
     }}
     title="End call"
    >
     <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
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