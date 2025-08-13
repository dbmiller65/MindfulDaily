# App Store Submission Guide for MindfulDaily

## 📱 App Information

**App Name:** MindfulDaily  
**Bundle ID:** com.mindfulDaily.app  
**Version:** 1.0.0  
**Category:** Health & Fitness  

## 🎯 Prerequisites Checklist

### 1. Apple Developer Account
- [ ] Apple Developer Program membership ($99/year)
- [ ] Access to App Store Connect
- [ ] Apple ID configured in Xcode

### 2. App Store Connect Setup
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **App Name:** MindfulDaily
   - **Primary Language:** English
   - **Bundle ID:** com.mindfulDaily.app
   - **SKU:** MINDFUL-DAILY-001

## 📝 App Store Listing Information

### App Description (Required)
```
MindfulDaily is your personal mental health companion, designed to help you build healthy daily habits and improve your overall well-being.

Track your daily wellness activities including:
• Exercise - Log your workouts and stay active
• Meditation - Built-in timer for mindfulness practice
• Gratitude Journal - Record what you're thankful for
• Outdoor Time - Track time spent in nature
• Sleep - Monitor your sleep patterns

Features:
• Daily progress tracking with visual indicators
• Streak counter to keep you motivated
• Weekly summary charts to visualize your progress
• Clean, intuitive interface
• Works offline - all data stored locally
• No ads, no subscriptions - completely free

Start your journey to better mental health today with MindfulDaily!
```

### Keywords
```
mental health, wellness, meditation, gratitude, exercise tracker, sleep tracker, mindfulness, daily habits, self care, mood tracker
```

### Support URL
```
https://mindfulDaily.com/support
```

### Privacy Policy URL
```
https://mindfulDaily.com/privacy
```

## 🖼️ Required Screenshots

### iPhone Screenshots (Required: 3-10)
1. **Home Screen** - Show daily activities with progress
2. **Meditation Timer** - Active timer screen
3. **Gratitude Journal** - Modal with entries
4. **Weekly Summary** - Chart showing progress
5. **Streak Display** - Showing current and best streaks

### Screenshot Specifications
- iPhone 15 Pro Max: 1290 × 2796 pixels
- iPhone 15/14/13: 1170 × 2532 pixels
- iPhone SE: 750 × 1334 pixels

## 🏗️ Build Process

### Step 1: Configure EAS
```bash
# Login to Expo account (create one if needed)
eas login

# Configure the project
eas build:configure
```

### Step 2: Build for iOS
```bash
# Create production build
eas build --platform ios --profile production
```

### Step 3: Submit to App Store
```bash
# After build completes, submit to App Store
eas submit --platform ios
```

## 📋 App Review Information

### Demo Account (if needed)
Not required - app works without login

### Notes for Reviewer
```
MindfulDaily is a mental health and wellness tracking app that helps users maintain healthy daily habits. All features work offline with local storage. No account or internet connection required.

The app includes 5 core activities:
1. Exercise tracking
2. Meditation with timer
3. Gratitude journaling
4. Outdoor activity logging
5. Sleep tracking

Users can view their daily progress, maintain streaks, and see weekly summaries of their wellness journey.
```

## 🚀 Submission Steps

1. **Create App Store Connect Record**
   - Log in to App Store Connect
   - Create new app with Bundle ID: com.mindfulDaily.app

2. **Build the App**
   ```bash
   cd /Users/davidmiller/CascadeProjects/health-app/MindfulDaily
   eas build --platform ios --profile production
   ```

3. **Submit Build**
   ```bash
   eas submit --platform ios
   ```

4. **Complete App Store Connect**
   - Upload screenshots
   - Fill in app description
   - Set pricing (Free)
   - Submit for review

## 📱 Testing Checklist

Before submission, ensure:
- [ ] All 5 activities work correctly
- [ ] Data persists between app launches
- [ ] Navigation works smoothly
- [ ] No crashes or errors
- [ ] UI looks good on all iPhone sizes
- [ ] Offline functionality works

## 🔒 Privacy & Compliance

### Privacy Policy Template
```
MindfulDaily Privacy Policy

Last updated: [Date]

MindfulDaily ("we", "our", or "us") operates the MindfulDaily mobile application (the "Service").

Information Collection and Use:
MindfulDaily does not collect, store, or transmit any personal information. All data is stored locally on your device and is never sent to external servers.

Data Storage:
All wellness tracking data, including exercise logs, meditation sessions, gratitude entries, outdoor activities, and sleep records, are stored locally on your device using AsyncStorage. This data is not accessible to us or any third parties.

Data Security:
Since all data is stored locally on your device, the security of your information depends on the security measures you have in place on your device.

Changes to This Privacy Policy:
We may update our Privacy Policy from time to time. You are advised to review this Privacy Policy periodically for any changes.

Contact Us:
If you have any questions about this Privacy Policy, please contact us at: support@mindfulDaily.com
```

## 💡 Tips for App Review Success

1. **Test thoroughly** on multiple devices
2. **Ensure all features work** without crashes
3. **Follow Apple's Human Interface Guidelines**
4. **Respond quickly** to any reviewer feedback
5. **Be clear** about app functionality in description

## 📞 Support Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)

## Next Steps

1. Create Apple Developer account if you don't have one
2. Run `eas login` to connect your Expo account
3. Run `eas build --platform ios --profile production` to create build
4. Follow the submission steps above

Good luck with your App Store submission! 🎉
