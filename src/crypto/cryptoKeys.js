import sodium from "libsodium-wrappers";
import { API_BASE_URL } from "../config";

const MEMORY_PK = { value: null };
const MEMORY_SK = { value: null };

export async function ensureDeviceKeypair() {
 await sodium.ready;

 // Check memory first
 if (MEMORY_PK.value && MEMORY_SK.value) {
  return {
   publicKey_b64: MEMORY_PK.value,
   privateKey_b64: MEMORY_SK.value,
   publicKey: sodium.from_base64(MEMORY_PK.value),
   privateKey: sodium.from_base64(MEMORY_SK.value),
  };
 }

 // Try to fetch from server
 try {
  const response = await fetch(`${API_BASE_URL}/api/keys/my-device`, {
   credentials: "include",
  });
  if (response.ok) {
   const data = await response.json();
   if (data.public_key && data.private_key) {
    MEMORY_PK.value = data.public_key;
    MEMORY_SK.value = data.private_key;
    return {
     publicKey_b64: data.public_key,
     privateKey_b64: data.private_key,
     publicKey: sodium.from_base64(data.public_key),
     privateKey: sodium.from_base64(data.private_key),
    };
   }
  }
 } catch (err) {
 }

 // Generate new keypair
 const { publicKey, privateKey } = sodium.crypto_box_keypair();
 const pk = sodium.to_base64(publicKey);
 const sk = sodium.to_base64(privateKey);

 MEMORY_PK.value = pk;
 MEMORY_SK.value = sk;

 // Save to server
 try {
  await fetch(`${API_BASE_URL}/api/keys/my-device`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   credentials: "include",
   body: JSON.stringify({ public_key: pk, private_key: sk }),
  });
 } catch (err) {
 }

 return {
  publicKey_b64: pk,
  privateKey_b64: sk,
  publicKey: sodium.from_base64(pk),
  privateKey: sodium.from_base64(sk),
 };
}

export async function getPublicKeyB64() {
 const { publicKey_b64 } = await ensureDeviceKeypair();
 return publicKey_b64;
}