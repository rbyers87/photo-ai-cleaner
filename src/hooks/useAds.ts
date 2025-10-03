import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import '../types/capacitor';

// Test IDs - Replace with your real AdMob IDs in production
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

export const useAds = (adsRemoved: boolean) => {
  const [initialized, setInitialized] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const ACTIONS_BEFORE_AD = 5; // Show interstitial every 5 actions

  useEffect(() => {
    if (!adsRemoved) {
      initializeAds();
    }
    
    return () => {
      if (initialized) {
        hideBanner();
      }
    };
  }, [adsRemoved]);

  const initializeAds = async () => {
    try {
      // Only initialize on native platform
      if (!window.Capacitor?.isNativePlatform()) {
        console.log('Ads skipped (not on device)');
        return;
      }

      await AdMob.initialize({
        testingDevices: ['YOUR_TEST_DEVICE_ID'], // Add your test device IDs
        initializeForTesting: true, // Remove in production
      });

      setInitialized(true);
      prepareInterstitial();
    } catch (error) {
      console.error('AdMob initialization error:', error);
    }
  };

  const showBanner = async () => {
    if (adsRemoved || !initialized || !window.Capacitor?.isNativePlatform()) {
      return;
    }

    try {
      const options: BannerAdOptions = {
        adId: TEST_BANNER_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true, // Set to false in production
      };

      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Banner ad error:', error);
    }
  };

  const hideBanner = async () => {
    if (!window.Capacitor?.isNativePlatform()) return;
    
    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Hide banner error:', error);
    }
  };

  const prepareInterstitial = async () => {
    if (adsRemoved || !initialized || !window.Capacitor?.isNativePlatform()) {
      return;
    }

    try {
      await AdMob.prepareInterstitial({
        adId: TEST_INTERSTITIAL_ID,
        isTesting: true, // Set to false in production
      });
      setInterstitialReady(true);

      // Listen for when ad is dismissed
      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        setInterstitialReady(false);
        prepareInterstitial(); // Prepare next ad
      });
    } catch (error) {
      console.error('Interstitial preparation error:', error);
    }
  };

  const showInterstitial = async () => {
    if (adsRemoved || !interstitialReady || !window.Capacitor?.isNativePlatform()) {
      return;
    }

    try {
      await AdMob.showInterstitial();
    } catch (error) {
      console.error('Show interstitial error:', error);
      prepareInterstitial(); // Retry preparation
    }
  };

  const trackAction = () => {
    if (adsRemoved) return;

    const newCount = actionCount + 1;
    setActionCount(newCount);

    if (newCount >= ACTIONS_BEFORE_AD) {
      showInterstitial();
      setActionCount(0);
    }
  };

  return {
    initialized,
    showBanner,
    hideBanner,
    trackAction,
    showInterstitial,
  };
};
