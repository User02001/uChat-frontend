import React from "react";
import * as stylex from "@stylexjs/stylex";
import { ReactionBadgeStyles as styles } from "../styles/reaction_badge";

const REACTIONS = [
 { type: "like", emoji: "👍", label: "Like" },
 { type: "love", emoji: "❤️", label: "Love" },
 { type: "happy", emoji: "😂", label: "Happy" },
 { type: "sad", emoji: "😢", label: "Sad" },
 { type: "angry", emoji: "😡", label: "Angry" },
 { type: "dislike", emoji: "👎", label: "Dislike" },
 { type: "skull", emoji: "💀", label: "Dead" },
];

const iconStyleByType = {
 like: styles.iconLike,
 love: styles.iconLove,
 happy: styles.iconHappy,
 sad: styles.iconSad,
 angry: styles.iconAngry,
 dislike: styles.iconDislike,
 skull: styles.iconSkull,
};

const ReactionBadge = ({
 messageId,
 reactions = {},
 onAddReaction,
 onRemoveReaction,
 currentUserId,
}) => {
 const getTooltipText = (reactionType) => {
  const reactionData = reactions[reactionType];
  if (!reactionData || !reactionData.users.length) return "";
  const users = reactionData.users;
  const count = users.length;

  if (count === 1) {
   return users.includes(currentUserId) ? "You reacted" : "1 person reacted";
  } else if (count === 2) {
   if (users.includes(currentUserId)) {
    return "You and 1 other reacted";
   }
   return "2 people reacted";
  } else {
   if (users.includes(currentUserId)) {
    return `You and ${count - 1} others reacted`;
   }
   return `${count} people reacted`;
  }
 };

 const activeReactions = Object.entries(reactions).filter(
  ([, data]) => data.users && data.users.length > 0
 );

 const handleReactionClick = (reactionType) => {
  const userReactions = reactions[reactionType]?.users || [];
  const hasReacted = userReactions.includes(currentUserId);

  if (hasReacted) {
   onRemoveReaction(messageId, reactionType);
  } else {
   onAddReaction(messageId, reactionType);
  }
 };

 return (
  <>
   {activeReactions.length > 0 && (
    <div {...stylex.props(styles.messageReactions)}>
     {activeReactions.map(([reactionType, data]) => {
      const reaction = REACTIONS.find((r) => r.type === reactionType);
      const displayEmoji = reaction?.emoji ?? reactionType;
      const userReacted = data.users.includes(currentUserId);

      return (
       <div
        key={reactionType}
        {...stylex.props(
         styles.reactionDisplay,
         userReacted && styles.reactionDisplayUserReacted
        )}
        onClick={() => handleReactionClick(reactionType)}
        data-tooltip={getTooltipText(reactionType)}
       >
        <span
         {...stylex.props(styles.reactionIcon, iconStyleByType[reactionType])}
        >
         {displayEmoji}
        </span>
        <span {...stylex.props(styles.reactionCount)}>{data.count}</span>
       </div>
      );
     })}
    </div>
   )}
  </>
 );
};

export default ReactionBadge;
