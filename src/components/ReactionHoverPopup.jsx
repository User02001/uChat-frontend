import React, { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ReactionHoverPopupStyles as styles } from "../styles/reaction_hover_popup";
import ReactionPickerModal from "./ReactionPickerModal";

const ReactionHoverPopup = ({
 messageId,
 onAddReaction,
 onClose,
 position,
 onReply,
 message,
 onDelete,
 isOwnMessage,
 onReport,
 onPickerToggle,
}) => {
 const popupRef = useRef(null);
 const pickerBtnRef = useRef(null);
 const [showPicker, setShowPicker] = useState(false);
 const [pickerStyle, setPickerStyle] = useState({});
 const prevPickerRef = useRef(false);

 React.useLayoutEffect(() => {
  if (prevPickerRef.current !== showPicker) {
   prevPickerRef.current = showPicker;
   onPickerToggle?.(showPicker);
  }
 }, [showPicker]);

 const baseReactions = [
  { emoji: "👍", type: "like" },
  { emoji: "❤️", type: "love" },
  { emoji: "😂", type: "happy" },
  { emoji: "😢", type: "sad" },
  { emoji: "😡", type: "angry" },
  { emoji: "💀", type: "skull" },
  { icon: "fa-reply", type: "reply" },
 ];

 const reactions = isOwnMessage
  ? [...baseReactions, { icon: "fa-trash", type: "delete" }]
  : [...baseReactions, { icon: "fa-flag", type: "report" }];

 const handleReactionClick = (reactionType) => {
  onAddReaction(messageId, reactionType);
  onClose();
 };

 const handleReplyClick = () => {
  onReply(message);
  onClose();
 };

 return (
  <>
   <div
    ref={popupRef}
    {...stylex.props(styles.popup)}
    onClick={(e) => e.stopPropagation()}
    role="dialog"
    aria-label="Add reaction"
   >
    <div {...stylex.props(styles.grid)}>
     {reactions.map((reaction, index) => (
      <button
       key={index}
       {...stylex.props(styles.button)}
       onClick={() => {
        if (reaction.type === "reply") {
         handleReplyClick();
        } else if (reaction.type === "delete") {
         onDelete(message);
         onClose();
        } else if (reaction.type === "report") {
         onReport(message);
         onClose();
        } else {
         handleReactionClick(reaction.type);
        }
       }}
       title={
        reaction.emoji
         ? `React with ${reaction.emoji}`
         : reaction.type === "reply"
          ? "Reply"
          : reaction.type === "delete"
           ? "Delete"
           : "Report"
       }
       type="button"
       style={
        reaction.type === "delete"
         ? { color: "#ff4757" }
         : reaction.type === "report"
          ? { color: "#fbbf24" }
          : {}
       }
      >
       {reaction.emoji || <i className={`fas ${reaction.icon}`}></i>}
      </button>
     ))}

     <button
      ref={pickerBtnRef}
      {...stylex.props(styles.button)}
      onClick={(e) => {
       e.stopPropagation();
       if (!showPicker && pickerBtnRef.current) {
        const rect = pickerBtnRef.current.getBoundingClientRect();
        const pickerHeight = 380;
        const margin = 8;
        let top;
        if (rect.top - pickerHeight - margin >= 0) {
         setPickerStyle({ position: 'fixed', bottom: Math.round(window.innerHeight - rect.top + margin), right: 16, zIndex: 10000, margin: 0 });
        } else if (rect.bottom + pickerHeight + margin <= window.innerHeight) {
         setPickerStyle({ position: 'fixed', top: Math.round(rect.bottom + margin), right: 16, zIndex: 10000, margin: 0 });
        } else {
         setPickerStyle({ position: 'fixed', top: Math.round(Math.max(margin, (window.innerHeight - pickerHeight) / 2)), right: 16, zIndex: 10000, margin: 0 });
        }
       }
       setShowPicker(prev => !prev);
      }}
      title="More reactions"
      type="button"
     >
      <i className="fas fa-plus" style={{ fontSize: 13 }} />
     </button>
    </div>
   </div>

   {showPicker && (
    <>
     <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      onClick={() => setShowPicker(false)}
     />
     <div data-reaction-popup-root style={pickerStyle}>
      <ReactionPickerModal
       messageId={messageId}
       onAddReaction={(msgId, emoji) => {
        onAddReaction(msgId, emoji);
        onClose();
       }}
       onClose={() => setShowPicker(false)}
      />
     </div>
    </>
   )}
  </>
 );
};

export default ReactionHoverPopup;