import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.photoaicleaner.app',
  appName: 'photo-ai-cleaner',
  webDir: 'dist',

  // Uncomment for live preview from Lovable.dev if needed
  // server: {
  //   url: 'https://15f530c1-fddd-446f-b693-e108790c47ec.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    AdMob: {
      // your AdMob config (optional)
    },
    Camera: {
      saveToGallery: true,        // saves captured photos to the gallery
      allowEditing: false,        // set to true if you want user editing
      resultType: 'uri',          // ensures you get file URIs, not base64
    },
    Filesystem: {
      directory: 'EXTERNAL',      // use shared storage
    },
  },

  android: {
    allowMixedContent: true,      // fixes API calls if using HTTP endpoints
  },
};

export default config;