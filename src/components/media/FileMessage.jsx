import React from 'react';
import styles from '../../index.module.css';

const FileMessage = ({ message, API_BASE_URL, formatFileSize, getFileIcon }) => {
 return (
  <div style={{ margin: '8px 0' }}>
   <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: 'var(--file-bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    maxWidth: '350px'
   }}
    onMouseEnter={(e) => {
     e.currentTarget.style.background = 'var(--file-bg-hover)';
     e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-light)';
    }}
    onMouseLeave={(e) => {
     e.currentTarget.style.background = 'var(--file-bg)';
     e.currentTarget.style.boxShadow = 'none';
    }}>
    <div className={styles.fileIconWrapper} style={{ fontSize: '28px', minWidth: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
     <i className={getFileIcon(message.file_type)}></i>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
     <div style={{ fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px', marginBottom: '2px' }}>
      {message.file_name || 'File'}
     </div>
     {message.file_size && (
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
       {formatFileSize(message.file_size)}
      </div>
     )}
    </div>
    <button
     onClick={(e) => {
      e.stopPropagation();
      window.open(`${API_BASE_URL}${message.file_path}`, '_blank');
     }}
     style={{
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      padding: '7px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: '500',
      flexShrink: 0
     }}
     onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--button-primary)';
      e.currentTarget.style.borderColor = 'var(--button-primary)';
      e.currentTarget.style.color = 'white';
     }}
     onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--text-secondary)';
     }}
     title="Download file"
    >
     <i className="fas fa-download"></i>
     <span>Download</span>
    </button>
   </div>
  </div>
 );
};

export default FileMessage;