import React, { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ReportMessageModalStyles as styles } from "../styles/report_message_modal";

const ReportMessageModal = ({ message, onClose, onSubmit }) => {
 const [category, setCategory] = useState(null);
 const [submitting, setSubmitting] = useState(false);

 const categories = [
  { id: "sexual", label: "Sexual/inappropriate content", icon: "🔞" },
  { id: "harassment", label: "Harassment or bullying", icon: "😢" },
  { id: "spam", label: "Spam or scam", icon: "📧" },
  { id: "threats", label: "Threats or violence", icon: "⚠️" },
  { id: "other", label: "Something else", icon: "❓" },
 ];

 const handleSubmit = async () => {
  if (submitting) return;

  setSubmitting(true);
  await onSubmit(message.id, category);
  setSubmitting(false);
  onClose();
 };

 return (
  <div {...stylex.props(styles.overlay)} onClick={onClose}>
   <div {...stylex.props(styles.modal)} onClick={(e) => e.stopPropagation()}>
    <div {...stylex.props(styles.header)}>
     <div {...stylex.props(styles.headerTitle)}>
      <i className={"fas fa-flag " + stylex.props(styles.headerTitleIcon).className} />
      <h2 {...stylex.props(styles.headerTitleText)}>Report this message</h2>
     </div>

     <button {...stylex.props(styles.closeBtn)} onClick={onClose} type="button">
      <i className="fas fa-times" />
     </button>
    </div>

    <div {...stylex.props(styles.content)}>
     <p {...stylex.props(styles.description)}>
      This will be reviewed by our moderation team. The sender WON'T know at ALL you reported
      them. Be brave. Don't hesitate to get help if you feel like it. Please stay safe while
      we review this message. Call your country's emergency number if you feel in immediate
      danger. You DON'T have to choose any category for your comfort, but providing it can
      help us. Your choice.
     </p>

     <div {...stylex.props(styles.categoryLabel)}>What's wrong with this message?</div>

     <div {...stylex.props(styles.categories)}>
      {categories.map((cat) => (
       <button
        key={cat.id}
        {...stylex.props(
         styles.categoryBtn,
         category === cat.id && styles.categoryBtnSelected
        )}
        onClick={() => setCategory(cat.id)}
        type="button"
       >
        <span {...stylex.props(styles.categoryIcon)}>{cat.icon}</span>
        <span {...stylex.props(styles.categoryText)}>{cat.label}</span>
        {category === cat.id && (
         <i
          className={"fas fa-check-circle " + stylex.props(styles.checkIcon).className}
         />
        )}
       </button>
      ))}
     </div>

     <div {...stylex.props(styles.actions)}>
      <button {...stylex.props(styles.cancelBtn)} onClick={onClose} type="button">
       Cancel
      </button>

      <button
       {...stylex.props(styles.submitBtn)}
       onClick={handleSubmit}
       disabled={submitting}
       type="button"
      >
       {submitting ? "Submitting..." : "Submit Report"}
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};

export default ReportMessageModal;
