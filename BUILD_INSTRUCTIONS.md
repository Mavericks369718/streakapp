# 📱 How to Build Your Streak Tracker APK

## Quick Setup (5 minutes)

### Step 1: Install EAS CLI
```bash
cd /app/frontend
npm install -g eas-cli
```

### Step 2: Login to Expo (Create free account if needed)
```bash
eas login
```
*If you don't have an account, visit: https://expo.dev/signup*

### Step 3: Build the APK
```bash
eas build -p android --profile preview
```

This will:
- Upload your code to Expo's build servers
- Build the APK in the cloud (takes ~10-15 minutes)
- Give you a download link when complete

### Step 4: Download & Install
- Once build completes, you'll get a download link
- Download the APK to your Android phone
- Install it (you may need to enable "Install from unknown sources")
- Done! Your app is now installed 🎉

---

## 📲 How Updates Work

### Option 1: Rebuild APK (Recommended for Major Changes)
- Run `eas build -p android --profile preview` again
- Download and install the new APK
- Users will need to reinstall

### Option 2: OTA Updates (For Minor Changes)
Using Expo Updates, you can push updates without rebuilding:
```bash
eas update --branch preview
```
- Users get updates automatically when they open the app
- No reinstall needed!
- Perfect for bug fixes and small changes

---

## 🔧 Troubleshooting

**If build fails:**
- Make sure you're logged in: `eas whoami`
- Check your internet connection
- Try again - sometimes cloud services have hiccups

**If APK won't install:**
- Enable "Install from unknown sources" in Android settings
- Try downloading on a different browser
- Make sure you have enough storage space

---

## 📝 Build Commands Reference

```bash
# Preview build (for testing)
eas build -p android --profile preview

# Production build (for release)
eas build -p android --profile production

# Check build status
eas build:list

# Push OTA update
eas update --branch preview
```

---

## 🎯 Your App Details

- **App Name:** Daily Streak Tracker
- **Package:** com.streaktracker.app
- **Version:** 1.0.0

Ready to build? Just run these commands from the frontend folder!
