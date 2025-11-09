import sodium from "libsodium-wrappers-sumo";

export async function deriveMasterKey(pin, salt_b64) {
 await sodium.ready;
 const salt = sodium.from_base64(salt_b64);
 const pinBytes = new TextEncoder().encode(pin);

 const key = await sodium.crypto_pwhash(
  32,
  pinBytes,
  salt,
  sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
  sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
  sodium.crypto_pwhash_ALG_ARGON2ID13
 );
 return key;
}

export async function encryptPrivateKey(privateKey_b64, masterKey) {
 await sodium.ready;
 const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
 const pk = sodium.from_base64(privateKey_b64);
 const cipher = sodium.crypto_secretbox_easy(pk, nonce, masterKey);

 const combined = new Uint8Array(nonce.length + cipher.length);
 combined.set(nonce);
 combined.set(cipher, nonce.length);

 return sodium.to_base64(combined);
}

export async function decryptPrivateKey(encryptedPK_b64, masterKey) {
 await sodium.ready;
 const combined = sodium.from_base64(encryptedPK_b64);
 const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES);
 const cipher = combined.slice(sodium.crypto_secretbox_NONCEBYTES);

 const privateKey = sodium.crypto_secretbox_open_easy(cipher, nonce, masterKey);
 return sodium.to_base64(privateKey);
}