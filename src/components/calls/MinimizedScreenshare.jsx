import React from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";

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
   {...stylex.props(styles.modernMinimizedScreenshare, styles.modernMinimizedScreenshareHover, styles.modernMinimizedScreenshareActive)}
   style={{
    left: `${callPosition.x}px`,
    top: `${callPosition.y}px`,
    cursor: isDragging ? "grabbing" : "grab"
   }}
   onMouseDown={onDragStart}
   onTouchStart={onDragStart}
  >
   <div {...stylex.props(styles.modernMinimizedHeader)}>
    <div {...stylex.props(styles.modernMinimizedInfo)}>
     <div {...stylex.props(styles.modernMinimizedScreenshareIcon)}>
      <i className="fas fa-desktop"></i>
     </div>
     <div {...stylex.props(styles.modernMinimizedUser)}>
      <h4 {...stylex.props(styles.modernMinimizedUserH4)}>{screenshareState.contact?.username}</h4>
      <p {...stylex.props(styles.modernMinimizedUserP)}>
       {screenshareState.isSharing ? "Sharing Screen" : "Viewing Screen"}
      </p>
     </div>
    </div>
   </div>

   <div {...stylex.props(styles.modernMinimizedScreensharePreview)}>
    {screenshareState.isViewing && (
     <video
      ref={screenshareRemoteVideoRef}
      {...stylex.props(styles.modernMinimizedScreenshareVideo)}
      autoPlay
      playsInline
     />
    )}
    {screenshareState.isSharing && (
     <video
      ref={screenshareLocalVideoRef}
      {...stylex.props(styles.modernMinimizedScreenshareVideo)}
      autoPlay
      playsInline
      muted
     />
    )}
   </div>

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
     title="Stop sharing"
    >
     <i className="fas fa-times"></i>
    </button>
   </div>
  </div>
 );
};

export default MinimizedScreenshare;