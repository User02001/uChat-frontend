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

 // NUCLEAR REFS - aggressive retry logic
 const connectionTimeoutRef = useRef(null);
 const signalQueueRef = useRef([]);
 const reconnectAttemptsRef = useRef(0);
 const maxReconnectAttempts = 5;
 const healthCheckIntervalRef = useRef(null);
 const lastPacketTimeRef = useRef(Date.now());
 const networkChangeHandlerRef = useRef(null);
 const visibilityChangeHandlerRef = useRef(null);
 const iceRestartTimeoutRef = useRef(null);
 const pendingCandidatesRef = useRef([]);
 const isNegotiatingRef = useRef(false);

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
  if (!ringtoneRef.current || !audioEnabled) return;

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

 // NUCLEAR: Detect network changes and force ICE restart
 useEffect(() => {
  const handleNetworkChange = async () => {
   console.log('[Network] ⚠️ Network change detected!');

   if (peerRef.current && peerRef.current._pc && callState.isActive) {
    console.log('[Network] 🔄 Forcing ICE restart due to network change');
    try {
     if (peerRef.current._pc.restartIce) {
      peerRef.current._pc.restartIce();
     }
    } catch (err) {
     console.error('[Network] ICE restart failed:', err);
    }
   }

   if (screensharePeerRef.current && screensharePeerRef.current._pc && screenshareState.isActive) {
    console.log('[Network] 🔄 Forcing screenshare ICE restart');
    try {
     if (screensharePeerRef.current._pc.restartIce) {
      screensharePeerRef.current._pc.restartIce();
     }
    } catch (err) {
     console.error('[Network] Screenshare ICE restart failed:', err);
    }
   }
  };

  if ('connection' in navigator) {
   networkChangeHandlerRef.current = handleNetworkChange;
   navigator.connection.addEventListener('change', handleNetworkChange);

   return () => {
    navigator.connection.removeEventListener('change', handleNetworkChange);
   };
  }
 }, [callState.isActive, screenshareState.isActive]);

 // NUCLEAR: Handle page visibility changes (mobile backgrounding)
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (document.hidden) {
    console.log('[Visibility] 📴 Page hidden - pausing health checks');
    if (healthCheckIntervalRef.current) {
     clearInterval(healthCheckIntervalRef.current);
    }
   } else {
    console.log('[Visibility] 📱 Page visible - resuming');

    // Force video play on mobile when coming back
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
     remoteVideoRef.current.play().catch(e => console.log('[Visibility] Resume play failed:', e));
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
     localVideoRef.current.play().catch(e => console.log('[Visibility] Local resume failed:', e));
    }

    // Restart health checks
    startHealthCheck();
   }
  };

  visibilityChangeHandlerRef.current = handleVisibilityChange;
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
   document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
 }, []);

 // NUCLEAR: Connection health monitoring
 const startHealthCheck = useCallback(() => {
  if (healthCheckIntervalRef.current) {
   clearInterval(healthCheckIntervalRef.current);
  }

  healthCheckIntervalRef.current = setInterval(() => {
   const now = Date.now();
   const timeSinceLastPacket = now - lastPacketTimeRef.current;

   // If no packets for 5 seconds, connection might be dead
   if (timeSinceLastPacket > 5000 && (callState.isActive || screenshareState.isActive)) {
    console.warn('[Health] ⚠️ No packets for 5s - connection may be dead');

    if (peerRef.current && peerRef.current._pc) {
     const state = peerRef.current._pc.iceConnectionState;
     console.log('[Health] ICE state:', state);

     if (state === 'disconnected' || state === 'failed') {
      console.log('[Health] 🔄 Attempting ICE restart');
      if (peerRef.current._pc.restartIce && reconnectAttemptsRef.current < maxReconnectAttempts) {
       reconnectAttemptsRef.current++;
       peerRef.current._pc.restartIce();
      }
     }
    }
   }
  }, 2000);
 }, [callState.isActive, screenshareState.isActive]);

 const getUserMedia = async (video = true) => {
  console.log('[Media] Requesting user media - video:', video);

  const constraints = {
   audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000
   },
   video: video ? {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user'
   } : false
  };

  try {
   const stream = await navigator.mediaDevices.getUserMedia(constraints);
   console.log('[Media] ✅ Got media stream:', stream.id);
   return stream;
  } catch (err) {
   console.error('[Media] Failed with ideal constraints:', err);

   try {
    const fallback1 = {
     audio: true,
     video: video ? {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 15 }
     } : false
    };
    const stream = await navigator.mediaDevices.getUserMedia(fallback1);
    console.log('[Media] ✅ Got media stream (fallback 1):', stream.id);
    return stream;
   } catch (err2) {
    console.error('[Media] Failed with fallback 1:', err2);

    try {
     const fallback2 = { audio: true, video: video };
     const stream = await navigator.mediaDevices.getUserMedia(fallback2);
     console.log('[Media] ✅ Got media stream (fallback 2):', stream.id);
     return stream;
    } catch (err3) {
     console.error('[Media] ❌ All media attempts failed');
     throw err3;
    }
   }
  }
 };

 const setLocalStream = (stream) => {
  console.log('[Media] Setting local stream');
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = stream;
   localVideoRef.current.style.transform = 'scaleX(-1)';
   localVideoRef.current.muted = true;
   localVideoRef.current.autoplay = true;
   localVideoRef.current.playsInline = true;

   const playLocal = () => {
    localVideoRef.current.play()
     .then(() => console.log('[Media] Local video playing'))
     .catch(e => {
      console.error('[Media] Local play failed:', e);
      setTimeout(playLocal, 500);
     });
   };
   playLocal();
  }
  localStreamRef.current = stream;
 };

 // NUCLEAR PEER CREATION with ALL the fixes
 const createPeer = (initiator, stream, isScreenshare = false) => {
  console.log(`[WebRTC] Creating peer - Initiator: ${initiator}, Screenshare: ${isScreenshare}`);

  // Clean up any existing peer first
  const existingPeer = isScreenshare ? screensharePeerRef.current : peerRef.current;
  if (existingPeer && !existingPeer.destroyed) {
   console.log('[WebRTC] 🧹 Cleaning up existing peer before creating new one');
   existingPeer.destroy();
  }

  const peer = new Peer({
   initiator,
   trickle: true,
   stream,
   reconnectTimer: 1000,
   iceCompleteTimeout: 10000,
   config: {
    iceServers: [
     // GOOGLE STUN (5 servers)
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:stun1.l.google.com:19302' },
     { urls: 'stun:stun2.l.google.com:19302' },
     { urls: 'stun:stun3.l.google.com:19302' },
     { urls: 'stun:stun4.l.google.com:19302' },

     // TWILIO
     { urls: 'stun:global.stun.twilio.com:3478' },

     // PUBLIC STUN
     { urls: 'stun:stun.stunprotocol.org:3478' },
     { urls: 'stun:stun.voip.blackberry.com:3478' },
     { urls: 'stun:stun.sipnet.net:3478' },
     { urls: 'stun:stun.ekiga.net' },
     { urls: 'stun:stun.ideasip.com' },

     // FREE TURN (critical for mobile data/strict NAT)
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
     },
     // Twilio's TURN (backup)
     {
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw='
     },
     {
      urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw='
     },
     {
      urls: 'turn:global.turn.twilio.com:443?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLw='
     }
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    sdpSemantics: 'unified-plan'
   },
   offerOptions: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
    iceRestart: true
   },
   answerOptions: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
   }
  });

  // CONNECTION TIMEOUT - force end if stuck
  connectionTimeoutRef.current = setTimeout(() => {
   if (peer && !peer.connected) {
    console.error('[WebRTC] ❌ Connection timeout after 30s');
    setError('Connection timeout - please check your internet');
    if (isScreenshare) {
     endScreenshare();
    } else {
     endCall();
    }
   }
  }, 30000);

  // SIGNAL - send to server
  peer.on('signal', (data) => {
   console.log('[WebRTC] 📡 Signal generated:', data.type);

   if (!socketRef.current || !socketRef.current.connected) {
    console.error('[WebRTC] ❌ Socket not connected, queueing signal');
    signalQueueRef.current.push(data);
    return;
   }

   const target = isScreenshare ? screenshareState.contact : callState.contact;

   if (isScreenshare) {
    socketRef.current.emit('screenshare_signal', {
     target_id: target?.id,
     signal: data
    });
   } else {
    socketRef.current.emit('webrtc_signal', {
     target_id: target?.id,
     signal: data
    });
   }

   console.log('[WebRTC] ✅ Signal sent');
  });

  // STREAM - remote media received
  peer.on('stream', (remoteStream) => {
   console.log('[WebRTC] 🎥 Remote stream received:', remoteStream.id);
   console.log('[WebRTC] Tracks:', remoteStream.getTracks().map(t => `${t.kind}:${t.enabled}`));

   lastPacketTimeRef.current = Date.now();

   if (connectionTimeoutRef.current) {
    clearTimeout(connectionTimeoutRef.current);
   }

   if (isScreenshare) {
    setScreenshareState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isViewing: true
    }));

    const setupVideo = (attempt = 0) => {
     setTimeout(() => {
      if (screenshareRemoteVideoRef.current && remoteStream) {
       console.log(`[WebRTC] Setting remote screenshare video (attempt ${attempt + 1})`);

       screenshareRemoteVideoRef.current.srcObject = null;
       screenshareRemoteVideoRef.current.load();

       setTimeout(() => {
        screenshareRemoteVideoRef.current.srcObject = remoteStream;
        screenshareRemoteVideoRef.current.autoplay = true;
        screenshareRemoteVideoRef.current.playsInline = true;
        screenshareRemoteVideoRef.current.muted = false;

        screenshareRemoteVideoRef.current.play()
         .then(() => console.log('[WebRTC] ✅ Remote screenshare playing'))
         .catch(e => {
          console.error(`[WebRTC] ❌ Play failed (attempt ${attempt + 1}):`, e);
          if (attempt < 10) setupVideo(attempt + 1);
         });
       }, 100);
      }
     }, 200 * (attempt + 1));
    };
    setupVideo(0);
   } else {
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false,
     isOutgoing: false
    }));

    const setupVideo = (attempt = 0) => {
     setTimeout(() => {
      if (remoteVideoRef.current && remoteStream) {
       console.log(`[WebRTC] Setting remote video (attempt ${attempt + 1})`);

       remoteVideoRef.current.srcObject = null;
       remoteVideoRef.current.load();

       setTimeout(() => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.muted = false;

        remoteVideoRef.current.play()
         .then(() => console.log('[WebRTC] ✅ Remote video playing'))
         .catch(e => {
          console.error(`[WebRTC] ❌ Play failed (attempt ${attempt + 1}):`, e);
          if (attempt < 10) setupVideo(attempt + 1);
         });
       }, 100);
      }
     }, 200 * (attempt + 1));
    };
    setupVideo(0);
   }
  });

  // CONNECT
  peer.on('connect', () => {
   console.log('[WebRTC] ✅✅✅ PEER CONNECTED!');
   if (connectionTimeoutRef.current) {
    clearTimeout(connectionTimeoutRef.current);
   }
   reconnectAttemptsRef.current = 0;
   lastPacketTimeRef.current = Date.now();

   // Start health monitoring
   startHealthCheck();

   // Flush queued signals
   if (signalQueueRef.current.length > 0) {
    console.log('[WebRTC] Flushing queued signals');
    signalQueueRef.current.forEach(data => peer.signal(data));
    signalQueueRef.current = [];
   }

   // Flush pending candidates
   if (pendingCandidatesRef.current.length > 0) {
    console.log('[WebRTC] Flushing pending candidates');
    pendingCandidatesRef.current.forEach(candidate => {
     try {
      peer.signal(candidate);
     } catch (e) {
      console.error('[WebRTC] Failed to add pending candidate:', e);
     }
    });
    pendingCandidatesRef.current = [];
   }
  });

  // ERROR
  peer.on('error', (error) => {
   console.error('[WebRTC] ❌❌❌ ERROR:', error.message);
   console.error('[WebRTC] Error stack:', error.stack);

   // Don't immediately kill on certain errors
   if (error.message.includes('User-Initiated Abort') ||
    error.message.includes('Cannot set remote answer')) {
    console.log('[WebRTC] Ignoring non-fatal error');
    return;
   }

   setError(`Connection error: ${error.message}`);

   // Try reconnect
   if (reconnectAttemptsRef.current < maxReconnectAttempts) {
    reconnectAttemptsRef.current++;
    console.log(`[WebRTC] Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
    setTimeout(() => {
     if (peer._pc && peer._pc.restartIce) {
      peer._pc.restartIce();
     }
    }, 2000);
   } else {
    setTimeout(() => {
     if (isScreenshare) {
      endScreenshare();
     } else {
      endCall();
     }
    }, 3000);
   }
  });

  // CLOSE
  peer.on('close', () => {
   console.log('[WebRTC] Connection closed');
   if (connectionTimeoutRef.current) {
    clearTimeout(connectionTimeoutRef.current);
   }
   if (healthCheckIntervalRef.current) {
    clearInterval(healthCheckIntervalRef.current);
   }
   if (isScreenshare) {
    endScreenshare();
   } else {
    endCall();
   }
  });

  // MONITOR EVERYTHING
  if (peer._pc) {
   // Track data channel activity
   peer._pc.ondatachannel = (event) => {
    event.channel.onmessage = () => {
     lastPacketTimeRef.current = Date.now();
    };
   };

   // Monitor stats for packet flow
   const statsInterval = setInterval(() => {
    if (peer._pc && peer._pc.connectionState === 'connected') {
     peer._pc.getStats().then(stats => {
      stats.forEach(report => {
       if (report.type === 'inbound-rtp' && report.packetsReceived) {
        lastPacketTimeRef.current = Date.now();
       }
      });
     }).catch(() => { });
    }
   }, 1000);

   peer.on('close', () => clearInterval(statsInterval));

   peer._pc.oniceconnectionstatechange = () => {
    const state = peer._pc.iceConnectionState;
    console.log('[WebRTC] 🧊 ICE state:', state);

    if (state === 'checking') {
     // Clear any existing timeout
     if (iceRestartTimeoutRef.current) {
      clearTimeout(iceRestartTimeoutRef.current);
     }

     iceRestartTimeoutRef.current = setTimeout(() => {
      if (peer._pc.iceConnectionState === 'checking') {
       console.error('[WebRTC] Stuck in checking - possible NAT/firewall');
       setError('Connection issue - trying TURN servers...');

       // Force TURN usage
       if (peer._pc.restartIce && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        peer._pc.restartIce();
       }
      }
     }, 15000);
    }

    if (state === 'connected') {
     if (iceRestartTimeoutRef.current) {
      clearTimeout(iceRestartTimeoutRef.current);
     }
     reconnectAttemptsRef.current = 0;
    }

    if (state === 'failed') {
     console.error('[WebRTC] ICE failed');
     if (iceRestartTimeoutRef.current) {
      clearTimeout(iceRestartTimeoutRef.current);
     }

     if (peer._pc.restartIce && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      console.log('[WebRTC] Restarting ICE...');
      peer._pc.restartIce();
     } else {
      setError('Connection failed - maximum retries reached');
      setTimeout(() => {
       if (isScreenshare) {
        endScreenshare();
       } else {
        endCall();
       }
      }, 2000);
     }
    }

    if (state === 'disconnected') {
     console.warn('[WebRTC] ICE disconnected - may reconnect');
     setTimeout(() => {
      if (peer._pc.iceConnectionState === 'disconnected') {
       console.error('[WebRTC] Still disconnected after 10s');
       setError('Connection lost - check internet');

       if (peer._pc.restartIce && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        peer._pc.restartIce();
       }
      }
     }, 10000);
    }
   };

   peer._pc.onconnectionstatechange = () => {
    console.log('[WebRTC] 🔌 Connection state:', peer._pc.connectionState);
   };

   peer._pc.onicegatheringstatechange = () => {
    console.log('[WebRTC] 📊 ICE gathering:', peer._pc.iceGatheringState);
   };

   peer._pc.onicecandidate = (event) => {
    if (event.candidate) {
     const c = event.candidate;
     console.log(`[WebRTC] 🧊 ICE candidate: ${c.type} ${c.protocol} ${c.address || 'relay'}`);
    } else {
     console.log('[WebRTC] ✅ ICE gathering complete');
    }
   };

   peer._pc.onsignalingstatechange = () => {
    const state = peer._pc.signalingState;
    console.log('[WebRTC] 📶 Signaling state:', state);

    // Track negotiation state to prevent race conditions
    if (state === 'have-local-offer' || state === 'have-remote-offer') {
     isNegotiatingRef.current = true;
    } else if (state === 'stable') {
     isNegotiatingRef.current = false;
    }
   };

   // NUCLEAR: Handle negotiation needed (for mid-call changes)
   peer._pc.onnegotiationneeded = async () => {
    if (isNegotiatingRef.current) {
     console.log('[WebRTC] ⏳ Already negotiating, skipping');
     return;
    }

    console.log('[WebRTC] 🔄 Negotiation needed');
    isNegotiatingRef.current = true;

    try {
     if (initiator) {
      // Only initiator creates new offers
      console.log('[WebRTC] Creating new offer for renegotiation');
      // simple-peer handles this automatically
     }
    } catch (err) {
     console.error('[WebRTC] Negotiation error:', err);
     isNegotiatingRef.current = false;
    }
   };
  }

  return peer;
 };

 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  socket.on('incoming_call', (data) => {
   console.log('[Call] Incoming call from:', data.caller.username);
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
   console.log('[Call] Call accepted');
   stopRingtone();
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false,
    callId: data.call_id
   }));
  });

  socket.on('call_rejected', () => {
   console.log('[Call] Call rejected');
   stopRingtone();
   endCall();
  });

  socket.on('webrtc_signal', (data) => {
   console.log('[Call] Received WebRTC signal from:', data.from_user);
   if (peerRef.current && !peerRef.current.destroyed) {
    try {
     // If we're still negotiating, queue the candidate
     if (isNegotiatingRef.current && data.signal.candidate) {
      console.log('[Call] Queueing candidate during negotiation');
      pendingCandidatesRef.current.push(data.signal);
      return;
     }

     peerRef.current.signal(data.signal);
     console.log('[Call] ✅ Signal processed');
    } catch (err) {
     console.error('[Call] ❌ Signal error:', err);
     // Queue it for retry
     if (data.signal.candidate) {
      pendingCandidatesRef.current.push(data.signal);
     }
    }
   } else {
    console.error('[Call] ❌ No peer to receive signal');
   }
  });

  socket.on('call_ended', () => {
   console.log('[Call] Call ended by remote');
   stopRingtone();
   endCall();
  });

  socket.on('screenshare_incoming', (data) => {
   console.log('[Screenshare] Incoming from:', data.sharer?.username);
   setScreenshareState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.sharer,
    incomingOffer: data.offer,
    shareId: data.share_id
   }));
  });

  socket.on('screenshare_accepted', (data) => {
   console.log('[Screenshare] Accepted');
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed && data.answerSDP) {
    try {
     screensharePeerRef.current.signal(data.answerSDP);
     setScreenshareState(prev => ({
      ...prev,
      isActive: true,
      shareId: data.share_id
     }));
    } catch (err) {
     console.error('[Screenshare] Signal error:', err);
    }
   }
  });

  socket.on('screenshare_rejected', () => {
   console.log('[Screenshare] Rejected');
   setError('Screenshare declined');
   endScreenshare();
  });

  socket.on('screenshare_signal', (data) => {
   console.log('[Screenshare] Signal from:', data.from_user);
   if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
    try {
     screensharePeerRef.current.signal(data.signal);
    } catch (err) {
     console.error('[Screenshare] Signal error:', err);
    }
   }
  });

  socket.on('screenshare_ended', () => {
   console.log('[Screenshare] Ended by remote');
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
 }, [socketRef, playRingtone, stopRingtone]);

 const startCall = async (contact, type) => {
  console.log(`[Call] Starting ${type} call to:`, contact.username);

  try {
   const audioUnlocked = await enableAudio();
   if (!audioUnlocked) {
    setError('Click anywhere to enable audio');
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
     console.log('[Call] Initiation sent');
    }
   });

  } catch (error) {
   console.error('[Call] Start failed:', error);
   setError('Failed to access camera/microphone');
  }
 };

 const answerCall = async (accept) => {
  console.log('[Call] Answer:', accept);
  stopRingtone();

  if (!accept) {
   socketRef.current.emit('call_answer', {
    call_id: callState.callId,
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

   peerRef.current = createPeer(false, stream, false);

   // Set up signal handler BEFORE signaling the offer
   peerRef.current.on('signal', (data) => {
    if (socketRef.current && socketRef.current.connected && data.type === 'answer') {
     socketRef.current.emit('call_answer', {
      call_id: callState.callId,
      caller_id: callState.contact.id,
      answer: true,
      answerSDP: data
     });
     console.log('[Call] Answer sent');
    }
   });

   // NOW signal the offer after everything is set up
   if (callState.incomingOffer) {
    // Small delay to ensure peer is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    if (peerRef.current && !peerRef.current.destroyed) {
     try {
      peerRef.current.signal(callState.incomingOffer);
      console.log('[Call] ✅ Offer signaled');
     } catch (err) {
      console.error('[Call] ❌ Signal error:', err);
      throw err;
     }
    }
   }

   setCallState(prev => ({
    ...prev,
    localStream: stream,
    isIncoming: false
   }));

  } catch (error) {
   console.error('[Call] Answer failed:', error);
   setError('Failed to access camera/microphone');
   endCall();
  }
 };

 const endCall = () => {
  console.log('[Call] Ending call');
  stopRingtone();

  // Clean up all timeouts and intervals
  if (connectionTimeoutRef.current) {
   clearTimeout(connectionTimeoutRef.current);
  }
  if (iceRestartTimeoutRef.current) {
   clearTimeout(iceRestartTimeoutRef.current);
  }
  if (healthCheckIntervalRef.current) {
   clearInterval(healthCheckIntervalRef.current);
  }

  if (localStreamRef.current) {
   localStreamRef.current.getTracks().forEach(track => {
    track.stop();
    console.log('[Media] Stopped track:', track.kind);
   });
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

  reconnectAttemptsRef.current = 0;
  signalQueueRef.current = [];
  pendingCandidatesRef.current = [];
  isNegotiatingRef.current = false;

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
  console.log('[Screenshare] Starting to:', contact.username);

  try {
   const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
     cursor: "always",
     displaySurface: "monitor",
     frameRate: { ideal: 30, max: 60 }
    },
    audio: false
   });

   console.log('[Screenshare] Stream obtained:', stream.id);

   stream.getVideoTracks()[0].onended = () => {
    console.log('[Screenshare] User stopped sharing');
    endScreenshare();
   };

   if (screenshareLocalVideoRef.current) {
    screenshareLocalVideoRef.current.srcObject = stream;
    screenshareLocalVideoRef.current.muted = true;
    screenshareLocalVideoRef.current.autoplay = true;
    screenshareLocalVideoRef.current.playsInline = true;
    screenshareLocalVideoRef.current.play().catch(e => console.log('[Screenshare] Local play error:', e));
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

  } catch (error) {
   console.error('[Screenshare] Failed to start:', error);
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
   console.log('[Screenshare] Accepting from:', screenshareState.contact?.username);

   screensharePeerRef.current = createPeer(false, null, true);

   if (screenshareState.incomingOffer) {
    setTimeout(() => {
     if (screensharePeerRef.current && !screensharePeerRef.current.destroyed) {
      screensharePeerRef.current.signal(screenshareState.incomingOffer);
     }
    }, 500);
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
   console.error('[Screenshare] Accept failed:', error);
   setError('Failed to accept screenshare');
  }
 };

 const endScreenshare = () => {
  console.log('[Screenshare] Ending');

  // Clean up all timeouts and intervals
  if (connectionTimeoutRef.current) {
   clearTimeout(connectionTimeoutRef.current);
  }
  if (iceRestartTimeoutRef.current) {
   clearTimeout(iceRestartTimeoutRef.current);
  }
  if (healthCheckIntervalRef.current) {
   clearInterval(healthCheckIntervalRef.current);
  }

  if (screenshareState.localStream) {
   screenshareState.localStream.getTracks().forEach(track => {
    track.stop();
    console.log('[Screenshare] Stopped track:', track.kind);
   });
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

  reconnectAttemptsRef.current = 0;
  signalQueueRef.current = [];
  pendingCandidatesRef.current = [];
  isNegotiatingRef.current = false;

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

 // NUCLEAR: Cleanup on unmount
 useEffect(() => {
  return () => {
   console.log('[Cleanup] Component unmounting - cleaning everything');

   // Stop all streams
   if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => track.stop());
   }
   if (screenshareState.localStream) {
    screenshareState.localStream.getTracks().forEach(track => track.stop());
   }

   // Destroy all peers
   if (peerRef.current) {
    peerRef.current.destroy();
   }
   if (screensharePeerRef.current) {
    screensharePeerRef.current.destroy();
   }

   // Clear all timeouts/intervals
   if (connectionTimeoutRef.current) {
    clearTimeout(connectionTimeoutRef.current);
   }
   if (iceRestartTimeoutRef.current) {
    clearTimeout(iceRestartTimeoutRef.current);
   }
   if (healthCheckIntervalRef.current) {
    clearInterval(healthCheckIntervalRef.current);
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