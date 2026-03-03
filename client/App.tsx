import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/lib/AppContext";
import { AlarmBanner } from "@/components/AlarmBanner";

function AppContent() {
  const { activeAlarm, setActiveAlarm } = useApp();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <KeyboardProvider>
          <NavigationContainer>
            {activeAlarm && (
              <AlarmBanner 
                message={activeAlarm.label || "Alarm Triggered"} 
                onClose={() => setActiveAlarm(null)} 
              />
            )}
            <RootStackNavigator />
          </NavigationContainer>
          <StatusBar style="light" />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        try {
          await Font.loadAsync({
            'Feather': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
          });
        } catch (fontError) {
          console.log("Font failed to load, falling back to system fonts:", fontError);
        }
      } catch (e) {
        console.warn("Font loading error:", e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
