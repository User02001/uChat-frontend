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

 // Add click listeners to enable audio on any user interaction
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

 // Play ringtone with fallback strategies
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

 const testAudio = () => {
  const audio = new Audio('/resources/ringtones/default_ringtone.mp3');
  audio.play().then(() => {
  }).catch(err => {
  });
 };

 // Stop ringtone
 const stopRingtone = useCallback(() => {
  if (ringtoneRef.current) {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
  }
 }, []);

 // Get user media
 const getUserMedia = async (video = true) => {
  return navigator.mediaDevices.getUserMedia({
   video,
   audio: {
    echoCancellation: true,
    noiseSuppression: true
   }
  });
 };

 // Set local stream to video element
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

 // Create peer connection
 const createPeer = (initiator, stream) => {
  console.log(`[WebRTC] Creating peer - Initiator: ${initiator}`);

  const peer = new Peer({
   initiator,
   trickle: true, // Enable trickle ICE for faster connection
   stream,
   config: {
    iceServers: [
     // GOOGLE STUN SERVERS (5 different ones for redundancy)
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:stun1.l.google.com:19302' },
     { urls: 'stun:stun2.l.google.com:19302' },
     { urls: 'stun:stun3.l.google.com:19302' },
     { urls: 'stun:stun4.l.google.com:19302' },

     // TWILIO STUN
     { urls: 'stun:global.stun.twilio.com:3478' },

     // PUBLIC STUN SERVERS (backup army)
     { urls: 'stun:stun.stunprotocol.org:3478' },
     { urls: 'stun:stun.voip.blackberry.com:3478' },
     { urls: 'stun:stun.sipnet.net:3478' },
     { urls: 'stun:stun.voxgratia.org:3478' },
     { urls: 'stun:stun.ekiga.net' },
     { urls: 'stun:stun.ideasip.com' },
     { urls: 'stun:stun.schlund.de' },
     { urls: 'stun:stun.voiparound.com' },
     { urls: 'stun:stun.voipbuster.com' },
     { urls: 'stun:stun.voipstunt.com' },

     // FREE TURN SERVERS (for strict NAT/firewall scenarios)
     {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
     },
     {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
     },
     {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
     }
    ],
    // AGGRESSIVE ICE OPTIONS
    iceCandidatePoolSize: 10, // Pre-gather candidates
    iceTransportPolicy: 'all', // Try everything: UDP, TCP, TURN
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
   },
   // SIMPLE-PEER OPTIONS
   offerOptions: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
   },
   answerOptions: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
   }
  });

  // SIGNAL EVENT - send ICE candidates as they're generated
  peer.on('signal', (data) => {
   console.log('[WebRTC] Signal generated:', data.type);
   if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit('webrtc_signal', {
     target_id: callState.contact?.id,
     signal: data
    });
    console.log('[WebRTC] Signal sent to server');
   } else {
    console.error('[WebRTC] Socket not connected, cannot send signal');
   }
  });

  // STREAM EVENT - remote video/audio received
  peer.on('stream', (remoteStream) => {
   console.log('[WebRTC] Remote stream received:', remoteStream.id);
   console.log('[WebRTC] Stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));

   setCallState(prev => ({
    ...prev,
    remoteStream,
    isActive: true,
    isIncoming: false,
    isOutgoing: false
   }));

   // AGGRESSIVE VIDEO SETUP with multiple retry attempts
   const setupRemoteVideo = (attempt = 0) => {
    setTimeout(() => {
     if (remoteVideoRef.current && remoteStream) {
      console.log(`[WebRTC] Setting up remote video (attempt ${attempt + 1})`);
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;

      remoteVideoRef.current.play().then(() => {
       console.log('[WebRTC] Remote video playing successfully');
      }).catch(e => {
       console.error(`[WebRTC] Remote video play failed (attempt ${attempt + 1}):`, e);
       // Retry up to 5 times with increasing delays
       if (attempt < 5) {
        setupRemoteVideo(attempt + 1);
       }
      });
     }
    }, 200 * (attempt + 1)); // Increasing delay: 200ms, 400ms, 600ms...
   };

   setupRemoteVideo(0);
  });

  // CONNECT EVENT - peers have connected
  peer.on('connect', () => {
   console.log('[WebRTC] ✅ Peer connection established!');
  });

  // ERROR EVENT - connection failed
  peer.on('error', (error) => {
   console.error('[WebRTC] ❌ Peer error:', error);
   console.error('[WebRTC] Error stack:', error.stack);
   setError(`Call connection failed: ${error.message}`);

   // Give it 2 seconds then end call
   setTimeout(() => {
    endCall();
   }, 2000);
  });

  // CLOSE EVENT - connection closed
  peer.on('close', () => {
   console.log('[WebRTC] Connection closed');
   endCall();
  });

  // MONITOR ICE CONNECTION STATE
  if (peer._pc) {
   peer._pc.oniceconnectionstatechange = () => {
    console.log('[WebRTC] ICE connection state:', peer._pc.iceConnectionState);

    // If stuck in 'checking' for too long, something's wrong
    if (peer._pc.iceConnectionState === 'checking') {
     setTimeout(() => {
      if (peer._pc.iceConnectionState === 'checking') {
       console.error('[WebRTC] Stuck in checking state - possible firewall/NAT issue');
       setError('Connection timeout - check firewall settings');
      }
     }, 15000); // 15 second timeout
    }

    // Failed state - immediate error
    if (peer._pc.iceConnectionState === 'failed') {
     console.error('[WebRTC] ICE connection failed');
     setError('Connection failed - trying to reconnect...');

     // Try ICE restart
     if (initiator && peer._pc.restartIce) {
      console.log('[WebRTC] Attempting ICE restart...');
      peer._pc.restartIce();
     }
    }
   };

   peer._pc.onconnectionstatechange = () => {
    console.log('[WebRTC] Connection state:', peer._pc.connectionState);
   };

   peer._pc.onicegatheringstatechange = () => {
    console.log('[WebRTC] ICE gathering state:', peer._pc.iceGatheringState);
   };

   peer._pc.onicecandidate = (event) => {
    if (event.candidate) {
     console.log('[WebRTC] ICE candidate:', event.candidate.type, event.candidate.protocol);
    } else {
     console.log('[WebRTC] ICE gathering complete');
    }
   };
  }

  return peer;
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  // CALL LISTENERS
  socket.on('incoming_call', (data) => {
   stopRingtone();
   playRingtone();

   setCallState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.caller,
    type: data.type,
    incomingOffer: data.offer,
    callId: data.call_id  // ADD THIS
   }));
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
    callId: data.call_id  // ADD THIS
   }));
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
   console.log('Incoming screenshare from:', data.sharer?.username);
   setScreenshareState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.sharer,
    incomingOffer: data.offer,
    shareId: data.share_id  // ADD THIS
   }));
  });

  socket.on('screenshare_accepted', (data) => {
   console.log('Screenshare accepted by viewer, signaling answer');
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed && data.answerSDP) {
    screensharePeerRef.current.signal(data.answerSDP);
    setScreenshareState(prev => ({
     ...prev,
     isActive: true,
     shareId: data.share_id  // ADD THIS
    }));
   }
  });

  socket.on('screenshare_rejected', () => {
   console.log('Screenshare rejected');
   setError('Screenshare was declined');
   endScreenshare();
  });

  socket.on('screenshare_signal', (data) => {
   console.log('Received screenshare signal from:', data.from_user);
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
    screensharePeerRef.current.signal(data.signal);
   }
  });

  socket.on('screenshare_ended', () => {
   console.log('Screenshare ended by other user');
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
 }, [socketRef, callState.contact, playRingtone, stopRingtone]);

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
    callId: null  // Will be set when we get response
   });

   peerRef.current = createPeer(true, stream);

   peerRef.current.on('signal', (data) => {
    socketRef.current.emit('call_initiate', {
     receiver_id: contact.id,
     type,
     offer: data
    });
   });

  } catch (error) {
   console.error('Failed to start call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  stopRingtone();

  if (!accept) {
   socketRef.current.emit('call_answer', {
    call_id: callState.callId,  // ADD THIS
    caller_id: callState.contact.id,
    answer: false
   });

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

   peerRef.current = createPeer(false, stream);

   if (callState.incomingOffer) {
    setTimeout(() => {
     if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.signal(callState.incomingOffer);
     }
    }, 100);
   }

   peerRef.current.on('signal', (data) => {
    socketRef.current.emit('call_answer', {
     call_id: callState.callId,  // ADD THIS
     caller_id: callState.contact.id,
     answer: true,
     answerSDP: data
    });
   });

   setCallState(prev => ({
    ...prev,
    localStream: stream,
    isIncoming: false
   }));

  } catch (error) {
   console.error('Failed to answer call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 // End call
 const endCall = () => {
  // Stop ringtone
  stopRingtone();

  // Stop local stream
  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach(track => track.stop());
   localStreamRef.current = null;
  }

  // Destroy peer connection
  if (peerRef.current) {
   peerRef.current.destroy();
   peerRef.current = null;
  }

  // Emit call end with call ID
  if (callState.contact && callState.callId && socketRef.current) {
   socketRef.current.emit('call_end', {
    call_id: callState.callId,
    target_id: callState.contact.id
   });
  }

  // Clear video elements
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = null;
  }
  if (remoteVideoRef.current) {
   remoteVideoRef.current.srcObject = null;
  }

  // Reset state
  setCallState({
   isActive: false,
   isIncoming: false,
   isOutgoing: false,
   type: null,
   contact: null,
   localStream: null,
   remoteStream: null,
   incomingOffer: null
  });
 };

 // Start screenshare
 const startScreenshare = async (contact) => {
  try {
   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
     cursor: "always",
     displaySurface: "monitor"
    },
    audio: false
   });

   console.log('Screen stream obtained:', stream.id);

   // Handle user clicking "Stop sharing" button
   stream.getVideoTracks()[0].onended = () => {
    console.log('Screen sharing stopped by user');
    endScreenshare();
   };

   // Set local video immediately
   if (screenshareLocalVideoRef.current) {
    screenshareLocalVideoRef.current.srcObject = stream;
    screenshareLocalVideoRef.current.muted = true;
    screenshareLocalVideoRef.current.autoplay = true;
    screenshareLocalVideoRef.current.playsInline = true;
    screenshareLocalVideoRef.current.play().catch(e => console.log('Local screenshare play error:', e));
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

   // Create peer as initiator
   const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
     iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
     ]
    }
   });

   screensharePeerRef.current = peer;

   peer.on('signal', (data) => {
    console.log('Screenshare signal generated by initiator');
    if (socketRef.current) {
     socketRef.current.emit('screenshare_start', {
      receiver_id: contact.id,
      offer: data
     });
    }
   });

   // ADD THIS: Listen for share_id from server
   peer.on('connect', () => {
    console.log('Screenshare peer connected (sharer)');
    setScreenshareState(prev => ({
     ...prev,
     isActive: true
    }));
   });

   peer.on('error', (error) => {
    console.error('Screenshare peer error:', error);
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    console.log('Screenshare peer closed');
    endScreenshare();
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
     share_id: screenshareState.shareId,  // ADD THIS
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
   console.log('Accepting screenshare from:', screenshareState.contact?.username);

   const peer = new Peer({
    initiator: false,
    trickle: false,
    config: {
     iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
     ]
    }
   });

   screensharePeerRef.current = peer;

   peer.on('stream', (remoteStream) => {
    console.log('Received screenshare stream:', remoteStream.id);

    setScreenshareState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isViewing: true
    }));

    setTimeout(() => {
     if (screenshareRemoteVideoRef.current && remoteStream) {
      console.log('Setting remote video srcObject');
      screenshareRemoteVideoRef.current.srcObject = remoteStream;
      screenshareRemoteVideoRef.current.autoplay = true;
      screenshareRemoteVideoRef.current.playsInline = true;
      screenshareRemoteVideoRef.current.muted = false;
      screenshareRemoteVideoRef.current.play().catch(e => {
       console.error('Remote screenshare play error:', e);
       setTimeout(() => {
        if (screenshareRemoteVideoRef.current) {
         screenshareRemoteVideoRef.current.play().catch(console.error);
        }
       }, 500);
      });
     }
    }, 200);
   });

   if (screenshareState.incomingOffer) {
    console.log('Signaling incoming offer to peer');
    peer.signal(screenshareState.incomingOffer);
   }

   peer.on('signal', (data) => {
    console.log('Screenshare signal generated by viewer');
    if (socketRef.current) {
     socketRef.current.emit('screenshare_signal', {
      share_id: screenshareState.shareId,  // ADD THIS instead of target_id
      target_id: screenshareState.contact.id,
      signal: data
     });
    }
   });

   peer.on('connect', () => {
    console.log('Screenshare peer connected (viewer)');
   });

   peer.on('error', (error) => {
    console.error('Screenshare peer error:', error);
    setError('Screenshare connection failed');
    endScreenshare();
   });

   peer.on('close', () => {
    console.log('Screenshare peer closed (viewer)');
    endScreenshare();
   });

  } catch (error) {
   console.error('Failed to accept screenshare:', error);
   setError('Failed to accept screenshare');
  }
 };

 // End screenshare
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
    share_id: screenshareState.shareId,  // ADD THIS
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