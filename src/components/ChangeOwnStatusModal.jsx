import React from "react";
import * as stylex from "@stylexjs/stylex";
import { ChangeOwnStatusModalStyles as styles } from "../styles/change_own_status_modal";
import Icon from "./Icon";

const ChangeOwnStatusModal = ({ onClose, onSelectStatus, currentStatus }) => {
 const statuses = [
  {
   value: "online",
   label: "Available",
   icon: { type: "fa", name: "circle" },
   color: "#4caf50",
   description: "Ready to chat",
  },
  {
   value: "away",
   label: "Inactive",
   icon: { type: "icon", name: "away_icon" },
   color: "#ff9800",
   description: "Not doing anything (AFK)",
  },
  {
   value: "offline",
   label: "Appear Offline",
   icon: { type: "fa-outline", name: "circle" },
   color: "#9e9e9e",
   description: "Invisible to other people",
  },
 ];

 return (
  <div {...stylex.props(styles.modalOverlay)} onClick={onClose}>
   <div {...stylex.props(styles.modal)} onClick={(e) => e.stopPropagation()}>
    <div {...stylex.props(styles.modalHeader)}>
     <h3 {...stylex.props(styles.modalHeaderTitle)}>Set Your Status</h3>

     <button {...stylex.props(styles.closeBtn)} onClick={onClose} type="button">
      <i className="fas fa-times" />
     </button>
    </div>

    <div {...stylex.props(styles.statusList)}>
     {statuses.map((status) => {
      const isActive = currentStatus === status.value;

      const statusItemProps = stylex.props(
       styles.statusItem,
       isActive && styles.statusItemActive
      );

      const faBase = `fas fa-${status.icon.name}`;

      const faIconClassName =
       status.icon.type === "fa"
        ? `${faBase} ${stylex.props(styles.statusFaIcon).className}`
        : status.icon.type === "fa-outline"
         ? `${faBase} ${stylex.props(styles.statusFaOutlineIcon).className}`
         : "";

      return (
       <button
        key={status.value}
        {...statusItemProps}
        onClick={() => {
         onSelectStatus(status.value);
         onClose();
        }}
        type="button"
       >
        <div {...stylex.props(styles.statusIcon)}>
         {status.icon.type === "icon" && (
          <Icon
           name={status.icon.name}
           alt={status.label}
           draggable={false}
           className={stylex.props(styles.statusAwayIcon).className}
          />
         )}

         {(status.icon.type === "fa" || status.icon.type === "fa-outline") && (
          <i className={faIconClassName} style={{ color: status.color }} />
         )}
        </div>

        <div {...stylex.props(styles.statusInfo)}>
         <div {...stylex.props(styles.statusLabel)}>{status.label}</div>
         <div {...stylex.props(styles.statusDescription)}>{status.description}</div>
        </div>

        {isActive && (
         <i className={`fas fa-check ${stylex.props(styles.checkIcon).className}`} />
        )}
       </button>
      );
     })}
    </div>
   </div>
  </div>
 );
};

export default ChangeOwnStatusModal;
