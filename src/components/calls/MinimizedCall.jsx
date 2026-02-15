import React, { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

const DOTS = ["", ".", "..", "..."];

const CallingText = ({ isMobile }) => {
 const [step, setStep] = useState(0);
 useEffect(() => {
  const t = setInterval(() => setStep(s => (s + 1) % 4), 400);
  return () => clearInterval(t);
 }, []);
 return (
  <p {...stylex.props(styles.callingOverlayText, isMobile && styles.callingOverlayTextMobile)}>
   Calling{DOTS[step]}
  </p>
 );
};

const PulsingAvatar = ({ src, alt, isMobile }) => (
 <div {...stylex.props(styles.pulseWrapper, isMobile && styles.pulseWrapperMobile)}>
  <div {...stylex.props(styles.pulseRing2, isMobile && styles.pulseRing2Mobile)} />
  <div {...stylex.props(styles.pulseRing1, isMobile && styles.pulseRing1Mobile)} />
  <img
   src={src}
   alt={alt}
   draggable="false"
   {...stylex.props(styles.pulseAvatar, isMobile && styles.pulseAvatarMobile)}
  />
 </div>
);

const CallingOverlay = ({ callState, API_BASE_URL, isMobile }) => (
 <div {...stylex.props(styles.callingOverlay)}>
  <PulsingAvatar
   src={callState.contact?.avatar_url
    ? `${API_BASE_URL}${callState.contact.avatar_url}`
    : "/resources/default_avatar.png"}
   alt={callState.contact?.username}
   isMobile={isMobile}
  />
  <p {...stylex.props(styles.callingOverlayUsername, isMobile && styles.callingOverlayUsernameMobile)}>
   {callState.contact?.username}
  </p>
  {callState.isOutgoing
   ? <CallingText isMobile={isMobile} />
   : <p {...stylex.props(styles.callingOverlayText, isMobile && styles.callingOverlayTextMobile)}>Their camera is off</p>
  }
 </div>
);

const MinimizedCall = ({
 callState,
 API_BASE_URL,
 callPosition,
 isDragging,
 isMobile,
 localVideoRef,
 remoteVideoRef,
 remoteScreenStreamRef,
 onDragStart,
 onMaximize,
 onEnd,
 onClick,
}) => {
 useEffect(() => {
  if (callState.localStream && localVideoRef.current) {
   if (localVideoRef.current.srcObject !== callState.localStream) {
    localVideoRef.current.srcObject = callState.localStream;
    localVideoRef.current.muted = true;
    localVideoRef.current.autoplay = true;
    localVideoRef.current.playsInline = true;
    localVideoRef.current.style.transform = "scaleX(-1)";
    localVideoRef.current.play().catch(() => { });
   }
  }
  if (remoteVideoRef.current) {
   const streamToShow = callState.remoteHasScreenshare
    ? (remoteScreenStreamRef.current || callState.remoteStream)
    : callState.remoteStream;
   if (streamToShow) {
    remoteVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = streamToShow;
    remoteVideoRef.current.muted = false;
    remoteVideoRef.current.load();
    remoteVideoRef.current.play().catch(() => { });
   }
  }
 }, [callState.remoteHasScreenshare, callState.remoteStream]);

 const showVideo = callState.hasVideo || callState.hasScreenshare
  || callState.remoteHasVideo || callState.remoteHasScreenshare;

 const showCallingOverlay = callState.isOutgoing
  || (!callState.remoteHasVideo && !callState.remoteHasScreenshare && callState.isActive);

 const callLabel = () => {
  if (callState.isOutgoing) return "Calling...";
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

   <div {...stylex.props(styles.modernMinimizedVideo)} style={{ display: showVideo ? 'block' : 'none' }}>
    <video
     ref={remoteVideoRef}
     {...stylex.props(styles.modernMinimizedRemoteVideo)}
     autoPlay
     playsInline
     muted={false}
     style={{ objectFit: callState.remoteHasScreenshare ? 'contain' : 'cover' }}
    />
    {showCallingOverlay && (
     <CallingOverlay callState={callState} API_BASE_URL={API_BASE_URL} isMobile={isMobile} />
    )}
   </div>

   <div {...stylex.props(styles.modernMinimizedAudio)} style={{ display: !showVideo ? 'flex' : 'none', position: 'relative' }}>
    {showCallingOverlay
     ? <CallingOverlay callState={callState} API_BASE_URL={API_BASE_URL} isMobile={isMobile} />
     : <div {...stylex.props(styles.modernMinimizedAudioWave, styles.modernMinimizedAudioWaveBefore)} />
    }
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