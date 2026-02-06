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
import { useVoiceRecorder } from "@/replit_integrations/audio/useVoiceRecorder";
import { useVoiceStream } from "@/replit_integrations/audio/useVoiceStream";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FiredAlarmTracker {
  [alarmId: string]: number; // timestamp of last trigger
}

export default function LiveMatchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { currentMatch, setNetWeight, updateNetName, endMatch, refreshWeather, settings, alarms } = useApp();
  const { startRecording, stopRecording, state: recordingState } = useVoiceRecorder();
  const { streamVoiceResponse } = useVoiceStream({
    onUserTranscript: (text) => console.log("User said:", text),
    onTranscript: (delta) => console.log("AI says:", delta),
    onComplete: (full) => {
      // Basic intent parsing from AI transcript
      const lbMatch = full.match(/(\d+)\s*(?:lb|pound)/i);
      const ozMatch = full.match(/(\d+)\s*(?:oz|ounce)/i);
      const netMatch = full.match(/net\s*(\d+)/i);
      
      let totalGrams = 0;
      if (lbMatch) totalGrams += parseInt(lbMatch[1]) * GRAMS_PER_LB;
      if (ozMatch) totalGrams += parseInt(ozMatch[1]) * GRAMS_PER_OZ;
      
      const netIdx = netMatch ? parseInt(netMatch[1]) - 1 : (editingNetIndex ?? 0);
      
      if (totalGrams > 0 && currentMatch) {
        const currentWeight = currentMatch.nets[netIdx].weight;
        const totalOz = Math.round(currentWeight / GRAMS_PER_OZ);
        const addedOz = Math.round(totalGrams / GRAMS_PER_OZ);
        setNetWeight(netIdx, (totalOz + addedOz) * GRAMS_PER_OZ);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak(`Added weight to net ${netIdx + 1}`);
      }
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTaps, setLockTaps] = useState(0);
  const [editingNetIndex, setEditingNetIndex] = useState<number | null>(null);
  const [editLb, setEditLb] = useState("0");
  const [editOz, setEditOz] = useState("0");
  const [editingNetNameIndex, setEditingNetNameIndex] = useState<number | null>(null);
  const [editNetName, setEditNetName] = useState("");
  const [firedAlarms, setFiredAlarms] = useState<FiredAlarmTracker>({});
  const [totalFish, setTotalFish] = useState(0);
  const [activeAlarmBanner, setActiveAlarmBanner] = useState<Alarm | null>(0);
  const [isListening, setIsListening] = useState(false);
  const soundRef = useRef<any>(null);

  const GRAMS_PER_OZ = 28.3495;
  const GRAMS_PER_LB = 453.592;

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
      console.log("Ending match...");
      const finalMatch = await endMatch();
      console.log("Match ended, final data:", finalMatch);
      
      // Navigate to the summary screen
      navigation.replace("EndMatchSummary", { 
        matchData: finalMatch 
      });
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
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
        { shouldPlay: true, isLooping: false, volume: 1.0 }
      );
      soundRef.current = sound;
      await sound.playAsync();
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

  const getNetLb = (weightGrams: number) => {
    const totalOz = Math.round(weightGrams / GRAMS_PER_OZ);
    const lb = Math.floor(totalOz / 16);
    return lb;
  };

  const setNetLb = (netIndex: number, lb: number) => {
    const currentWeight = currentMatch?.nets[netIndex]?.weight || 0;
    const currentOz = Math.round(currentWeight / GRAMS_PER_OZ) % 16;
    const newTotalOz = (lb * 16) + currentOz;
    setNetWeight(netIndex, newTotalOz * GRAMS_PER_OZ);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!currentMatch) return null;

  const netCount = currentMatch.nets.length;
  const netWidth = (SCREEN_WIDTH - Spacing.lg * 3) / 2;
  const netHeight = 180;

  const handleVoiceCommand = useCallback(async () => {
    if (recordingState === "recording") {
      const audioBlob = await stopRecording();
      setIsListening(false);
      try {
        // We need a conversation ID. For now, using a hardcoded or match-specific one.
        // In a full implementation, you'd create/fetch a conversation.
        await streamVoiceResponse("/api/conversations/1/messages", audioBlob);
      } catch (e) {
        console.error("Voice streaming error:", e);
        Alert.alert("Error", "Failed to process voice command.");
      }
      return;
    }
    
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Microphone access is required for voice commands.");
        return;
      }
      await startRecording();
      setIsListening(true);
    } catch (e) {
      console.log("Voice start error:", e);
    }
  }, [recordingState, startRecording, stopRecording, streamVoiceResponse]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleLockTap} style={styles.headerButton} hitSlop={15}>
          <Feather name={isLocked ? "lock" : "unlock"} size={22} color={theme.text} />
        </Pressable>
        <View style={styles.timerContainer}>
          <ThemedText style={[styles.timer, { color: remainingSeconds < 300 ? Colors.dark.warning : theme.text }]}>
            {formatTime(remainingSeconds)}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={() => navigation.navigate("WeatherDetails")} style={styles.headerButton} hitSlop={15}>
            <Feather name="cloud" size={22} color={theme.text} />
          </Pressable>
          <Pressable onPress={handleVoiceCommand} style={styles.headerButton} hitSlop={15}>
            <Feather name="mic" size={22} color={isListening ? Colors.dark.primary : theme.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Settings")} style={styles.headerButton} hitSlop={15}>
            <Feather name="settings" size={22} color={theme.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("AlarmManagement")} style={styles.headerButton} hitSlop={15}>
            <Feather name="bell" size={22} color={alarms.length > 0 ? Colors.dark.primary : theme.text} />
          </Pressable>
        </View>
      </View>

      {activeAlarmBanner && (
        <Animated.View 
          entering={FadeIn}
          style={[styles.alarmBanner, { backgroundColor: Colors.dark.primary }]}
        >
          <Feather name="bell" size={20} color="#000" />
          <ThemedText style={styles.alarmBannerText}>
            {activeAlarmBanner.label || "Alarm Triggered!"}
          </ThemedText>
          <Pressable onPress={() => setActiveAlarmBanner(null)} style={styles.alarmBannerClose}>
            <Feather name="x" size={20} color="#000" />
          </Pressable>
        </Animated.View>
      )}

      <ScrollView 
        style={styles.netsScroll} 
        contentContainerStyle={styles.netsGrid}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.netsGridInner}>
          {currentMatch.nets.map((net, index) => {
            const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
            const progressColor = getProgressColor(percentage, {
              success: Colors.dark.success,
              warning: Colors.dark.warning,
              error: Colors.dark.error,
            });
            const totalOz = Math.round(net.weight / GRAMS_PER_OZ);
            const lb = Math.floor(totalOz / 16);
            const oz = totalOz % 16;

            return (
              <Animated.View
                key={index}
                entering={FadeIn.delay(index * 50)}
                style={[styles.netTile, { width: netWidth, height: netHeight, backgroundColor: theme.backgroundDefault }]}
              >
                <View style={styles.netHeader}>
                  <Pressable 
                    onPress={() => {
                      setEditingNetNameIndex(index);
                      setEditNetName(net.name || `Net ${index + 1}`);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{net.name || `Net ${index + 1}`}</ThemedText>
                    {!isLocked && <Feather name="edit-3" size={10} color={theme.textSecondary} style={{ marginLeft: 4 }} />}
                  </Pressable>
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
                  <View style={styles.weightDisplay}>
                    <ThemedText style={styles.controlValue}>{lb}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 4 }}>lb</ThemedText>
                    <ThemedText style={[styles.controlValue, { marginLeft: 8 }]}>{oz}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 4 }}>oz</ThemedText>
                  </View>

                  <View style={styles.controlGroup}>
                    <View style={styles.controlGroupRow}>
                      <Pressable
                        onPress={() => {
                          if (!isLocked) {
                            const currentWeight = net.weight;
                            const totalOz = Math.round(currentWeight / GRAMS_PER_OZ);
                            const newOz = Math.max(0, totalOz - 16);
                            setNetWeight(index, newOz * GRAMS_PER_OZ);
                          }
                        }}
                        disabled={isLocked || net.weight < GRAMS_PER_LB}
                        hitSlop={10}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || net.weight < GRAMS_PER_LB ? 0.4 : 1 }]}
                      >
                        <Feather name="minus" size={20} color={theme.text} />
                      </Pressable>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>LB</ThemedText>
                      <Pressable
                        onPress={() => !isLocked && setNetWeight(index, net.weight + GRAMS_PER_LB)}
                        disabled={isLocked}
                        hitSlop={10}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked ? 0.4 : 1 }]}
                      >
                        <Feather name="plus" size={20} color={theme.text} />
                      </Pressable>
                    </View>

                    <View style={styles.controlGroupRow}>
                      <Pressable
                        onPress={() => {
                          if (!isLocked) {
                            const currentWeight = net.weight;
                            const totalOz = Math.round(currentWeight / GRAMS_PER_OZ);
                            const newOz = Math.max(0, totalOz - 1);
                            setNetWeight(index, newOz * GRAMS_PER_OZ);
                          }
                        }}
                        disabled={isLocked || net.weight < (GRAMS_PER_OZ - 1)}
                        hitSlop={10}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || net.weight < (GRAMS_PER_OZ - 1) ? 0.4 : 1 }]}
                      >
                        <Feather name="minus" size={20} color={theme.text} />
                      </Pressable>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>OZ</ThemedText>
                      <Pressable
                        onPress={() => !isLocked && setNetWeight(index, net.weight + GRAMS_PER_OZ)}
                        disabled={isLocked}
                        hitSlop={10}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked ? 0.4 : 1 }]}
                      >
                        <Feather name="plus" size={20} color={theme.text} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {net.capacity ? (
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
                      <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }]} />
                    </View>
                  </View>
                ) : null}
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          entering={FadeIn.delay(netCount * 50)}
          style={[styles.netTile, { width: SCREEN_WIDTH - Spacing.lg * 2, height: 100, backgroundColor: theme.backgroundDefault, justifyContent: 'center' }]}
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
                    const lb = Math.floor(parseFloat(editLb) || 0);
                    let oz = Math.floor(parseFloat(editOz) || 0);
                    
                    // Correctly handle ounce overflow
                    const extraLb = Math.floor(oz / 16);
                    const finalOz = oz % 16;
                    const finalLb = lb + extraLb;
                    
                    const totalOz = (finalLb * 16) + finalOz;
                    setNetWeight(editingNetIndex, totalOz * GRAMS_PER_OZ);
                    setEditingNetIndex(null);
                  }
                }}
              >
                <ThemedText style={{ color: Colors.dark.background }}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={editingNetNameIndex !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.editModal}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>Edit Net Name</ThemedText>
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border, width: '100%', marginBottom: Spacing.lg }]}
              value={editNetName}
              onChangeText={setEditNetName}
              placeholder="Enter net name..."
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            <View style={styles.editButtonRow}>
              <Pressable style={[styles.editButton, { backgroundColor: theme.backgroundTertiary }]} onPress={() => setEditingNetNameIndex(null)}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.editButton, { backgroundColor: Colors.dark.primary }]}
                onPress={() => {
                  if (editingNetNameIndex !== null) {
                    updateNetName(editingNetNameIndex, editNetName);
                    setEditingNetNameIndex(null);
                  }
                }}
              >
                <ThemedText style={{ color: Colors.dark.background }}>Save</ThemedText>
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
  netsGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  netTile: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  netHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  netContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlGroup: {
    width: '100%',
    gap: Spacing.xs,
  },
  controlGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
  },
  weightDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  controlValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  alarmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alarmBannerText: {
    flex: 1,
    color: '#000',
    fontWeight: '700',
    marginLeft: Spacing.md,
  },
  alarmBannerClose: {
    padding: Spacing.xs,
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
