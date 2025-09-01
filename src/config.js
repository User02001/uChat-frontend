const config = {
 development: {
  API_BASE_URL: 'https://tooth-procurement-scholarships-dictionary.trycloudflare.com',
  SOCKET_URL: 'https://tooth-procurement-scholarships-dictionary.trycloudflare.com'
 },
 production: {
  API_BASE_URL: 'https://tooth-procurement-scholarships-dictionary.trycloudflare.com',
  SOCKET_URL: 'https://tooth-procurement-scholarships-dictionary.trycloudflare.com'
 }
};

// Detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const environment = isDevelopment ? 'development' : 'production';

export const API_BASE_URL = config[environment].API_BASE_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;

export default config[environment];