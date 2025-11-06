import { useState, useRef, useCallback, useEffect } from 'react';
import Peer from 'simple-peer';

const ICE_SERVERS = [
 // STUN servers (for NAT traversal)
 { urls: 'stun:stun.l.google.com:19302' },
 { urls: 'stun:stun1.l.google.com:19302' },

 // Metered.ca TURN servers
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

 const createPeer = (initiator, stream) => {
  const peer = new Peer({
   initiator,
   trickle: false,
   stream,
   config: {
    iceServers: ICE_SERVERS
   }
  });

  peer.on('signal', (data) => {
   console.log('Peer signal generated:', initiator ? 'INITIATOR' : 'RECEIVER');
   // Skip emitting the initial offer - it's already sent in startCall
   if (!initiator || data.type !== 'offer') {
    if (socketRef.current) {
     socketRef.current.emit('webrtc_signal', {
      target_id: callState.contact?.id,
      signal: data
     });
    }
   }
  });

  peer.on('stream', (remoteStream) => {
   console.log('Received remote stream:', remoteStream.id);
   setCallState(prev => ({
    ...prev,
    remoteStream,
    isActive: true,
    isIncoming: false,
    isOutgoing: false
   }));

   // Set up remote video with a small delay to ensure element exists
   setTimeout(() => {
    if (remoteVideoRef.current && remoteStream) {
     remoteVideoRef.current.srcObject = remoteStream;
     remoteVideoRef.current.autoplay = true;
     remoteVideoRef.current.playsInline = true;
     remoteVideoRef.current.muted = false;
     remoteVideoRef.current.play().catch(e => {
      // Try again after a short delay
      setTimeout(() => {
       if (remoteVideoRef.current) {
        remoteVideoRef.current.play().catch(console.error);
       }
      }, 500);
     });
    }
   }, 200);
  });

  peer.on('error', (error) => {
   console.error('Peer error:', error);
   setError('Call connection failed');
   endCall();
  });

  peer.on('close', () => {
   endCall();
  });

  return peer;
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  // Remove any existing listeners first to prevent duplicates
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
   console.log('[CALLS] Incoming call received:', data);
   stopRingtone();

   // Force state update to happen immediately
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

   // Play ringtone after state is set
   setTimeout(() => playRingtone(), 100);
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
    callId: data.call_id
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
   console.log('Received webrtc_signal from:', data.from_user);
   if (peerRef.current && !peerRef.current.destroyed) {
    peerRef.current.signal(data.signal);
   }
  });

  socket.on('call_ended', () => {
   stopRingtone();

   // If we have an incoming call that hasn't been answered yet, just clear it
   if (callState.isIncoming) {
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
   } else {
    endCall();
   }
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

  socket.on('screenshare_ended', (data) => {
   console.log('Screenshare ended by other user', data);
   endScreenshare(true);
  });

 }, [socketRef.current]);

 // Set up socket listeners when socket connects - ONLY run once per socket connection
 useEffect(() => {
  if (!socketRef.current) return;
  const cleanup = setupSocketListeners();

  return () => {
   if (cleanup) cleanup();
  };
 }, [socketRef.current]);

 const startCall = async (contact, type) => {
  try {
   // Ensure socket is connected
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

   // Set up all event listeners before signaling
   peer.on('error', (error) => {
    console.error('Peer error:', error);
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    console.log('Peer closed');
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    console.log('Caller received remote stream:', remoteStream.id);
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
   });

   // Signal event comes last - only after all listeners are set up
   peer.on('signal', (data) => {
    console.log('Initial offer generated, sending call_initiate');
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_initiate', {
      receiver_id: contact.id,
      type,
      offer: data
     });
    } else {
     console.error('Socket disconnected, cannot send call initiate');
     setError('Connection lost');
     endCall();
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
   // Ensure socket is connected
   if (!socketRef.current || !socketRef.current.connected) {
    setError('Not connected to server');
    endCall();
    return;
   }

   console.log('Answering call, getting media...');
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

   // Set up error/close handlers first
   peer.on('error', (error) => {
    console.error('Peer error:', error);
    setError('Call connection failed');
    endCall();
   });

   peer.on('close', () => {
    console.log('Peer closed');
    endCall();
   });

   peer.on('stream', (remoteStream) => {
    console.log('Receiver got remote stream:', remoteStream.id);
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
      remoteVideoRef.current.play().catch(e => {
       setTimeout(() => {
        if (remoteVideoRef.current) {
         remoteVideoRef.current.play().catch(console.error);
        }
       }, 500);
      });
     }
    }, 200);
   });

   peer.on('signal', (data) => {
    console.log('Answer signal generated, sending to caller');
    if (socketRef.current && socketRef.current.connected) {
     socketRef.current.emit('call_answer', {
      call_id: callState.callId,
      caller_id: callState.contact.id,
      answer: true,
      answerSDP: data
     });
    } else {
     console.error('Socket disconnected during answer');
     setError('Connection lost');
     endCall();
    }
   });

   console.log('Signaling incoming offer to peer');
   if (callState.incomingOffer) {
    peer.signal(callState.incomingOffer);
   }

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

 // End call
 const endCall = () => {
  // Stop ringtone
  stopRingtone();

  // Stop screenshare if active (do this BEFORE stopping local stream)
  const wasScreensharing = screenshareState.isActive || screenshareState.isSharing || screenshareState.isViewing;
  if (wasScreensharing) {
   endScreenshare();
  }

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

  // Emit call end - ALWAYS send if we have a contact, even without call_id
  if (callState.contact && socketRef.current) {
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
   incomingOffer: null,
   callId: null
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

   // Store in ref for guaranteed access during cleanup
   screenshareLocalStreamRef.current = stream;

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
     iceServers: ICE_SERVERS
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
    // Ignore "User-Initiated Abort" errors - these are expected when hanging up
    if (error.message && error.message.includes('User-Initiated Abort')) {
     console.log('Screenshare ended normally (viewer)');
     return;
    }
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
   setError('You cannot screenshare from a phone');
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
     iceServers: ICE_SERVERS
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
 const endScreenshare = (skipEmit = false) => {
  console.log('endScreenshare called', {
   isSharing: screenshareState.isSharing,
   isViewing: screenshareState.isViewing,
   contact: screenshareState.contact?.username,
   shareId: screenshareState.shareId,
   skipEmit,
   hasRefStream: !!screenshareLocalStreamRef.current
  });

  // CRITICAL: Use REF not state - state might be stale during cleanup
  if (screenshareLocalStreamRef.current) {
   const tracks = screenshareLocalStreamRef.current.getTracks();
   console.log('Stopping', tracks.length, 'LOCAL screenshare tracks from REF');
   tracks.forEach(track => {
    console.log('Stopping track:', track.kind, track.label, 'readyState:', track.readyState);
    track.stop();
    console.log('After stop - readyState:', track.readyState);
   });
   screenshareLocalStreamRef.current = null;
  }

  // Also try from state as backup
  if (screenshareState.localStream) {
   const tracks = screenshareState.localStream.getTracks();
   console.log('BACKUP: Stopping', tracks.length, 'local screenshare tracks from STATE');
   tracks.forEach(track => {
    console.log('Stopping track:', track.kind, track.label);
    track.stop();
   });
  }

  if (screenshareState.remoteStream) {
   const tracks = screenshareState.remoteStream.getTracks();
   console.log('Stopping', tracks.length, 'remote screenshare tracks');
   tracks.forEach(track => {
    track.stop();
   });
  }

  // Clear video element sources BEFORE destroying peer
  if (screenshareLocalVideoRef.current && screenshareLocalVideoRef.current.srcObject) {
   console.log('Clearing local video srcObject');
   screenshareLocalVideoRef.current.pause();
   screenshareLocalVideoRef.current.srcObject = null;
   screenshareLocalVideoRef.current.load();
  }
  if (screenshareRemoteVideoRef.current && screenshareRemoteVideoRef.current.srcObject) {
   console.log('Clearing remote video srcObject');
   screenshareRemoteVideoRef.current.pause();
   screenshareRemoteVideoRef.current.srcObject = null;
   screenshareRemoteVideoRef.current.load();
  }

  // Destroy peer connection
  if (screensharePeerRef.current) {
   console.log('Destroying screenshare peer');
   screensharePeerRef.current.destroy();
   screensharePeerRef.current = null;
  }

  // Only emit if we're not being called from a socket event
  if (!skipEmit && screenshareState.contact && socketRef.current) {
   console.log('Emitting screenshare_end to:', screenshareState.contact.username);
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

  console.log('endScreenshare completed');
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