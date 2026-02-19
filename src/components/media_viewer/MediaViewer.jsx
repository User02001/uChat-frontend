import React, { useState, useRef, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { API_BASE_URL } from "../../config";
import { MediaViewerStyles as styles } from "../../styles/media_viewer";
import VideoPlayer from "./VideoPlayer";

const MediaViewer = ({ media, onClose, initialTime = 0, autoplay = false }) => {
 const [scale, setScale] = useState(1);
 const [position, setPosition] = useState({ x: 0, y: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [isDownloading, setIsDownloading] = useState(false);
 const [showHeader, setShowHeader] = useState(true);

 const containerRef = useRef(null);
 const overlayRef = useRef(null);
 const audioRef = useRef(null);
 const headerTimeoutRef = useRef(null);
 const videoPlayerRef = useRef(null);

 const mediaUrl = media.isBlob || media.url.startsWith("blob:") || media.url.startsWith("http") ? media.url : `${API_BASE_URL}${media.url}`;
 const isVideo = media.type === "video" || /\.(mp4|webm|ogg|mov)$/i.test(media.url);
 const isAudio = media.type === "audio" || /\.(mp3|wav|ogg|m4a|aac)$/i.test(media.url);
 const isImage = !isVideo && !isAudio;

 const handleClose = () => {
  if (overlayRef.current) {
   overlayRef.current.style.transition = "opacity 0.3s ease";
   overlayRef.current.style.opacity = "0";
  }

  setTimeout(() => {
   if (isVideo && videoPlayerRef.current) {
    const currentTime = videoPlayerRef.current.getCurrentTime();
    const isPlaying = videoPlayerRef.current.isPlaying();
    if (media.onReturn) {
     media.onReturn(currentTime, isPlaying);
    }
   }
   onClose();
  }, 300);
 };

 useEffect(() => {
  const handleKeyDown = (e) => {
   if (e.key === "Escape") handleClose();
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
 }, [onClose]);

 const handleMouseMove = () => {
  setShowHeader(true);
  if (headerTimeoutRef.current) {
   clearTimeout(headerTimeoutRef.current);
  }
  if (isVideo || isAudio) {
   headerTimeoutRef.current = setTimeout(() => {
    setShowHeader(false);
   }, 3000);
  }
 };

 const handleWheel = (e) => {
  if (!isImage) return;
  e.preventDefault();
  const delta = e.deltaY * -0.01;
  const newScale = Math.min(Math.max(0.5, scale + delta), 5);
  setScale(newScale);
 };

 const handleMouseDown = (e) => {
  if (!isImage || scale <= 1) return;
  setIsDragging(true);
  setDragStart({
   x: e.clientX - position.x,
   y: e.clientY - position.y,
  });
 };

 const handleMouseMove2 = (e) => {
  if (!isDragging) return;
  setPosition({
   x: e.clientX - dragStart.x,
   y: e.clientY - dragStart.y,
  });
 };

 const handleMouseUp = () => {
  setIsDragging(false);
 };

 const handleTouchStart = (e) => {
  if (!isImage || scale <= 1) return;
  const touch = e.touches[0];
  setIsDragging(true);
  setDragStart({
   x: touch.clientX - position.x,
   y: touch.clientY - position.y,
  });
 };

 const handleTouchMove = (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  setPosition({
   x: touch.clientX - dragStart.x,
   y: touch.clientY - dragStart.y,
  });
 };

 const handleTouchEnd = () => {
  setIsDragging(false);
 };

 const handleZoomIn = () => {
  setScale((prev) => Math.min(prev + 0.5, 5));
 };

 const handleZoomOut = () => {
  const newScale = Math.max(scale - 0.5, 0.5);
  setScale(newScale);
  if (newScale <= 1) {
   setPosition({ x: 0, y: 0 });
  }
 };

 const handleReset = () => {
  setScale(1);
  setPosition({ x: 0, y: 0 });
 };

 const handleDownload = async () => {
  setIsDownloading(true);
  try {
   const { generateDeviceFingerprint } = await import('../../utils/deviceFingerprint');
   const response = await fetch(mediaUrl, {
    credentials: 'include',
    headers: { 'X-Device-Fingerprint': generateDeviceFingerprint() }
   });
   const blob = await response.blob();
   const url = window.URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = media.name || `download.${media.type}`;
   document.body.appendChild(a);
   a.click();
   window.URL.revokeObjectURL(url);
   document.body.removeChild(a);
  } catch (error) {
   console.error("Download failed:", error);
  } finally {
   setIsDownloading(false);
  }
 };

 useEffect(() => {
  if (isDragging) {
   window.addEventListener("mousemove", handleMouseMove2);
   window.addEventListener("mouseup", handleMouseUp);
   window.addEventListener("touchmove", handleTouchMove);
   window.addEventListener("touchend", handleTouchEnd);

   return () => {
    window.removeEventListener("mousemove", handleMouseMove2);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
   };
  }
 }, [isDragging, dragStart]);

 return (
  <div
   ref={overlayRef}
   {...stylex.props(styles.mediaViewerOverlay)}
   onClick={handleClose}
   onMouseMove={handleMouseMove}
  >
   <div
    {...stylex.props(styles.mediaViewerContainer)}
    onClick={(e) => e.stopPropagation()}
   >
    <div
     {...stylex.props(
      styles.mediaViewerHeader,
      showHeader && styles.mediaViewerHeaderVisible
     )}
    >
     <div {...stylex.props(styles.mediaViewerTitle)}>{media.name || "Media"}</div>

     <div {...stylex.props(styles.mediaViewerActions)}>
      {isImage && (
       <>
        <button
         {...stylex.props(styles.mediaViewerBtn)}
         onClick={handleZoomOut}
         disabled={scale <= 0.5}
         title="Zoom out"
         type="button"
        >
         <i className="fas fa-search-minus"></i>
        </button>
        <button
         {...stylex.props(styles.mediaViewerBtn)}
         onClick={handleZoomIn}
         disabled={scale >= 5}
         title="Zoom in"
         type="button"
        >
         <i className="fas fa-search-plus"></i>
        </button>
        <button
         {...stylex.props(styles.mediaViewerBtn)}
         onClick={handleReset}
         disabled={scale === 1 && position.x === 0 && position.y === 0}
         title="Reset zoom"
         type="button"
        >
         <i className="fas fa-undo"></i>
        </button>
       </>
      )}

      <button
       {...stylex.props(styles.mediaViewerBtn)}
       onClick={handleDownload}
       disabled={isDownloading}
       title="Download"
       type="button"
      >
       {isDownloading ? (
        <i className="fas fa-spinner fa-spin"></i>
       ) : (
        <i className="fas fa-download"></i>
       )}
      </button>

      <button
       {...stylex.props(styles.mediaViewerBtnClose)}
       onClick={handleClose}
       title="Close"
       type="button"
      >
       <i className="fas fa-times"></i>
      </button>
     </div>
    </div>

    <div
     {...stylex.props(styles.mediaViewerContent)}
     ref={containerRef}
     onWheel={handleWheel}
     onMouseDown={handleMouseDown}
     onTouchStart={handleTouchStart}
    >
     {isVideo && (
      <div {...stylex.props(styles.mediaViewerVideoWrapper)}>
       <VideoPlayer
        ref={videoPlayerRef}
        src={mediaUrl}
        inChat={false}
        initialTime={initialTime}
        autoplay={autoplay}
       />
      </div>
     )}

     {isAudio && (
      <div {...stylex.props(styles.mediaViewerAudioWrapper)}>
       <div {...stylex.props(styles.mediaViewerAudioIcon)}>
        <i className="fas fa-music"></i>
       </div>

       <div {...stylex.props(styles.mediaViewerAudioInfo)}>
        <h3 {...stylex.props(styles.mediaViewerAudioInfoTitle)}>
         {media.name || "Audio File"}
        </h3>
        <p {...stylex.props(styles.mediaViewerAudioInfoSubtitle)}>Playing audio...</p>
       </div>

       <audio
        ref={audioRef}
        src={mediaUrl}
        controls
        autoPlay
        {...stylex.props(styles.mediaViewerAudio)}
       />
      </div>
     )}

     {isImage && (
      <div
       {...stylex.props(styles.mediaViewerImageWrapper)}
       style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
       <img
        src={mediaUrl}
        alt={media.name || "Media"}
        {...stylex.props(styles.mediaViewerImage)}
        style={{
         transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
         cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default",
        }}
        draggable={false}
       />
      </div>
     )}
    </div>

    {isImage && scale > 1 && (
     <div {...stylex.props(styles.mediaViewerZoomIndicator)}>
      {Math.round(scale * 100)}%
     </div>
    )}
   </div>
  </div>
 );
};

export default MediaViewer;
