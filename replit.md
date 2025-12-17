# PegPro - Fishing Match Tracker

## Overview
PegPro is a native React Native mobile app for tracking fishing match competitions. It allows anglers to monitor multiple nets, track weights, manage alarms, view weather data, and generate match summaries.

## Tech Stack
- **Frontend**: React Native with Expo SDK
- **State Management**: React Context + AsyncStorage for persistence
- **Navigation**: React Navigation 7 (Stack-only navigation)
- **Styling**: StyleSheet with custom theme (dark navy, coral-red, teal-blue)

## Project Structure
```
client/
├── App.tsx                    # Root component with providers
├── components/                # Reusable UI components
├── constants/theme.ts         # Design tokens (colors, spacing, typography)
├── hooks/                     # Custom React hooks
├── lib/
│   ├── AppContext.tsx         # Global state management
│   ├── storage.ts             # AsyncStorage utilities
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Helper functions
├── navigation/
│   └── RootStackNavigator.tsx # Stack navigation setup
└── screens/
    ├── OnboardingScreen.tsx   # First-time user welcome
    ├── MatchSetupScreen.tsx   # Configure new match
    ├── LiveMatchScreen.tsx    # Core match tracking UI
    ├── ManualWeightEditModal.tsx  # Numeric weight entry
    ├── AlarmManagementScreen.tsx  # View/manage alarms
    ├── AddEditAlarmScreen.tsx     # Create/edit alarms
    ├── WeatherDetailsScreen.tsx   # Weather information
    ├── EndMatchSummaryScreen.tsx  # Match results
    └── SettingsScreen.tsx         # App preferences
```

## Key Features
- **Multi-Net Tracking**: Monitor 1-6 nets with +/- weight controls
- **Match Timer**: Countdown timer with visual warnings
- **Alarms**: One-time, repeat, and pattern-based reminders
- **Weather**: Temperature, humidity, wind, pressure tracking
- **Lock Mode**: Prevent accidental touches during matches
- **Export/Share**: Share match summaries

## Color Palette
- **Backgrounds**: Deep Black (#05080B), Card (#0B1218), Elevated (#111A22), Border (#1C2A35)
- **Primary Accent (Neon Green)**: #3CFFB0 (soft: #2EDC9C, progress: #41F5A3)
- **Danger Red**: #FF4D4D (dark button: #8B1E1E)
- **Warning Yellow**: #F6C343 (amber: #E9B949, muted: #D8B55A)
- **Action Blue**: #2F8CFF (muted: #1E5FAF)
- **Text**: Primary (#FFFFFF), Secondary (#A8B3BD), Muted (#6F7C87)
- **Button Text**: Primary buttons use dark text (#05120C) on green background
- **Effects**: Neon glow effects instead of shadows (green/red/blue glows)

## Running the App
- Development: `npm run dev` (starts Expo on port 8081, Express on port 5000)
- Test on device: Scan QR code in Expo Go app
