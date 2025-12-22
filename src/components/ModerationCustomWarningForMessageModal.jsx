import React, { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { API_BASE_URL } from "../config";
import {
 ModerationCustomWarningForMessageModalStyles as styles,
} from "../styles/moderation_custom_warning_for_message_modal";

const ModerationCustomWarningForMessageModal = ({ onClose }) => {
 const [warnings, setWarnings] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchActiveWarnings = async () => {
   try {
    const res = await fetch(`${API_BASE_URL}/api/warnings/active`, {
     credentials: "include",
    });
    if (res.ok) {
     const data = await res.json();
     setWarnings(data.warnings);
    }
   } catch (error) {
    console.error("Failed to fetch warnings:", error);
   } finally {
    setLoading(false);
   }
  };

  fetchActiveWarnings();
 }, []);

 const handleAcknowledge = async () => {
  if (warnings.length === 0) return;

  const currentWarning = warnings[currentIndex];

  try {
   const res = await fetch(
    `${API_BASE_URL}/api/warnings/${currentWarning.id}/acknowledge`,
    {
     method: "POST",
     credentials: "include",
    }
   );

   if (res.ok) {
    if (currentIndex + 1 < warnings.length) {
     setCurrentIndex(currentIndex + 1);
    } else {
     onClose();
    }
   }
  } catch (error) {
   console.error("Failed to acknowledge warning:", error);
  }
 };

 useEffect(() => {
  if (!loading && warnings.length === 0) {
   onClose();
  }
 }, [loading, warnings.length, onClose]);

 if (loading) {
  return (
   <div {...stylex.props(styles.overlay)}>
    <div {...stylex.props(styles.modal)}>
     <div {...stylex.props(styles.loadingSpinner)} />
    </div>
   </div>
  );
 }

 if (warnings.length === 0) {
  return null;
 }

 const currentWarning = warnings[currentIndex];
 const issuedDate = new Date(currentWarning.issued_at).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
 });

 return (
  <div {...stylex.props(styles.overlay)}>
   <div {...stylex.props(styles.modal)}>
    <div {...stylex.props(styles.header)}>
     <div {...stylex.props(styles.iconContainer)}>
      <i className={"fas fa-exclamation-triangle " + stylex.props(styles.icon).className} />
     </div>
     <h2 {...stylex.props(styles.title)}>⚠️ Moderation Warning</h2>
    </div>

    <div {...stylex.props(styles.content)}>
     <div {...stylex.props(styles.warningBox)}>
      <p {...stylex.props(styles.warningText)}>{currentWarning.warning_message}</p>
     </div>

     <div {...stylex.props(styles.metadata)}>
      <p {...stylex.props(styles.metaItem)}>
       <i className={"fas fa-calendar-alt " + stylex.props(styles.metaIcon).className} />
       <span>Issued: {issuedDate}</span>
      </p>
      <p {...stylex.props(styles.metaItem)}>
       <i className={"fas fa-eye " + stylex.props(styles.metaIcon).className} />
       <span>Shown: {currentWarning.times_shown + 1} / 3 times</span>
      </p>
     </div>

     <div {...stylex.props(styles.infoBox)}>
      <p {...stylex.props(styles.infoText)}>
       <strong className={stylex.props(styles.infoStrong).className}>Important:</strong>{" "}
       This warning will appear {3 - currentWarning.times_shown} more time(s). Repeated
       violations may result in account suspension or permanent ban. Please adhere to our community guidelines, no exceptions.
      </p>
     </div>

     {warnings.length > 1 && (
      <div {...stylex.props(styles.progressIndicator)}>
       <p {...stylex.props(styles.progressLabel)}>
        Warning {currentIndex + 1} of {warnings.length}
       </p>
       <div {...stylex.props(styles.progressBar)}>
        <div
         {...stylex.props(styles.progressFill)}
         style={{ width: `${((currentIndex + 1) / warnings.length) * 100}%` }}
        />
       </div>
      </div>
     )}
    </div>

    <div {...stylex.props(styles.footer)}>
     <button {...stylex.props(styles.acknowledgeBtn)} onClick={handleAcknowledge} type="button">
      I understand.
     </button>
    </div>
   </div>
  </div>
 );
};

export default ModerationCustomWarningForMessageModal;
