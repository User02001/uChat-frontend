import React, { useState } from 'react';
import styles from './ReportModal.module.css';

const ReportModal = ({ message, onClose, onSubmit }) => {
 const [category, setCategory] = useState(null);
 const [submitting, setSubmitting] = useState(false);

 const categories = [
  { id: 'sexual', label: 'Sexual/inappropriate content', icon: '🔞' },
  { id: 'harassment', label: 'Harassment or bullying', icon: '😢' },
  { id: 'spam', label: 'Spam or scam', icon: '📧' },
  { id: 'threats', label: 'Threats or violence', icon: '⚠️' },
  { id: 'other', label: 'Something else', icon: '❓' }
 ];

 const handleSubmit = async () => {
  if (submitting) return;

  setSubmitting(true);
  await onSubmit(message.id, category);
  setSubmitting(false);
  onClose();
 };

 return (
  <div className={styles.overlay} onClick={onClose}>
   <div className={styles.modal} onClick={e => e.stopPropagation()}>
    <div className={styles.header}>
     <div className={styles.headerTitle}>
      <i className="fas fa-flag"></i>
      <h2>Report this message</h2>
     </div>
     <button className={styles.closeBtn} onClick={onClose}>
      <i className="fas fa-times"></i>
     </button>
    </div>

    <div className={styles.content}>
     <p className={styles.description}>
      This will be reviewed by our moderation team. The sender WON'T know at ALL you reported them. Be brave. Don't hesitate to get help if you feel like it. Please stay safe while we review this message. Call your country's emergency number if you feel in immediate danger. You DON'T have to choose any category for your comfort, but providing it can help us. Your choice.
     </p>

     <div className={styles.categoryLabel}>What's wrong with this message?</div>

     <div className={styles.categories}>
      {categories.map(cat => (
       <button
        key={cat.id}
        className={`${styles.categoryBtn} ${category === cat.id ? styles.selected : ''}`}
        onClick={() => setCategory(cat.id)}
       >
        <span className={styles.categoryIcon}>{cat.icon}</span>
        <span className={styles.categoryText}>{cat.label}</span>
        {category === cat.id && (
         <i className="fas fa-check-circle" style={{ marginLeft: 'auto', color: 'var(--button-primary)' }}></i>
        )}
       </button>
      ))}
     </div>

     <div className={styles.actions}>
      <button className={styles.cancelBtn} onClick={onClose}>
       Cancel
      </button>
      <button
       className={styles.submitBtn}
       onClick={handleSubmit}
       disabled={submitting}
      >
       {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ReportModal;