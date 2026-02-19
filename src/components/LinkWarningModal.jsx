import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { LinkWarningModalStyles as styles } from '../styles/link_warning_modal';

let _setLink = null;

export function triggerLinkWarning(url) {
 if (_setLink) _setLink(url);
}

const LinkWarningModal = () => {
 const [link, setLink] = useState(null);
 _setLink = setLink;

 if (typeof window !== 'undefined') {
  window.__linkWarningConfirm = triggerLinkWarning;
 }

 if (!link) return null;

 return (
  <div {...stylex.props(styles.overlay)} onClick={() => setLink(null)}>
   <div {...stylex.props(styles.modal)} onClick={e => e.stopPropagation()}>
    <i className={`fas fa-exclamation-triangle ${stylex.props(styles.icon).className}`} />
    <h3 {...stylex.props(styles.title)}>External URL Detected!</h3>
    <p {...stylex.props(styles.description)}>
     Woah! That URL looks spoookyy~ Remember, only click links from people you trust, as links can be dangerous and lead you to malware or such! Be cautious!
    </p>
    <div {...stylex.props(styles.urlBox)}>{link}</div>
    <div {...stylex.props(styles.buttons)}>
     <button {...stylex.props(styles.cancelBtn)} onClick={() => setLink(null)} type="button">Cancel</button>
     <button {...stylex.props(styles.visitBtn)} onClick={() => { window.open(link, '_blank', 'noopener,noreferrer'); setLink(null); }} type="button">Visit Anyway</button>
    </div>
   </div>
  </div>
 );
};

export default LinkWarningModal;