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
  incomingOffer: null
 });

 const [audioEnabled, setAudioEnabled] = useState(false);
 const peerRef = useRef(null);
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const localStreamRef = useRef(null);
 const ringtoneRef = useRef(null);

 // Initialize audio context and enable audio playbook
 const enableAudio = useCallback(async () => {
  if (audioEnabled) return true;

  try {
   // Create and resume audio context
   const AudioContext = window.AudioContext || window.webkitAudioContext;
   if (AudioContext) {
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
     await audioContext.resume();
    }
   }

   // Prime the ringtone audio element
   if (ringtoneRef.current) {
    ringtoneRef.current.load();
    ringtoneRef.current.volume = 0.01; // Very low volume for unlock

    // Try to play and immediately pause to unlock audio
    const playPromise = ringtoneRef.current.play();
    await playPromise;
    ringtoneRef.current.pause();
    ringtoneRef.current.currentTime = 0;
    ringtoneRef.current.volume = 0.7; // Reset to normal volume

    setAudioEnabled(true);
    return true;
   }
  } catch (err) {
   return false;
  }
 }, [audioEnabled]);

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
  if (!ringtoneRef.current) {
   return;
  }

  try {
   // Stop any currently playing ringtone
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;

   // Set loop and volume
   ringtoneRef.current.loop = true;
   ringtoneRef.current.volume = 0.7;

   // Try to play
   const playPromise = ringtoneRef.current.play();

   if (playPromise !== undefined) {
    await playPromise;
   }
  } catch (error) {
   // Show visual notification if audio is blocked
   if (setError) {
    setError('Incoming call (audio blocked by browser)');
    setTimeout(() => setError(''), 3000);
   }

   // Try to enable audio for future calls
   enableAudio();
  }
 }, [enableAudio, setError]);

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
  const peer = new Peer({
   initiator,
   trickle: false,
   stream,
   config: {
    iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:global.stun.twilio.com:3478' }
    ]
   }
  });

  peer.on('signal', (data) => {
   if (socketRef.current) {
    socketRef.current.emit('webrtc_signal', {
     target_id: callState.contact?.id,
     signal: data
    });
   }
  });

  peer.on('stream', (remoteStream) => {
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

 // Setup socket listeners
 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  socket.on('incoming_call', (data) => {
   // Stop any existing ringtone and play new one
   stopRingtone();
   playRingtone();

   setCallState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.caller,
    type: data.type,
    incomingOffer: data.offer
   }));
  });

  socket.on('call_accepted', (data) => {
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false
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

  return () => {
   socket.off('incoming_call');
   socket.off('call_accepted');
   socket.off('call_rejected');
   socket.off('webrtc_signal');
   socket.off('call_ended');
  };
 }, [socketRef, callState.contact, playRingtone, stopRingtone]);

 // Start call
 const startCall = async (contact, type) => {
  try {
   // Enable audio before starting call - if it fails, show error
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
    incomingOffer: null
   });

   // Create peer as initiator
   peerRef.current = createPeer(true, stream);

   // Send call initiate with the peer's signal data
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

 // Answer call
 const answerCall = async (accept) => {
  // Always stop ringtone when answering
  stopRingtone();

  if (!accept) {
   socketRef.current.emit('call_answer', {
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
    incomingOffer: null
   });
   return;
  }

  try {
   const stream = await getUserMedia(callState.type === 'video');
   setLocalStream(stream);

   // Create peer as non-initiator
   peerRef.current = createPeer(false, stream);

   // Signal the incoming offer after peer is ready
   if (callState.incomingOffer) {
    setTimeout(() => {
     if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.signal(callState.incomingOffer);
     }
    }, 100);
   }

   // Send answer with peer's signal data
   peerRef.current.on('signal', (data) => {
    socketRef.current.emit('call_answer', {
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

  // Emit call end
  if (callState.contact && socketRef.current) {
   socketRef.current.emit('call_end', {
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
  enableAudio
 };
};

export default useCalls;