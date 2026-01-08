import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import OnboardingScreen from "@/screens/OnboardingScreen";
import MatchSetupScreen from "@/screens/MatchSetupScreen";
import LiveMatchScreen from "@/screens/LiveMatchScreen";
import EndMatchSummaryScreen from "@/screens/EndMatchSummaryScreen";
import AlarmManagementScreen from "@/screens/AlarmManagementScreen";
import AddEditAlarmScreen from "@/screens/AddEditAlarmScreen";
import WeatherDetailsScreen from "@/screens/WeatherDetailsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ManualWeightEditModal from "@/screens/ManualWeightEditModal";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  MatchSetup: undefined;
  LiveMatch: undefined;
  EndMatchSummary: undefined;
  AlarmManagement: undefined;
  AddEditAlarm: { alarmId?: string };
  WeatherDetails: undefined;
  Settings: undefined;
  ManualWeightEdit: { netIndex: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MatchSetup"
        component={MatchSetupScreen}
        options={{ headerTitle: "New Match" }}
      />
      <Stack.Screen
        name="LiveMatch"
        component={LiveMatchScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="EndMatchSummary"
        component={EndMatchSummaryScreen}
        options={{ headerTitle: "Match Complete", gestureEnabled: false }}
      />
      <Stack.Screen
        name="AlarmManagement"
        component={AlarmManagementScreen}
        options={{ headerTitle: "Alarms" }}
      />
      <Stack.Screen
        name="AddEditAlarm"
        component={AddEditAlarmScreen}
        options={{ headerTitle: "New Alarm", presentation: "modal" }}
      />
      <Stack.Screen
        name="WeatherDetails"
        component={WeatherDetailsScreen}
        options={{ headerTitle: "Weather" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="ManualWeightEdit"
        component={ManualWeightEditModal}
        options={{ 
          headerTitle: "Edit Weight",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
