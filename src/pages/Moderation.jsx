import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import styles from './Moderation.module.css';

const Moderation = () => {
 const navigate = useNavigate();
 const [reports, setReports] = useState([]);
 const [stats, setStats] = useState({
  total: 0,
  pending: 0,
  reviewed: 0,
  urgent: 0
 });
 const [loading, setLoading] = useState(true);
 const [selectedReport, setSelectedReport] = useState(null);
 const [filter, setFilter] = useState('all');
 const [actionLoading, setActionLoading] = useState(false);
 const [showWarningModal, setShowWarningModal] = useState(null);
 const [warningMessage, setWarningMessage] = useState('');

 useEffect(() => {
  fetchReports();
 }, []);

 const fetchReports = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/moderation/reports`, {
    credentials: 'include'
   });

   if (response.status === 403) {
    navigate('/chat');
    return;
   }

   if (response.ok) {
    const data = await response.json();
    setReports(data.reports);
    setStats(data.stats);
   }
  } catch (error) {
   console.error('Failed to fetch reports:', error);
  } finally {
   setLoading(false);
  }
 };

 const handleSendWarning = async (reportId) => {
  if (warningMessage.trim().length < 10) {
   alert('Warning message must be at least 10 characters');
   return;
  }

  setActionLoading(true);

  try {
   const response = await fetch(`${API_BASE_URL}/api/moderation/reports/${reportId}/action`, {
    method: 'POST',
    credentials: 'include',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({
     action: 'warn',
     warning_message: warningMessage
    })
   });

   if (response.ok) {
    alert('Warning sent successfully!');
    fetchReports();
    setSelectedReport(null);
    setShowWarningModal(null);
    setWarningMessage('');
   } else {
    const error = await response.json();
    alert(error.error || 'Failed to send warning');
   }
  } catch (error) {
   console.error('Failed to send warning:', error);
   alert('Failed to send warning');
  } finally {
   setActionLoading(false);
  }
 };

 const handleAction = async (reportId, action) => {
  const actionMessages = {
   ban: 'permanently ban this user',
   warn: 'issue a warning to this user',
   delete: 'delete this message',
   dismiss: 'dismiss this report'
  };

  if (action === 'warn') {
   setShowWarningModal(reportId);
   return;
  }

  if (!window.confirm(`Are you sure you want to ${actionMessages[action]}?`)) {
   return;
  }

  setActionLoading(true);

  try {
   const response = await fetch(`${API_BASE_URL}/api/moderation/reports/${reportId}/action`, {
    method: 'POST',
    credentials: 'include',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action })
   });

   if (response.ok) {
    alert('Action completed successfully');
    fetchReports();
    setSelectedReport(null);
   } else {
    const error = await response.json();
    alert(error.error || 'Action failed');
   }
  } catch (error) {
   console.error('Action failed:', error);
   alert('Failed to perform action');
  } finally {
   setActionLoading(false);
  }
 };

 const filteredReports = reports.filter(report => {
  if (filter === 'pending') return report.status === 'pending';
  if (filter === 'urgent') return report.priority >= 15;
  return true;
 });

 if (loading) {
  return (
   <div className={styles.moderationContainer}>
    <div className={styles.moderationLoading}>Loading reports...</div>
   </div>
  );
 }

 return (
  <div className={styles.moderationContainer}>
   <header className={styles.moderationHeader}>
    <div className={styles.moderationTitle}>
     <i className="fas fa-shield-alt"></i>
     <h1>Moderation Dashboard</h1>
    </div>
    <button onClick={() => navigate('/chat')} className={styles.moderationBackBtn}>
     <i className="fas fa-arrow-left"></i> Back to Chat
    </button>
   </header>

   <div className={styles.moderationStats}>
    <div className={styles.statCard}>
     <div className={`${styles.statIcon} ${styles.total}`}>
      <i className="fas fa-flag"></i>
     </div>
     <div className={styles.statInfo}>
      <span className={styles.statNumber}>{stats.total}</span>
      <span className={styles.statLabel}>Total Reports</span>
     </div>
    </div>
    <div className={styles.statCard}>
     <div className={`${styles.statIcon} ${styles.pending}`}>
      <i className="fas fa-clock"></i>
     </div>
     <div className={styles.statInfo}>
      <span className={styles.statNumber}>{stats.pending}</span>
      <span className={styles.statLabel}>Pending</span>
     </div>
    </div>
    <div className={styles.statCard}>
     <div className={`${styles.statIcon} ${styles.urgent}`}>
      <i className="fas fa-exclamation-triangle"></i>
     </div>
     <div className={styles.statInfo}>
      <span className={styles.statNumber}>{stats.urgent}</span>
      <span className={styles.statLabel}>Urgent</span>
     </div>
    </div>
    <div className={styles.statCard}>
     <div className={`${styles.statIcon} ${styles.reviewed}`}>
      <i className="fas fa-check-circle"></i>
     </div>
     <div className={styles.statInfo}>
      <span className={styles.statNumber}>{stats.reviewed}</span>
      <span className={styles.statLabel}>Reviewed</span>
     </div>
    </div>
   </div>

   <div className={styles.moderationFilters}>
    <button
     className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
     onClick={() => setFilter('all')}
    >
     All Reports
    </button>
    <button
     className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
     onClick={() => setFilter('pending')}
    >
     Pending
    </button>
    <button
     className={`${styles.filterBtn} ${filter === 'urgent' ? styles.active : ''}`}
     onClick={() => setFilter('urgent')}
    >
     Urgent
    </button>
   </div>

   <div className={styles.moderationContent}>
    {filteredReports.length === 0 ? (
     <div className={styles.noReports}>
      <i className="fas fa-inbox"></i>
      <p>No reports to display</p>
     </div>
    ) : (
     <div className={styles.reportsList}>
      {filteredReports.map(report => (
       <div
        key={report.id}
        className={`${styles.reportCard} ${report.priority >= 15 ? styles.urgent : ''}`}
        onClick={() => setSelectedReport(report)}
       >
        <div className={styles.reportHeader}>
         <span className={styles.reportId}>#{report.id}</span>
         <span className={`${styles.reportPriority} ${styles[`priority${report.priority >= 15 ? 'High' : report.priority >= 8 ? 'Medium' : 'Low'}`]}`}>
          Priority: {report.priority}
         </span>
         <span className={`${styles.reportStatus} ${styles[`status${report.status.charAt(0).toUpperCase() + report.status.slice(1)}`]}`}>
          {report.status}
         </span>
        </div>
        <div className={styles.reportInfo}>
         <div>
          <strong>{report.reported_username}</strong> reported by <strong>{report.reporter_username}</strong>
         </div>
         <span className={styles.reportCategory}>
          {report.category || 'No category specified'}
         </span>
         <span className={styles.reportTime}>
          {new Date(report.created_at).toLocaleString()}
         </span>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>

   {selectedReport && (
    <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
     <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={styles.modalHeader}>
       <div className={styles.modalHeaderTitle}>
        <h2>Report #{selectedReport.id}</h2>
        <span className={`${styles.reportPriority} ${styles[`priority${selectedReport.priority >= 15 ? 'High' : selectedReport.priority >= 8 ? 'Medium' : 'Low'}`]}`}>
         Priority: {selectedReport.priority}
        </span>
       </div>
       <button className={styles.modalCloseBtn} onClick={() => setSelectedReport(null)}>
        <i className="fas fa-times"></i>
       </button>
      </div>

      <div className={styles.modalContent}>
       <div className={styles.reportSection}>
        <h3>Report Information</h3>
        <div className={styles.reportDetail}>
         <span className={styles.detailLabel}>Reported:</span>
         <span className={styles.detailValue}>{new Date(selectedReport.created_at).toLocaleString()}</span>
        </div>
        <div className={styles.reportDetail}>
         <span className={styles.detailLabel}>Category:</span>
         <span className={styles.detailValue}>{selectedReport.category || 'Not specified'}</span>
        </div>
        <div className={styles.reportDetail}>
         <span className={styles.detailLabel}>Status:</span>
         <span className={`${styles.detailValue} ${styles[`status${selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}`]}`}>
          {selectedReport.status}
         </span>
        </div>
       </div>

       <div className={styles.reportSection}>
        <h3>Users Involved</h3>
        <div className={styles.reportDetail}>
         <span className={styles.detailLabel}>Reporter:</span>
         <span className={styles.detailValue}>{selectedReport.reporter_username} (ID: {selectedReport.reporter_id})</span>
        </div>
        <div className={styles.reportDetail}>
         <span className={styles.detailLabel}>Reported User:</span>
         <span className={styles.detailValue}>{selectedReport.reported_username} (ID: {selectedReport.reported_user_id})</span>
        </div>
       </div>

       <div className={styles.reportSection}>
        <h3>Message Content</h3>
        <div className={styles.messagePreview}>
         {selectedReport.message_type === 'text' ? (
          <p>{selectedReport.message_content}</p>
         ) : (
          <p><em>{selectedReport.message_content}</em></p>
         )}
        </div>
       </div>

       <div className={styles.reportSection}>
        <h3>Moderation Actions</h3>
        <div className={styles.actionButtons}>
         <button
          className={`${styles.actionBtn} ${styles.banBtn}`}
          onClick={() => handleAction(selectedReport.id, 'ban')}
          disabled={actionLoading}
         >
          <i className="fas fa-ban"></i>
          Ban User Permanently
         </button>
         <button
          className={`${styles.actionBtn} ${styles.warnBtn}`}
          onClick={() => handleAction(selectedReport.id, 'warn')}
          disabled={actionLoading}
         >
          <i className="fas fa-exclamation-triangle"></i>
          Issue Warning
         </button>
         <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => handleAction(selectedReport.id, 'delete')}
          disabled={actionLoading}
         >
          <i className="fas fa-trash"></i>
          Delete Message Only
         </button>
         <button
          className={`${styles.actionBtn} ${styles.dismissBtn}`}
          onClick={() => handleAction(selectedReport.id, 'dismiss')}
          disabled={actionLoading}
         >
          <i className="fas fa-times-circle"></i>
          Dismiss Report
         </button>
        </div>
       </div>
      </div>
     </div>
    </div>
   )}
   {showWarningModal && (
    <div className={styles.modalOverlay} onClick={() => setShowWarningModal(null)}>
     <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
      <div className={styles.modalHeader}>
       <div className={styles.modalHeaderTitle}>
        <h2>⚠️ Issue Warning</h2>
       </div>
       <button className={styles.modalCloseBtn} onClick={() => setShowWarningModal(null)}>
        <i className="fas fa-times"></i>
       </button>
      </div>
      <div className={styles.modalContent}>
       <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
        Write a custom warning message that will be shown to the user 3 times:
       </p>
       <textarea
        value={warningMessage}
        onChange={(e) => setWarningMessage(e.target.value)}
        placeholder="Example: Your recent message violated our community guidelines against harassment. Please be respectful to other users. Continued violations may result in account suspension."
        rows={6}
        maxLength={500}
        style={{
         width: '100%',
         padding: '12px',
         borderRadius: '8px',
         border: '1px solid var(--border)',
         background: 'var(--bg-tertiary)',
         color: 'var(--text-primary)',
         fontSize: '14px',
         fontFamily: 'inherit',
         resize: 'vertical',
         minHeight: '120px'
        }}
       />
       <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'right'
       }}>
        {warningMessage.length}/500 characters
       </div>
       <div style={{
        marginTop: '20px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
       }}>
        <button
         onClick={() => {
          setShowWarningModal(null);
          setWarningMessage('');
         }}
         style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
         }}
        >
         Cancel
        </button>
        <button
         onClick={() => handleSendWarning(showWarningModal)}
         disabled={warningMessage.trim().length < 10 || actionLoading}
         style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: '#f59e0b',
          color: 'white',
          cursor: warningMessage.trim().length < 10 ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          opacity: warningMessage.trim().length < 10 ? 0.5 : 1
         }}
        >
         <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
         Send Warning
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
};

export default Moderation;