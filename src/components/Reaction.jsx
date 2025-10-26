import React, { useEffect } from 'react';
import './Reaction.css';

const REACTIONS = [
 { type: 'like', emoji: '👍', label: 'Like' },
 { type: 'love', emoji: '❤️', label: 'Love' },
 { type: 'happy', emoji: '😂', label: 'Happy' },
 { type: 'sad', emoji: '😢', label: 'Sad' },
 { type: 'angry', emoji: '😡', label: 'Angry' },
 { type: 'dislike', emoji: '👎', label: 'Dislike' },
 { type: 'skull', emoji: '💀', label: 'Dead' }
];

const Reaction = ({
 messageId,
 reactions = {},
 onAddReaction,
 onRemoveReaction,
 currentUserId
}) => {
  const getTooltipText = (reactionType) => {
    const reactionData = reactions[reactionType];
    if (!reactionData || !reactionData.users.length) return '';
    const users = reactionData.users;
    const count = users.length;

    if (count === 1) {
      return users.includes(currentUserId) ? 'You reacted' : '1 person reacted';
    } else if (count === 2) {
      if (users.includes(currentUserId)) {
        return 'You and 1 other reacted';
      }
      return '2 people reacted';
    } else {
      if (users.includes(currentUserId)) {
        return `You and ${count - 1} others reacted`;
      }
      return `${count} people reacted`;
    }
  };

  const activeReactions = Object.entries(reactions).filter(
    ([_, data]) => data.users && data.users.length > 0
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
   {/* Display Active Reactions */}
      {activeReactions.length > 0 && (
        <div className="message-reactions">
          {activeReactions.map(([reactionType, data]) => {
            const reaction = REACTIONS.find((r) => r.type === reactionType);
            const userReacted = data.users.includes(currentUserId);
            return (
              <div
                key={reactionType}
                className={`reaction-display ${reactionType} ${
                  userReacted ? 'user-reacted' : ''
                }`}
                onClick={() => handleReactionClick(reactionType)}
                data-tooltip={getTooltipText(reactionType)}
              >
                <span className="reaction-icon">{reaction.emoji}</span>
                <span className="reaction-count">{data.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Reaction;
