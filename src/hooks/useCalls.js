import { useState, useRef, useCallback } from 'react';

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

 const [peerConnection, setPeerConnection] = useState(null);
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const pendingIceCandidates = useRef([]);
 const remoteVideoSetup = useRef(false); // Prevent duplicate setup

 const pcConfig = {
  iceServers: [
   { urls: 'stun:stun.l.google.com:19302' },
   { urls: 'stun:stun1.l.google.com:19302' }
  ]
 };

 // Simple function to set up local video
 const setupLocalVideo = (stream) => {
  if (localVideoRef.current) {
   localVideoRef.current.srcObject = stream;
   localVideoRef.current.muted = true;
   localVideoRef.current.play().catch(console.log);
   console.log('Local video set up');
  }
 };

 // Simple function to set up remote video
 const setupRemoteVideo = async (stream) => {
  console.log('Setting up remote video...');

  if (remoteVideoSetup.current) {
   console.log('Remote video already being set up, skipping duplicate');
   return;
  }

  remoteVideoSetup.current = true;

  // Wait for the video element to be available
  let attempts = 0;
  while (!remoteVideoRef.current && attempts < 30) {
   await new Promise(resolve => setTimeout(resolve, 100));
   attempts++;
  }

  if (remoteVideoRef.current) {
   const video = remoteVideoRef.current;
   video.srcObject = stream;
   video.autoplay = true;
   video.playsInline = true;
   video.muted = false; // We want to hear the remote person

   console.log('Remote video element configured, attempting play...');

   const playPromise = video.play();
   if (playPromise !== undefined) {
    playPromise
     .then(() => {
      console.log('Remote video playing successfully');
     })
     .catch(error => {
      console.log('Remote video autoplay failed, setting up click handler');
      // FORCE UNMUTE AND RETRY
      video.muted = false;
      video.volume = 1.0;

      // Set up click handler for user interaction
      const playOnClick = async () => {
       console.log('CLICK DETECTED - Attempting to play remote video');
       try {
        video.muted = false;
        await video.play();
        console.log('SUCCESS: Remote video started after click');
        document.removeEventListener('click', playOnClick);
        document.removeEventListener('touchstart', playOnClick);
        document.removeEventListener('keydown', playOnClick);
       } catch (e) {
        console.error('FAILED: Still cannot play remote video after click:', e);
       }
      };

      document.addEventListener('click', playOnClick);
      document.addEventListener('touchstart', playOnClick);
      document.addEventListener('keydown', playOnClick);
      console.log('>>> CLICK, TOUCH, OR PRESS ANY KEY TO START REMOTE VIDEO <<<');
     });
   }
  } else {
   console.log('Remote video element not available after waiting');
   remoteVideoSetup.current = false;
  }
 };

 // Setup socket listeners
 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  socket.on('incoming_call', (data) => {
   console.log('Incoming call:', data);
   remoteVideoSetup.current = false; // Reset for new call
   setCallState(prev => ({
    ...prev,
    isIncoming: true,
    contact: data.caller,
    type: data.type,
    incomingOffer: data.offer
   }));
  });

  socket.on('call_accepted', async (data) => {
   console.log('Call accepted:', data);
   if (peerConnection && data.answerSDP) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answerSDP));
    await processPendingIceCandidates(peerConnection);
   }
   setCallState(prev => ({
    ...prev,
    isActive: true,
    isOutgoing: false
   }));
  });

  socket.on('call_rejected', () => {
   console.log('Call rejected');
   endCall();
  });

  socket.on('webrtc_signal', async (data) => {
   if (data.signal.ice) {
    if (peerConnection && peerConnection.remoteDescription) {
     await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal.ice));
    } else {
     pendingIceCandidates.current.push(data.signal.ice);
    }
   }
  });

  socket.on('call_ended', () => {
   console.log('Call ended');
   endCall();
  });

  return () => {
   socket.off('incoming_call');
   socket.off('call_accepted');
   socket.off('call_rejected');
   socket.off('webrtc_signal');
   socket.off('call_ended');
  };
 }, [socketRef]);

 // Start a call
 const startCall = async (contact, type) => {
  try {
   console.log('Starting call with', contact.username);

   const stream = await navigator.mediaDevices.getUserMedia({
    video: type === 'video',
    audio: true
   });

   const pc = new RTCPeerConnection(pcConfig);
   setPeerConnection(pc);

   // Add local stream
   stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
   });

   // Handle ICE candidates
   pc.onicecandidate = (event) => {
    if (event.candidate && socketRef.current) {
     socketRef.current.emit('webrtc_signal', {
      target_id: contact.id,
      signal: { ice: event.candidate }
     });
    }
   };

   // Handle remote stream - SIMPLE approach
   pc.ontrack = async (event) => {
    const [remoteStream] = event.streams;
    console.log('Got remote stream');
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isOutgoing: false
    }));
    // Add delay to ensure React has time to render the video element
    setTimeout(() => setupRemoteVideo(remoteStream), 100);
   };

   // Create offer
   const offer = await pc.createOffer();
   await pc.setLocalDescription(offer);

   // Update state
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

   // Set up local video
   setupLocalVideo(stream);

   // Send offer
   socketRef.current.emit('call_initiate', {
    receiver_id: contact.id,
    type,
    offer
   });

  } catch (error) {
   console.error('Failed to start call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 // Answer a call
 const answerCall = async (accept) => {
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
   console.log('Answering call');

   const stream = await navigator.mediaDevices.getUserMedia({
    video: callState.type === 'video',
    audio: true
   });

   const pc = new RTCPeerConnection(pcConfig);
   setPeerConnection(pc);

   // Add local stream
   stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
   });

   // Handle ICE candidates
   pc.onicecandidate = (event) => {
    if (event.candidate && socketRef.current) {
     socketRef.current.emit('webrtc_signal', {
      target_id: callState.contact.id,
      signal: { ice: event.candidate }
     });
    }
   };

   // Handle remote stream - SIMPLE approach
   pc.ontrack = async (event) => {
    const [remoteStream] = event.streams;
    console.log('Got remote stream in answer');
    setCallState(prev => ({
     ...prev,
     remoteStream,
     isActive: true,
     isIncoming: false
    }));
    // Add delay to ensure React has time to render the video element
    setTimeout(() => setupRemoteVideo(remoteStream), 100);
   };

   // Set remote description
   await pc.setRemoteDescription(new RTCSessionDescription(callState.incomingOffer));

   // Create answer
   const answer = await pc.createAnswer();
   await pc.setLocalDescription(answer);

   // Process pending ICE candidates
   await processPendingIceCandidates(pc);

   // Update state
   setCallState(prev => ({
    ...prev,
    localStream: stream
   }));

   // Set up local video
   setupLocalVideo(stream);

   // Send answer
   socketRef.current.emit('call_answer', {
    caller_id: callState.contact.id,
    answer: true,
    answerSDP: answer
   });

  } catch (error) {
   console.error('Failed to answer call:', error);
   setError('Failed to access camera/microphone');
  }
 };

 // Process pending ICE candidates
 const processPendingIceCandidates = async (pc) => {
  for (const candidate of pendingIceCandidates.current) {
   try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
   } catch (error) {
    console.error('Error adding ICE candidate:', error);
   }
  }
  pendingIceCandidates.current = [];
 };

 // End call
 const endCall = () => {
  console.log('Ending call');

  remoteVideoSetup.current = false; // Reset flag

  if (callState.localStream) {
   callState.localStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
   peerConnection.close();
   setPeerConnection(null);
  }

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

  pendingIceCandidates.current = [];

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
  startCall,
  answerCall,
  endCall,
  setupSocketListeners
 };
};

export default useCalls;