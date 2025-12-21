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
  urls: 'turn:a.relay.metered.ca:80?transport=tcp',
  username: '0fb9f18d86c5f73d408585d8',
  credential: 'G1tYNp2unkO0qbDe',
 },
 {
  urls: 'turn:a.relay.metered.ca:443',
  username: '0fb9f18d86c5f73d408585d8',
  credential: 'G1tYNp2unkO0qbDe',
 },
 {
  urls: 'turns:a.relay.metered.ca:443?transport=tcp',
  username: '0fb9f18d86c5f73d408585d8',
  credential: 'G1tYNp2unkO0qbDe',
 },
];

const useCalls = (socketRef, setError, callMinimized, screenshareMinimized) => {
 const [callState, setCallState] = useState({
  isActive: false,
  isIncoming: false,
  isOutgoing: false,
  type: null,
  contact: null,
  localStream: null,
  remoteStream: null,
  incomingOffer: null,
  callId: null,
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
  shareId: null,
 });

 const [audioEnabled, setAudioEnabled] = useState(false);
 const [ringtoneInitialized, setRingtoneInitialized] = useState(false);
 const [isMicMuted, setIsMicMuted] = useState(false);
 const [isCameraOff, setIsCameraOff] = useState(false);

 const peerRef = useRef(null);
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const localStreamRef = useRef(null);
 const ringtoneRef = useRef(null);

 const screensharePeerRef = useRef(null);
 const screenshareLocalVideoRef = useRef(null);
 const screenshareRemoteVideoRef = useRef(null);
 const screenshareLocalStreamRef = useRef(null);

 const listenersSetupRef = useRef(false);

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
  return navigator.mediaDevices.getUserMedia({
   video,
   audio: {
    echoCancellation: true,
    noiseSuppression: true,
   },
  });
 };

 const setLocalStream = (stream) => {
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = stream;
   localVideoRef.current.style.transform = 'scaleX(-1)';
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;
   localVideoRef.current.play().catch(() => { });
  }
  localStreamRef.current = stream;
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) {
   return;
  }

  const socket = socketRef.current;

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

  // CALL LISTENERS
  socket.on('incoming_call', (data) => {
   stopRingtone();

   setCallState({
    isActive: false,
    isIncoming: true,
    isOutgoing: false,
    type: data.type,
    contact: data.caller,
    localStream: null,
    remoteStream: null,
    incomingOffer: data.offer,
    callId: data.call_id,
   });

   setTimeout(() => playRingtone(), 100);
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState((prev) => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
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
    peerRef.current.signal(data.signal);
   }
  });

  socket.on('call_ended', () => {
   stopRingtone();
   endCall();
  });

  // SCREENSHARE LISTENERS
  socket.on('screenshare_incoming', (data) => {
   setScreenshareState((prev) => ({
    ...prev,
    isIncoming: true,
    contact: data.sharer,
    incomingOffer: data.offer,
    shareId: data.share_id,
   }));
  });

  socket.on('screenshare_accepted', (data) => {
   if (
    screensharePeerRef.current &&
    !screensharePeerRef.current.destroyed &&
    data.answerSDP
   ) {
    screensharePeerRef.current.signal(data.answerSDP);
    setScreenshareState((prev) => ({
     ...prev,
     isActive: true,
     shareId: data.share_id,
    }));
   }
  });

  socket.on('screenshare_rejected', () => {
   setError('Screenshare was declined');
   endScreenshare();
  });

  socket.on('screenshare_signal', (data) => {
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
    screensharePeerRef.current.signal(data.signal);
   }
  });

  socket.on('screenshare_ended', () => {
   endScreenshare(true);
  });

  listenersSetupRef.current = true;

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
   listenersSetupRef.current = false;
  };
 }, [stopRingtone, playRingtone, setError, socketRef]);

 useEffect(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  if (listenersSetupRef.current) {
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
   listenersSetupRef.current = false;
  }

  if (socket.connected) {
   setupSocketListeners();
  }

  const onConnect = () => {
   if (listenersSetupRef.current) {
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
    listenersSetupRef.current = false;
   }
   setupSocketListeners();
  };

  socket.on('connect', onConnect);
  socket.on('reconnect', onConnect);

  return () => {
   socket.off('connect', onConnect);
   socket.off('reconnect', onConnect);
   if (listenersSetupRef.current) {
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
    listenersSetupRef.current = false;
   }
  };
 }, [setupSocketListeners, socketRef]);

 const startCall = async (contact, type) => {
  try {
   if (!socketRef.current || !socketRef.current.connected) {
    setError('Not connected to server. Retrying...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!socketRef.current || !socketRef.current.connected) {
     setError('Cannot start call - not connected to server');
     return;
    }
   }

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
    callId: null,
   });

   const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
     iceServers: ICE_SERVERS,
    },
   });

   peerRef.current = peer;

   peer.on('error', () => {
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    setCallState((prev) => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isOutgoing: false,
    }));

    setTimeout(() => {
     if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(() => { });
     }
    }, 200);
   });

   peer.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_initiate', {
      receiver_id: contact.id,
      type,
      offer: data,
     });
    } else {
     setError('Connection lost');
     endCall();
    }
   });
  } catch (error) {
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  stopRingtone();

  if (!accept) {
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit('call_answer', {
     call_id: callState.callId,
     caller_id: callState.contact.id,
     answer: false,
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
    callId: null,
   });
   return;
  }

  try {
   if (!socketRef.current || !socketRef.current.connected) {
    setError('Not connected to server');
    endCall();
    return;
   }

   const stream = await getUserMedia(callState.type === 'video');
   setLocalStream(stream);

   const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
    config: {
     iceServers: ICE_SERVERS,
    },
   });

   peerRef.current = peer;

   peer.on('error', () => {
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    setCallState((prev) => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
    }));

    setTimeout(() => {
     if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(() => { });
     }
    }, 200);
   });

   peer.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_answer', {
      call_id: callState.callId,
      caller_id: callState.contact.id,
      answer: true,
      answerSDP: data,
     });
    } else {
     setError('Connection lost');
     endCall();
    }
   });

   if (callState.incomingOffer) {
    peer.signal(callState.incomingOffer);
   }

   setCallState((prev) => ({
    ...prev,
    localStream: stream,
    isIncoming: false,
   }));
  } catch (error) {
   setError('Failed to access camera/microphone');
   endCall();
  }
 };

 const endCall = () => {
  stopRingtone();

  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach((track) => track.stop());
   localStreamRef.current = null;
  }

  if (peerRef.current) {
   peerRef.current.destroy();
   peerRef.current = null;
  }

  if (callState.contact && socketRef.current) {
   socketRef.current.emit('call_end', {
    call_id: callState.callId,
    target_id: callState.contact.id,
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
   callId: null,
  });
 };

 const startScreenshare = async (contact) => {
  try {
   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
     cursor: 'always',
     displaySurface: 'monitor',
    },
    audio: false,
   });

   screenshareLocalStreamRef.current = stream;

   stream.getVideoTracks()[0].onended = () => {
    endScreenshare();
   };

   if (screenshareLocalVideoRef.current) {
    screenshareLocalVideoRef.current.srcObject = stream;
    screenshareLocalVideoRef.current.muted = true;
    screenshareLocalVideoRef.current.autoplay = true;
    screenshareLocalVideoRef.current.playsInline = true;
    screenshareLocalVideoRef.current.play().catch(() => { });
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
    shareId: null,
   });

   const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
     iceServers: ICE_SERVERS,
    },
   });

   screensharePeerRef.current = peer;

   peer.on('signal', (data) => {
    if (socketRef.current) {
     socketRef.current.emit('screenshare_start', {
      receiver_id: contact.id,
      offer: data,
     });
    }
   });

   peer.on('connect', () => {
    setScreenshareState((prev) => ({
     ...prev,
     isActive: true,
    }));
   });

   peer.on('error', (error) => {
    if (error?.message && error.message.includes('User-Initiated Abort')) {
     return;
    }
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    endScreenshare();
   });
  } catch (error) {
   setError('You cannot screenshare from a phone');
  }
 };

 const answerScreenshare = async (accept) => {
  if (!accept) {
   if (socketRef.current) {
    socketRef.current.emit('screenshare_answer', {
     share_id: screenshareState.shareId,
     sharer_id: screenshareState.contact.id,
     answer: false,
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
    shareId: null,
   });
   return;
  }

  try {
   const peer = new Peer({
    initiator: false,
    trickle: false,
    config: {
     iceServers: ICE_SERVERS,
    },
   });

   screensharePeerRef.current = peer;

   peer.on('stream', (remoteStream) => {
    setScreenshareState((prev) => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isViewing: true,
    }));

    setTimeout(() => {
     if (screenshareRemoteVideoRef.current && remoteStream) {
      screenshareRemoteVideoRef.current.srcObject = remoteStream;
      screenshareRemoteVideoRef.current.autoplay = true;
      screenshareRemoteVideoRef.current.playsInline = true;
      screenshareRemoteVideoRef.current.muted = false;
      screenshareRemoteVideoRef.current.play().catch(() => { });
     }
    }, 200);
   });

   if (screenshareState.incomingOffer) {
    peer.signal(screenshareState.incomingOffer);
   }

   peer.on('signal', (data) => {
    if (socketRef.current) {
     socketRef.current.emit('screenshare_signal', {
      share_id: screenshareState.shareId,
      target_id: screenshareState.contact.id,
      signal: data,
     });
    }
   });

   peer.on('error', () => {
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    endScreenshare();
   });
  } catch (error) {
   setError('Failed to accept screenshare');
  }
 };

 const endScreenshare = (skipEmit = false) => {
  if (screenshareLocalStreamRef.current) {
   screenshareLocalStreamRef.current.getTracks().forEach((track) => track.stop());
   screenshareLocalStreamRef.current = null;
  }

  if (screenshareState.localStream) {
   screenshareState.localStream.getTracks().forEach((track) => track.stop());
  }

  if (screenshareState.remoteStream) {
   screenshareState.remoteStream.getTracks().forEach((track) => track.stop());
  }

  if (screenshareLocalVideoRef.current) {
   screenshareLocalVideoRef.current.pause();
   screenshareLocalVideoRef.current.srcObject = null;
  }
  if (screenshareRemoteVideoRef.current) {
   screenshareRemoteVideoRef.current.pause();
   screenshareRemoteVideoRef.current.srcObject = null;
  }

  if (screensharePeerRef.current) {
   screensharePeerRef.current.destroy();
   screensharePeerRef.current = null;
  }

  if (!skipEmit && screenshareState.contact && socketRef.current) {
   socketRef.current.emit('screenshare_end', {
    share_id: screenshareState.shareId,
    target_id: screenshareState.contact.id,
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
   shareId: null,
  });
 };

 const toggleMic = () => {
  if (localStreamRef.current) {
   const audioTrack = localStreamRef.current.getAudioTracks()[0];
   if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicMuted(!audioTrack.enabled);
   }
  }
 };

 const toggleCamera = () => {
  if (localStreamRef.current && callState.type === 'video') {
   const videoTrack = localStreamRef.current.getVideoTracks()[0];
   if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
   }
  }
 };

 useEffect(() => {
  window.__setupCallListeners = setupSocketListeners;
  return () => {
   delete window.__setupCallListeners;
  };
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
  screenshareState,
  screenshareLocalVideoRef,
  screenshareRemoteVideoRef,
  startScreenshare,
  answerScreenshare,
  endScreenshare,
  isMicMuted,
  isCameraOff,
  toggleMic,
  toggleCamera,
 };
};

export default useCalls;
