import React, { useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

const ActiveCall = ({
 callState,
 API_BASE_URL,
 localVideoRef,
 remoteVideoRef,
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
 // CRITICAL: Re-attach streams when component mounts (after minimize/maximize)
 useEffect(() => {
  console.log('🎬 ActiveCall mounted - attaching streams');

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

 const showVideoUI = callState.isActive || callState.isOutgoing || callState.isIncoming;

 const callLabel = () => {
  if (callState.isOutgoing) return "Calling...";
  const parts = [];
  if (callState.hasVideo) parts.push("Video");
  if (callState.hasScreenshare) parts.push("Screenshare");
  if (parts.length === 0) parts.push("Audio");
  return parts.join(" + ") + " Call";
 };

 const showOverlay = !callState.remoteHasVideo && !callState.remoteHasScreenshare && callState.isActive;

 return (
  <div {...stylex.props(styles.modernCallOverlay)} onClick={onOverlayClick}>
   <div {...stylex.props(styles.modernActiveCall)}>

    {/* Header */}
    <div {...stylex.props(styles.modernCallHeader, !uiVisible && styles.modernCallHeaderHidden)} style={{ zIndex: 101 }}>
     <div {...stylex.props(styles.modernCallInfo)}>
      <img
       src={callState.contact?.avatar_url
        ? `${API_BASE_URL}${callState.contact.avatar_url}`
        : "/resources/default_avatar.png"}
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

    {/* Video Container */}
    <div {...stylex.props(styles.modernVideoContainer)}>
     {/* Remote video - NEVER set srcObject here, only display */}
     <video
      ref={remoteVideoRef}
      {...stylex.props(styles.modernRemoteVideo)}
      autoPlay
      playsInline
      muted={false}
      style={{
       position: 'absolute',
       top: 0,
       left: 0,
       width: '100%',
       height: '100%',
       objectFit: 'cover',
       backgroundColor: '#000',
       zIndex: 1,
      }}
     />

     {/* Overlay when no video */}
     {showOverlay && (
      <div style={{
       position: 'absolute',
       top: 0,
       left: 0,
       right: 0,
       bottom: 0,
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center',
       justifyContent: 'center',
       background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
       zIndex: 50,
       pointerEvents: 'none',
      }}>
       <img
        src={callState.contact?.avatar_url
         ? `${API_BASE_URL}${callState.contact.avatar_url}`
         : "/resources/default_avatar.png"}
        alt={callState.contact?.username}
        draggable="false"
        style={{
         width: '120px',
         height: '120px',
         borderRadius: '50%',
         marginBottom: '16px',
         border: '4px solid rgba(255,255,255,0.1)',
        }}
       />
       <h3 style={{
        color: 'white',
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '8px',
       }}>
        {callState.contact?.username}
       </h3>
       <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px'
       }}>
        Camera is off
       </p>
      </div>
     )}

     {/* Local video preview - NEVER set srcObject here */}
     <video
      ref={localVideoRef}
      {...stylex.props(styles.modernLocalVideo, styles.modernLocalVideoHover)}
      autoPlay
      playsInline
      muted
      style={{
       display: callState.hasVideo && !isScreensharing ? 'block' : 'none',
       transform: 'scaleX(-1)',
      }}
     />

     {/* Camera off indicator */}
     {!callState.hasVideo && !isScreensharing && callState.isActive && (
      <div style={{
       position: 'absolute',
       bottom: '20px',
       right: '20px',
       width: '120px',
       height: '90px',
       background: 'linear-gradient(135deg, #2c2c54 0%, #1a1a2e 100%)',
       borderRadius: '12px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       border: '2px solid rgba(255,255,255,0.1)',
       zIndex: 10,
      }}>
       <i className="fas fa-video-slash" style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '24px'
       }}></i>
      </div>
     )}

     {/* Screenshare preview - ONLY show when screenStream exists */}
     {isScreensharing && callState.screenStream && (
      <div style={{
       position: 'absolute',
       bottom: '20px',
       right: '20px',
       width: '180px',
       height: '120px',
       background: '#000',
       borderRadius: '12px',
       overflow: 'hidden',
       border: '2px solid rgba(255,255,255,0.2)',
       zIndex: 10,
      }}>
       <video
        autoPlay
        playsInline
        muted
        ref={(el) => {
         // CRITICAL: Only set srcObject if it's different AND screenStream exists
         if (el && callState.screenStream) {
          if (el.srcObject !== callState.screenStream) {
           el.srcObject = callState.screenStream;
           el.play().catch(() => { });
          }
         } else if (el && !callState.screenStream) {
          // Clear immediately when screenStream is null
          if (el.srcObject) {
           el.srcObject = null;
          }
         }
        }}
        style={{
         width: '100%',
         height: '100%',
         objectFit: 'contain',
        }}
       />
       <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
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

    {/* Controls */}
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