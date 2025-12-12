import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
import MatchSetup from './pages/MatchSetup';
import LiveMatch from './pages/LiveMatchNative';
import EndSummary from './pages/EndSummaryNative';
import AlarmList from './pages/AlarmListNative';
import WeatherDetail from './pages/WeatherDetailNative';
import AdminLogin from './pages/admin/Login';

// Simple navigation state
type Screen = 'setup' | 'live' | 'summary' | 'alarms' | 'weather' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'setup':
        return <MatchSetup onStart={() => setCurrentScreen('live')} />;
      case 'live':
        return <LiveMatch onNavigate={(screen) => setCurrentScreen(screen as Screen)} />;
      case 'summary':
        return <EndSummary onNavigate={(screen) => setCurrentScreen(screen as Screen)} />;
      case 'alarms':
        return <AlarmList onNavigate={(screen) => setCurrentScreen(screen as Screen)} />;
      case 'weather':
        return <WeatherDetail onNavigate={(screen) => setCurrentScreen(screen as Screen)} />;
      case 'admin':
        return <AdminLogin />;
      default:
        return <MatchSetup onStart={() => setCurrentScreen('live')} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
  },
});
