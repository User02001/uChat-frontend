const config = {
 development: {
  API_BASE_URL: 'http://localhost:5000',
  SOCKET_URL: 'http://localhost:5000'
 },
 production: {
  API_BASE_URL: 'https://pathology-dover-travelers-equilibrium.trycloudflare.com',
  SOCKET_URL: 'https://pathology-dover-travelers-equilibrium.trycloudflare.com'
 }
};

// Detect environment
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const environment = isDevelopment ? 'development' : 'production';

export const API_BASE_URL = config[environment].API_BASE_URL;
export const SOCKET_URL = config[environment].SOCKET_URL;

export default config[environment];