import React, { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ReactionHoverPopupStyles as styles } from "../styles/reaction_hover_popup";

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
}) => {
 const popupRef = useRef(null);
 const [adjustedStyle, setAdjustedStyle] = useState({});

 const baseReactions = [
  { emoji: "👍", type: "like" },
  { emoji: "❤️", type: "love" },
  { emoji: "😂", type: "happy" },
  { emoji: "😢", type: "sad" },
  { emoji: "😡", type: "angry" },
  { emoji: "👎", type: "dislike" },
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
  <div
   ref={popupRef}
   {...stylex.props(styles.popup)}
   style={adjustedStyle}
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
      aria-label={
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
   </div>
  </div>
 );
};

export default ReactionHoverPopup;
