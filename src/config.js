const config = {
 development: {
  API_BASE_URL: 'https://192.168.1.48:5001',
  CDN_BASE_URL: 'https://192.168.1.48:5001',  // Add CDN
  SOCKET_URL: 'https://192.168.1.48:5001'
 },
 production: {
  API_BASE_URL: 'https://api.ufonic.xyz',
  CDN_BASE_URL: 'https://cdn.ufonic.xyz',  // Add CDN
  SOCKET_URL: 'https://api.ufonic.xyz'
 }
};

// Detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const environment = isDevelopment ? 'development' : 'production';

export const API_BASE_URL = config[environment].API_BASE_URL;
export const CDN_BASE_URL = config[environment].CDN_BASE_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;

export default config[environment];