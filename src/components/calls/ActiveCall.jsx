import React from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

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
  <div {...stylex.props(styles.modernCallOverlay)} onClick={onOverlayClick}>
   <div {...stylex.props(styles.modernActiveCall)}>
    <div {...stylex.props(styles.modernCallHeader)}>
     <div {...stylex.props(styles.modernCallInfo)}>
      <img
       src={
        callState.contact?.avatar_url
         ? `${API_BASE_URL}${callState.contact.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt={callState.contact?.username}
       {...stylex.props(styles.modernCallAvatar)}
       draggable="false"
      />
      <div {...stylex.props(styles.modernCallUser)}>
       <h3 {...stylex.props(styles.modernCallUserH3)}>{callState.contact?.username}</h3>
       <p {...stylex.props(styles.modernCallUserP)}>
        {callState.isOutgoing
         ? "Calling..."
         : callState.type === "video"
          ? "Video Call"
          : "Audio Call"}
       </p>
      </div>
     </div>
     <button
      {...stylex.props(
       styles.modernMinimizeBtn,
       styles.modernMinimizeBtnHover,
       styles.modernMinimizeBtnActive
      )}
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
     <div {...stylex.props(styles.modernVideoContainer)}>
      <video
       ref={remoteVideoRef}
       {...stylex.props(styles.modernRemoteVideo)}
       autoPlay
       playsInline
       controls={false}
       muted={false}
      />
      <video
       ref={localVideoRef}
       {...stylex.props(styles.modernLocalVideo, styles.modernLocalVideoHover)}
       autoPlay
       playsInline
       controls={false}
       muted={true}
      />
     </div>
    ) : (
     <div {...stylex.props(styles.modernAudioCallUi)}>
      <div {...stylex.props(styles.modernAudioAvatarWrapper)}>
       <img
        src={
         callState.contact?.avatar_url
          ? `${API_BASE_URL}${callState.contact.avatar_url}`
          : "/resources/default_avatar.png"
        }
        alt={callState.contact?.username}
        draggable="false"
        {...stylex.props(styles.modernAudioAvatar)}
       />
       <div {...stylex.props(styles.modernAudioPulse)}></div>
      </div>
      <h3 {...stylex.props(styles.modernAudioCallUiH3)}>{callState.contact?.username}</h3>
      <p {...stylex.props(styles.modernAudioCallUiP)}>{callState.isOutgoing ? "Calling..." : "Audio Call"}</p>
      <audio ref={remoteVideoRef} autoPlay muted={false} style={{ display: "none" }} />
      <audio ref={localVideoRef} autoPlay muted={true} style={{ display: "none" }} />
     </div>
    )}

    <div {...stylex.props(styles.modernCallControlsWrapper)}>
     <div {...stylex.props(styles.modernCallControls)}>
      <button
       {...stylex.props(
        styles.modernControlBtn,
        styles.modernControlBtnHover,
        styles.modernControlBtnActive,
        styles.modernMuteBtn,
        isMicMuted && styles.muted
       )}
       onClick={(e) => {
        e.stopPropagation();
        onToggleMic();
       }}
       title={isMicMuted ? "Unmute" : "Mute"}
      >
       <i className={isMicMuted ? "fas fa-microphone-slash" : "fas fa-microphone"}></i>
      </button>
      {callState.type === "video" && (
       <button
        {...stylex.props(
         styles.modernControlBtn,
         styles.modernControlBtnHover,
         styles.modernControlBtnActive,
         styles.modernCameraBtn,
         isCameraOff && styles.cameraOff
        )}
        onClick={(e) => {
         e.stopPropagation();
         onToggleCamera();
        }}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
       >
        <i className={isCameraOff ? "fas fa-video-slash" : "fas fa-video"}></i>
       </button>
      )}
      <button
       {...stylex.props(
        styles.modernEndCallBtn,
        styles.modernEndCallBtnHover,
        styles.modernEndCallBtnActive
       )}
       onClick={(e) => {
        e.stopPropagation();
        onEnd();
       }}
       title="End call"
      >
       <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ActiveCall;