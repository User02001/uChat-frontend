import React, { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

const DOTS = ["", ".", "..", "..."];

const CallingText = () => {
 const [step, setStep] = useState(0);
 useEffect(() => {
  const t = setInterval(() => setStep(s => (s + 1) % 4), 400);
  return () => clearInterval(t);
 }, []);
 return (
  <p {...stylex.props(styles.activeCallSubtext)}>
   Calling{DOTS[step]}
  </p>
 );
};

const ActiveCall = ({
 callState,
 API_BASE_URL,
 localVideoRef,
 remoteVideoRef,
 remoteScreenStreamRef,
 isMicMuted,
 isCameraOff,
 isScreensharing,
 onToggleMic,
 onToggleCamera,
 onToggleScreenshare,
 onMinimize,
 onEnd,
 uiVisible = true,
 onOverlayClick,
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
   if (streamToShow && remoteVideoRef.current.srcObject !== streamToShow) {
    remoteVideoRef.current.srcObject = streamToShow;
    remoteVideoRef.current.muted = false;
    remoteVideoRef.current.play().catch(() => { });
   }
  }
 }, []);

 const callLabel = () => {
  if (callState.isOutgoing) return "Calling...";
  const parts = [];
  if (callState.hasVideo) parts.push("Video");
  if (callState.hasScreenshare) parts.push("Screenshare");
  if (parts.length === 0) parts.push("Audio");
  return parts.join(" + ") + " Call";
 };

 const showOverlay = callState.isOutgoing || (!callState.remoteHasVideo && !callState.remoteHasScreenshare && callState.isActive);
 const avatarSrc = callState.contact?.avatar_url
  ? `${API_BASE_URL}${callState.contact.avatar_url}`
  : "/resources/default_avatar.png";

 return (
  <div {...stylex.props(styles.modernCallOverlay)} onClick={onOverlayClick}>
   <div {...stylex.props(styles.modernActiveCall)}>
    <div {...stylex.props(styles.modernCallHeader, !uiVisible && styles.modernCallHeaderHidden)} style={{ zIndex: 101 }}>
     <div {...stylex.props(styles.modernCallInfo)}>
      <img
       src={avatarSrc}
       alt={callState.contact?.username}
       {...stylex.props(styles.modernCallAvatar)}
       draggable="false"
      />
      <div {...stylex.props(styles.modernCallUser)}>
       <h3 {...stylex.props(styles.modernCallUserH3)}>{callState.contact?.username}</h3>
       <p {...stylex.props(styles.modernCallUserP)}>{callLabel()}</p>
      </div>
     </div>
     <button
      {...stylex.props(styles.modernMinimizeBtn, styles.modernMinimizeBtnHover, styles.modernMinimizeBtnActive)}
      onClick={(e) => { e.stopPropagation(); onMinimize(); }}
      title="Minimize"
     >
      <i className="fas fa-minus"></i>
     </button>
    </div>

    <div {...stylex.props(styles.modernVideoContainer)}>
     <video
      ref={remoteVideoRef}
      {...stylex.props(styles.modernRemoteVideo)}
      autoPlay
      playsInline
      muted={false}
      style={{
       position: 'absolute',
       top: 0, left: 0,
       width: '100%', height: '100%',
       objectFit: callState.remoteHasScreenshare ? 'contain' : 'cover',
       backgroundColor: '#000',
       zIndex: 1,
      }}
     />

     {showOverlay && (
      <div {...stylex.props(styles.activeCallOverlayContainer)}>
       <div {...stylex.props(styles.activeCallPulseWrapper)}>
        <div {...stylex.props(styles.activeCallPulseRing2)} />
        <div {...stylex.props(styles.activeCallPulseRing1)} />
        <img
         src={avatarSrc}
         alt={callState.contact?.username}
         draggable="false"
         {...stylex.props(styles.activeCallPulseAvatar)}
        />
       </div>
       <p {...stylex.props(styles.activeCallUsername)}>
        {callState.contact?.username}
       </p>
       {callState.isOutgoing
        ? <CallingText />
        : <p {...stylex.props(styles.activeCallSubtext)}>Their camera is off</p>
       }
      </div>
     )}

     <video
      ref={localVideoRef}
      {...stylex.props(styles.modernLocalVideo, styles.modernLocalVideoHover, !uiVisible && styles.modernLocalVideoUiHidden)}
      autoPlay
      playsInline
      muted
      style={{
       display: callState.hasVideo && !isScreensharing ? 'block' : 'none',
       transform: 'scaleX(-1)',
      }}
     />

     {!callState.hasVideo && !isScreensharing && callState.isActive && (
      <div style={{
       position: 'absolute',
       bottom: '20px', right: '20px',
       width: '120px', height: '90px',
       background: 'linear-gradient(135deg, #2c2c54 0%, #1a1a2e 100%)',
       borderRadius: '12px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       border: '2px solid rgba(255,255,255,0.1)',
       zIndex: 10,
      }}>
       <i className="fas fa-video-slash" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24px' }}></i>
      </div>
     )}

     {isScreensharing && callState.screenStream && (
      <div style={{
       position: 'absolute',
       bottom: '20px', right: '20px',
       width: '180px', height: '120px',
       background: '#000',
       borderRadius: '12px',
       overflow: 'hidden',
       border: '2px solid rgba(255,255,255,0.2)',
       zIndex: 10,
      }}>
       <video
        autoPlay playsInline muted
        ref={(el) => {
         if (el && callState.screenStream) {
          if (el.srcObject !== callState.screenStream) {
           el.srcObject = callState.screenStream;
           el.play().catch(() => { });
          }
         } else if (el && !callState.screenStream) {
          if (el.srcObject) el.srcObject = null;
         }
        }}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
       />
       <div style={{
        position: 'absolute',
        bottom: '8px', left: '8px',
        background: 'rgba(0,0,0,0.7)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
       }}>
        <i className="fas fa-desktop" style={{ fontSize: '10px' }}></i>
        Sharing
       </div>
      </div>
     )}
    </div>

    <div {...stylex.props(styles.modernCallControlsWrapper, !uiVisible && styles.modernCallControlsWrapperHidden)} style={{ zIndex: 102 }}>
     <div {...stylex.props(styles.modernCallControls)}>
      <button
       {...stylex.props(styles.modernControlBtn, styles.modernControlBtnHover, styles.modernControlBtnActive, styles.modernMuteBtn, isMicMuted && styles.muted)}
       onClick={(e) => { e.stopPropagation(); onToggleMic(); }}
      >
       <i className={isMicMuted ? "fas fa-microphone-slash" : "fas fa-microphone"}></i>
      </button>
      <button
       {...stylex.props(styles.modernControlBtn, styles.modernControlBtnHover, styles.modernControlBtnActive, styles.modernCameraBtn, isCameraOff && styles.cameraOff)}
       onClick={(e) => { e.stopPropagation(); onToggleCamera(); }}
      >
       <i className={isCameraOff ? "fas fa-video-slash" : "fas fa-video"}></i>
      </button>
      <button
       {...stylex.props(styles.modernControlBtn, styles.modernControlBtnHover, styles.modernControlBtnActive, styles.modernCameraBtn, isScreensharing && styles.cameraOff)}
       onClick={(e) => { e.stopPropagation(); onToggleScreenshare(); }}
      >
       <i className="fas fa-desktop"></i>
      </button>
      <button
       {...stylex.props(styles.modernEndCallBtn, styles.modernEndCallBtnHover, styles.modernEndCallBtnActive)}
       onClick={(e) => { e.stopPropagation(); onEnd(); }}
      >
       <i className="fas fa-phone" style={{ transform: "rotate(135deg)" }}></i>
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ActiveCall;