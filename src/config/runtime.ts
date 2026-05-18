export const runtimeConfig = {
  signalK: {
    enabled: import.meta.env.VITE_SIGNALK_ENABLED === 'true',
    url: import.meta.env.VITE_SIGNALK_WS_URL ?? 'ws://localhost:3000/signalk/v1/stream?subscribe=none',
  },
};
