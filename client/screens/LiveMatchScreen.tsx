import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions, Alert, ScrollView, Modal, TextInput } from "react-native";
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
import { formatTime, getProgressColor } from "@/lib/utils";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LiveMatchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { currentMatch, setNetWeight, endMatch, weather, refreshWeather, settings, alarms } = useApp();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTaps, setLockTaps] = useState(0);
  const [editingNetIndex, setEditingNetIndex] = useState<number | null>(null);
  const [editLb, setEditLb] = useState("0");

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

  const handleMatchEnd = useCallback(async () => {
    try {
      await endMatch();
      setTimeout(() => {
        navigation.replace("EndMatchSummary");
      }, 100);
    } catch (error) {
      console.error("Error ending match:", error);
      navigation.replace("EndMatchSummary");
    }
  }, [endMatch, navigation]);

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

  const GRAMS_PER_LB = 453.592; // More precise conversion

  const getNetLb = (weightGrams: number) => {
    const lb = Math.round(weightGrams / GRAMS_PER_LB);
    return Math.min(Math.max(0, lb), 100);
  };

  const setNetLb = (netIndex: number, lb: number) => {
    const weightGrams = lb * GRAMS_PER_LB;
    setNetWeight(netIndex, weightGrams);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!currentMatch) return null;

  const netCount = currentMatch.config.numberOfNets;
  const columns = 2;
  const netWidth = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.xs) / 2;
  const rows = Math.ceil(netCount / columns);
  // Calculate available height for nets grid (accounting for header, weather, footer, etc)
  const estimatedHeaderHeight = 120; // header + weather bar approximate
  const estimatedFooterHeight = 100; // total weight card
  const availableHeight = Dimensions.get("window").height - estimatedHeaderHeight - estimatedFooterHeight - insets.top - insets.bottom;
  const netHeight = availableHeight / rows - Spacing.xs;

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
        <Pressable 
          style={styles.weatherBar}
          onPress={() => navigation.navigate("WeatherDetails")}
        >
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
        </Pressable>
      ) : null}

      <View style={[styles.netsGrid, { paddingHorizontal: Spacing.lg }]}>
        {currentMatch.nets.map((net, index) => {
          const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
          const progressColor = getProgressColor(percentage, {
            success: Colors.dark.success,
            warning: Colors.dark.warning,
            error: Colors.dark.error,
          });
          const lb = getNetLb(net.weight);

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 50)}
              style={[
                styles.netTile,
                {
                  width: netWidth,
                  height: netHeight,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
            >
              <View style={styles.netHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Net {index + 1}
                </ThemedText>
                {!isLocked && (
                  <Pressable
                    onPress={() => {
                      setEditingNetIndex(index);
                      setEditLb(lb.toString());
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Feather name="edit-2" size={14} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>

              <View style={styles.netContent}>
                <View style={styles.controlGroup}>
                  <Pressable
                    onPress={() => !isLocked && setNetLb(index, Math.max(0, lb - 1))}
                    disabled={isLocked || lb === 0}
                    style={[
                      styles.controlButton,
                      { backgroundColor: theme.backgroundTertiary, opacity: isLocked || lb === 0 ? 0.4 : 1 },
                    ]}
                  >
                    <Feather name="minus" size={18} color={theme.text} />
                  </Pressable>
                  <View style={styles.weightDisplay}>
                    <ThemedText style={styles.controlValue}>{lb}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600" }}>lb</ThemedText>
                  </View>
                  <Pressable
                    onPress={() => !isLocked && setNetLb(index, Math.min(100, lb + 1))}
                    disabled={isLocked || lb === 100}
                    style={[
                      styles.controlButton,
                      { backgroundColor: theme.backgroundTertiary, opacity: isLocked || lb === 100 ? 0.4 : 1 },
                    ]}
                  >
                    <Feather name="plus" size={18} color={theme.text} />
                  </Pressable>
                </View>
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
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                    {Math.round(percentage)}%
                  </ThemedText>
                </View>
              ) : null}
            </Animated.View>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={[styles.totalCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.totalContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Weight
            </ThemedText>
            <ThemedText type="h2">
              {getNetLb(totalWeight)}lb
            </ThemedText>
          </View>
          <Pressable
            onPress={confirmEndMatch}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.endButton,
              { backgroundColor: Colors.dark.errorDark, opacity: pressed || isLocked ? 0.6 : 1 },
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

      <Modal
        visible={editingNetIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingNetIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setEditingNetIndex(null)}
          />
          <View style={[styles.editModal, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.lg }}>
              Edit Net {(editingNetIndex ?? 0) + 1} Weight
            </ThemedText>

            <View style={styles.editInputRow}>
              <View style={styles.editInputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  Pounds (lb)
                </ThemedText>
                <TextInput
                  style={[
                    styles.editInput,
                    { backgroundColor: theme.backgroundTertiary, color: theme.text, borderColor: theme.textSecondary },
                  ]}
                  value={editLb}
                  onChangeText={setEditLb}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <View style={styles.editButtonRow}>
              <Pressable
                onPress={() => setEditingNetIndex(null)}
                style={[styles.editButton, { backgroundColor: theme.backgroundTertiary }]}
              >
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (editingNetIndex !== null) {
                    const lb = Math.max(0, Math.min(100, parseInt(editLb) || 0));
                    setNetLb(editingNetIndex, lb);
                    setEditingNetIndex(null);
                  }
                }}
                style={[styles.editButton, { backgroundColor: Colors.dark.primary }]}
              >
                <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
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
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  weatherItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  controlValue: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModal: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minWidth: 300,
  },
  editInputRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  editInputGroup: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    fontWeight: "600",
  },
  editButtonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  editButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  netsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
    flex: 1,
    alignContent: "flex-start",
  },
  netTile: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    justifyContent: "flex-start",
  },
  netHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  netContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    width: "100%",
  },
  weightDisplay: {
    alignItems: "center",
    gap: 2,
  },
  progressContainer: {
    marginTop: 2,
    alignItems: "center",
    width: "100%",
  },
  progressBar: {
    width: "100%",
    height: 3,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    marginTop: "auto",
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
