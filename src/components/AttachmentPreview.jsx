import * as stylex from '@stylexjs/stylex';
import { AttachmentPreviewStyles as styles } from '../styles/attachment_preview';

const getFileIcon = (file) => {
 const ext = file.name.split('.').pop().toLowerCase();
 if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'fas fa-file-video';
 if (['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(ext)) return 'fas fa-file-audio';
 if (['pdf'].includes(ext)) return 'fas fa-file-pdf';
 if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word';
 if (['xls', 'xlsx'].includes(ext)) return 'fas fa-file-excel';
 if (['zip', 'rar', '7z'].includes(ext)) return 'fas fa-file-archive';
 return 'fas fa-file';
};

const formatSize = (bytes) => {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPreview = ({ pendingFiles, onCancel, onOpenViewer }) => {
 if (!pendingFiles || pendingFiles.length === 0) return null;

 return (
  <div {...stylex.props(styles.container)}>
   {pendingFiles.map((pf) => {
    const isImage = pf.file.type.startsWith('image/');

    if (isImage) {
     return (
      <div key={pf.id} {...stylex.props(styles.item, styles.imageItem)}>
       <img
        src={pf.previewUrl}
        alt={pf.file.name}
        {...stylex.props(styles.thumbnail)}
        onClick={() => onOpenViewer && pf.status !== 'uploading' && onOpenViewer({ url: pf.previewUrl, name: pf.file.name, type: pf.file.type.startsWith('video/') ? 'video' : 'image', isBlob: true })}
        style={{ cursor: 'pointer' }}
       />
       {pf.status === 'uploading' && (
        <div {...stylex.props(styles.uploadingOverlay)}>
         <i className="fas fa-spinner fa-spin" style={{ color: '#fff', fontSize: '16px' }} />
        </div>
       )}
       {pf.status === 'error' && (
        <div {...stylex.props(styles.errorOverlay)}>
         <i className="fas fa-exclamation-triangle" />
        </div>
       )}
       {pf.status === 'uploading' && (
        <div {...stylex.props(styles.progressOverlay)}>
         <div {...stylex.props(styles.progressBar)} style={{ width: `${pf.progress}%` }} />
        </div>
       )}
       {pf.status !== 'uploading' && (
        <button
         {...stylex.props(styles.cancelBtn)}
         onClick={() => onCancel(pf.id)}
         type="button"
        >
         <i className="fas fa-times" />
        </button>
       )}
      </div>
     );
    }

    return (
     <div key={pf.id} {...stylex.props(styles.item, styles.fileItem)}>
      <i className={`${getFileIcon(pf.file)} ${stylex.props(styles.fileIcon).className}`} />
      <div {...stylex.props(styles.fileInfo)}>
       <span {...stylex.props(styles.fileName)}>{pf.file.name}</span>
       <span {...stylex.props(styles.fileSize)}>{formatSize(pf.file.size)}</span>
       {pf.status === 'uploading' && (
        <div {...stylex.props(styles.progressOverlay)} style={{ position: 'relative', height: '3px', borderRadius: '2px', marginTop: '2px' }}>
         <div {...stylex.props(styles.progressBar)} style={{ width: `${pf.progress}%` }} />
        </div>
       )}
      </div>
      {pf.status !== 'uploading' && (
       <button
        {...stylex.props(styles.cancelBtn, styles.cancelBtnFile)}
        onClick={() => onCancel(pf.id)}
        type="button"
       >
        <i className="fas fa-times" />
       </button>
      )}
     </div>
    );
   })}
  </div>
 );
};

export default AttachmentPreview;