import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '@/config/monetization';
import { Capacitor } from '@capacitor/core';

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
        setInitialized(false);
        return;
      }

      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: ADMOB_CONFIG.USE_TEST_ADS,
      });

      setInitialized(true);
      prepareInterstitial();
    } catch (error) {
      console.error('AdMob initialization error:', error);
      setInitialized(false);
      // Don't throw - just log and continue
    }
  };

  const showBanner = async () => {
    if (adsRemoved || !initialized || !window.Capacitor?.isNativePlatform()) {
      return;
    }

    try {
      const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
      const options: BannerAdOptions = {
        adId: ADMOB_CONFIG.BANNER_AD_ID[platform],
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: ADMOB_CONFIG.USE_TEST_ADS,
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
      const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.INTERSTITIAL_AD_ID[platform],
        isTesting: ADMOB_CONFIG.USE_TEST_ADS,
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
