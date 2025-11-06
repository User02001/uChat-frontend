import sodium from "libsodium-wrappers";
import { ensureDeviceKeypair } from "./cryptoKeys";

const PREFIX = "enc:v1:"; // simple marker for ciphertext

export async function encryptFor(recipientPk_b64, plaintext) {
 await sodium.ready;
 const rpk = sodium.from_base64(recipientPk_b64);
 const msg = new TextEncoder().encode(plaintext);
 const sealed = sodium.crypto_box_seal(msg, rpk);
 return PREFIX + sodium.to_base64(sealed);
}

export async function decryptMaybe(content) {
 if (!content || typeof content !== "string") return content;
 if (!content.startsWith("enc:v1:")) return content;
 try {
  await sodium.ready;
  const { publicKey, privateKey } = await ensureDeviceKeypair();
  if (!publicKey || !privateKey) {
   return content.slice("enc:v1:".length);
  }
  const ct = sodium.from_base64(content.slice("enc:v1:".length));
  const opened = sodium.crypto_box_seal_open(ct, publicKey, privateKey);
  const plaintext = new TextDecoder().decode(opened);
  return plaintext;
 } catch (err) {
  return content.slice("enc:v1:".length);
 }
}