import { useState, useRef, useCallback, useEffect } from 'react';
import SimpleSignalClient from 'simple-signal-client';

const useCalls = (socketRef, setError) => {
 const [callState, setCallState] = useState({
  isActive: false,
  isIncoming: false,
  isOutgoing: false,
  type: null,
  contact: null,
  localStream: null,
  remoteStream: null,
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
  shareId: null
 });

 const [audioEnabled, setAudioEnabled] = useState(false);
 const [ringtoneInitialized, setRingtoneInitialized] = useState(false);

 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const ringtoneRef = useRef(null);
 const screenshareLocalVideoRef = useRef(null);
 const screenshareRemoteVideoRef = useRef(null);

 const signalClientRef = useRef(null);
 const currentPeerRef = useRef(null);
 const currentScreensharePeerRef = useRef(null);
 const incomingRequestRef = useRef(null);
 const incomingScreenshareRequestRef = useRef(null);

 const enableAudio = useCallback(async () => {
  if (audioEnabled) return true;
  try {
   const AudioContext = window.AudioContext || window.webkitAudioContext;
   if (AudioContext) {
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') await audioContext.resume();
   }
   if (ringtoneRef.current && !ringtoneInitialized) {
    ringtoneRef.current.volume = 0;
    ringtoneRef.current.muted = true;
    setRingtoneInitialized(true);
   }
   setAudioEnabled(true);
   return true;
  } catch (err) {
   return false;
  }
 }, [audioEnabled, ringtoneInitialized]);

 useEffect(() => {
  const handleInteraction = () => enableAudio();
  if (!audioEnabled) {
   document.addEventListener('click', handleInteraction);
   document.addEventListener('touchstart', handleInteraction);
   document.addEventListener('keydown', handleInteraction);
   return () => {
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
    document.removeEventListener('keydown', handleInteraction);
   };
  }
 }, [audioEnabled, enableAudio]);

 const playRingtone = useCallback(async () => {
  if (!ringtoneRef.current || !audioEnabled) return;
  try {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
   ringtoneRef.current.muted = false;
   ringtoneRef.current.loop = true;
   ringtoneRef.current.volume = 0.7;
   const playPromise = ringtoneRef.current.play();
   if (playPromise !== undefined) await playPromise;
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
    video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false,
    audio: { echoCancellation: true, noiseSuppression: true }
   });
  } catch (err) {
   return await navigator.mediaDevices.getUserMedia({ video: video, audio: true });
  }
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  // Initialize simple-signal client
  signalClientRef.current = new SimpleSignalClient(socketRef.current);

  // Handle incoming call requests
  signalClientRef.current.on('request', async (request) => {
   const metadata = request.metadata || {};

   if (metadata.type === 'screenshare') {
    // Incoming screenshare
    stopRingtone();
    incomingScreenshareRequestRef.current = request;
    setScreenshareState(prev => ({
     ...prev,
     isIncoming: true,
     contact: metadata.caller,
     shareId: request.id
    }));
   } else {
    // Incoming call
    stopRingtone();
    playRingtone();
    incomingRequestRef.current = request;
    setCallState(prev => ({
     ...prev,
     isIncoming: true,
     contact: metadata.caller,
     type: metadata.callType || 'audio',
     callId: request.id
    }));
   }
  });

  return () => {
   if (signalClientRef.current) {
    signalClientRef.current.removeAllListeners();
   }
  };
 }, [socketRef, playRingtone, stopRingtone]);

 const startCall = async (contact, type) => {
  try {
   const audioUnlocked = await enableAudio();
   if (!audioUnlocked) {
    setError('Click anywhere first to enable call audio');
    return;
   }

   const stream = await getUserMedia(type === 'video');

   setCallState({
    isActive: false,
    isOutgoing: true,
    isIncoming: false,
    type,
    contact,
    localStream: stream,
    remoteStream: null,
    callId: `call_${Date.now()}`
   });

   // Set local video
   if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    localVideoRef.current.autoplay = true;
    localVideoRef.current.playsInline = true;
    localVideoRef.current.style.transform = 'scaleX(-1)';
    localVideoRef.current.play().catch(console.error);
   }

   // Use simple-signal to connect
   const peer = await signalClientRef.current.connect(
    contact.id.toString(),
    { stream },
    { caller: contact, callType: type }
   );

   currentPeerRef.current = peer;

   peer.on('stream', (remoteStream) => {
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isOutgoing: false
    }));

    setTimeout(() => {
     if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   peer.on('close', () => endCall());
   peer.on('error', (err) => {
    console.error('Peer error:', err);
    setError('Call connection failed');
    endCall();
   });

  } catch (error) {
   console.error('Failed to start call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  stopRingtone();

  if (!accept) {
   if (incomingRequestRef.current) {
    incomingRequestRef.current.reject();
    incomingRequestRef.current = null;
   }
   setCallState({
    isActive: false,
    isIncoming: false,
    isOutgoing: false,
    type: null,
    contact: null,
    localStream: null,
    remoteStream: null,
    callId: null
   });
   return;
  }

  try {
   const stream = await getUserMedia(callState.type === 'video');

   // Set local video
   if (localVideoRef.current) {
    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    localVideoRef.current.autoplay = true;
    localVideoRef.current.playsInline = true;
    localVideoRef.current.style.transform = 'scaleX(-1)';
    localVideoRef.current.play().catch(console.error);
   }

   // Accept the call using simple-signal
   const peer = await incomingRequestRef.current.accept({ stream });
   currentPeerRef.current = peer;
   incomingRequestRef.current = null;

   peer.on('stream', (remoteStream) => {
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     localStream: stream
    }));

    setTimeout(() => {
     if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   peer.on('close', () => endCall());
   peer.on('error', (err) => {
    console.error('Peer error:', err);
    setError('Call connection failed');
    endCall();
   });

  } catch (error) {
   console.error('Failed to answer call:', error);
   setError('Failed to access camera/microphone');
   endCall();
  }
 };

 const endCall = () => {
  stopRingtone();

  if (callState.localStream) {
   callState.localStream.getTracks().forEach(track => track.stop());
  }

  if (currentPeerRef.current) {
   currentPeerRef.current.destroy();
   currentPeerRef.current = null;
  }

  if (localVideoRef.current) localVideoRef.current.srcObject = null;
  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

  setCallState({
   isActive: false,
   isIncoming: false,
   isOutgoing: false,
   type: null,
   contact: null,
   localStream: null,
   remoteStream: null,
   callId: null
  });
 };

 const startScreenshare = async (contact) => {
  try {
   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: "always", displaySurface: "monitor" },
    audio: false
   });

   stream.getVideoTracks()[0].onended = () => endScreenshare();

   setScreenshareState({
    isActive: false,
    isSharing: true,
    isViewing: false,
    isIncoming: false,
    contact,
    localStream: stream,
    remoteStream: null,
    shareId: `share_${Date.now()}`
   });

   if (screenshareLocalVideoRef.current) {
    screenshareLocalVideoRef.current.srcObject = stream;
    screenshareLocalVideoRef.current.muted = true;
    screenshareLocalVideoRef.current.autoplay = true;
    screenshareLocalVideoRef.current.playsInline = true;
    screenshareLocalVideoRef.current.play().catch(console.error);
   }

   // Use simple-signal for screenshare
   const peer = await signalClientRef.current.connect(
    contact.id.toString(),
    { stream },
    { caller: contact, type: 'screenshare' }
   );

   currentScreensharePeerRef.current = peer;

   peer.on('connect', () => {
    setScreenshareState(prev => ({ ...prev, isActive: true }));
   });

   peer.on('close', () => endScreenshare());
   peer.on('error', (err) => {
    console.error('Screenshare error:', err);
    setError('Screenshare connection failed');
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
   if (incomingScreenshareRequestRef.current) {
    incomingScreenshareRequestRef.current.reject();
    incomingScreenshareRequestRef.current = null;
   }
   setScreenshareState({
    isActive: false,
    isSharing: false,
    isViewing: false,
    isIncoming: false,
    contact: null,
    localStream: null,
    remoteStream: null,
    shareId: null
   });
   return;
  }

  try {
   // Accept screenshare (no local stream needed for viewer)
   const peer = await incomingScreenshareRequestRef.current.accept();
   currentScreensharePeerRef.current = peer;
   incomingScreenshareRequestRef.current = null;

   peer.on('stream', (remoteStream) => {
    setScreenshareState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isViewing: true
    }));

    setTimeout(() => {
     if (screenshareRemoteVideoRef.current) {
      screenshareRemoteVideoRef.current.srcObject = remoteStream;
      screenshareRemoteVideoRef.current.autoplay = true;
      screenshareRemoteVideoRef.current.playsInline = true;
      screenshareRemoteVideoRef.current.muted = false;
      screenshareRemoteVideoRef.current.play().catch(console.error);
     }
    }, 200);
   });

   peer.on('close', () => endScreenshare());
   peer.on('error', (err) => {
    console.error('Screenshare error:', err);
    setError('Screenshare connection failed');
    endScreenshare();
   });

  } catch (error) {
   console.error('Failed to accept screenshare:', error);
   setError('Failed to accept screenshare');
  }
 };

 const endScreenshare = () => {
  if (screenshareState.localStream) {
   screenshareState.localStream.getTracks().forEach(track => track.stop());
  }

  if (currentScreensharePeerRef.current) {
   currentScreensharePeerRef.current.destroy();
   currentScreensharePeerRef.current = null;
  }

  if (screenshareLocalVideoRef.current) screenshareLocalVideoRef.current.srcObject = null;
  if (screenshareRemoteVideoRef.current) screenshareRemoteVideoRef.current.srcObject = null;

  setScreenshareState({
   isActive: false,
   isSharing: false,
   isViewing: false,
   isIncoming: false,
   contact: null,
   localStream: null,
   remoteStream: null,
   shareId: null
  });
 };

 // Cleanup on unmount
 useEffect(() => {
  return () => {
   if (callState.localStream) {
    callState.localStream.getTracks().forEach(track => track.stop());
   }
   if (currentPeerRef.current) currentPeerRef.current.destroy();
   if (currentScreensharePeerRef.current) currentScreensharePeerRef.current.destroy();
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