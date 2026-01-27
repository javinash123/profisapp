import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, Dimensions, Alert, ScrollView, Modal, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Audio } from "expo-av";
import Animated, { FadeIn } from "react-native-reanimated";

import * as Speech from 'expo-speech';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatTime, getProgressColor } from "@/lib/utils";
import { Alarm } from "@/lib/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FiredAlarmTracker {
  [alarmId: string]: number; // timestamp of last trigger
}

export default function LiveMatchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { currentMatch, setNetWeight, endMatch, refreshWeather, settings, alarms } = useApp();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTaps, setLockTaps] = useState(0);
  const [editingNetIndex, setEditingNetIndex] = useState<number | null>(null);
  const [editLb, setEditLb] = useState("0");
  const [editOz, setEditOz] = useState("0");
  const [firedAlarms, setFiredAlarms] = useState<FiredAlarmTracker>({});
  const [totalFish, setTotalFish] = useState(0);
  const [activeAlarmBanner, setActiveAlarmBanner] = useState<Alarm | null>(null);
  const [isListening, setIsListening] = useState(false);
  const soundRef = useRef<any>(null);

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
      const finalMatch = await endMatch();
      setTimeout(() => {
        navigation.replace("EndMatchSummary", { matchData: finalMatch });
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

  const playAlarmSound = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({
          uri: "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
        });
        soundRef.current = sound;
      }
      await soundRef.current.replayAsync();
    } catch (e) {
      console.log("Audio playback error:", e);
    }
  }, []);

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

  useEffect(() => {
    if (!currentMatch) return;

    const checkAlarms = async () => {
      const now = Date.now();
      alarms.forEach(async (alarm) => {
        if (!alarm.enabled) return;

        const lastFired = firedAlarms[alarm.id] || 0;
        const timeSinceLastFire = now - lastFired;
        let shouldFire = false;

        if (alarm.mode === "repeat" && alarm.intervalMinutes && alarm.time) {
          const intervalMs = alarm.intervalMinutes * 60 * 1000;
          if (now >= alarm.time && timeSinceLastFire >= intervalMs) {
            shouldFire = true;
          }
        } else if (alarm.mode === "duration-pattern" && alarm.durationSeconds && alarm.patternMinutes) {
          const patternMs = alarm.patternMinutes * 60 * 1000;
          if (timeSinceLastFire >= patternMs) {
            shouldFire = true;
          }
        } else if (alarm.mode === "one-time" && alarm.time) {
          if (now >= alarm.time && timeSinceLastFire > 2000) {
            shouldFire = true;
          }
        }

        if (shouldFire) {
          setFiredAlarms((prev) => ({ ...prev, [alarm.id]: now }));
          setActiveAlarmBanner(alarm);
          setTimeout(() => setActiveAlarmBanner(null), 10000);
          await playAlarmSound();
          if (alarm.vibrationEnabled && settings.haptics) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {
              console.log("Haptic feedback error:", e);
            }
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [currentMatch, alarms, firedAlarms, settings]);

  const totalWeight = currentMatch?.nets.reduce((sum, net) => sum + net.weight, 0) || 0;
  const enabledAlarms = alarms.filter((a) => a.enabled);
  const GRAMS_PER_LB = 453.592;

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

  const netCount = currentMatch.nets.length;
  const netWidth = SCREEN_WIDTH - Spacing.lg * 2;
  const netHeight = 180;

  const handleVoiceCommand = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    Alert.alert("Voice Control", "Try saying 'Add fish'", [{ text: "OK", onPress: () => setIsListening(false) }]);
    Speech.speak("Voice control active.");
  }, [isListening]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleLockTap} style={styles.headerButton}>
          <Feather name={isLocked ? "lock" : "unlock"} size={22} color={theme.text} />
        </Pressable>
        <View style={styles.timerContainer}>
          <ThemedText style={[styles.timer, { color: remainingSeconds < 300 ? Colors.dark.warning : theme.text }]}>
            {formatTime(remainingSeconds)}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={handleVoiceCommand} style={styles.headerButton}>
            <Feather name="mic" size={22} color={isListening ? Colors.dark.primary : theme.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("AlarmManagement")} style={styles.headerButton}>
            <Feather name="bell" size={22} color={alarms.length > 0 ? Colors.dark.primary : theme.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.netsScroll} 
        contentContainerStyle={styles.netsGrid}
        showsVerticalScrollIndicator={false}
      >
        {currentMatch.nets.map((net, index) => {
          const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
          const progressColor = getProgressColor(percentage, {
            success: Colors.dark.success,
            warning: Colors.dark.warning,
            error: Colors.dark.error,
          });
          const lb = Math.floor(net.weight / GRAMS_PER_LB);
          const oz = Math.round((net.weight % GRAMS_PER_LB) / 28.3495);

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 50)}
              style={[styles.netTile, { width: netWidth, height: netHeight, backgroundColor: theme.backgroundDefault }]}
            >
              <View style={styles.netHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Net {index + 1}</ThemedText>
                {!isLocked && (
                  <Pressable onPress={() => {
                    setEditingNetIndex(index);
                    setEditLb(lb.toString());
                    setEditOz(oz.toString());
                  }}>
                    <Feather name="edit-2" size={14} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>

              <View style={styles.netContent}>
                <View style={styles.controlGroup}>
                  <Pressable
                    onPress={() => !isLocked && setNetWeight(index, Math.max(0, net.weight - GRAMS_PER_LB))}
                    disabled={isLocked || net.weight < GRAMS_PER_LB}
                    style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || net.weight < GRAMS_PER_LB ? 0.4 : 1 }]}
                  >
                    <Feather name="minus" size={24} color={theme.text} />
                  </Pressable>
                  
                  <View style={styles.weightDisplay}>
                    <ThemedText style={styles.controlValue}>{lb}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>lb</ThemedText>
                    <ThemedText style={[styles.controlValue, { marginLeft: 12 }]}>{oz}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>oz</ThemedText>
                  </View>

                  <Pressable
                    onPress={() => !isLocked && setNetWeight(index, net.weight + GRAMS_PER_LB)}
                    disabled={isLocked}
                    style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked ? 0.4 : 1 }]}
                  >
                    <Feather name="plus" size={24} color={theme.text} />
                  </Pressable>
                </View>
              </View>

              {net.capacity ? (
                <View style={styles.progressContainer}>
                  <View style={styles.capacityLabel}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>{lb}lb / {Math.round(net.capacity / GRAMS_PER_LB)}lb</ThemedText>
                    <ThemedText type="caption" style={{ color: progressColor, fontWeight: "600" }}>{Math.round(percentage)}%</ThemedText>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
                    <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }]} />
                  </View>
                </View>
              ) : null}
            </Animated.View>
          );
        })}

        <Animated.View
          entering={FadeIn.delay(netCount * 50)}
          style={[styles.netTile, { width: netWidth, height: 100, backgroundColor: theme.backgroundDefault, justifyContent: 'center' }]}
        >
          <View style={[styles.controlRow, { paddingHorizontal: Spacing.md, width: '100%', justifyContent: 'space-between' }]}>
            <ThemedText type="h4" style={{ color: theme.textSecondary }}>Total Fish</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <Pressable
                onPress={() => !isLocked && setTotalFish(Math.max(0, totalFish - 1))}
                disabled={isLocked || totalFish === 0}
                style={[styles.controlButtonLarge, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || totalFish === 0 ? 0.4 : 1 }]}
              >
                <Feather name="minus" size={24} color={theme.text} />
              </Pressable>
              <ThemedText type="h2" style={{ width: 60, textAlign: 'center' }}>{totalFish}</ThemedText>
              <Pressable
                onPress={() => !isLocked && setTotalFish(totalFish + 1)}
                disabled={isLocked}
                style={[styles.controlButtonLarge, { backgroundColor: theme.backgroundTertiary, opacity: isLocked ? 0.4 : 1 }]}
              >
                <Feather name="plus" size={24} color={theme.text} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.statsSummary}>
          <View style={styles.statBox}>
            <Feather name="layers" size={16} color={Colors.dark.primary} />
            <ThemedText type="small" style={{ marginLeft: 8, color: theme.textSecondary }}>
              Fish Count: {totalFish}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.totalCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.totalContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Total Weight</ThemedText>
            <ThemedText type="h2">{getNetLb(totalWeight)}lb</ThemedText>
          </View>
          <Pressable
            onPress={confirmEndMatch}
            disabled={isLocked}
            style={[styles.endButton, { backgroundColor: Colors.dark.errorDark, opacity: isLocked ? 0.6 : 1 }]}
          >
            <Feather name="stop-circle" size={20} color="#FFFFFF" />
            <ThemedText type="small" style={{ color: "#FFFFFF", marginLeft: 6, fontWeight: "600" }}>End</ThemedText>
          </Pressable>
        </View>
      </View>

      <Modal visible={editingNetIndex !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.editModal}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Edit Weight</ThemedText>
            <View style={styles.editInputRow}>
              <View style={styles.editInputGroup}>
                <ThemedText type="small" style={{ marginBottom: 4 }}>lb</ThemedText>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={editLb}
                  onChangeText={setEditLb}
                />
              </View>
              <View style={styles.editInputGroup}>
                <ThemedText type="small" style={{ marginBottom: 4 }}>oz</ThemedText>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={editOz}
                  onChangeText={setEditOz}
                />
              </View>
            </View>
            <View style={styles.editButtonRow}>
              <Pressable style={[styles.editButton, { backgroundColor: theme.backgroundTertiary }]} onPress={() => setEditingNetIndex(null)}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.editButton, { backgroundColor: Colors.dark.primary }]} 
                onPress={() => {
                  if (editingNetIndex !== null) {
                    const lb = parseFloat(editLb) || 0;
                    const oz = parseFloat(editOz) || 0;
                    setNetWeight(editingNetIndex, (lb * GRAMS_PER_LB) + (oz * 28.3495));
                    setEditingNetIndex(null);
                  }
                }}
              >
                <ThemedText style={{ color: "#000" }}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  timerContainer: { flex: 1, alignItems: "center" },
  timer: { fontSize: 36, fontWeight: "700" },
  headerRight: { flexDirection: "row", gap: Spacing.md },
  netsScroll: { flex: 1 },
  netsGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 150,
  },
  netTile: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  netHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  netContent: {
    flex: 1,
    justifyContent: "center",
  },
  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weightDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  controlValue: {
    fontSize: 42,
    fontWeight: "700",
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  capacityLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
  },
  statsSummary: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  totalContent: {
    flex: 1,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModal: {
    width: "80%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  editInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  editInputGroup: {
    flex: 1,
  },
  editInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
  },
  editButtonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  editButton: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
