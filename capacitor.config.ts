import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.photoaicleaner.app',
  appName: 'photo-ai-cleaner',
  webDir: 'dist',
  server: {
    url: 'https://15f530c1-fddd-446f-b693-e108790c47ec.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    AdMob: {
      // Configure AdMob settings here if needed
    }
  }
};

export default config;
