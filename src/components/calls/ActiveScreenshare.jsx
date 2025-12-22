import React from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

const ActiveScreenshare = ({
 screenshareState,
 screenshareLocalVideoRef,
 screenshareRemoteVideoRef,
 onMinimize,
 onEnd,
 onOverlayClick
}) => {
 return (
  <div {...stylex.props(styles.modernScreenshareOverlay)} onClick={onOverlayClick}>
   <div {...stylex.props(styles.modernScreenshareActive)}>
    <div {...stylex.props(styles.modernScreenshareHeader)}>
     <div {...stylex.props(styles.modernScreenshareInfo)}>
      <div {...stylex.props(styles.modernScreenshareIcon)}>
       <i className="fas fa-desktop"></i>
      </div>
      <div {...stylex.props(styles.modernScreenshareUser)}>
       <h3 {...stylex.props(styles.modernScreenshareUserH3)}>
        {screenshareState.isSharing
         ? `Sharing with ${screenshareState.contact?.username}`
         : screenshareState.contact?.username}
       </h3>
       <p {...stylex.props(styles.modernScreenshareUserP)}>
        {screenshareState.isSharing ? "Screen Share Active" : "Viewing Screen Share"}
       </p>
      </div>
     </div>
     <button
      {...stylex.props(
       styles.modernScreenshareMinimizeBtn,
       styles.modernScreenshareMinimizeBtnHover,
       styles.modernScreenshareMinimizeBtnActive
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

    <div {...stylex.props(styles.modernScreenshareContainer)}>
     {screenshareState.isViewing && (
      <video
       ref={screenshareRemoteVideoRef}
       {...stylex.props(styles.modernScreenshareVideo)}
       autoPlay
       playsInline
       controls={false}
      />
     )}
     {screenshareState.isSharing && (
      <video
       ref={screenshareLocalVideoRef}
       {...stylex.props(styles.modernScreenshareVideo)}
       autoPlay
       playsInline
       muted
      />
     )}
    </div>

    <div {...stylex.props(styles.modernScreenshareControlsWrapper, styles.modernScreenshareControlsWrapperVisible)}>
     <div {...stylex.props(styles.modernScreenshareControls)}>
      <button
       {...stylex.props(
        styles.modernScreenshareEndBtn,
        styles.modernScreenshareEndBtnHover,
        styles.modernScreenshareEndBtnActive
       )}
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