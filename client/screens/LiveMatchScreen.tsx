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
  
  const GRAMS_PER_OZ = 28.3495;
  const GRAMS_PER_LB = 453.592;

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
  const [activeAlarmBanner, setActiveAlarmBanner] = useState<Alarm | null>(null);
  const [isListening, setIsListening] = useState(false);
  const soundRef = useRef<any>(null);

  const { streamVoiceResponse } = useVoiceStream({
    onUserTranscript: (text) => console.log("User said:", text),
    onTranscript: (delta) => console.log("AI says:", delta),
    onComplete: (full) => {
      console.log("Voice processing complete. AI full response:", full);
      
      const lowerFull = full.toLowerCase();
      
      // Handle "add a fish" or "add fish"
      if ((lowerFull.includes("add") || lowerFull.includes("plus")) && lowerFull.includes("fish")) {
        setTotalFish(prev => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak("Added a fish");
        return;
      }
      
      // Handle "total fish 20" or "fish count 15"
      const totalFishMatch = lowerFull.match(/(?:total|count|set)\s*fish\s*(?:to|is)?\s*(\d+)/i) || lowerFull.match(/fish\s*(?:total|count|set)\s*(?:to|is)?\s*(\d+)/i);
      if (totalFishMatch) {
        const count = parseInt(totalFishMatch[1]);
        setTotalFish(count);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak(`Total fish set to ${count}`);
        return;
      }
      
      // Handle "remove a fish" or "remove fish"
      if ((lowerFull.includes("remove") || lowerFull.includes("delete") || lowerFull.includes("minus")) && lowerFull.includes("fish")) {
        setTotalFish(prev => Math.max(0, prev - 1));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak("Removed a fish");
        return;
      }

      // Handle weight commands
      // Matches "add 5 lb to net 1", "plus 10 oz net 2", "5 pound net 3", "2oz net 1"
      const lbMatch = full.match(/(\d+)\s*(?:lb|pound|lbs)/i);
      const ozMatch = full.match(/(\d+)\s*(?:oz|ounce|ounces)/i);
      const netMatch = full.match(/net\s*(\d+)/i);
      const weightMentioned = full.match(/(\d+)\s*(?:lb|pound|lbs|oz|ounce|ounces)/i);
      
      let totalGrams = 0;
      if (lbMatch) totalGrams += parseInt(lbMatch[1]) * GRAMS_PER_LB;
      if (ozMatch) totalGrams += parseInt(ozMatch[1]) * GRAMS_PER_OZ;
      
      // Default to net 1 if no net mentioned and no net is being edited
      const netIdx = netMatch ? parseInt(netMatch[1]) - 1 : (editingNetIndex ?? 0);
      
      if (weightMentioned && currentMatch && netIdx >= 0 && netIdx < currentMatch.nets.length) {
        const isAdding = lowerFull.includes("add") || lowerFull.includes("plus") || lowerFull.includes("put") || (!lowerFull.includes("remove") && !lowerFull.includes("reduce") && !lowerFull.includes("minus") && !lowerFull.includes("take"));
        
        const currentWeight = currentMatch.nets[netIdx].weight;
        if (isAdding) {
          const totalOz = Math.round(currentWeight / GRAMS_PER_OZ);
          const addedOz = Math.round(totalGrams / GRAMS_PER_OZ);
          setNetWeight(netIdx, (totalOz + addedOz) * GRAMS_PER_OZ);
          Speech.speak(`Added ${lbMatch ? lbMatch[1] + ' pounds ' : ''}${ozMatch ? ozMatch[1] + ' ounces ' : ''}to net ${netIdx + 1}`);
        } else {
          const totalOz = Math.round(currentWeight / GRAMS_PER_OZ);
          const removedOz = Math.round(totalGrams / GRAMS_PER_OZ);
          setNetWeight(netIdx, Math.max(0, (totalOz - removedOz) * GRAMS_PER_OZ));
          Speech.speak(`Removed ${lbMatch ? lbMatch[1] + ' pounds ' : ''}${ozMatch ? ozMatch[1] + ' ounces ' : ''}from net ${netIdx + 1}`);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (weightMentioned) {
        Speech.speak("I heard the weight but couldn't identify which net to update.");
      }
    }
  });

  const handleMatchEnd = useCallback(async () => {
    Alert.alert(
      "End Match",
      "Are you sure you want to end this match and see the summary?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "End Match",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Ending match...");
              const matchData = await endMatch();
              navigation.replace("EndMatchSummary", { matchData });
            } catch (error) {
              console.error("Error ending match:", error);
              navigation.replace("EndMatchSummary");
            }
          }
        }
      ]
    );
  }, [endMatch, navigation]);

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
  }, [currentMatch, handleMatchEnd]);

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
  }, [currentMatch, alarms, firedAlarms, settings, playAlarmSound]);

  const totalWeight = currentMatch?.nets.reduce((sum, net) => sum + net.weight, 0) || 0;

  const getNetLb = (weightGrams: number) => {
    const totalOz = Math.round(weightGrams / GRAMS_PER_OZ);
    const lb = Math.floor(totalOz / 16);
    return lb;
  };

  if (!currentMatch) return null;

  const netWidth = (SCREEN_WIDTH - Spacing.lg * 3) / 2;
  const netHeight = 180;

  const handleVoiceCommand = useCallback(async () => {
    if (recordingState === "recording") {
      const audioBlob = await stopRecording();
      setIsListening(false);
      try {
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
        <View style={styles.headerInner}>
          <Pressable onPress={handleLockTap} style={styles.headerButton} hitSlop={15}>
            <Feather name={isLocked ? "lock" : "unlock"} size={22} color={theme.text} />
          </Pressable>
          
          <View style={styles.timerContainer}>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {currentMatch.config.lakeName} - Peg {currentMatch.config.pegNumber}
            </ThemedText>
            <ThemedText style={[styles.timer, { color: remainingSeconds < 300 ? Colors.dark.warning : theme.text }]}>
              {formatTime(remainingSeconds)}
            </ThemedText>
          </View>

          <View style={styles.headerIcons}>
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
      </View>

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
                            const newOz = Math.max(0, totalOz - 16);
                            setNetWeight(index, newOz * GRAMS_PER_OZ);
                          }
                        }}
                        disabled={isLocked || net.weight < GRAMS_PER_LB}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || net.weight < GRAMS_PER_LB ? 0.4 : 1 }]}
                      >
                        <Feather name="minus" size={20} color={theme.text} />
                      </Pressable>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>LB</ThemedText>
                      <Pressable
                        onPress={() => !isLocked && setNetWeight(index, net.weight + GRAMS_PER_LB)}
                        disabled={isLocked}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked ? 0.4 : 1 }]}
                      >
                        <Feather name="plus" size={20} color={theme.text} />
                      </Pressable>
                    </View>

                    <View style={styles.controlGroupRow}>
                      <Pressable
                        onPress={() => {
                          if (!isLocked) {
                            const newOz = Math.max(0, totalOz - 1);
                            setNetWeight(index, newOz * GRAMS_PER_OZ);
                          }
                        }}
                        disabled={isLocked || net.weight < (GRAMS_PER_OZ - 1)}
                        style={[styles.controlButton, { backgroundColor: theme.backgroundTertiary, opacity: isLocked || net.weight < (GRAMS_PER_OZ - 1) ? 0.4 : 1 }]}
                      >
                        <Feather name="minus" size={20} color={theme.text} />
                      </Pressable>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>OZ</ThemedText>
                      <Pressable
                        onPress={() => !isLocked && setNetWeight(index, net.weight + GRAMS_PER_OZ)}
                        disabled={isLocked}
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
          entering={FadeIn.delay(currentMatch.nets.length * 50)}
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
            onPress={handleMatchEnd}
            disabled={isLocked}
            style={[styles.endButton, { backgroundColor: Colors.dark.primary, opacity: isLocked ? 0.6 : 1 }]}
          >
            <Feather name="list" size={20} color="#000000" />
            <ThemedText type="small" style={{ color: "#000000", marginLeft: 6, fontWeight: "600" }}>End</ThemedText>
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
                    const extraLb = Math.floor(oz / 16);
                    const finalOz = oz % 16;
                    const finalLb = lb + extraLb;
                    const totalOz = (finalLb * 16) + finalOz;
                    setNetWeight(editingNetIndex, totalOz * GRAMS_PER_OZ);
                    setEditingNetIndex(null);
                  }
                }}>
                <ThemedText style={{ color: '#000', fontWeight: '600' }}>Save</ThemedText>
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
              placeholder="Enter net name"
              placeholderTextColor={theme.textMuted}
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
                }}>
                <ThemedText style={{ color: '#000', fontWeight: '600' }}>Save</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    padding: Spacing.xs,
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
  },
  timer: {
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  headerIcons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  alarmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  alarmBannerText: {
    flex: 1,
    color: '#000',
    fontWeight: '600',
  },
  alarmBannerClose: {
    padding: 4,
  },
  netsScroll: {
    flex: 1,
  },
  netsGrid: {
    padding: Spacing.lg,
  },
  netsGridInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.lg,
  },
  netTile: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  controlValue: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
  controlGroup: {
    width: '100%',
    gap: Spacing.xs,
  },
  controlGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  controlButtonLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
  },
  totalContent: {
    gap: 2,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  editModal: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  editInputRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  editInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  editInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  editButton: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
