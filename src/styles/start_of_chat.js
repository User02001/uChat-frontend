import * as stylex from "@stylexjs/stylex";

export const StartOfChatStyles = stylex.create({
 startOfChat: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  paddingTop: 25,
  paddingRight: 20,
  paddingBottom: 25,
  paddingLeft: 20,
  marginTop: -20,
 },

 avatar: {
  width: 80,
  height: 80,
  marginBottom: 14,
  cursor: "pointer",
 },

 avatarImg: {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
 },

 username: {
  fontSize: 32,
  fontWeight: 700,
  color: "var(--text-primary, #fff)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 4,
  marginLeft: 0,
  lineHeight: 1.2,
 },

 handle: {
  fontSize: 20,
  fontWeight: 400,
  color: "var(--text-secondary, #b9bbbe)",
  marginTop: 0,
  marginRight: 0,
  marginBottom: 8,
  marginLeft: 0,
 },

 message: {
  fontSize: 16,
  color: "var(--text-secondary, #b9bbbe)",
  lineHeight: 1.4,
 },

 separator: {
  width: "100%",
  height: 1,
  backgroundColor: "var(--border, #40444b)",
  marginTop: 20,
 },
});
