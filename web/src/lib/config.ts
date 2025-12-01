// Environment configuration
const isDevelopment = import.meta.env.DEV;

export const config = {
  apiBaseUrl: isDevelopment
    ? 'https://pickleapp-dev.onrender.com'
    : 'https://pickleapp.onrender.com',
  websocketUrl: isDevelopment
    ? 'wss://pickleapp-dev-websocket.onrender.com'
    : 'wss://pickleapp-websocket.onrender.com',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
