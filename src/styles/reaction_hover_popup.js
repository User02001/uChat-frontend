import * as stylex from "@stylexjs/stylex";

const reactionPopupAppear = stylex.keyframes({
 from: { opacity: 0, transform: "translateY(-5px)" },
 to: { opacity: 1, transform: "translateY(0)" },
});

export const ReactionHoverPopupStyles = stylex.create({
 popup: {
  "--btn-size": "32px",
  "--gap": "4px",
  backgroundColor: "var(--bg-secondary)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--border)",
  borderRadius: 10,
  padding: 6,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
  width: "fit-content",
  height: "fit-content",
  position: "absolute",
  zIndex: 100,

  ":global([data-theme='dark']) &": {
   backgroundColor: "var(--bg-tertiary)",
   boxShadow: "0 10px 36px rgba(0, 0, 0, 0.55)",
  },

  "@media (max-width: 1200px)": {
   "--btn-size": "30px",
   "--gap": "3px",
   padding: 5,
  },

  "@media (max-width: 768px)": {
   "--btn-size": "28px",
   "--gap": "3px",
   borderRadius: 8,
   padding: 5,
  },

  "@media (max-width: 480px)": {
   "--btn-size": "26px",
   "--gap": "2px",
   padding: 4,
  },
 },

 grid: {
  display: "flex",
  flexWrap: "nowrap",
  columnGap: "var(--gap)",
  rowGap: "var(--gap)",
  alignItems: "center",
  justifyContent: "center",

  "@media (max-width: 768px)": {
   gridTemplateColumns: "repeat(9, var(--btn-size))",
  },

  "@media (max-width: 480px)": {
   gridTemplateColumns: "repeat(9, var(--btn-size))",
  },
 },

 button: {
  width: "var(--btn-size)",
  height: "var(--btn-size)",
  borderWidth: 0,
  borderStyle: "solid",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: 8,
  fontSize: 18,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition:
   "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease",
  color: "var(--text-primary)",
  flexShrink: 0,

  ":hover": {
   backgroundColor: "var(--border)",
   transform: "scale(1.1)",
  },

  ":active": {
   transform: "scale(0.95)",
  },

  "@media (max-width: 1200px)": {
   fontSize: 16,
  },

  "@media (max-width: 768px)": {
   fontSize: 15,
   borderRadius: 6,
  },

  "@media (max-width: 480px)": {
   fontSize: 14,
  },
 },
});
