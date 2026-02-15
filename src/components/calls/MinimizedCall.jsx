import React, { useEffect } from "react";
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
 onClick,
}) => {
 // CRITICAL: Re-attach streams when component mounts (after minimize/maximize)
 useEffect(() => {
  console.log('🎬 MinimizedCall mounted - attaching streams');

  // Attach local stream
  if (callState.localStream && localVideoRef.current) {
   if (localVideoRef.current.srcObject !== callState.localStream) {
    localVideoRef.current.srcObject = callState.localStream;
    localVideoRef.current.muted = true;
    localVideoRef.current.autoplay = true;
    localVideoRef.current.playsInline = true;
    localVideoRef.current.style.transform = "scaleX(-1)";
    localVideoRef.current.play().catch(console.error);
   }
  }

  // Attach remote stream
  if (callState.remoteStream && remoteVideoRef.current) {
   if (remoteVideoRef.current.srcObject !== callState.remoteStream) {
    remoteVideoRef.current.srcObject = callState.remoteStream;
    remoteVideoRef.current.muted = false;
    remoteVideoRef.current.play().catch(console.error);
   }
  }
 }, []); // Run on mount only

 const showVideo = callState.hasVideo || callState.hasScreenshare
  || callState.remoteHasVideo || callState.remoteHasScreenshare;

 const callLabel = () => {
  const parts = [];
  if (callState.hasVideo) parts.push("Video");
  if (callState.hasScreenshare) parts.push("Screen");
  if (parts.length === 0) parts.push("Audio");
  return parts.join(" + ") + " Call";
 };

 return (
  <div
   {...stylex.props(styles.modernMinimizedCall, styles.modernMinimizedCallHover, styles.modernMinimizedCallActive)}
   style={{ left: `${callPosition.x}px`, top: `${callPosition.y}px`, cursor: isDragging ? "grabbing" : "grab" }}
   onMouseDown={onDragStart}
   onTouchStart={onDragStart}
   onClick={onClick}
  >
   <div {...stylex.props(styles.modernMinimizedHeader)}>
    <div {...stylex.props(styles.modernMinimizedInfo)}>
     <img
      src={callState.contact?.avatar_url
       ? `${API_BASE_URL}${callState.contact.avatar_url}`
       : "/resources/default_avatar.png"}
      alt={callState.contact?.username}
      {...stylex.props(styles.modernMinimizedAvatar)}
      draggable="false"
     />
     <div {...stylex.props(styles.modernMinimizedUser)}>
      <h4 {...stylex.props(styles.modernMinimizedUserH4)}>{callState.contact?.username}</h4>
      <p {...stylex.props(styles.modernMinimizedUserP)}>{callLabel()}</p>
     </div>
    </div>
   </div>

   {/* Remote video - NEVER re-attach, just display */}
   <div {...stylex.props(styles.modernMinimizedVideo)} style={{ display: showVideo ? 'block' : 'none' }}>
    <video
     ref={remoteVideoRef}
     {...stylex.props(styles.modernMinimizedRemoteVideo)}
     autoPlay
     playsInline
     muted={false}
    />
   </div>

   {/* Audio indicator when no video */}
   <div {...stylex.props(styles.modernMinimizedAudio)} style={{ display: !showVideo ? 'flex' : 'none' }}>
    <div {...stylex.props(styles.modernMinimizedAudioWave, styles.modernMinimizedAudioWaveBefore)}></div>
   </div>

   <div {...stylex.props(styles.modernMinimizedControls)}>
    <button
     {...stylex.props(styles.modernMinimizedBtn, styles.modernMinimizedMaximize, styles.modernMinimizedMaximizeHover, styles.modernMinimizedBtnActive)}
     onClick={(e) => { e.stopPropagation(); onMaximize(); }}
     title="Maximize"
    >
     <i className="fas fa-expand"></i>
    </button>
    <button
     {...stylex.props(styles.modernMinimizedBtn, styles.modernMinimizedEnd, styles.modernMinimizedEndHover, styles.modernMinimizedBtnActive)}
     onClick={(e) => { e.stopPropagation(); onEnd(); }}
     title="End call"
    >
     <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
    </button>
   </div>
  </div>
 );
};

export default MinimizedCall;