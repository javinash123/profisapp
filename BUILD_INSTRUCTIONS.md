# PegPro Mobile App Build Instructions

This guide explains how to build the Android APK for PegPro using React Native and Expo on your local machine.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed (LTS version recommended).
2. **Git**: To clone the repository (if you downloaded it via Git).
3. **Expo CLI**: Install the EAS (Expo Application Services) CLI globally:
   ```bash
   npm install -g eas-cli
   ```
4. **Expo Account**: Create an account at [expo.dev](https://expo.dev) and login via CLI:
   ```bash
   eas login
   ```

## Setup

1. Download/Unzip the project to your local machine.
2. Open a terminal in the project root directory.
3. Install dependencies:
   ```bash
   npm install
   ```

## Building the APK (Android)

To generate an installable APK file for Android:

1. Run the build command:
   ```bash
   eas build -p android --profile preview
   ```
   
   *Note: This will upload the code to Expo's build servers and generate the APK there. This is the easiest method and doesn't require Android Studio.*

2. Follow the interactive prompts.
3. Once finished, you will get a link to download the `.apk` file.

## Running Locally (Development)

To run the app in development mode on your local machine:

```bash
npx expo start
```

- Scan the QR code with the **Expo Go** app on your Android/iOS device.
- Or press `a` to run in Android Emulator (requires Android Studio).
- Or press `i` to run in iOS Simulator (requires Xcode on Mac).

## Project Structure for Mobile

- **mobile/**: Contains the standalone Expo project. Use this folder to build the APK.
- **client/src**: Contains the shared source code.
- **app.json**: Web configuration.

## Building with the `mobile` folder

1. Navigate to the mobile folder:
   ```bash
   cd mobile
   ```

2. Clean install dependencies (IMPORTANT):
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
   
   This ensures all required packages like `expo-asset`, `expo-font`, etc. are properly installed.

3. Build the APK:
   ```bash
   npx eas build -p android --profile preview
   ```

## Troubleshooting

### Error: "The required package `expo-asset` cannot be found"
This means the dependencies in the `mobile` folder weren't installed properly. Solution:
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx eas build -p android --profile preview
```

### Error: "Gradle build failed"
- Check the build logs in the Expo dashboard for specific errors
- Make sure you're using the latest version of EAS CLI: `npm install -g eas-cli@latest`
- Try clearing the build cache: add `--clear-cache` flag to the build command
