import { API_BASE_URL } from '../config';
class SimpleCrypto {
 constructor() {
  this.keyPair = null;
  this.initialized = false;
  this.recipientKeys = new Map(); // Cache recipient public keys
 }

 // Generate RSA key pair
 async generateKeyPair() {
  this.keyPair = await window.crypto.subtle.generateKey(
   {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
   },
   true,
   ["encrypt", "decrypt"]
  );
  this.initialized = true;
  return this.keyPair;
 }

 // Export public key to base64
 async exportPublicKey() {
  const exported = await window.crypto.subtle.exportKey("spki", this.keyPair.publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
 }

 // Export private key to base64
 async exportPrivateKey() {
  const exported = await window.crypto.subtle.exportKey("pkcs8", this.keyPair.privateKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
 }

 // Import key pair from base64
 async importKeyPair(publicKeyBase64, privateKeyBase64) {
  const publicKeyData = new Uint8Array(atob(publicKeyBase64).split('').map(c => c.charCodeAt(0)));
  const privateKeyData = new Uint8Array(atob(privateKeyBase64).split('').map(c => c.charCodeAt(0)));

  const publicKey = await window.crypto.subtle.importKey(
   "spki",
   publicKeyData,
   { name: "RSA-OAEP", hash: "SHA-256" },
   true,
   ["encrypt"]
  );

  const privateKey = await window.crypto.subtle.importKey(
   "pkcs8",
   privateKeyData,
   { name: "RSA-OAEP", hash: "SHA-256" },
   true,
   ["decrypt"]
  );

  this.keyPair = { publicKey, privateKey };
  this.initialized = true;
 }

 // Import public key only
 async importPublicKey(base64Key) {
  const keyData = new Uint8Array(atob(base64Key).split('').map(c => c.charCodeAt(0)));
  return await window.crypto.subtle.importKey(
   "spki",
   keyData,
   { name: "RSA-OAEP", hash: "SHA-256" },
   false,
   ["encrypt"]
  );
 }

 async getRecipientPublicKey(recipientId) {
  if (this.recipientKeys.has(recipientId)) {
   return this.recipientKeys.get(recipientId);
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/get-public-keys/${recipientId}`, {
    credentials: 'include'
   });

   if (response.ok) {
    const keys = await response.json();
    if (keys.identity_key_public) {
     const publicKey = await this.importPublicKey(keys.identity_key_public);
     this.recipientKeys.set(recipientId, publicKey);
     return publicKey;
    }
   }
  } catch (error) {
   console.error('Failed to get recipient public key:', error);
  }

  return null;
 }

 // REAL encryption with recipient's public key
 async encryptMessage(recipientId, message) {
  const recipientPublicKey = await this.getRecipientPublicKey(recipientId);

  if (!recipientPublicKey) {
   throw new Error('Recipient public key not available');
  }

  try {
   const encoded = new TextEncoder().encode(message);

   // ACTUAL RSA-OAEP encryption
   const encrypted = await window.crypto.subtle.encrypt(
    {
     name: "RSA-OAEP"
    },
    recipientPublicKey,
    encoded
   );

   return {
    type: 'encrypted',
    body: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
   };
  } catch (error) {
   console.error('Encryption failed:', error);
   throw error;
  }
 }

 // REAL decryption with our private key
 async decryptMessage(senderId, encryptedMessage) {
  if (!this.keyPair || !this.keyPair.privateKey) {
   throw new Error('Private key not available');
  }

  try {
   if (encryptedMessage.type === 'encrypted') {
    // Convert base64 back to ArrayBuffer
    const encryptedData = new Uint8Array(
     atob(encryptedMessage.body)
      .split('')
      .map(c => c.charCodeAt(0))
    );

    // ACTUAL RSA-OAEP decryption
    const decrypted = await window.crypto.subtle.decrypt(
     {
      name: "RSA-OAEP"
     },
     this.keyPair.privateKey,
     encryptedData
    );

    return new Uint8Array(decrypted);
   }

   throw new Error('Invalid encrypted message format');
  } catch (error) {
   console.error('Decryption failed:', error);
   throw error;
  }
 }

 // Generate keys and return in format expected by backend
 async generateKeys() {
  await this.generateKeyPair();
  const publicKey = await this.exportPublicKey();
  const privateKey = await this.exportPrivateKey();

  return {
   identity_key_public: publicKey,
   identity_key_private: privateKey,
   prekey_public: publicKey, // Simplified - using same key
   prekey_private: privateKey,
   signed_prekey_public: publicKey,
   signed_prekey_private: privateKey,
   registration_id: Math.floor(Math.random() * 1000000)
  };
 }

 // Initialize with existing keys
 async initializeStore(keys) {
  if (keys.identity_key_public && keys.identity_key_private) {
   await this.importKeyPair(keys.identity_key_public, keys.identity_key_private);
  }
 }
}

export default new SimpleCrypto();