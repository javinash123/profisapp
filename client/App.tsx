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
import { AppProvider } from "@/lib/AppContext";
import { AlarmBanner } from "@/components/AlarmBanner";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Skip font loading if it fails, as some environments might not have the file accessible
        try {
          await Font.loadAsync({
            'Feather': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
          });
        } catch (fontError) {
          console.log("Font failed to load, falling back to system fonts:", fontError);
        }
        
        // Mocking an alarm for demonstration purposes
        // In a real app, this would come from a real-time source or state management
        setTimeout(() => {
          setActiveAlarm("Alarm: Weigh-in scheduled in 10 minutes");
        }, 3000);
      } catch (e) {
        console.warn("Font loading error:", e);
      } finally {
        setAppIsReady(true);
        // Hide splash screen immediately when ready
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
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer>
                  {activeAlarm && (
                    <AlarmBanner 
                      message={activeAlarm} 
                      onClose={() => setActiveAlarm(null)} 
                    />
                  )}
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
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
