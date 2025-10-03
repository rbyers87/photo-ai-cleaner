import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';
import '../types/capacitor';

const AD_REMOVAL_KEY = 'ad_removal_purchased';
const AD_REMOVAL_PRODUCT_ID = 'remove_ads'; // Change this to your actual product ID

// RevenueCat will be initialized later when needed
let CapacitorPurchases: any = null;

// Dynamically import RevenueCat only on native platforms
const initPurchases = async () => {
  if (!CapacitorPurchases && window.Capacitor?.isNativePlatform()) {
    try {
      const module = await import('@capgo/capacitor-purchases');
      CapacitorPurchases = module.CapacitorPurchases;
    } catch (error) {
      console.log('RevenueCat not available:', error);
    }
  }
};

export const useAdRemoval = () => {
  const [adsRemoved, setAdsRemoved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Check purchase status on mount
  useEffect(() => {
    initPurchases().then(() => checkPurchaseStatus());
  }, []);

  const checkPurchaseStatus = async () => {
    try {
      // First check local storage
      const { value } = await Preferences.get({ key: AD_REMOVAL_KEY });
      if (value === 'true') {
        setAdsRemoved(true);
        setLoading(false);
        return;
      }

      // Then check with store (RevenueCat)
      if (CapacitorPurchases && window.Capacitor?.isNativePlatform()) {
        try {
          const customerInfo = await CapacitorPurchases.getCustomerInfo();
          const hasPurchased = customerInfo.customerInfo.entitlements.active['ad_free'] !== undefined;
          
          if (hasPurchased) {
            await Preferences.set({ key: AD_REMOVAL_KEY, value: 'true' });
            setAdsRemoved(true);
          }
        } catch (error) {
          console.log('Purchase check error:', error);
        }
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseAdRemoval = async () => {
    setPurchasing(true);
    try {
      // In development/web, simulate purchase
      if (!window.Capacitor?.isNativePlatform() || !CapacitorPurchases) {
        // Simulate purchase for testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Preferences.set({ key: AD_REMOVAL_KEY, value: 'true' });
        setAdsRemoved(true);
        toast.success('Ads removed! (Test mode)');
        return;
      }

      // On native platform, use RevenueCat
      const offerings = await CapacitorPurchases.getOfferings();
      const adRemovalPackage = offerings.current?.availablePackages.find(
        (pkg: any) => pkg.product.identifier === AD_REMOVAL_PRODUCT_ID
      );

      if (!adRemovalPackage) {
        throw new Error('Ad removal product not found');
      }

      const purchase = await CapacitorPurchases.purchasePackage({
        identifier: adRemovalPackage.identifier,
        offering: offerings.current?.identifier || '',
      });

      if (purchase.customerInfo.entitlements.active['ad_free']) {
        await Preferences.set({ key: AD_REMOVAL_KEY, value: 'true' });
        setAdsRemoved(true);
        toast.success('Ads removed successfully!');
      }
    } catch (error: any) {
      if (error.code === 1) { // Purchase cancelled
        toast.info('Purchase cancelled');
      } else {
        console.error('Purchase error:', error);
        toast.error('Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    setLoading(true);
    try {
      if (!window.Capacitor?.isNativePlatform() || !CapacitorPurchases) {
        toast.info('Restore only works on device');
        return;
      }

      const customerInfo = await CapacitorPurchases.restorePurchases();
      
      if (customerInfo.customerInfo.entitlements.active['ad_free']) {
        await Preferences.set({ key: AD_REMOVAL_KEY, value: 'true' });
        setAdsRemoved(true);
        toast.success('Purchases restored!');
      } else {
        toast.info('No purchases found');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  return {
    adsRemoved,
    loading,
    purchasing,
    purchaseAdRemoval,
    restorePurchases,
  };
};
