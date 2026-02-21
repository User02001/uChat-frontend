import React, { useState, useRef, useEffect } from "react";
import EmojiPickerSheet from "./EmojiPickerSheet";
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
 const [showEmojiSheet, setShowEmojiSheet] = useState(false);
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
  setTimeout(onClose, 200);
 };

 const handleReactionClick = (reactionType) => {
  const isActive = currentUserReactions?.includes(reactionType);
  if (isActive) onRemoveReaction(message.id, reactionType);
  else onAddReaction(message.id, reactionType);
  handleClose();
 };

 const handleReply = () => { onReply(message); handleClose(); };
 const handleDelete = () => { onDelete(message); handleClose(); };

 const handleCopy = async () => {
  try {
   if (message.content) await navigator.clipboard.writeText(message.content);
  } catch (err) {
   console.error("Failed to copy:", err);
  }
  handleClose();
 };

 const hasLink =
  message.content &&
  (message.content.includes("http://") ||
   message.content.includes("https://") ||
   message.content.includes("www."));

 const handleOpenLink = () => {
  let url = message.content;
  const urlMatch = url.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/i);
  if (urlMatch) url = urlMatch[0];
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  window.open(url, "_blank", "noopener,noreferrer");
  handleClose();
 };

 const hasText =
  message.content &&
  message.message_type !== "image" &&
  message.message_type !== "file";

 // Drag-to-dismiss
 useEffect(() => {
  const sheet = sheetRef.current;
  if (!sheet) return;
  let startY = 0, curr = 0, isDragging = false;

  const onDown = (e) => {
   if (!handleAreaRef.current?.contains(e.target)) return;
   isDragging = true;
   startY = e.clientY;
   curr = 0;
   sheet.style.transition = "none";
   e.preventDefault();
  };
  const onMove = (e) => {
   if (!isDragging) return;
   const d = e.clientY - startY;
   if (d > 0) { curr = d; sheet.style.transform = `translateY(${d}px)`; }
  };
  const onUp = () => {
   if (!isDragging) return;
   isDragging = false;
   if (curr > 100) handleClose();
   else {
    sheet.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    sheet.style.transform = "translateY(0)";
   }
  };

  sheet.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  return () => {
   sheet.removeEventListener("pointerdown", onDown);
   window.removeEventListener("pointermove", onMove);
   window.removeEventListener("pointerup", onUp);
   window.removeEventListener("pointercancel", onUp);
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

    {/* Reactions row — scrollable, no squishing */}
    <div {...stylex.props(styles.reactionsSection)}>
     {reactions.map((r) => {
      const isActive = currentUserReactions?.includes(r.type);
      return (
       <button
        key={r.type}
        {...stylex.props(styles.reactionButton, isActive && styles.reactionActive)}
        onClick={() => handleReactionClick(r.type)}
        type="button"
        title={r.emoji}
       >
        {r.emoji}
       </button>
      );
     })}

     {/* "+" button — now properly styled */}
     <button
      {...stylex.props(styles.moreReactionsBtn)}
      onClick={() => setShowEmojiSheet(true)}
      type="button"
      title="More reactions"
     >
      <i className="fas fa-plus" />
     </button>
    </div>

    {showEmojiSheet && (
     <EmojiPickerSheet
      messageId={message.id}
      onAddReaction={(msgId, emoji) => {
       onAddReaction(msgId, emoji);
       handleClose();
      }}
      onClose={() => setShowEmojiSheet(false)}
     />
    )}

    <div {...stylex.props(styles.actionsSection)}>
     <button {...stylex.props(styles.actionButton)} onClick={handleReply} type="button">
      <i className={"fas fa-reply " + stylex.props(styles.actionIcon).className} />
      <span>Reply</span>
     </button>

     {hasText && (
      <button {...stylex.props(styles.actionButton)} onClick={handleCopy} type="button">
       <i className={"fas fa-copy " + stylex.props(styles.actionIcon).className} />
       <span>Copy Text</span>
      </button>
     )}

     {hasLink && (
      <button {...stylex.props(styles.actionButton)} onClick={handleOpenLink} type="button">
       <i className={"fas fa-external-link-alt " + stylex.props(styles.actionIcon).className} />
       <span>Open in Browser</span>
      </button>
     )}

     {isOwnMessage ? (
      <button
       {...stylex.props(styles.actionButton, styles.deleteAction)}
       onClick={handleDelete}
       type="button"
      >
       <i className={"fas fa-trash " + stylex.props(styles.actionIcon, styles.deleteIcon).className} />
       <span>Delete</span>
      </button>
     ) : (
      <button
       {...stylex.props(styles.actionButton, styles.reportAction)}
       onClick={() => { if (onReport) onReport(message); handleClose(); }}
       type="button"
      >
       <i className={"fas fa-flag " + stylex.props(styles.actionIcon).className} />
       <span>Report</span>
      </button>
     )}
    </div>
   </div>
  </>
 );
};

export default MessageActionsSheet;