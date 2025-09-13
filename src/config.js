const config = {
 development: {
  API_BASE_URL: 'http://192.168.1.48:5001',
  SOCKET_URL: 'http://192.168.1.48:5001'
 },
 production: {
  API_BASE_URL: 'https://sofa-sacrifice-computed-levels.trycloudflare.com',
  SOCKET_URL: 'https://sofa-sacrifice-computed-levels.trycloudflare.com'
 }
};

// Detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const environment = isDevelopment ? 'development' : 'production';

export const API_BASE_URL = config[environment].API_BASE_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;

export default config[environment];