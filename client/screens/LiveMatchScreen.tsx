import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import Animated, { FadeIn, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatTime, formatWeight, getProgressColor } from "@/lib/utils";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LiveMatchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { currentMatch, updateNetWeight, endMatch, weather, refreshWeather, settings, alarms } = useApp();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTaps, setLockTaps] = useState(0);

  useEffect(() => {
    if (!currentMatch) {
      navigation.replace("MatchSetup");
      return;
    }

    if (currentMatch.config.keepScreenOn) {
      activateKeepAwakeAsync();
    }

    refreshWeather();

    return () => {
      deactivateKeepAwake();
    };
  }, [currentMatch?.id, navigation]);

  useEffect(() => {
    if (!currentMatch) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - currentMatch.startTime) / 1000);
      const total = currentMatch.config.durationMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        handleMatchEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentMatch]);

  const handleMatchEnd = async () => {
    await endMatch();
    navigation.replace("EndMatchSummary");
  };

  const confirmEndMatch = () => {
    Alert.alert(
      "End Match",
      "Are you sure you want to end the match?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Match", style: "destructive", onPress: handleMatchEnd },
      ]
    );
  };

  const handleLockTap = useCallback(() => {
    if (!isLocked) {
      setIsLocked(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      const newTaps = lockTaps + 1;
      setLockTaps(newTaps);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (newTaps >= 3) {
        setIsLocked(false);
        setLockTaps(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [isLocked, lockTaps]);

  const totalWeight = currentMatch?.nets.reduce((sum, net) => sum + net.weight, 0) || 0;

  if (!currentMatch) return null;

  const netCount = currentMatch.config.numberOfNets;
  const columns = 1;
  const netWidth = SCREEN_WIDTH - Spacing.xl * 2;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={handleLockTap}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name={isLocked ? "lock" : "unlock"} size={22} color={theme.text} />
        </Pressable>

        <View style={styles.timerContainer}>
          <ThemedText style={[styles.timer, { color: remainingSeconds < 300 ? Colors.dark.warning : theme.text }]}>
            {formatTime(remainingSeconds)}
          </ThemedText>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => navigation.navigate("WeatherDetails")}
            style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="cloud" size={22} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("AlarmManagement")}
            style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="bell" size={22} color={alarms.length > 0 ? Colors.dark.primary : theme.text} />
          </Pressable>
        </View>
      </View>

      {weather ? (
        <View style={styles.weatherBar}>
          <View style={styles.weatherItem}>
            <Feather name="thermometer" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {weather.temperature}°C
            </ThemedText>
          </View>
          <View style={styles.weatherItem}>
            <Feather
              name={weather.pressureTrend === "rising" ? "trending-up" : weather.pressureTrend === "falling" ? "trending-down" : "minus"}
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {weather.pressure}mb
            </ThemedText>
          </View>
          <View style={styles.weatherItem}>
            <Feather name="wind" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {weather.windSpeed}mph
            </ThemedText>
          </View>
        </View>
      ) : null}

      <ScrollView style={styles.netsScrollView} contentContainerStyle={[styles.netsGrid, { paddingHorizontal: Spacing.xl }]}>
        {currentMatch.nets.map((net, index) => {
          const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
          const progressColor = getProgressColor(percentage, {
            success: Colors.dark.success,
            warning: Colors.dark.warning,
            error: Colors.dark.error,
          });

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 50)}
              style={[
                styles.netTile,
                {
                  width: netWidth,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
            >
              <View style={styles.netHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Net {index + 1}
                </ThemedText>
                <Pressable
                  onPress={() => !isLocked && navigation.navigate("ManualWeightEdit", { netIndex: index })}
                  disabled={isLocked}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Feather name="edit-2" size={16} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.netContent}>
                <Pressable
                  onPress={() => !isLocked && updateNetWeight(index, currentMatch.config.unit === "kg/g" ? -100 : -28.35)}
                  disabled={isLocked}
                  style={({ pressed }) => [
                    styles.netButton,
                    { backgroundColor: Colors.dark.secondary, opacity: pressed || isLocked ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="minus" size={24} color="#FFFFFF" />
                </Pressable>

                <View style={styles.weightDisplay}>
                  <ThemedText style={styles.weightText}>
                    {formatWeight(net.weight, currentMatch.config.unit)}
                  </ThemedText>
                </View>

                <Pressable
                  onPress={() => !isLocked && updateNetWeight(index, currentMatch.config.unit === "kg/g" ? 100 : 28.35)}
                  disabled={isLocked}
                  style={({ pressed }) => [
                    styles.netButton,
                    { backgroundColor: Colors.dark.primary, opacity: pressed || isLocked ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="plus" size={24} color="#FFFFFF" />
                </Pressable>
              </View>

              {net.capacity ? (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 4 }}>
                    {Math.round(percentage)}%
                  </ThemedText>
                </View>
              ) : null}
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={[styles.totalCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.totalContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Weight
            </ThemedText>
            <ThemedText type="h2">
              {formatWeight(totalWeight, currentMatch.config.unit)}
            </ThemedText>
          </View>
          <Pressable
            onPress={confirmEndMatch}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.endButton,
              { backgroundColor: Colors.dark.error, opacity: pressed || isLocked ? 0.6 : 1 },
            ]}
          >
            <Feather name="stop-circle" size={20} color="#FFFFFF" />
            <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: 6, fontWeight: "600" }}>
              End
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {isLocked ? (
        <Pressable onPress={handleLockTap} style={styles.lockOverlay}>
          <View style={styles.lockContent}>
            <Feather name="lock" size={48} color={theme.text} />
            <ThemedText type="h3" style={{ marginTop: Spacing.lg }}>
              Screen Locked
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              Tap 3 times to unlock ({3 - lockTaps} remaining)
            </ThemedText>
          </View>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
  },
  timerContainer: {
    alignItems: "center",
  },
  timer: {
    ...Typography.timer,
  },
  weatherBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  weatherItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  netsScrollView: {
    flex: 1,
  },
  netsGrid: {
    flexDirection: "column",
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  netTile: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  netHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  netContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  netButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  weightDisplay: {
    flex: 1,
    alignItems: "center",
  },
  weightText: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  totalContent: {
    flex: 1,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 35, 50, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockContent: {
    alignItems: "center",
  },
});
