// Monetization Configuration
// Replace these with your actual IDs before releasing to production

export const ADMOB_CONFIG = {
  // Your production ad unit IDs
  BANNER_AD_ID: {
    ios: 'ca-app-pub-4584390638970294/4620714041',
    android: 'ca-app-pub-4584390638970294/4620714041',
    web: 'ca-app-pub-4584390638970294/4620714041',
  },
  INTERSTITIAL_AD_ID: {
    ios: 'ca-app-pub-4584390638970294/8552112396',
    android: 'ca-app-pub-4584390638970294/8552112396',
    web: 'ca-app-pub-4584390638970294/8552112396',
  },
  // Set to true during development, false in production
  USE_TEST_ADS: false,
};

export const IAP_CONFIG = {
  // RevenueCat API Keys
  // Get these from https://app.revenuecat.com/
  REVENUECAT_API_KEY: {
    ios: 'YOUR_IOS_API_KEY_HERE',
    android: 'YOUR_ANDROID_API_KEY_HERE',
  },
  
  // Product IDs - must match what you configured in App Store Connect and Google Play Console
  AD_REMOVAL_PRODUCT_ID: 'remove_ads',
  
  // Entitlement ID - must match what you configured in RevenueCat
  AD_FREE_ENTITLEMENT: 'ad_free',
};

// PRODUCTION CHECKLIST:
// 1. Replace AdMob test IDs with your real ad unit IDs
// 2. Set USE_TEST_ADS to false
// 3. Add your RevenueCat API keys
// 4. Configure your IAP products in App Store Connect (iOS) and Google Play Console (Android)
// 5. Configure products and entitlements in RevenueCat dashboard
// 6. Test on physical devices before releasing
