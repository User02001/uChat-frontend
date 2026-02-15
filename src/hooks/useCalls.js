import { useState, useRef, useCallback, useEffect } from 'react';
import Peer from 'simple-peer';

const ICE_SERVERS = [
 { urls: 'stun:stun.l.google.com:19302' },
 { urls: 'stun:stun1.l.google.com:19302' },
 {
  urls: 'turn:a.relay.metered.ca:80',
  username: '0fb9f18d86c5f73d408585d8',
  credential: 'G1tYNp2unkO0qbDe',
 },
 {
  urls: 'turn:a.relay.metered.ca:443',
  username: '0fb9f18d86c5f73d408585d8',
  credential: 'G1tYNp2unkO0qbDe',
 },
];

const DEFAULT_CALL_STATE = {
 isActive: false,
 isIncoming: false,
 isOutgoing: false,
 contact: null,
 callId: null,
 incomingOffer: null,
 initiatorType: null,
 hasAudio: false,
 hasVideo: false,
 hasScreenshare: false,
 localStream: null,
 remoteStream: null,
 screenStream: null,
 remoteHasVideo: true,
 remoteHasAudio: true,
 remoteHasScreenshare: false,
 isMicMuted: false,
 isCameraOff: false,
 isScreensharing: false,
};

const useCalls = (socketRef, setError, callMinimized) => {
 const [callState, setCallState] = useState(DEFAULT_CALL_STATE);
 const [audioEnabled, setAudioEnabled] = useState(false);
 const [ringtoneInitialized, setRingtoneInitialized] = useState(false);

 const peerRef = useRef(null);
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const ringtoneRef = useRef(null);
 const localStreamRef = useRef(null);
 const screenStreamRef = useRef(null);
 const callStateRef = useRef(callState);

 // CRITICAL: Store BOTH camera and screenshare streams
 const remoteCameraStreamRef = useRef(null);
 const remoteScreenStreamRef = useRef(null);

 // CRITICAL: Prevent competing srcObject assignments
 const remoteStreamAttachedRef = useRef(false);
 const localStreamAttachedRef = useRef(false);

 useEffect(() => {
  callStateRef.current = callState;
 }, [callState]);

 const enableAudio = useCallback(async () => {
  if (audioEnabled) return true;
  try {
   const AC = window.AudioContext || window.webkitAudioContext;
   if (AC) {
    const ctx = new AC();
    if (ctx.state === 'suspended') await ctx.resume();
   }
   if (ringtoneRef.current && !ringtoneInitialized) {
    ringtoneRef.current.volume = 0;
    ringtoneRef.current.muted = true;
    setRingtoneInitialized(true);
   }
   setAudioEnabled(true);
   return true;
  } catch { return false; }
 }, [audioEnabled, ringtoneInitialized]);

 useEffect(() => {
  if (audioEnabled) return;
  const unlock = () => enableAudio();
  document.addEventListener('click', unlock);
  document.addEventListener('touchstart', unlock);
  return () => {
   document.removeEventListener('click', unlock);
   document.removeEventListener('touchstart', unlock);
  };
 }, [audioEnabled, enableAudio]);

 const playRingtone = useCallback(async () => {
  if (!ringtoneRef.current || !audioEnabled) return;
  try {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
   ringtoneRef.current.muted = false;
   ringtoneRef.current.loop = true;
   ringtoneRef.current.volume = 0.7;
   await ringtoneRef.current.play();
  } catch { }
 }, [audioEnabled]);

 const stopRingtone = useCallback(() => {
  if (!ringtoneRef.current) return;
  ringtoneRef.current.pause();
  ringtoneRef.current.currentTime = 0;
 }, []);

 const emitTrackUpdate = useCallback((tracks) => {
  const cs = callStateRef.current;
  if (!socketRef.current || !cs.contact) {
   console.log('⚠️ Cannot emit track update - no socket or contact');
   return;
  }

  console.log('📤 EMITTING call_track_update:', {
   target_id: cs.contact.id,
   call_id: cs.callId,
   tracks
  });

  socketRef.current.emit('call_track_update', {
   target_id: cs.contact.id,
   call_id: cs.callId,
   tracks,
  });
 }, [socketRef]);

 // ATOMIC stream attachment - only call this once per stream
 const attachRemoteStream = useCallback((stream) => {
  if (!remoteVideoRef.current) return;

  console.log('🎬 ATTACHING remote stream (single point of truth)');

  // Clear old stream first
  if (remoteVideoRef.current.srcObject) {
   const oldStream = remoteVideoRef.current.srcObject;
   oldStream.getTracks().forEach(t => {
    t.onended = null; // Remove old handlers
   });
  }

  remoteVideoRef.current.srcObject = stream;
  remoteVideoRef.current.play().catch(console.error);
  remoteStreamAttachedRef.current = true;
 }, []);

 // REMOVED: attachLocalStream - local video is attached in component useEffect
 // because the ref doesn't exist yet when startCall/answerCall runs

 const endCall = useCallback(() => {
  console.log('📞 ENDING CALL - Full cleanup');
  stopRingtone();

  // Stop all local tracks
  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach(t => {
    t.onended = null;
    t.stop();
   });
   localStreamRef.current = null;
  }

  // Stop screenshare tracks
  if (screenStreamRef.current) {
   screenStreamRef.current.getTracks().forEach(t => {
    t.onended = null;
    t.stop();
   });
   screenStreamRef.current = null;
  }

  // Clear remote stream refs
  remoteCameraStreamRef.current = null;
  remoteScreenStreamRef.current = null;

  // Destroy peer connection
  if (peerRef.current) {
   peerRef.current.destroy();
   peerRef.current = null;
  }

  const cs = callStateRef.current;
  if (cs.contact && socketRef.current?.connected) {
   socketRef.current.emit('call_end', {
    call_id: cs.callId,
    target_id: cs.contact.id,
   });
  }

  // Clear video elements
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = null;
   localStreamAttachedRef.current = false;
  }
  if (remoteVideoRef.current) {
   remoteVideoRef.current.srcObject = null;
   remoteStreamAttachedRef.current = false;
  }

  setCallState(DEFAULT_CALL_STATE);
 }, [stopRingtone, socketRef]);

 const createPeer = useCallback((initiator, stream, onSignal) => {
  const peer = new Peer({
   initiator,
   trickle: false,
   stream,
   config: { iceServers: ICE_SERVERS },
  });

  peer.on('signal', onSignal);

  peer.on('stream', (remoteStream) => {
   console.log('🎥 Remote stream received - SINGLE attachment point');

   // Detect if this is a screenshare stream (has only video, no audio)
   const videoTracks = remoteStream.getVideoTracks();
   const audioTracks = remoteStream.getAudioTracks();
   const isScreenshareStream = videoTracks.length > 0 && audioTracks.length === 0;

   if (isScreenshareStream) {
    console.log('🖥️ SCREENSHARE STREAM detected (video only, no audio)');
    remoteScreenStreamRef.current = remoteStream;

    // Show screenshare stream
    attachRemoteStream(remoteStream);

    setCallState(prev => ({
     ...prev,
     remoteHasScreenshare: true,
    }));
   } else {
    console.log('📹 CAMERA STREAM detected (has audio)');
    remoteCameraStreamRef.current = remoteStream;

    // Only attach if we're not currently showing screenshare
    if (!remoteScreenStreamRef.current) {
     attachRemoteStream(remoteStream);
    }

    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isOutgoing: false,
     isIncoming: false,
     remoteHasVideo: videoTracks.length > 0,
     remoteHasAudio: audioTracks.length > 0,
    }));
   }
  });

  // CRITICAL: Listen for new tracks being added (screenshare!)
  peer.on('track', (track, stream) => {
   console.log('🎬 Track event:', track.kind, track.label, 'enabled:', track.enabled);

   track.onended = () => {
    console.log('🛑 Track ended:', track.kind, track.label);

    const remainingVideoTracks = stream.getVideoTracks().filter(t => t.readyState === 'live');
    const remainingAudioTracks = stream.getAudioTracks().filter(t => t.readyState === 'live');

    console.log('📊 Remaining tracks - Video:', remainingVideoTracks.length, 'Audio:', remainingAudioTracks.length);

    setCallState(prev => ({
     ...prev,
     remoteHasVideo: remainingVideoTracks.length > 0,
     remoteHasAudio: remainingAudioTracks.length > 0,
    }));
   };
  });

  peer.on('error', (err) => {
   console.error('❌ Peer error:', err);
   setError('Call connection failed');
   endCall();
  });

  peer.on('close', () => {
   console.log('📞 Peer closed');
   endCall();
  });

  return peer;
 }, [setError, endCall, attachRemoteStream]);

 const startCall = useCallback(async (contact, type) => {
  if (!socketRef.current?.connected) {
   setError('Not connected to server');
   return;
  }
  if (callStateRef.current.isActive || callStateRef.current.isOutgoing) {
   setError('Already in a call');
   return;
  }

  const unlocked = await enableAudio();
  if (!unlocked) {
   setError('Click anywhere first to enable call audio');
   return;
  }

  try {
   const wantVideo = type === 'video';
   const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: wantVideo,
   });

   localStreamRef.current = stream;

   setCallState({
    ...DEFAULT_CALL_STATE,
    isOutgoing: true,
    contact,
    initiatorType: type,
    hasAudio: true,
    hasVideo: wantVideo,
    localStream: stream,
    isMicMuted: false,
    isCameraOff: !wantVideo,
    isScreensharing: false,
    remoteHasVideo: wantVideo,
    remoteHasAudio: true,
   });

   const peer = createPeer(true, stream, (signal) => {
    socketRef.current.emit('call_initiate', {
     receiver_id: contact.id,
     type,
     offer: signal,
    });
   });

   peerRef.current = peer;
  } catch {
   setError('Failed to access camera/microphone');
  }
 }, [socketRef, enableAudio, createPeer, setError]);

 const answerCall = useCallback(async (accept) => {
  stopRingtone();
  const cs = callStateRef.current;

  if (!accept) {
   if (socketRef.current?.connected) {
    socketRef.current.emit('call_answer', {
     call_id: cs.callId,
     caller_id: cs.contact?.id,
     answer: false,
    });
   }
   setCallState(DEFAULT_CALL_STATE);
   return;
  }

  try {
   const wantVideo = cs.initiatorType === 'video';
   const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: wantVideo,
   });

   localStreamRef.current = stream;

   const peer = createPeer(false, stream, (signal) => {
    if (socketRef.current?.connected) {
     socketRef.current.emit('call_answer', {
      call_id: cs.callId,
      caller_id: cs.contact?.id,
      answer: true,
      answerSDP: signal,
     });
    }
   });

   if (cs.incomingOffer) peer.signal(cs.incomingOffer);
   peerRef.current = peer;

   setCallState(prev => ({
    ...prev,
    isIncoming: false,
    hasAudio: true,
    hasVideo: wantVideo,
    localStream: stream,
    isMicMuted: false,
    isCameraOff: !wantVideo,
    isScreensharing: false,
    remoteHasVideo: wantVideo,
    remoteHasAudio: true,
   }));
  } catch {
   setError('Failed to access camera/microphone');
   endCall();
  }
 }, [stopRingtone, socketRef, createPeer, setError, endCall]);

 const toggleMic = useCallback(() => {
  if (!localStreamRef.current) return;
  const track = localStreamRef.current.getAudioTracks()[0];
  if (!track) return;

  track.enabled = !track.enabled;

  setCallState(prev => ({ ...prev, isMicMuted: !track.enabled }));

  // Only emit track update, don't touch video at all
  emitTrackUpdate({
   audio: track.enabled,
   video: callStateRef.current.hasVideo,
   screenshare: callStateRef.current.isScreensharing
  });
 }, [emitTrackUpdate]);

 const toggleCamera = useCallback(async () => {
  if (!localStreamRef.current) return;

  const videoTracks = localStreamRef.current.getVideoTracks();
  const cameraTrack = videoTracks.find(t => !t.label.toLowerCase().includes('screen'));

  // Turn OFF camera
  if (cameraTrack && cameraTrack.enabled) {
   console.log('📷 Turning camera OFF');
   cameraTrack.enabled = false;

   setCallState(prev => ({ ...prev, isCameraOff: true, hasVideo: false }));
   emitTrackUpdate({ audio: true, video: false, screenshare: callStateRef.current.isScreensharing });
  }
  // Turn ON existing camera track
  else if (cameraTrack && !cameraTrack.enabled) {
   console.log('📷 Turning camera ON (re-enable existing track)');
   cameraTrack.enabled = true;

   setCallState(prev => ({ ...prev, isCameraOff: false, hasVideo: true }));
   emitTrackUpdate({ audio: true, video: true, screenshare: callStateRef.current.isScreensharing });
  }
  // No camera track - get new one
  else {
   console.log('📷 No camera track - requesting new stream');
   try {
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = newStream.getVideoTracks()[0];

    localStreamRef.current.addTrack(videoTrack);

    if (peerRef.current && !peerRef.current.destroyed) {
     const senders = peerRef.current._pc.getSenders();
     const videoSender = senders.find(s => s.track && s.track.kind === 'video');

     if (videoSender) {
      await videoSender.replaceTrack(videoTrack);
     } else {
      peerRef.current._pc.addTrack(videoTrack, localStreamRef.current);
     }

     const offer = await peerRef.current._pc.createOffer();
     await peerRef.current._pc.setLocalDescription(offer);

     const cs = callStateRef.current;
     if (socketRef.current && cs.contact) {
      socketRef.current.emit('webrtc_signal', {
       target_id: cs.contact.id,
       signal: offer,
      });
     }
    }

    setCallState(prev => ({ ...prev, isCameraOff: false, hasVideo: true }));
    emitTrackUpdate({ audio: true, video: true, screenshare: callStateRef.current.isScreensharing });
   } catch (err) {
    console.error('❌ Camera access failed:', err);
    setError('Failed to access camera');
   }
  }
 }, [emitTrackUpdate, setError, socketRef]);

 const toggleScreenshare = useCallback(async () => {
  // STOP screenshare
  if (callStateRef.current.isScreensharing) {
   console.log('🛑 STOPPING screenshare');

   if (screenStreamRef.current) {
    const screenTrack = screenStreamRef.current.getVideoTracks()[0];
    if (screenTrack) {
     screenTrack.onended = null; // Remove handler before stopping
     screenTrack.stop();
    }

    // Remove from peer connection
    if (peerRef.current && !peerRef.current.destroyed && screenTrack) {
     const senders = peerRef.current._pc.getSenders();
     const screenSender = senders.find(s => s.track === screenTrack);
     if (screenSender) {
      peerRef.current._pc.removeTrack(screenSender);
     }

     // Renegotiate to remove screenshare
     const offer = await peerRef.current._pc.createOffer();
     await peerRef.current._pc.setLocalDescription(offer);

     const cs = callStateRef.current;
     if (socketRef.current && cs.contact) {
      socketRef.current.emit('webrtc_signal', {
       target_id: cs.contact.id,
       signal: offer,
      });
     }
    }

    screenStreamRef.current = null;
   }

   // CRITICAL: Clear screenStream from state
   setCallState(prev => ({
    ...prev,
    isScreensharing: false,
    hasScreenshare: false,
    screenStream: null, // This must be null for cleanup
   }));

   emitTrackUpdate({
    audio: true,
    video: callStateRef.current.hasVideo,
    screenshare: false
   });
  }
  // START screenshare
  else {
   console.log('🎬 STARTING screenshare');

   try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
     video: { cursor: 'always' },
     audio: false,
    });

    screenStreamRef.current = screenStream;
    const screenTrack = screenStream.getVideoTracks()[0];

    // Handle user clicking "Stop sharing" in browser UI
    screenTrack.onended = () => {
     console.log('📺 Screen track ended by user');
     if (callStateRef.current.isScreensharing) {
      toggleScreenshare(); // Recursively call to clean up
     }
    };

    if (peerRef.current && !peerRef.current.destroyed) {
     peerRef.current._pc.addTrack(screenTrack, screenStream);

     const offer = await peerRef.current._pc.createOffer();
     await peerRef.current._pc.setLocalDescription(offer);

     const cs = callStateRef.current;
     if (socketRef.current && cs.contact) {
      socketRef.current.emit('webrtc_signal', {
       target_id: cs.contact.id,
       signal: offer,
      });
     }
    }

    setCallState(prev => ({
     ...prev,
     isScreensharing: true,
     hasScreenshare: true,
     screenStream
    }));

    emitTrackUpdate({
     audio: true,
     video: callStateRef.current.hasVideo,
     screenshare: true
    });
   } catch (e) {
    if (e.name !== 'NotAllowedError') {
     setError('Failed to start screenshare');
    }
   }
  }
 }, [emitTrackUpdate, setError, socketRef]);

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;
  const socket = socketRef.current;

  const events = ['incoming_call', 'call_accepted', 'call_rejected', 'webrtc_signal', 'call_ended', 'call_track_update'];
  events.forEach(e => socket.off(e));

  console.log('🔧 Setting up socket listeners, socket connected:', socket.connected);

  socket.on('incoming_call', (data) => {
   const cs = callStateRef.current;
   if (cs.isActive || cs.isOutgoing) return;

   stopRingtone();
   setCallState({
    ...DEFAULT_CALL_STATE,
    isIncoming: true,
    contact: data.caller,
    callId: data.call_id,
    incomingOffer: data.offer,
    initiatorType: data.type,
    remoteHasVideo: data.type === 'video',
    remoteHasAudio: true,
   });
   setTimeout(() => playRingtone(), 100);
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isOutgoing: prev.isOutgoing,
    callId: data.call_id,
   }));
   if (data.answerSDP && peerRef.current && !peerRef.current.destroyed) {
    peerRef.current.signal(data.answerSDP);
   }
  });

  socket.on('call_rejected', () => {
   stopRingtone();
   endCall();
  });

  socket.on('webrtc_signal', (data) => {
   if (peerRef.current && !peerRef.current.destroyed) {
    const signal = data.signal;

    if (signal.type === 'offer') {
     peerRef.current._pc.setRemoteDescription(new RTCSessionDescription(signal))
      .then(() => peerRef.current._pc.createAnswer())
      .then(answer => peerRef.current._pc.setLocalDescription(answer))
      .then(() => {
       const cs = callStateRef.current;
       if (socketRef.current && cs.contact) {
        socketRef.current.emit('webrtc_signal', {
         target_id: cs.contact.id,
         signal: peerRef.current._pc.localDescription,
        });
       }
      })
      .catch(err => console.error('Renegotiation error:', err));
    } else {
     peerRef.current.signal(signal);
    }
   }
  });

  socket.on('call_ended', () => {
   stopRingtone();
   endCall();
  });

  socket.on('call_track_update', (data) => {
   try {
    console.log('📡 ✅ RECEIVED call_track_update:', JSON.stringify(data));

    const wasShowingScreenshare = callStateRef.current.remoteHasScreenshare;
    console.log('📊 Current state - remoteHasScreenshare:', wasShowingScreenshare, 'incoming screenshare:', data.tracks?.screenshare);

    // Update state - but be careful not to cause unnecessary re-renders
    setCallState(prev => {
     // Only update if values actually changed
     if (prev.remoteHasAudio === (data.tracks?.audio ?? true) &&
      prev.remoteHasVideo === (data.tracks?.video ?? false) &&
      prev.remoteHasScreenshare === (data.tracks?.screenshare ?? false)) {
      console.log('🔄 No state change needed');
      return prev; // No change, don't trigger re-render
     }

     console.log('🔄 Updating remote track state:', data.tracks);
     return {
      ...prev,
      remoteHasAudio: data.tracks?.audio ?? true,
      remoteHasVideo: data.tracks?.video ?? false,
      remoteHasScreenshare: data.tracks?.screenshare ?? false,
     };
    });

    // CRITICAL: Restore camera stream when screenshare ends!
    if (wasShowingScreenshare && data.tracks?.screenshare === false) {
     console.log('🧹 SCREENSHARE ENDED - restoring camera stream');

     if (remoteCameraStreamRef.current && remoteVideoRef.current) {
      console.log('✅ Restoring camera stream from ref');

      // Clear screenshare ref
      remoteScreenStreamRef.current = null;

      // Restore camera stream
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;

      setTimeout(() => {
       if (remoteVideoRef.current && remoteCameraStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteCameraStreamRef.current;
        remoteVideoRef.current.load();
        remoteVideoRef.current.play().catch(err => console.error('Play failed:', err));
        console.log('🎉 Camera stream restored successfully!');
       }
      }, 50);
     } else {
      console.log('⚠️ No camera stream ref found!');
     }
    } else if (wasShowingScreenshare && data.tracks?.screenshare === false) {
     console.log('⚠️ Screenshare ended but remoteVideoRef is null!');
    } else if (data.tracks?.screenshare === false) {
     console.log('⚠️ Got screenshare=false but wasShowingScreenshare is false, state mismatch!');
    }
   } catch (error) {
    console.error('❌ Error in call_track_update handler:', error);
   }
  });

  return () => {
   events.forEach(e => socket.off(e));
  };
 }, [socketRef, stopRingtone, playRingtone, endCall]);

 useEffect(() => {
  if (!socketRef.current) return;
  const socket = socketRef.current;

  if (socket.connected) setupSocketListeners();

  const onConnect = () => setupSocketListeners();
  socket.on('connect', onConnect);
  socket.on('reconnect', onConnect);

  return () => {
   socket.off('connect', onConnect);
   socket.off('reconnect', onConnect);
   const events = ['incoming_call', 'call_accepted', 'call_rejected', 'webrtc_signal', 'call_ended', 'call_track_update'];
   events.forEach(e => socket.off(e));
  };
 }, [setupSocketListeners, socketRef]);

 useEffect(() => {
  window.__setupCallListeners = setupSocketListeners;
  return () => { delete window.__setupCallListeners; };
 }, [setupSocketListeners]);

 return {
  callState,
  localVideoRef,
  remoteVideoRef,
  ringtoneRef,
  startCall,
  answerCall,
  endCall,
  audioEnabled,
  enableAudio,
  isMicMuted: callState.isMicMuted,
  isCameraOff: callState.isCameraOff,
  isScreensharing: callState.isScreensharing,
  toggleMic,
  toggleCamera,
  toggleScreenshare,
  screenshareState: { isActive: false, isSharing: false, isViewing: false, isIncoming: false },
  screenshareLocalVideoRef: { current: null },
  screenshareRemoteVideoRef: { current: null },
  startScreenshare: () => { },
  answerScreenshare: () => { },
  endScreenshare: () => { },
 };
};

export default useCalls;