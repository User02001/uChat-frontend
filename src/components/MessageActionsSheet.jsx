import React, { useState, useRef, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { MessageActionsSheetStyles as styles } from "../styles/message_actions_sheet";

const MessageActionsSheet = ({
 message,
 isOwnMessage,
 onReply,
 onAddReaction,
 onRemoveReaction,
 onDelete,
 onReport,
 onClose,
 currentUserReactions,
}) => {
 const [isClosing, setIsClosing] = useState(false);
 const sheetRef = useRef(null);
 const handleAreaRef = useRef(null);

 const reactions = [
  { emoji: "👍", type: "like" },
  { emoji: "❤️", type: "love" },
  { emoji: "😂", type: "happy" },
  { emoji: "😢", type: "sad" },
  { emoji: "😡", type: "angry" },
  { emoji: "👎", type: "dislike" },
  { emoji: "💀", type: "skull" },
 ];

 const handleClose = () => {
  setIsClosing(true);
  setTimeout(() => {
   onClose();
  }, 200);
 };

 const handleReactionClick = (reactionType) => {
  const isActive = currentUserReactions?.includes(reactionType);

  if (isActive) {
   onRemoveReaction(message.id, reactionType);
  } else {
   onAddReaction(message.id, reactionType);
  }

  handleClose();
 };

 const handleReply = () => {
  onReply(message);
  handleClose();
 };

 const handleDelete = () => {
  onDelete(message);
  handleClose();
 };

 const handleCopy = async () => {
  try {
   const textToCopy = message.content;
   if (textToCopy) {
    await navigator.clipboard.writeText(textToCopy);
   }
   handleClose();
  } catch (err) {
   console.error("Failed to copy:", err);
  }
 };

 const hasLink =
  message.content &&
  (message.content.includes("http://") ||
   message.content.includes("https://") ||
   message.content.includes("www."));

 const handleOpenLink = () => {
  let url = message.content;

  const urlMatch = url.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/i);
  if (urlMatch) {
   url = urlMatch[0];
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
   url = "https://" + url;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  handleClose();
 };

 const hasText =
  message.content && message.message_type !== "image" && message.message_type !== "file";

 useEffect(() => {
  const sheet = sheetRef.current;
  if (!sheet) return;

  let startY = 0;
  let currentTranslate = 0;
  let isDragging = false;

  const handlePointerDown = (e) => {
   if (!handleAreaRef.current || !handleAreaRef.current.contains(e.target)) return;

   isDragging = true;
   startY = e.clientY;
   currentTranslate = 0;
   sheet.style.transition = "none";
   e.preventDefault();
  };

  const handlePointerMove = (e) => {
   if (!isDragging) return;

   const deltaY = e.clientY - startY;
   if (deltaY > 0) {
    currentTranslate = deltaY;
    sheet.style.transform = `translateY(${deltaY}px)`;
   }
  };

  const handlePointerUp = () => {
   if (!isDragging) return;

   isDragging = false;

   if (currentTranslate > 100) {
    handleClose();
   } else {
    sheet.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    sheet.style.transform = "translateY(0)";
   }
  };

  sheet.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  return () => {
   sheet.removeEventListener("pointerdown", handlePointerDown);
   window.removeEventListener("pointermove", handlePointerMove);
   window.removeEventListener("pointerup", handlePointerUp);
   window.removeEventListener("pointercancel", handlePointerUp);
  };
 }, []);

 return (
  <>
   <div
    {...stylex.props(styles.overlay, isClosing && styles.overlayClosing)}
    onClick={handleClose}
   />
   <div
    ref={sheetRef}
    {...stylex.props(styles.bottomSheet, isClosing && styles.bottomSheetClosing)}
   >
    <div ref={handleAreaRef} {...stylex.props(styles.handleArea)}>
     <div {...stylex.props(styles.handle)} />
    </div>

    <div {...stylex.props(styles.reactionsSection)}>
     {reactions.map((reaction) => {
      const isActive = currentUserReactions?.includes(reaction.type);
      return (
       <button
        key={reaction.type}
        {...stylex.props(styles.reactionButton, isActive && styles.reactionActive)}
        onClick={() => handleReactionClick(reaction.type)}
        type="button"
       >
        {reaction.emoji}
       </button>
      );
     })}
    </div>

    <div {...stylex.props(styles.actionsSection)}>
     <button {...stylex.props(styles.actionButton)} onClick={handleReply} type="button">
      <i className={"fas fa-reply " + stylex.props(styles.actionIcon).className}></i>
      <span>Reply</span>
     </button>

     {hasText && (
      <button {...stylex.props(styles.actionButton)} onClick={handleCopy} type="button">
       <i className={"fas fa-copy " + stylex.props(styles.actionIcon).className}></i>
       <span>Copy Text</span>
      </button>
     )}

     {hasLink && (
      <button {...stylex.props(styles.actionButton)} onClick={handleOpenLink} type="button">
       <i
        className={
         "fas fa-external-link-alt " + stylex.props(styles.actionIcon).className
        }
       ></i>
       <span>Open in Browser</span>
      </button>
     )}

     {isOwnMessage ? (
      <button
       {...stylex.props(styles.actionButton, styles.deleteAction)}
       onClick={handleDelete}
       type="button"
      >
       <i
        className={
         "fas fa-trash " +
         stylex.props(styles.actionIcon, styles.deleteIcon).className
        }
       ></i>
       <span>Delete</span>
      </button>
     ) : (
      <button
       {...stylex.props(styles.actionButton, styles.reportAction)}
       onClick={() => {
        if (onReport) onReport(message);
        handleClose();
       }}
       type="button"
      >
       <i className={"fas fa-flag " + stylex.props(styles.actionIcon).className}></i>
       <span>Report</span>
      </button>
     )}
    </div>
   </div>
  </>
 );
};

export default MessageActionsSheet;