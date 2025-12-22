import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
 callButtons: {
  display: "flex",
  gap: "12px",
  marginLeft: "auto",
  "@media (max-width: 768px)": {
   gap: "10px",
   marginRight: "-5px",
  },
 },
 callBtn: {
  width: "44px",
  height: "44px",
  border: "1px solid var(--border)",
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  transition: "all 0.2s ease",
  position: "relative",
  "@media (max-width: 768px)": {
   width: "42px",
   height: "42px",
   fontSize: "17px",
   background: "transparent",
   border: "none",
   color: "#ffa500",
  },
 },
 callBtnHover: {
  ":hover:not(:disabled)": {
   background: "var(--button-primary)",
   color: "white",
   transform: "scale(1.1)",
  },
  "@media (max-width: 768px)": {
   ":hover:not(:disabled)": {
    background: "rgba(128, 128, 128, 0.3)",
    color: "#ffa500",
    transform: "none",
   },
  },
 },
 callBtnActive: {
  ":active:not(:disabled)": {
   transform: "scale(0.95)",
  },
  "@media (max-width: 768px)": {
   ":active:not(:disabled)": {
    background: "rgba(128, 128, 128, 0.5)",
    transform: "scale(0.95)",
   },
  },
 },
 callBtnDisabled: {
  ":disabled": {
   opacity: 0.5,
   cursor: "not-allowed",
   transform: "none",
  },
 },
});