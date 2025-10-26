import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import styles from './MediaViewer.module.css';
import VideoPlayer from './VideoPlayer';

const MediaViewer = ({ media, onClose }) => {
 const [scale, setScale] = useState(1);
 const [position, setPosition] = useState({ x: 0, y: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [isDownloading, setIsDownloading] = useState(false);
 const [showHeader, setShowHeader] = useState(true);
 const containerRef = useRef(null);
 const audioRef = useRef(null);
 const headerTimeoutRef = useRef(null);

 const mediaUrl = media.url.startsWith('http') ? media.url : `${API_BASE_URL}${media.url}`;
 const isVideo = media.type === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(media.url);
 const isAudio = media.type === 'audio' || /\.(mp3|wav|ogg|m4a|aac)$/i.test(media.url);
 const isImage = !isVideo && !isAudio;

 useEffect(() => {
  const handleKeyDown = (e) => {
   if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
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
   y: e.clientY - position.y
  });
 };

 const handleMouseMove2 = (e) => {
  if (!isDragging) return;
  setPosition({
   x: e.clientX - dragStart.x,
   y: e.clientY - dragStart.y
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
   y: touch.clientY - position.y
  });
 };

 const handleTouchMove = (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  setPosition({
   x: touch.clientX - dragStart.x,
   y: touch.clientY - dragStart.y
  });
 };

 const handleTouchEnd = () => {
  setIsDragging(false);
 };

 const handleZoomIn = () => {
  setScale(prev => Math.min(prev + 0.5, 5));
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
   const response = await fetch(mediaUrl);
   const blob = await response.blob();
   const url = window.URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = media.name || `download.${media.type}`;
   document.body.appendChild(a);
   a.click();
   window.URL.revokeObjectURL(url);
   document.body.removeChild(a);
  } catch (error) {
   console.error('Download failed:', error);
  } finally {
   setIsDownloading(false);
  }
 };

 useEffect(() => {
  if (isDragging) {
   window.addEventListener('mousemove', handleMouseMove2);
   window.addEventListener('mouseup', handleMouseUp);
   window.addEventListener('touchmove', handleTouchMove);
   window.addEventListener('touchend', handleTouchEnd);

   return () => {
    window.removeEventListener('mousemove', handleMouseMove2);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
   };
  }
 }, [isDragging, dragStart]);

 return (
  <div
   className={styles.mediaViewerOverlay}
   onClick={onClose}
   onMouseMove={handleMouseMove}
  >
   <div className={styles.mediaViewerContainer} onClick={(e) => e.stopPropagation()}>
    {/* Floating Header */}
    <div className={`${styles.mediaViewerHeader} ${showHeader ? styles.mediaViewerHeaderVisible : ''}`}>
     <div className={styles.mediaViewerTitle}>
      {media.name || 'Media'}
     </div>
     <div className={styles.mediaViewerActions}>
      {isImage && (
       <>
        <button
         className={styles.mediaViewerBtn}
         onClick={handleZoomOut}
         disabled={scale <= 0.5}
         title="Zoom out"
        >
         <i className="fas fa-search-minus"></i>
        </button>
        <button
         className={styles.mediaViewerBtn}
         onClick={handleZoomIn}
         disabled={scale >= 5}
         title="Zoom in"
        >
         <i className="fas fa-search-plus"></i>
        </button>
        <button
         className={styles.mediaViewerBtn}
         onClick={handleReset}
         disabled={scale === 1 && position.x === 0 && position.y === 0}
         title="Reset zoom"
        >
         <i className="fas fa-undo"></i>
        </button>
       </>
      )}
      <button
       className={styles.mediaViewerBtn}
       onClick={handleDownload}
       disabled={isDownloading}
       title="Download"
      >
       {isDownloading ? (
        <i className="fas fa-spinner fa-spin"></i>
       ) : (
        <i className="fas fa-download"></i>
       )}
      </button>
      <button
       className={styles.mediaViewerBtnClose}
       onClick={onClose}
       title="Close"
      >
       <i className="fas fa-times"></i>
      </button>
     </div>
    </div>

    <div
     className={styles.mediaViewerContent}
     ref={containerRef}
     onWheel={handleWheel}
     onMouseDown={handleMouseDown}
     onTouchStart={handleTouchStart}
    >
     {isVideo && (
      <div className={styles.mediaViewerVideoWrapper}>
       <VideoPlayer src={mediaUrl} inChat={false} />
      </div>
     )}

     {isAudio && (
      <div className={styles.mediaViewerAudioWrapper}>
       <div className={styles.mediaViewerAudioIcon}>
        <i className="fas fa-music"></i>
       </div>
       <div className={styles.mediaViewerAudioInfo}>
        <h3>{media.name || 'Audio File'}</h3>
        <p>Playing audio...</p>
       </div>
       <audio
        ref={audioRef}
        src={mediaUrl}
        controls
        autoPlay
        className={styles.mediaViewerAudio}
       />
      </div>
     )}

     {isImage && (
      <div
       className={styles.mediaViewerImageWrapper}
       style={{
        cursor: scale > 1 ? 'grab' : 'default'
       }}
      >
       <img
        src={mediaUrl}
        alt={media.name || 'Media'}
        className={styles.mediaViewerImage}
        style={{
         transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
         cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
        }}
        draggable={false}
       />
      </div>
     )}
    </div>

    {isImage && scale > 1 && (
     <div className={styles.mediaViewerZoomIndicator}>
      {Math.round(scale * 100)}%
     </div>
    )}
   </div>
  </div>
 );
};

export default MediaViewer;