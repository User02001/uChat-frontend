import React from "react";
import * as stylex from "@stylexjs/stylex";
import { StartOfChatStyles as styles } from "../styles/start_of_chat";

const StartOfChat = ({ contact, onProfileClick, API_BASE_URL }) => {
 const isPendingOutgoing =
  Boolean(contact?.pending_request && contact?.request_status === "pending_outgoing");

 const handleText = contact?.handle
  ? `@${String(contact.handle).replace(/^@/, "")}`
  : null;

 return (
  <div {...stylex.props(styles.startOfChat)}>
   <div
    {...stylex.props(styles.avatar)}
    onClick={() => {
     if (isPendingOutgoing) return;
     onProfileClick?.(contact);
    }}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
     if (isPendingOutgoing) return;
     if (e.key === "Enter" || e.key === " ") onProfileClick?.(contact);
    }}
    title={isPendingOutgoing ? "Profile hidden until they accept" : undefined}
   >
    <img
     src={
      contact?.avatar_url
       ? `${API_BASE_URL}${contact.avatar_url}`
       : "/resources/default_avatar.png"
     }
     alt={contact?.username || "User"}
     {...stylex.props(styles.avatarImg)}
     draggable="false"
    />
   </div>

   <h1 {...stylex.props(styles.username)}>{contact?.username}</h1>

   {handleText && <p {...stylex.props(styles.handle)}>{handleText}</p>}

   <p {...stylex.props(styles.message)}>
    {isPendingOutgoing
     ? `Message request pending. Once they accept, you can chat normally and use GIF's, react, send files and more.`
     : `Your conversation with ${contact.username} has started here!`}
   </p>

   <div {...stylex.props(styles.separator)} />
  </div>
 );
};

export default StartOfChat;
