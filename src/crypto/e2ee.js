import sodium from "libsodium-wrappers-sumo";
import { ensureDeviceKeypair } from "./cryptoKeys";

const PREFIX = "enc:v1:";

export async function encryptFor(recipientPk_b64, plaintext) {
 await sodium.ready;
 const rpk = sodium.from_base64(recipientPk_b64);
 const msg = new TextEncoder().encode(plaintext);
 const sealed = sodium.crypto_box_seal(msg, rpk);
 return PREFIX + sodium.to_base64(sealed);
}

export async function decryptMaybe(content) {
 if (!content || typeof content !== "string") return content;
 if (!content.startsWith(PREFIX)) return content;

 console.log('[DECRYPT] Attempting to decrypt:', content.substring(0, 50) + '...');

 try {
  await sodium.ready;
  const { publicKey, privateKey } = await ensureDeviceKeypair();

  console.log('[DECRYPT] Keys available:', !!publicKey, !!privateKey);

  if (!publicKey || !privateKey) {
   console.log('[DECRYPT] No keys available, returning stripped content');
   return content.slice(PREFIX.length);
  }

  const ct = sodium.from_base64(content.slice(PREFIX.length));
  const opened = sodium.crypto_box_seal_open(ct, publicKey, privateKey);
  const decrypted = new TextDecoder().decode(opened);

  console.log('[DECRYPT] Successfully decrypted:', decrypted.substring(0, 20) + '...');
  return decrypted;
 } catch (err) {
  console.error('[DECRYPT] Decryption failed:', err);
  return content.slice(PREFIX.length);
 }
}

// Encrypt message for BOTH sender and receiver
export async function encryptMessageDouble(plaintext, recipientPk_b64) {
 const { publicKey_b64 } = await ensureDeviceKeypair();

 const content_receiver = await encryptFor(recipientPk_b64, plaintext);
 const content_sender = await encryptFor(publicKey_b64, plaintext);

 return { content_receiver, content_sender };
}