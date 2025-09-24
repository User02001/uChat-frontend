const config = {
 development: {
  API_BASE_URL: 'https://192.168.1.48:5001',
  SOCKET_URL: 'https://192.168.1.48:5001',
  CDN_BASE_URL: 'https://cdn.ufonic.xyz' // Same as API in dev
 },
 production: {
  API_BASE_URL: 'https://api.ufonic.xyz',
  SOCKET_URL: 'https://api.ufonic.xyz',
  CDN_BASE_URL: 'https://cdn.ufonic.xyz' // CDN subdomain in prod
 }
};

// Detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const environment = isDevelopment ? 'development' : 'production';

export const API_BASE_URL = config[environment].API_BASE_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;
export const CDN_BASE_URL = config[environment].CDN_BASE_URL;

export default config[environment];