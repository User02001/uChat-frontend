import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ src, inChat = false, onExpand }) => {
 const [isPlaying, setIsPlaying] = useState(false);
 const [hasStarted, setHasStarted] = useState(false);
 const [currentTime, setCurrentTime] = useState(0);
 const [duration, setDuration] = useState(0);
 const [volume, setVolume] = useState(1);
 const [isMuted, setIsMuted] = useState(false);
 const [showControls, setShowControls] = useState(!inChat);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [isSeeking, setIsSeeking] = useState(false);
 const [showCursor, setShowCursor] = useState(true);
 const videoRef = useRef(null);
 const containerRef = useRef(null);
 const controlsTimeoutRef = useRef(null);
 const progressAnimationRef = useRef(null);

 useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const updateProgress = () => {
   setCurrentTime(video.currentTime);
   if (!video.paused) {
    progressAnimationRef.current = requestAnimationFrame(updateProgress);
   }
  };

  const handleLoadedMetadata = () => setDuration(video.duration);
  const handleEnded = () => {
   setIsPlaying(false);
   cancelAnimationFrame(progressAnimationRef.current);
  };

  const handlePlay = () => {
   setIsPlaying(true);
   setHasStarted(true);
   updateProgress();
  };

  const handlePause = () => {
   setIsPlaying(false);
   cancelAnimationFrame(progressAnimationRef.current);
  };

  video.addEventListener('loadedmetadata', handleLoadedMetadata);
  video.addEventListener('ended', handleEnded);
  video.addEventListener('play', handlePlay);
  video.addEventListener('pause', handlePause);

  return () => {
   video.removeEventListener('loadedmetadata', handleLoadedMetadata);
   video.removeEventListener('ended', handleEnded);
   video.removeEventListener('play', handlePlay);
   video.removeEventListener('pause', handlePause);
   if (progressAnimationRef.current) {
    cancelAnimationFrame(progressAnimationRef.current);
   }
  };
 }, []);

 useEffect(() => {
  const handleFullscreenChange = () => {
   setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
 }, []);

 useEffect(() => {
  if (!isSeeking) return;

  const progressBar = containerRef.current?.querySelector(`.${styles.videoPlayerProgressBar}`);
  if (!progressBar) return;

  const handleMove = (e) => {
   const rect = progressBar.getBoundingClientRect();
   const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
   const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
   const newTime = pos * duration;
   setCurrentTime(newTime);
  };

  const handleEnd = (e) => {
   const rect = progressBar.getBoundingClientRect();
   const clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
   const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
   const newTime = pos * duration;
   videoRef.current.currentTime = newTime;
   setCurrentTime(newTime);
   setIsSeeking(false);
   if (isPlaying) {
    videoRef.current.play();
   }
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove);
  window.addEventListener('touchend', handleEnd);

  return () => {
   window.removeEventListener('mousemove', handleMove);
   window.removeEventListener('mouseup', handleEnd);
   window.removeEventListener('touchmove', handleMove);
   window.removeEventListener('touchend', handleEnd);
  };
 }, [isSeeking, duration]);

 const togglePlay = () => {
  if (videoRef.current.paused) {
   videoRef.current.play();
   if (inChat) {
    setShowControls(true);
   }
  } else {
   videoRef.current.pause();
  }
 };

 const getSeekPosition = (e, element) => {
  const rect = element.getBoundingClientRect();
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  return pos * duration;
 };

 const handleSeek = (e) => {
  if (isSeeking) return;
  const newTime = getSeekPosition(e, e.currentTarget);
  videoRef.current.currentTime = newTime;
  setCurrentTime(newTime);
 };

 const handleSeekStart = (e) => {
  e.preventDefault();
  setIsSeeking(true);
  if (!videoRef.current.paused) {
   videoRef.current.pause();
  }
  const newTime = getSeekPosition(e, e.currentTarget);
  setCurrentTime(newTime);
 };

 const handleVolumeChange = (e) => {
  const newVolume = parseFloat(e.target.value);
  setVolume(newVolume);
  videoRef.current.volume = newVolume;
  setIsMuted(newVolume === 0);
 };

 const toggleMute = () => {
  if (isMuted) {
   videoRef.current.volume = volume || 0.5;
   setVolume(volume || 0.5);
   setIsMuted(false);
  } else {
   videoRef.current.volume = 0;
   setIsMuted(true);
  }
 };

 const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
   await containerRef.current.requestFullscreen();
  } else {
   await document.exitFullscreen();
  }
 };

 const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 };

 const handleMouseMove = () => {
  setShowControls(true);
  setShowCursor(true);
  if (controlsTimeoutRef.current) {
   clearTimeout(controlsTimeoutRef.current);
  }
  if (isPlaying) {
   controlsTimeoutRef.current = setTimeout(() => {
    setShowControls(false);
    setShowCursor(false);
   }, 3000);
  }
 };

 const handleVideoClick = () => {
  if (inChat) {
   const newShowControls = !showControls;
   setShowControls(newShowControls);
   setShowCursor(newShowControls);
   if (controlsTimeoutRef.current) {
    clearTimeout(controlsTimeoutRef.current);
   }
   if (newShowControls && isPlaying) {
    controlsTimeoutRef.current = setTimeout(() => {
     setShowControls(false);
     setShowCursor(false);
    }, 3000);
   }
  } else {
   togglePlay();
  }
 };

 return (
  <div
   ref={containerRef}
   className={`${styles.videoPlayerContainer} ${inChat ? styles.videoPlayerInChat : ''}`}
   onMouseMove={handleMouseMove}
   style={{ cursor: showCursor ? 'default' : 'none' }}
  >
   <video
    ref={videoRef}
    src={src}
    className={styles.videoPlayerVideo}
    onClick={handleVideoClick}
    playsInline
   />

   {!hasStarted && (
    <div className={styles.videoPlayerPlayOverlay} onClick={togglePlay}>
     <div className={styles.videoPlayerPlayButton}>
      <i className="fas fa-play"></i>
     </div>
    </div>
   )}

   <div
    className={`${styles.videoPlayerControls} ${(showControls || !isPlaying) && (inChat ? hasStarted : true) ? styles.videoPlayerControlsVisible : ''
     }`}
   >
    <div
     className={styles.videoPlayerProgressBar}
     onClick={handleSeek}
     onMouseDown={handleSeekStart}
     onTouchStart={handleSeekStart}
    >
     <div
      className={styles.videoPlayerProgress}
      style={{ width: `${(currentTime / duration) * 100}%` }}
     >
      <div className={styles.videoPlayerProgressThumb}></div>
     </div>
    </div>

    <div className={styles.videoPlayerControlsBottom}>
     <div className={styles.videoPlayerControlsLeft}>
      <button className={styles.videoPlayerBtn} onClick={togglePlay}>
       <i title="Play" className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
      </button>

      <div className={styles.videoPlayerVolumeControl}>
       <button className={styles.videoPlayerBtn} onClick={toggleMute}>
        <i
         title="Volume Control"
         className={`fas fa-volume-${isMuted || volume === 0 ? 'mute' : volume < 0.5 ? 'down' : 'up'
          }`}
        ></i>
       </button>
       <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className={styles.videoPlayerVolumeSlider}
       />
      </div>

      <div className={styles.videoPlayerTime}>
       {formatTime(currentTime)} / {formatTime(duration)}
      </div>
     </div>

     <div className={styles.videoPlayerControlsRight}>
      {inChat && onExpand && (
       <button
        className={styles.videoPlayerBtn}
        onClick={onExpand}
        title="Expand"
       >
        <i className="fas fa-expand"></i>
       </button>
      )}
      {!inChat && (
       <button
        className={styles.videoPlayerBtn}
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
       >
        <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
       </button>
      )}
     </div>
    </div>
   </div>
  </div>
 );
};

export default VideoPlayer;