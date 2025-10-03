# Monetization Setup Guide

This guide will help you set up AdMob ads and in-app purchases for your mobile app.

## Overview

The app includes:
- **Banner ads** at the bottom of the screen
- **Interstitial ads** (full-screen) shown after every 5 user actions
- **In-app purchase** to permanently remove all ads
- **Persistent purchase state** across app reinstalls

## Development Setup

The app works in test mode by default:
- On web browser: Shows placeholder ads and simulates purchases
- On mobile device: Shows AdMob test ads and simulates purchases

## Production Setup

### 1. Google AdMob Setup

1. **Create AdMob Account**
   - Go to https://admob.google.com/
   - Create a new app for iOS and Android

2. **Create Ad Units**
   - Create a **Banner Ad** unit for each platform
   - Create an **Interstitial Ad** unit for each platform
   - Note down the ad unit IDs

3. **Update Configuration**
   - Open `src/config/monetization.ts`
   - Replace test IDs with your real ad unit IDs:
   ```typescript
   BANNER_AD_ID: {
     ios: 'ca-app-pub-XXXXX/YYYYY',
     android: 'ca-app-pub-XXXXX/ZZZZZ',
   }
   ```
   - Set `USE_TEST_ADS: false`

### 2. In-App Purchase Setup

#### RevenueCat Setup
1. **Create RevenueCat Account**
   - Go to https://www.revenuecat.com/
   - Create a new project

2. **Get API Keys**
   - Navigate to Project Settings → API Keys
   - Copy your iOS and Android API keys
   - Update `src/config/monetization.ts`:
   ```typescript
   REVENUECAT_API_KEY: {
     ios: 'appl_XXXXX',
     android: 'goog_XXXXX',
   }
   ```

#### iOS Setup (App Store Connect)
1. **Create In-App Purchase**
   - Log into App Store Connect
   - Go to your app → Features → In-App Purchases
   - Create a new **Non-Consumable** purchase
   - Product ID: `remove_ads` (must match `AD_REMOVAL_PRODUCT_ID` in config)
   - Price: Set your desired price (e.g., $2.99)

2. **Link to RevenueCat**
   - In RevenueCat dashboard, go to Project Settings
   - Add your App Store Connect credentials
   - Link your iOS app

#### Android Setup (Google Play Console)
1. **Create In-App Product**
   - Go to Google Play Console
   - Select your app → Monetize → Products → In-app products
   - Create new product
   - Product ID: `remove_ads`
   - Price: Set your desired price

2. **Link to RevenueCat**
   - In RevenueCat dashboard
   - Add your Google Play Service Account credentials
   - Link your Android app

#### RevenueCat Entitlements
1. In RevenueCat dashboard, go to Entitlements
2. Create entitlement named: `ad_free`
3. Attach the `remove_ads` product to this entitlement

### 3. Build and Sync

After updating all configuration:

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Sync Capacitor
npx cap sync

# Build for production
npm run build
npx cap sync

# Run on device
npx cap run ios
# or
npx cap run android
```

## Testing Purchases

### iOS Testing
1. Create a sandbox tester account in App Store Connect
2. Sign out of your regular Apple ID on the test device
3. When prompted during purchase, sign in with sandbox account

### Android Testing
1. Add your Google account as a license tester in Google Play Console
2. Use internal testing track or closed testing track
3. Install app from Play Store testing track

## How It Works

### Ad Display Logic
- Banner ad shows at bottom of screen (unless removed)
- Interstitial ad shows every 5 actions:
  - Batch delete photos
  - Batch keep photos
- Ads are hidden immediately after purchase

### Purchase Persistence
1. Purchase status is stored in Capacitor Preferences (local)
2. Also verified with app stores via RevenueCat
3. On app launch, checks both local storage and RevenueCat
4. Works across app reinstalls (as long as user signs in with same account)

### Settings Page
- Accessed via gear icon in header
- Shows "Remove Ads" card with benefits
- Purchase button shows price ($2.99 default)
- "Restore Purchases" button for users who reinstall

## Troubleshooting

### Ads not showing
- Check AdMob account is active
- Verify ad unit IDs are correct
- Wait 24-48 hours after creating new ad units
- Check device logs for errors

### Purchases failing
- Verify RevenueCat API keys are correct
- Ensure product IDs match exactly
- Check entitlement configuration in RevenueCat
- For iOS: Use sandbox tester account
- For Android: Use testing track

### Purchase not restoring
- Ensure user is signed in with same account
- Check RevenueCat dashboard for purchase records
- Verify entitlement configuration

## Revenue Tracking

Monitor your revenue in:
- **AdMob Dashboard**: Ad performance and earnings
- **RevenueCat Dashboard**: Purchase analytics and revenue
- **App Store Connect / Play Console**: Official store reports

## Important Notes

⚠️ **Before Production Release:**
- [ ] Set `USE_TEST_ADS: false` in monetization.ts
- [ ] Replace all test ad unit IDs with real IDs
- [ ] Add RevenueCat API keys
- [ ] Test purchases with real test accounts
- [ ] Verify "Restore Purchases" works
- [ ] Test on both iOS and Android devices
- [ ] Review ad frequency (adjust `ACTIONS_BEFORE_AD` if needed)

## Need Help?

- AdMob Support: https://support.google.com/admob
- RevenueCat Docs: https://docs.revenuecat.com/
- Capacitor Docs: https://capacitorjs.com/docs
