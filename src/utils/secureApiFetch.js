import { generateDeviceFingerprint } from './deviceFingerprint';
import { API_BASE_URL } from '../config';

// Store original fetch
const originalFetch = window.fetch;

// Override global fetch for API calls only
window.fetch = function (url, options = {}) {
 // Only add fingerprint to OUR API calls
 if (typeof url === 'string' && url.includes(API_BASE_URL)) {
  const fingerprint = generateDeviceFingerprint();

  options.headers = {
   ...options.headers,
   'X-Device-Fingerprint': fingerprint,
  };
 }

 return originalFetch(url, options);
};

export default window.fetch;