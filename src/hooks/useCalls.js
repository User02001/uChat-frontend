import { useState, useRef, useCallback } from 'react';
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

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

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
      stream
    });

    peer.on('signal', (data) => {
      console.log('Peer signal:', data);
     if (socketRef.current) {
      socketRef.current.emit('webrtc_signal', {
        target_id: callState.contact?.id,
        signal: data
      });
     }
    });

   peer.on('stream', (remoteStream) => {
    console.log('Got remote stream, setting up video element');

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
      console.log('Setting remote video srcObject');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(e => {
       console.log('Remote video play error:', e);
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
      console.log('Peer connection closed');
      endCall();
    });

    return peer;
  };

  // Setup socket listeners
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('incoming_call', (data) => {
      console.log('Incoming call:', data);
      setCallState(prev => ({
        ...prev,
        isIncoming: true,
        contact: data.caller,
        type: data.type,
        incomingOffer: data.offer
      }));
    });

    socket.on('call_accepted', (data) => {
      console.log('Call accepted:', data);
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

    socket.on('webrtc_signal', (data) => {
      console.log('Received WebRTC signal:', data);
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(data.signal);
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
  }, [socketRef, callState.contact]);

  // Start call
  const startCall = async (contact, type) => {
    try {
      console.log('Starting call with', contact.username);

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

     peerRef.current = createPeer(false, stream);

     // ADD THIS LINE:
     console.log('Created receiver peer, waiting for remote stream...');

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
    console.log('Ending call');

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
    startCall,
    answerCall,
    endCall,
    setupSocketListeners
  };
};

export default useCalls;