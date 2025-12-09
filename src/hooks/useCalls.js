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
    noiseSuppression: true
   }
  });
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

 // FIX: Separate socket listener setup to ensure it runs properly
 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) {
   console.log('[CALLS] No socket available');
   return;
  }

  const socket = socketRef.current;

  // Remove old listeners if they exist
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

  console.log('[CALLS] Setting up socket listeners');

  // CALL LISTENERS
  socket.on('incoming_call', (data) => {
   console.log('[CALLS] Incoming call received:', data);
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
    callId: data.call_id
   });

   setTimeout(() => playRingtone(), 100);
  });

  socket.on('call_accepted', (data) => {
   console.log('[CALLS] Call accepted:', data);
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
    callId: data.call_id
   }));
   if (data.answerSDP && peerRef.current && !peerRef.current.destroyed) {
    console.log('[CALLS] Signaling answer SDP to peer');
    peerRef.current.signal(data.answerSDP);
   }
  });

  socket.on('call_rejected', () => {
   console.log('[CALLS] Call rejected');
   stopRingtone();
   endCall();
  });

  socket.on('webrtc_signal', (data) => {
   console.log('[CALLS] Received webrtc_signal from:', data.from_user);
   if (peerRef.current && !peerRef.current.destroyed) {
    peerRef.current.signal(data.signal);
   }
  });

  socket.on('call_ended', () => {
   console.log('[CALLS] Call ended by other user');
   stopRingtone();
   endCall();
  });

  // SCREENSHARE LISTENERS
  socket.on('screenshare_incoming', (data) => {
   console.log('[SCREENSHARE] Incoming screenshare from:', data.sharer?.username);
   setScreenshareState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.sharer,
    incomingOffer: data.offer,
    shareId: data.share_id
   }));
  });

  socket.on('screenshare_accepted', (data) => {
   console.log('[SCREENSHARE] Screenshare accepted');
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed && data.answerSDP) {
    screensharePeerRef.current.signal(data.answerSDP);
    setScreenshareState(prev => ({
     ...prev,
     isActive: true,
     shareId: data.share_id
    }));
   }
  });

  socket.on('screenshare_rejected', () => {
   console.log('[SCREENSHARE] Screenshare rejected');
   setError('Screenshare was declined');
   endScreenshare();
  });

  socket.on('screenshare_signal', (data) => {
   console.log('[SCREENSHARE] Received signal from:', data.from_user);
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
    screensharePeerRef.current.signal(data.signal);
   }
  });

  socket.on('screenshare_ended', (data) => {
   console.log('[SCREENSHARE] Screenshare ended by other user');
   endScreenshare(true);
  });

  listenersSetupRef.current = true;
  console.log('[CALLS] Socket listeners setup complete');

  return () => {
   console.log('[CALLS] Cleaning up socket listeners');
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
 }, [stopRingtone, playRingtone, setError]);

 // FIX: Run setup once when socket is available and on reconnect
 useEffect(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  // Always clean up old listeners first
  if (listenersSetupRef.current) {
   console.log('[CALLS] Cleaning up old listeners before setup');
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

  // Set up listeners immediately if socket is connected
  if (socket.connected) {
   console.log('[CALLS] Socket already connected, setting up listeners immediately');
   setupSocketListeners();
  }

  // ALWAYS listen for connect/reconnect events
  const onConnect = () => {
   console.log('[CALLS] Socket connected, setting up listeners');
   // Clean up before setting up again
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
   console.log('[CALLS] useEffect cleanup');
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
 }, [setupSocketListeners]);

 const startCall = async (contact, type) => {
  try {
   console.log('[CALLS] Starting call to:', contact.username, 'type:', type);

   if (!socketRef.current || !socketRef.current.connected) {
    setError('Not connected to server. Retrying...');
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    callId: null
   });

   const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
     iceServers: ICE_SERVERS
    }
   });

   peerRef.current = peer;

   peer.on('error', (error) => {
    console.error('[CALLS] Peer error:', error);
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    console.log('[CALLS] Peer closed');
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    console.log('[CALLS] Caller received remote stream');
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
      remoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   // FIX: Only emit the initial offer, don't set up additional signal handlers
   peer.on('signal', (data) => {
    console.log('[CALLS] Peer generated signal, sending to server');
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_initiate', {
      receiver_id: contact.id,
      type,
      offer: data
     });
    } else {
     console.error('[CALLS] Socket disconnected, cannot send call initiate');
     setError('Connection lost');
     endCall();
    }
   });

  } catch (error) {
   console.error('[CALLS] Failed to start call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  stopRingtone();

  if (!accept) {
   console.log('[CALLS] Rejecting call');
   if (socketRef.current && socketRef.current.connected) {
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
   console.log('[CALLS] Accepting call');

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
     iceServers: ICE_SERVERS
    }
   });

   peerRef.current = peer;

   peer.on('error', (error) => {
    console.error('[CALLS] Peer error:', error);
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    console.log('[CALLS] Peer closed');
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    console.log('[CALLS] Receiver got remote stream');
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false
    }));

    setTimeout(() => {
     if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   peer.on('signal', (data) => {
    console.log('[CALLS] Answer signal generated, sending to caller');
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_answer', {
      call_id: callState.callId,
      caller_id: callState.contact.id,
      answer: true,
      answerSDP: data
     });
    } else {
     console.error('[CALLS] Socket disconnected during answer');
     setError('Connection lost');
     endCall();
    }
   });

   console.log('[CALLS] Signaling incoming offer to peer');
   if (callState.incomingOffer) {
    peer.signal(callState.incomingOffer);
   }

   setCallState(prev => ({
    ...prev,
    localStream: stream,
    isIncoming: false
   }));

  } catch (error) {
   console.error('[CALLS] Failed to answer call:', error);
   setError('Failed to access camera/microphone');
   endCall();
  }
 };

 const endCall = () => {
  console.log('[CALLS] Ending call');
  stopRingtone();

  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach(track => track.stop());
   localStreamRef.current = null;
  }

  if (peerRef.current) {
   peerRef.current.destroy();
   peerRef.current = null;
  }

  if (callState.contact && socketRef.current) {
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
   console.log('[SCREENSHARE] Starting screenshare to:', contact.username);

   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
     cursor: "always",
     displaySurface: "monitor"
    },
    audio: false
   });

   screenshareLocalStreamRef.current = stream;

   stream.getVideoTracks()[0].onended = () => {
    console.log('[SCREENSHARE] Screen sharing stopped by user');
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
    incomingOffer: null
   });

   const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
     iceServers: ICE_SERVERS
    }
   });

   screensharePeerRef.current = peer;

   peer.on('signal', (data) => {
    console.log('[SCREENSHARE] Signal generated');
    if (socketRef.current) {
     socketRef.current.emit('screenshare_start', {
      receiver_id: contact.id,
      offer: data
     });
    }
   });

   peer.on('connect', () => {
    console.log('[SCREENSHARE] Peer connected');
    setScreenshareState(prev => ({
     ...prev,
     isActive: true
    }));
   });

   peer.on('error', (error) => {
    if (error.message && error.message.includes('User-Initiated Abort')) {
     return;
    }
    console.error('[SCREENSHARE] Peer error:', error);
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    console.log('[SCREENSHARE] Peer closed');
    endScreenshare();
   });

  } catch (error) {
   console.error('[SCREENSHARE] Failed to start:', error);
   setError('You cannot screenshare from a phone');
  }
 };

 const answerScreenshare = async (accept) => {
  if (!accept) {
   console.log('[SCREENSHARE] Rejecting screenshare');
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
   console.log('[SCREENSHARE] Accepting screenshare');

   const peer = new Peer({
    initiator: false,
    trickle: false,
    config: {
     iceServers: ICE_SERVERS
    }
   });

   screensharePeerRef.current = peer;

   peer.on('stream', (remoteStream) => {
    console.log('[SCREENSHARE] Received stream');

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
      screenshareRemoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   if (screenshareState.incomingOffer) {
    peer.signal(screenshareState.incomingOffer);
   }

   peer.on('signal', (data) => {
    console.log('[SCREENSHARE] Answer signal generated');
    if (socketRef.current) {
     socketRef.current.emit('screenshare_signal', {
      share_id: screenshareState.shareId,
      target_id: screenshareState.contact.id,
      signal: data
     });
    }
   });

   peer.on('error', (error) => {
    console.error('[SCREENSHARE] Peer error:', error);
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    console.log('[SCREENSHARE] Peer closed');
    endScreenshare();
   });

  } catch (error) {
   console.error('[SCREENSHARE] Failed to accept:', error);
   setError('Failed to accept screenshare');
  }
 };

 const endScreenshare = (skipEmit = false) => {
  console.log('[SCREENSHARE] Ending screenshare');

  if (screenshareLocalStreamRef.current) {
   screenshareLocalStreamRef.current.getTracks().forEach(track => track.stop());
   screenshareLocalStreamRef.current = null;
  }

  if (screenshareState.localStream) {
   screenshareState.localStream.getTracks().forEach(track => track.stop());
  }

  if (screenshareState.remoteStream) {
   screenshareState.remoteStream.getTracks().forEach(track => track.stop());
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
    target_id: screenshareState.contact.id
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

 // Expose setup function globally so initializeSocket can call it
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
  toggleCamera
 };
};

export default useCalls;