import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.serviq.app',
  appName: 'SERVIQ',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
