import React, { useState, useEffect, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { GeneralCallsStyles as styles } from "../../styles/general_calls";
import { RINGTONE_BEATS } from "../../assets/ringtone_beats";

const IncomingCallNotification = ({ callState, API_BASE_URL, onAnswer, onDecline, ringtoneRef }) => {
 const [pulseIntensity, setPulseIntensity] = useState(0);
 const intensityRef = useRef(0);
 const lastBeatTimeRef = useRef(0);

 useEffect(() => {
  if (!ringtoneRef?.current || RINGTONE_BEATS.length === 0) return;
  const audio = ringtoneRef.current;
  let animationFrame;

  const syncBeats = () => {
   if (audio.paused) {
    animationFrame = requestAnimationFrame(syncBeats);
    return;
   }

   const currentTimeMs = audio.currentTime * 1000;

   const currentBeat = RINGTONE_BEATS.find(beatTime => {
    return Math.abs(currentTimeMs - beatTime) < 50;
   });

   if (currentBeat && Date.now() - lastBeatTimeRef.current > 100) {
    intensityRef.current = 1.5;
    lastBeatTimeRef.current = Date.now();
   }

   intensityRef.current *= 0.65;
   setPulseIntensity(intensityRef.current);

   animationFrame = requestAnimationFrame(syncBeats);
  };

  const onPlay = () => syncBeats();

  audio.addEventListener('play', onPlay);

  if (!audio.paused) syncBeats();

  return () => {
   audio.removeEventListener('play', onPlay);
   if (animationFrame) cancelAnimationFrame(animationFrame);
  };
 }, [ringtoneRef]);

 const scale = 1 + (pulseIntensity * 0.4);
 const iconSize = 18 + (pulseIntensity * 10);
 const barWidth = 20 + (pulseIntensity * 80);

 return (
  <div {...stylex.props(styles.incomingCallNotification)}>
   <div
    {...stylex.props(styles.rainbowBeatBar)}
    style={{
     width: `${barWidth}%`,
     opacity: 0.3 + (pulseIntensity * 0.7),
     transition: 'width 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease',
    }}
   />
   <div {...stylex.props(styles.incomingCallContent)}>
    <div {...stylex.props(styles.incomingCallInfo)}>
     <img
      draggable="false"
      src={
       callState.contact?.avatar_url
        ? `${API_BASE_URL}${callState.contact.avatar_url}`
        : "/resources/default_avatar.png"
      }
      alt={callState.contact?.username}
      {...stylex.props(styles.incomingCallAvatar)}
     />
     <div {...stylex.props(styles.incomingCallText)}>
      <h4 {...stylex.props(styles.incomingCallTextH4)}>{callState.contact?.username}</h4>
      <p {...stylex.props(styles.incomingCallTextP)}>is calling you!!</p>
     </div>
    </div>
    <div {...stylex.props(styles.incomingCallActions)}>
     <button
      {...stylex.props(styles.declineBtnSmall, styles.declineBtnSmallHover, styles.btnSmallActive)}
      onClick={onDecline}
      title="Decline"
     >
      <i className="fas fa-phone" style={{ transform: 'rotate(135deg)' }}></i>
     </button>
     <button
      {...stylex.props(styles.acceptBtnSmall, styles.acceptBtnSmallHover, styles.btnSmallActive)}
      onClick={onAnswer}
      title="Accept"
      style={{
       transform: `scale(${scale})`,
       transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
     >
      <i
       className="fas fa-phone"
       style={{
        fontSize: `${iconSize}px`,
        transition: 'font-size 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
       }}
      ></i>
     </button>
    </div>
   </div>
  </div>
 );
};

export default IncomingCallNotification;