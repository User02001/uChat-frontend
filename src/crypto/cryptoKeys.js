import sodium from "libsodium-wrappers-sumo";
import { API_BASE_URL } from "../config";
import { deriveMasterKey, decryptPrivateKey, encryptPrivateKey } from "../utils/pinCrypto";

const MEMORY_PK = { value: null };
const MEMORY_SK = { value: null };
let CACHED_PIN = null;

// Change this to store derived key instead of PIN
const STORED_KEY = 'uchat_session_master_key';

export async function ensureDeviceKeypair(pin = null) {
 await sodium.ready;
 if (MEMORY_PK.value && MEMORY_SK.value) {
  return {
   publicKey_b64: MEMORY_PK.value,
   privateKey_b64: MEMORY_SK.value,
   publicKey: sodium.from_base64(MEMORY_PK.value),
   privateKey: sodium.from_base64(MEMORY_SK.value),
  };
 }

 // Try to get cached DERIVED KEY (not PIN) from localStorage
 let masterKey = null;
 const storedKey_b64 = localStorage.getItem(STORED_KEY);

 if (storedKey_b64) {
  try {
   masterKey = sodium.from_base64(storedKey_b64);
  } catch {
   localStorage.removeItem(STORED_KEY);
  }
 }

 // If no cached key and no PIN provided, ask for PIN
 if (!masterKey && !pin) {
  throw new Error("Please enter your PIN to decrypt your messages.");
 }

 try {
  const response = await fetch(`${API_BASE_URL}/api/keys/my-device`, {
   credentials: "include",
  });

  if (response.ok) {
   const data = await response.json();

   if (data.encrypted_private_key && data.master_key_salt) {
    try {
     // If we don't have masterKey, derive it from PIN
     if (!masterKey) {
      masterKey = await deriveMasterKey(pin, data.master_key_salt);

      // Store DERIVED KEY (not PIN!) in localStorage
      localStorage.setItem(STORED_KEY, sodium.to_base64(masterKey));
     }

     const privateKey_b64 = await decryptPrivateKey(data.encrypted_private_key, masterKey);

     MEMORY_PK.value = data.public_key;
     MEMORY_SK.value = privateKey_b64;

     return {
      publicKey_b64: data.public_key,
      privateKey_b64: privateKey_b64,
      publicKey: sodium.from_base64(data.public_key),
      privateKey: sodium.from_base64(privateKey_b64),
     };
    } catch (decryptError) {
     // Clear invalid cached key
     localStorage.removeItem(STORED_KEY);
     throw new Error("Incorrect PIN. Please try again.");
    }
   }
  } else if (response.status === 404) {
   throw new Error("Please set up your PIN to continue.");
  } else if (response.status === 401) {
   throw new Error("Session expired. Please log in again.");
  }
 } catch (err) {
  if (err.message.includes("Incorrect PIN") ||
   err.message.includes("set up your PIN") ||
   err.message.includes("Session expired")) {
   throw err;
  }
  console.error("Failed to fetch keys:", err);
  throw new Error("Unable to access your encryption keys. Please try again.");
 }

 throw new Error("Please enter your PIN to decrypt your messages.");
}

export async function createAndSaveKeypair(pin) {
 console.log('[KEYS] createAndSaveKeypair called with pin length:', pin?.length);

 if (!pin || pin.length !== 6) {
  throw new Error("Please enter a valid 6-digit PIN.");
 }

 if (!/^\d+$/.test(pin)) {
  throw new Error("PIN must contain only numbers.");
 }

 try {
  await sodium.ready;

  const { publicKey, privateKey } = sodium.crypto_box_keypair();
  const publicKey_b64 = sodium.to_base64(publicKey);
  const privateKey_b64 = sodium.to_base64(privateKey);

  console.log('[KEYS] Generated keypair');

  const salt = sodium.randombytes_buf(16);
  const salt_b64 = sodium.to_base64(salt);

  console.log('[KEYS] Deriving master key...');
  const masterKey = await deriveMasterKey(pin, salt_b64);

  console.log('[KEYS] Encrypting private key...');
  const encryptedPrivateKey = await encryptPrivateKey(privateKey_b64, masterKey);

  console.log('[KEYS] Hashing PIN...');
  const pinHash = await hashPin(pin);

  console.log('[KEYS] Saving to server...');
  const response = await fetch(`${API_BASE_URL}/api/keys/my-device`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   credentials: "include",
   body: JSON.stringify({
    public_key: publicKey_b64,
    encrypted_private_key: encryptedPrivateKey,
    master_key_salt: salt_b64,
    pin_hash: pinHash
   }),
  });

  if (!response.ok) {
   const error = await response.json();
   console.error('[KEYS] Server error:', error);

   if (response.status === 409) {
    throw new Error("A PIN is already set up for this device.");
   } else if (response.status === 401) {
    throw new Error("Session expired. Please log in again.");
   } else if (response.status === 400) {
    throw new Error("Invalid PIN format. Please try again.");
   }

   throw new Error("Failed to save your PIN. Please try again.");
  }

  console.log('[KEYS] Keys saved successfully');

  MEMORY_PK.value = publicKey_b64;
  MEMORY_SK.value = privateKey_b64;

  // Store DERIVED KEY (not PIN!) in localStorage
  localStorage.setItem(STORED_KEY, sodium.to_base64(masterKey));

  return { publicKey_b64, privateKey_b64 };
 } catch (err) {
  if (err.message.includes("PIN") ||
   err.message.includes("Session") ||
   err.message.includes("device")) {
   throw err;
  }

  console.error('[KEYS] Unexpected error:', err);
  throw new Error("Something went wrong while setting up your PIN. Please try again.");
 }
}

async function hashPin(pin) {
 if (!pin || typeof pin !== 'string') {
  throw new Error('Please enter a valid PIN.');
 }

 try {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 } catch (err) {
  throw new Error('Failed to process your PIN. Please try again.');
 }
}

export async function getPublicKeyB64() {
 const { publicKey_b64 } = await ensureDeviceKeypair();
 return publicKey_b64;
}