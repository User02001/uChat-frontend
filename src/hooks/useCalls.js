import { useState, useRef, useCallback, useEffect } from 'react';
import Peer from 'simple-peer';

const useCalls = (socketRef, setError) => {
 const [callState, setCallState] = useState({
  isActive: false,
  isIncoming: false,
  isOutgoing: false,
  type: null,
  contact: null,
  localStream: null,
  remoteStream: null,
  incomingOffer: null,
  callId: null
 });

 const [screenshareState, setScreenshareState] = useState({
  isActive: false,
  isSharing: false,
  isViewing: false,
  isIncoming: false,
  contact: null,
  localStream: null,
  remoteStream: null,
  incomingOffer: null,
  shareId: null
 });

 const [audioEnabled, setAudioEnabled] = useState(false);
 const [ringtoneInitialized, setRingtoneInitialized] = useState(false);
 const peerRef = useRef(null);
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const localStreamRef = useRef(null);
 const ringtoneRef = useRef(null);
 const screensharePeerRef = useRef(null);
 const screenshareLocalVideoRef = useRef(null);
 const screenshareRemoteVideoRef = useRef(null);

 // FIX: Track if we're already in a reconnection attempt to prevent cascades
 const isReconnectingRef = useRef(false);

 const enableAudio = useCallback(async () => {
  if (audioEnabled) return true;

  try {
   const AudioContext = window.AudioContext || window.webkitAudioContext;
   if (AudioContext) {
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
     await audioContext.resume();
    }
   }

   if (ringtoneRef.current && !ringtoneInitialized) {
    ringtoneRef.current.volume = 0;
    ringtoneRef.current.muted = true;

    setRingtoneInitialized(true);
    setAudioEnabled(true);
    return true;
   }

   setAudioEnabled(true);
   return true;
  } catch (err) {
   return false;
  }
 }, [audioEnabled, ringtoneInitialized]);

 useEffect(() => {
  const handleInteraction = () => {
   enableAudio();
  };

  if (!audioEnabled) {
   document.addEventListener('click', handleInteraction);
   document.addEventListener('touchstart', handleInteraction);
   document.addEventListener('keydown', handleInteraction);
  }

  return () => {
   document.removeEventListener('click', handleInteraction);
   document.removeEventListener('touchstart', handleInteraction);
   document.removeEventListener('keydown', handleInteraction);
  };
 }, [audioEnabled, enableAudio]);

 const playRingtone = useCallback(async () => {
  if (!ringtoneRef.current || !audioEnabled) {
   return;
  }

  try {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
   ringtoneRef.current.muted = false;
   ringtoneRef.current.loop = true;
   ringtoneRef.current.volume = 0.7;

   const playPromise = ringtoneRef.current.play();
   if (playPromise !== undefined) {
    await playPromise;
   }
  } catch (error) {
   if (setError) {
    setError('Incoming call (audio blocked by browser)');
    setTimeout(() => setError(''), 3000);
   }
  }
 }, [audioEnabled, setError]);

 const stopRingtone = useCallback(() => {
  if (ringtoneRef.current) {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
  }
 }, []);

 const getUserMedia = async (video = true) => {
  try {
   return await navigator.mediaDevices.getUserMedia({
    video: video ? {
     width: { ideal: 1280 },
     height: { ideal: 720 },
     frameRate: { ideal: 30 }
    } : false,
    audio: {
     echoCancellation: true,
     noiseSuppression: true
    }
   });
  } catch (err) {
   // Fallback to basic constraints
   return await navigator.mediaDevices.getUserMedia({
    video: video,
    audio: true
   });
  }
 };

 const setLocalStream = (stream) => {
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = stream;
   localVideoRef.current.style.transform = 'scaleX(-1)';
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.play().catch(console.error);
  }
  localStreamRef.current = stream;
 };

 const createPeer = (initiator, stream, isScreenshare = false) => {
  const peer = new Peer({
   initiator,
   trickle: false,
   stream,
   config: {
    iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:stun1.l.google.com:19302' },
     { urls: 'stun:global.stun.twilio.com:3478' },
     { urls: 'stun:stun.stunprotocol.org:3478' }
    ]
   }
  });

  peer.on('signal', (data) => {
   if (socketRef.current) {
    if (isScreenshare) {
     socketRef.current.emit('screenshare_signal', {
      target_id: screenshareState.contact?.id,
      signal: data
     });
    } else {
     socketRef.current.emit('webrtc_signal', {
      target_id: callState.contact?.id,
      signal: data
     });
    }
   }
  });

  peer.on('stream', (remoteStream) => {
   if (isScreenshare) {
    setScreenshareState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isViewing: true
    }));

    setTimeout(() => {
     if (screenshareRemoteVideoRef.current && remoteStream) {
      screenshareRemoteVideoRef.current.srcObject = remoteStream;
      screenshareRemoteVideoRef.current.autoplay = true;
      screenshareRemoteVideoRef.current.playsInline = true;
      screenshareRemoteVideoRef.current.muted = false;
      screenshareRemoteVideoRef.current.play().catch(e => {
       setTimeout(() => {
        if (screenshareRemoteVideoRef.current) {
         screenshareRemoteVideoRef.current.play().catch(console.error);
        }
       }, 500);
      });
     }
    }, 200);
   } else {
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isOutgoing: false
    }));

    setTimeout(() => {
     if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(e => {
       setTimeout(() => {
        if (remoteVideoRef.current) {
         remoteVideoRef.current.play().catch(console.error);
        }
       }, 500);
      });
     }
    }, 200);
   }
  });

  peer.on('error', (error) => {
   console.error('Peer error:', error);
   setError('Call connection failed');
   if (isScreenshare) {
    endScreenshare();
   } else {
    endCall();
   }
  });

  peer.on('close', () => {
   if (isScreenshare) {
    endScreenshare();
   } else {
    endCall();
   }
  });

  return peer;
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  socket.on('incoming_call', (data) => {
   stopRingtone();
   playRingtone();

   setCallState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.caller,
    type: data.type,
    incomingOffer: data.offer,
    callId: data.call_id
   }));
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
    callId: data.call_id
   }));
  });

  socket.on('call_rejected', () => {
   stopRingtone();
   endCall();
  });

  socket.on('webrtc_signal', (data) => {
   if (peerRef.current && !peerRef.current.destroyed) {
    try {
     peerRef.current.signal(data.signal);
    } catch (err) {
     console.error('Signal error:', err);
    }
   }
  });

  socket.on('call_ended', () => {
   stopRingtone();
   endCall();
  });

  socket.on('screenshare_incoming', (data) => {
   setScreenshareState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.sharer,
    incomingOffer: data.offer,
    shareId: data.share_id
   }));
  });

  socket.on('screenshare_accepted', (data) => {
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed && data.answerSDP) {
    try {
     screensharePeerRef.current.signal(data.answerSDP);
     setScreenshareState(prev => ({
      ...prev,
      isActive: true,
      shareId: data.share_id
     }));
    } catch (err) {
     console.error('Screenshare signal error:', err);
    }
   }
  });

  socket.on('screenshare_rejected', () => {
   setError('Screenshare was declined');
   endScreenshare();
  });

  socket.on('screenshare_signal', (data) => {
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
    try {
     screensharePeerRef.current.signal(data.signal);
    } catch (err) {
     console.error('Screenshare signal error:', err);
    }
   }
  });

  socket.on('screenshare_ended', () => {
   endScreenshare();
  });

  return () => {
   socket.off('incoming_call');
   socket.off('call_accepted');
   socket.off('call_rejected');
   socket.off('webrtc_signal');
   socket.off('call_ended');
   socket.off('screenshare_incoming');
   socket.off('screenshare_accepted');
   socket.off('screenshare_rejected');
   socket.off('screenshare_signal');
   socket.off('screenshare_ended');
  };
 }, [socketRef, callState.contact, screenshareState.contact, playRingtone, stopRingtone]);

 const startCall = async (contact, type) => {
  try {
   const audioUnlocked = await enableAudio();
   if (!audioUnlocked) {
    setError('Click anywhere first to enable call audio');
    return;
   }

   const stream = await getUserMedia(type === 'video');
   setLocalStream(stream);

   setCallState({
    isActive: false,
    isOutgoing: true,
    isIncoming: false,
    type,
    contact,
    localStream: stream,
    remoteStream: null,
    incomingOffer: null,
    callId: null
   });

   peerRef.current = createPeer(true, stream, false);

   peerRef.current.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_initiate', {
      receiver_id: contact.id,
      type,
      offer: data
     });
    }
   });

  } catch (error) {
   console.error('Failed to start call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  stopRingtone();

  if (!accept) {
   if (socketRef.current) {
    socketRef.current.emit('call_answer', {
     call_id: callState.callId,
     caller_id: callState.contact.id,
     answer: false
    });
   }

   setCallState({
    isActive: false,
    isIncoming: false,
    isOutgoing: false,
    type: null,
    contact: null,
    localStream: null,
    remoteStream: null,
    incomingOffer: null,
    callId: null
   });
   return;
  }

  try {
   const stream = await getUserMedia(callState.type === 'video');
   setLocalStream(stream);

   peerRef.current = createPeer(false, stream, false);

   if (callState.incomingOffer) {
    setTimeout(() => {
     if (peerRef.current && !peerRef.current.destroyed) {
      try {
       peerRef.current.signal(callState.incomingOffer);
      } catch (err) {
       console.error('Failed to signal offer:', err);
      }
     }
    }, 100);
   }

   peerRef.current.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_answer', {
      call_id: callState.callId,
      caller_id: callState.contact.id,
      answer: true,
      answerSDP: data
     });
    }
   });

   setCallState(prev => ({
    ...prev,
    localStream: stream,
    isIncoming: false
   }));

  } catch (error) {
   console.error('Failed to answer call:', error);
   setError('Failed to access camera/microphone');
   endCall();
  }
 };

 const endCall = () => {
  stopRingtone();

  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach(track => track.stop());
   localStreamRef.current = null;
  }

  if (peerRef.current) {
   peerRef.current.destroy();
   peerRef.current = null;
  }

  if (callState.contact && callState.callId && socketRef.current) {
   socketRef.current.emit('call_end', {
    call_id: callState.callId,
    target_id: callState.contact.id
   });
  }

  if (localVideoRef.current) {
   localVideoRef.current.srcObject = null;
  }
  if (remoteVideoRef.current) {
   remoteVideoRef.current.srcObject = null;
  }

  setCallState({
   isActive: false,
   isIncoming: false,
   isOutgoing: false,
   type: null,
   contact: null,
   localStream: null,
   remoteStream: null,
   incomingOffer: null,
   callId: null
  });
 };

 const startScreenshare = async (contact) => {
  try {
   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
     cursor: "always",
     displaySurface: "monitor"
    },
    audio: false
   });

   stream.getVideoTracks()[0].onended = () => {
    endScreenshare();
   };

   if (screenshareLocalVideoRef.current) {
    screenshareLocalVideoRef.current.srcObject = stream;
    screenshareLocalVideoRef.current.muted = true;
    screenshareLocalVideoRef.current.autoplay = true;
    screenshareLocalVideoRef.current.playsInline = true;
    screenshareLocalVideoRef.current.play().catch(console.error);
   }

   setScreenshareState({
    isActive: false,
    isSharing: true,
    isViewing: false,
    isIncoming: false,
    contact,
    localStream: stream,
    remoteStream: null,
    incomingOffer: null,
    shareId: null
   });

   screensharePeerRef.current = createPeer(true, stream, true);

   screensharePeerRef.current.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('screenshare_start', {
      receiver_id: contact.id,
      offer: data
     });
    }
   });

   screensharePeerRef.current.on('connect', () => {
    setScreenshareState(prev => ({
     ...prev,
     isActive: true
    }));
   });

  } catch (error) {
   console.error('Failed to start screenshare:', error);
   if (error.name === 'NotAllowedError') {
    setError('Screen sharing permission denied');
   } else {
    setError('Failed to start screenshare');
   }
  }
 };

 const answerScreenshare = async (accept) => {
  if (!accept) {
   if (socketRef.current) {
    socketRef.current.emit('screenshare_answer', {
     share_id: screenshareState.shareId,
     sharer_id: screenshareState.contact.id,
     answer: false
    });
   }

   setScreenshareState({
    isActive: false,
    isSharing: false,
    isViewing: false,
    isIncoming: false,
    contact: null,
    localStream: null,
    remoteStream: null,
    incomingOffer: null,
    shareId: null
   });
   return;
  }

  try {
   screensharePeerRef.current = createPeer(false, null, true);

   if (screenshareState.incomingOffer) {
    setTimeout(() => {
     if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
      try {
       screensharePeerRef.current.signal(screenshareState.incomingOffer);
      } catch (err) {
       console.error('Failed to signal screenshare offer:', err);
      }
     }
    }, 100);
   }

   screensharePeerRef.current.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('screenshare_answer', {
      share_id: screenshareState.shareId,
      sharer_id: screenshareState.contact.id,
      answer: true,
      answerSDP: data
     });
    }
   });

   setScreenshareState(prev => ({
    ...prev,
    isIncoming: false
   }));

  } catch (error) {
   console.error('Failed to accept screenshare:', error);
   setError('Failed to accept screenshare');
  }
 };

 const endScreenshare = () => {
  if (screenshareState.localStream) {
   screenshareState.localStream.getTracks().forEach(track => track.stop());
  }

  if (screensharePeerRef.current) {
   screensharePeerRef.current.destroy();
   screensharePeerRef.current = null;
  }

  if (screenshareState.contact && screenshareState.shareId && socketRef.current) {
   socketRef.current.emit('screenshare_end', {
    share_id: screenshareState.shareId,
    target_id: screenshareState.contact.id
   });
  }

  if (screenshareLocalVideoRef.current) {
   screenshareLocalVideoRef.current.srcObject = null;
  }
  if (screenshareRemoteVideoRef.current) {
   screenshareRemoteVideoRef.current.srcObject = null;
  }

  setScreenshareState({
   isActive: false,
   isSharing: false,
   isViewing: false,
   isIncoming: false,
   contact: null,
   localStream: null,
   remoteStream: null,
   incomingOffer: null,
   shareId: null
  });
 };

 // Cleanup on unmount
 useEffect(() => {
  return () => {
   if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => track.stop());
   }
   if (peerRef.current) {
    peerRef.current.destroy();
   }
   if (screensharePeerRef.current) {
    screensharePeerRef.current.destroy();
   }
  };
 }, []);

 return {
  callState,
  localVideoRef,
  remoteVideoRef,
  ringtoneRef,
  startCall,
  answerCall,
  endCall,
  setupSocketListeners,
  audioEnabled,
  enableAudio,
  screenshareState,
  screenshareLocalVideoRef,
  screenshareRemoteVideoRef,
  startScreenshare,
  answerScreenshare,
  endScreenshare
 };
};

export default useCalls;