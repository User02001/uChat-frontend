import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'; // ADD THIS
import styles from './WarningForModeration.module.css';

const WarningForModeration = ({ onClose }) => {
 const [warnings, setWarnings] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchActiveWarnings();
 }, []);

 const fetchActiveWarnings = async () => {
  try {
   const res = await fetch(`${API_BASE_URL}/api/warnings/active`, { // FIXED
    credentials: 'include'
   });
   if (res.ok) {
    const data = await res.json();
    setWarnings(data.warnings);
   }
  } catch (error) {
   console.error('Failed to fetch warnings:', error);
  } finally {
   setLoading(false);
  }
 };

 const handleAcknowledge = async () => {
  if (warnings.length === 0) return;

  const currentWarning = warnings[currentIndex];

  try {
   const res = await fetch(`${API_BASE_URL}/api/warnings/${currentWarning.id}/acknowledge`, { // FIXED
    method: 'POST',
    credentials: 'include'
   });

   if (res.ok) {
    const data = await res.json();

    // Move to next warning or close if done
    if (currentIndex + 1 < warnings.length) {
     setCurrentIndex(currentIndex + 1);
    } else {
     // All warnings shown
     onClose();
    }
   }
  } catch (error) {
   console.error('Failed to acknowledge warning:', error);
  }
 };

 useEffect(() => {
  if (!loading && warnings.length === 0) {
   onClose();
  }
 }, [loading, warnings.length, onClose]);

 if (loading) {
  return (
   <div className={styles.overlay}>
    <div className={styles.modal}>
     <div className={styles.loadingSpinner}></div>
    </div>
   </div>
  );
 }

 if (warnings.length === 0) {
  return null;
 }

 const currentWarning = warnings[currentIndex];
 const issuedDate = new Date(currentWarning.issued_at).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
 });

 return (
  <div className={styles.overlay}>
   <div className={styles.modal}>
    <div className={styles.header}>
     <div className={styles.iconContainer}>
      <i className="fas fa-exclamation-triangle"></i>
     </div>
     <h2 className={styles.title}>⚠️ Moderation Warning</h2>
    </div>

    <div className={styles.content}>
     <div className={styles.warningBox}>
      <p className={styles.warningText}>{currentWarning.warning_message}</p>
     </div>

     <div className={styles.metadata}>
      <p className={styles.metaItem}>
       <i className="fas fa-calendar-alt"></i>
       <span>Issued: {issuedDate}</span>
      </p>
      <p className={styles.metaItem}>
       <i className="fas fa-eye"></i>
       <span>Shown: {currentWarning.times_shown + 1} / 3 times</span>
      </p>
     </div>

     <div className={styles.infoBox}>
      <p>
       <strong>Important:</strong> This warning will appear {3 - currentWarning.times_shown} more time(s).
       Repeated violations may result in account suspension or permanent ban.
      </p>
     </div>

     {warnings.length > 1 && (
      <div className={styles.progressIndicator}>
       <p>Warning {currentIndex + 1} of {warnings.length}</p>
       <div className={styles.progressBar}>
        <div
         className={styles.progressFill}
         style={{ width: `${((currentIndex + 1) / warnings.length) * 100}%` }}
        ></div>
       </div>
      </div>
     )}
    </div>

    <div className={styles.footer}>
     <button
      className={styles.acknowledgeBtn}
      onClick={handleAcknowledge}
     >
      I Understand
     </button>
    </div>
   </div>
  </div>
 );
};

export default WarningForModeration;