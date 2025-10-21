import { useState, useRef, useCallback, useEffect } from "react";
import * as LiveKit from "livekit-client";
import { API_BASE_URL } from "../config";

const LIVEKIT_WS = "wss://livekit.ufonic.xyz"; // your hosted LiveKit

const useCalls = (socketRef, setError) => {
 // ---------------- STATE ----------------
 const [callState, setCallState] = useState({
  isActive: false,
  isIncoming: false,
  isOutgoing: false,
  type: null,            // "audio" | "video"
  contact: null,         // { id, username, ... }
  localStream: null,     // MediaStream
  remoteStream: null,    // MediaStream
  callId: null
 });

 const [screenshareState, setScreenshareState] = useState({
  isActive: false,
  isSharing: false,
  isViewing: false,
  isIncoming: false,     // kept for API compatibility
  contact: null,
  localStream: null,
  remoteStream: null
 });

 const [audioEnabled, setAudioEnabled] = useState(false);
 const [ringtoneInitialized, setRingtoneInitialized] = useState(false);

 // ---------------- REFS ----------------
 const localVideoRef = useRef(null);
 const remoteVideoRef = useRef(null);
 const ringtoneRef = useRef(null);

 const screenshareLocalVideoRef = useRef(null);
 const screenshareRemoteVideoRef = useRef(null);

 const roomRef = useRef(null);
 const localMicRef = useRef(null);
 const localCamRef = useRef(null);
 const localScreenRef = useRef(null);
 const myUserIdRef = useRef(null);

 // ---------------- HELPERS ----------------
 useEffect(() => {
  (async () => {
   try {
    const r = await fetch(`${API_BASE_URL}/api/me`, { credentials: "include" });
    if (r.ok) {
     const data = await r.json();
     myUserIdRef.current = data?.user?.id ?? null;
    }
   } catch { }
  })();
 }, []);

 const pairRoomName = useCallback((otherId) => {
  const me = Number(myUserIdRef.current);
  const you = Number(otherId);
  if (Number.isFinite(me) && Number.isFinite(you)) {
   return `call_${Math.min(me, you)}_${Math.max(me, you)}`;
  }
  return `call_${otherId}`;
 }, []);

 const enableAudio = useCallback(async () => {
  if (audioEnabled) return true;
  try {
   const AC = window.AudioContext || window.webkitAudioContext;
   if (AC) {
    const ctx = new AC();
    if (ctx.state === "suspended") await ctx.resume();
   }
   if (ringtoneRef.current && !ringtoneInitialized) {
    ringtoneRef.current.volume = 0;
    ringtoneRef.current.muted = true;
    setRingtoneInitialized(true);
   }
   setAudioEnabled(true);
   return true;
  } catch {
   return false;
  }
 }, [audioEnabled, ringtoneInitialized]);

 const playRingtone = useCallback(async () => {
  if (!ringtoneRef.current || !audioEnabled) return;
  try {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
   ringtoneRef.current.muted = false;
   ringtoneRef.current.loop = true;
   ringtoneRef.current.volume = 0.7;
   await ringtoneRef.current.play();
  } catch {
   setError?.("Incoming call (audio blocked by browser)");
   setTimeout(() => setError?.(""), 2200);
  }
 }, [audioEnabled, setError]);

 const stopRingtone = useCallback(() => {
  if (ringtoneRef.current) {
   ringtoneRef.current.pause();
   ringtoneRef.current.currentTime = 0;
  }
 }, []);

 const attachStreamToVideo = (el, stream, mirror = false) => {
  if (!el) return;
  el.srcObject = stream || null;
  el.autoplay = true;
  el.playsInline = true;
  el.muted = mirror; // mute local
  el.style.transform = mirror ? "scaleX(-1)" : "none";
  el.play?.().catch(() => { });
 };

 const setLocalMediaStream = (tracks) => {
  const mediaTracks = tracks
   .filter(Boolean)
   .map((t) => t.mediaStreamTrack)
   .filter(Boolean);
  if (mediaTracks.length) {
   const ms = new MediaStream(mediaTracks);
   setCallState((p) => ({ ...p, localStream: ms }));
   attachStreamToVideo(localVideoRef.current, ms, true);
  }
 };

 const setRemoteMediaStream = (mediaStreamTrack) => {
  const ms = new MediaStream([mediaStreamTrack]);
  setCallState((p) => ({ ...p, remoteStream: ms }));
  attachStreamToVideo(remoteVideoRef.current, ms, false);
 };

 const cleanupLocalTracks = () => {
  [localMicRef.current, localCamRef.current, localScreenRef.current]
   .filter(Boolean)
   .forEach((t) => {
    try { roomRef.current?.localParticipant.unpublishTrack(t); } catch { }
    try { t.stop(); } catch { }
   });
  localMicRef.current = null;
  localCamRef.current = null;
  localScreenRef.current = null;
 };

 const disconnectRoom = () => {
  try { cleanupLocalTracks(); } catch { }
  try { roomRef.current?.disconnect(); } catch { }
  roomRef.current = null;
 };

 const fetchToken = async (roomName) => {
  const r = await fetch(
   `${API_BASE_URL}/api/livekit/token?room=${encodeURIComponent(roomName)}`,
   { credentials: "include" }
  );
  if (!r.ok) throw new Error("Failed to fetch LiveKit token");
  const { token } = await r.json();
  return token;
 };

 const wireRoomEvents = (room) => {
  room
   .on(LiveKit.RoomEvent.TrackSubscribed, (track, pub, participant) => {
    if (track.kind === "video" && pub.source !== LiveKit.Track.Source.ScreenShare) {
     setRemoteMediaStream(track.mediaStreamTrack);
    }
    if (pub.source === LiveKit.Track.Source.ScreenShare) {
     const ms = new MediaStream([track.mediaStreamTrack]);
     setScreenshareState((p) => ({
      ...p,
      isActive: true,
      isViewing: true,
      remoteStream: ms
     }));
     attachStreamToVideo(screenshareRemoteVideoRef.current, ms, false);
    }
   })
   .on(LiveKit.RoomEvent.TrackUnsubscribed, (track, pub) => {
    if (pub.source === LiveKit.Track.Source.ScreenShare) {
     setScreenshareState((p) => ({
      ...p,
      isViewing: false,
      remoteStream: null
     }));
     attachStreamToVideo(screenshareRemoteVideoRef.current, null, false);
    }
   })
   .on(LiveKit.RoomEvent.ParticipantDisconnected, () => {
    endCall();
   })
   .on(LiveKit.RoomEvent.Disconnected, () => {
    endCall();
   });
 };

 const connectAndPublish = async (contactId, type) => {
  const roomName = pairRoomName(contactId);
  const token = await fetchToken(roomName);

  const room = await LiveKit.connect(LIVEKIT_WS, token);
  roomRef.current = room;
  wireRoomEvents(room);

  // Mic
  const mic = await LiveKit.createLocalAudioTrack();
  await room.localParticipant.publishTrack(mic);
  localMicRef.current = mic;

  // Camera if video call
  let cam = null;
  if (type === "video") {
   cam = await LiveKit.createLocalVideoTrack();
   await room.localParticipant.publishTrack(cam);
   localCamRef.current = cam;
  }

  setLocalMediaStream([mic, cam].filter(Boolean));

  setCallState((p) => ({
   ...p,
   isActive: true,
   isIncoming: false,
   isOutgoing: false
  }));
 };

 // ---------------- SOCKET GLUE ----------------
 const setupSocketListeners = useCallback(() => {
  if (!socketRef.current) return;
  const socket = socketRef.current;

  // Callee side: someone rings you
  socket.on("new user", async (data) => {
   stopRingtone();
   await playRingtone();
   setCallState((p) => ({
    ...p,
    isIncoming: true,
    isOutgoing: false,
    type: data?.type || "video",
    contact: data?.contact || { id: data?.socketId },
    callId: data?.call_id || null
   }));
  });

  // Caller side: callee accepted -> start LiveKit
  socket.on("newUserStart", async () => {
   stopRingtone();
   try {
    if (!callState.contact) return;
    await connectAndPublish(callState.contact.id, callState.type || "video");
    setCallState((p) => ({ ...p, isOutgoing: false }));
   } catch {
    setError?.("Failed to start call");
    endCall();
   }
  });

  socket.on("call_rejected", () => {
   stopRingtone();
   endCall();
  });

  socket.on("call_ended", () => {
   stopRingtone();
   endCall();
  });

  // Back-compat with older names if present backend-side
  socket.on("incoming_call", (data) => {
   stopRingtone();
   playRingtone();
   setCallState((p) => ({
    ...p,
    isIncoming: true,
    contact: data.caller,
    type: data.type,
    callId: data.call_id
   }));
  });

  socket.on("call_accepted", async (data) => {
   stopRingtone();
   try {
    if (!callState.contact) return;
    await connectAndPublish(callState.contact.id, callState.type || "video");
    setCallState((p) => ({ ...p, isOutgoing: false, callId: data?.call_id || p.callId }));
   } catch {
    setError?.("Failed to start call");
    endCall();
   }
  });

  return () => {
   socket.off("new user");
   socket.off("newUserStart");
   socket.off("call_rejected");
   socket.off("call_ended");
   socket.off("incoming_call");
   socket.off("call_accepted");
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [socketRef, callState.contact, callState.type, playRingtone, stopRingtone]);

 // ---------------- PUBLIC API ----------------
 const startCall = async (contact, type) => {
  try {
   const ok = await enableAudio();
   if (!ok) {
    setError?.("Tap/click once to enable audio, then try again");
    return;
   }

   setCallState({
    isActive: false,
    isIncoming: false,
    isOutgoing: true,
    type,
    contact,
    localStream: null,
    remoteStream: null,
    callId: null
   });

   // ring callee; we connect to LiveKit after they accept
   socketRef.current?.emit("call_initiate", {
    receiver_id: contact.id,
    type
   });
  } catch {
   setError?.("Failed to initiate call");
   endCall();
  }
 };

 const answerCall = async (accept = true) => {
  if (!callState.isIncoming || !callState.contact) return;
  stopRingtone();

  socketRef.current?.emit("call_answer", {
   call_id: callState.callId,
   caller_id: callState.contact.id,
   answer: !!accept
  });

  if (!accept) {
   endCall();
   return;
  }

  try {
   await connectAndPublish(callState.contact.id, callState.type || "video");
  } catch {
   setError?.("Failed to join call");
   endCall();
  }
 };

 const endCall = () => {
  try {
   if (callState.contact && socketRef.current) {
    socketRef.current.emit("call_end", {
     call_id: callState.callId,
     target_id: callState.contact.id
    });
   }
  } catch { }

  disconnectRoom();

  attachStreamToVideo(localVideoRef.current, null, true);
  attachStreamToVideo(remoteVideoRef.current, null, false);

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

 // ---------------- SCREENSHARE ----------------
 const startScreenshare = async (contact) => {
  try {
   const targetId = contact?.id ?? callState.contact?.id;
   if (!targetId) {
    setError?.("No target to screenshare with");
    return;
   }
   if (!roomRef.current) {
    await connectAndPublish(targetId, "video");
   }
   const [screenTrack] = await LiveKit.createLocalScreenTracks({ audio: false });
   await roomRef.current.localParticipant.publishTrack(screenTrack);
   localScreenRef.current = screenTrack;

   const ms = new MediaStream([screenTrack.mediaStreamTrack]);
   setScreenshareState((p) => ({
    ...p,
    isActive: true,
    isSharing: true,
    contact: contact || p.contact || callState.contact,
    localStream: ms
   }));
   attachStreamToVideo(screenshareLocalVideoRef.current, ms, false);
  } catch {
   setError?.("Failed to start screenshare");
  }
 };

 // kept for API compatibility (LiveKit auto-subscribes when sharer publishes)
 const answerScreenshare = async () => { };

 const endScreenshare = () => {
  try {
   if (localScreenRef.current) {
    try { roomRef.current?.localParticipant.unpublishTrack(localScreenRef.current); } catch { }
    try { localScreenRef.current.stop(); } catch { }
    localScreenRef.current = null;
   }
  } catch { }

  attachStreamToVideo(screenshareLocalVideoRef.current, null, false);
  attachStreamToVideo(screenshareRemoteVideoRef.current, null, false);

  setScreenshareState({
   isActive: false,
   isSharing: false,
   isViewing: false,
   isIncoming: false,
   contact: null,
   localStream: null,
   remoteStream: null
  });
 };

 // ---------------- RETURN ----------------
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
