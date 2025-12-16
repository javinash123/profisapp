import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, TextInput, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AlarmMode } from "@/lib/types";

type RouteType = RouteProp<RootStackParamList, "AddEditAlarm">;

const ALARM_MODES: { value: AlarmMode; label: string; icon: string }[] = [
  { value: "one-time", label: "One-time", icon: "clock" },
  { value: "repeat", label: "Repeat", icon: "repeat" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function AddEditAlarmScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { theme } = useTheme();
  const { alarms, addAlarm, updateAlarm, settings } = useApp();

  const alarmId = route.params?.alarmId;
  const existingAlarm = alarmId ? alarms.find((a) => a.id === alarmId) : null;
  const isEditing = !!existingAlarm;

  const getInitialTime = () => {
    if (existingAlarm?.time) {
      const date = new Date(existingAlarm.time);
      return { hour: date.getHours(), minute: date.getMinutes() };
    }
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return { hour: now.getHours(), minute: 0 };
  };

  const initialTime = getInitialTime();
  const [originalAlarmTime] = useState(existingAlarm?.time || null);

  const [mode, setMode] = useState<AlarmMode>(existingAlarm?.mode || "repeat");
  const [label, setLabel] = useState(existingAlarm?.label || "");
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [intervalMinutes, setIntervalMinutes] = useState(
    existingAlarm?.intervalMinutes?.toString() || "30"
  );
  const [durationSeconds, setDurationSeconds] = useState(
    existingAlarm?.durationSeconds?.toString() || "20"
  );
  const [patternMinutes, setPatternMinutes] = useState(
    existingAlarm?.patternMinutes?.toString() || "5"
  );
  const [soundEnabled, setSoundEnabled] = useState(existingAlarm?.soundEnabled ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(existingAlarm?.vibrationEnabled ?? true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? "Edit Alarm" : "New Alarm",
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ThemedText type="body" style={{ color: theme.link }}>Cancel</ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ThemedText type="body" style={{ color: Colors.dark.primary, fontWeight: "600" }}>
            Save
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, theme, mode, label, intervalMinutes, durationSeconds, patternMinutes, soundEnabled, vibrationEnabled]);

  const getAlarmTime = () => {
    const now = new Date();
    let alarmDate: Date;
    
    if (originalAlarmTime && isEditing) {
      alarmDate = new Date(originalAlarmTime);
      alarmDate.setHours(selectedHour, selectedMinute, 0, 0);
      if (alarmDate <= now) {
        alarmDate.setDate(now.getDate());
        alarmDate.setHours(selectedHour, selectedMinute, 0, 0);
        if (alarmDate <= now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }
      }
    } else {
      alarmDate = new Date();
      alarmDate.setHours(selectedHour, selectedMinute, 0, 0);
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }
    }
    
    return alarmDate.getTime();
  };

  const handleSave = async () => {
    const alarmData = {
      mode,
      label: label.trim() || undefined,
      intervalMinutes: mode === "repeat" ? parseInt(intervalMinutes) || 30 : undefined,
      durationSeconds: undefined,
      patternMinutes: undefined,
      time: (mode === "one-time" || mode === "repeat") ? getAlarmTime() : undefined,
      soundEnabled,
      vibrationEnabled,
      enabled: true,
    };

    if (isEditing && alarmId) {
      await updateAlarm(alarmId, alarmData);
    } else {
      await addAlarm(alarmData);
    }

    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Alarm Type
          </ThemedText>
          <View style={styles.modeSelector}>
            {ALARM_MODES.map((m) => (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                style={[
                  styles.modeOption,
                  {
                    backgroundColor: mode === m.value ? Colors.dark.primary : theme.backgroundDefault,
                    borderColor: mode === m.value ? Colors.dark.primary : theme.border,
                  },
                ]}
              >
                <Feather
                  name={m.icon as any}
                  size={20}
                  color={mode === m.value ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  type="small"
                  style={{
                    color: mode === m.value ? "#FFFFFF" : theme.text,
                    marginTop: 4,
                    fontWeight: "600",
                  }}
                >
                  {m.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Label (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g., Feed time"
            placeholderTextColor={theme.textSecondary}
            value={label}
            onChangeText={setLabel}
          />
        </View>

        {mode === "repeat" ? (
          <>
            <View style={styles.section}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Start Time
              </ThemedText>
              <View style={styles.timePickerContainer}>
                <View style={[styles.timePickerColumn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Hour</ThemedText>
                  <View style={styles.timeButtonsRow}>
                    <Pressable
                      onPress={() => setSelectedHour((prev) => (prev === 0 ? 23 : prev - 1))}
                      style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                    >
                      <Feather name="chevron-up" size={20} color={theme.text} />
                    </Pressable>
                    <ThemedText type="h2" style={styles.timeValue}>
                      {selectedHour.toString().padStart(2, "0")}
                    </ThemedText>
                    <Pressable
                      onPress={() => setSelectedHour((prev) => (prev === 23 ? 0 : prev + 1))}
                      style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                    >
                      <Feather name="chevron-down" size={20} color={theme.text} />
                    </Pressable>
                  </View>
                </View>

                <ThemedText type="h2" style={{ marginHorizontal: Spacing.sm }}>:</ThemedText>

                <View style={[styles.timePickerColumn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Minute</ThemedText>
                  <View style={styles.timeButtonsRow}>
                    <Pressable
                      onPress={() => setSelectedMinute((prev) => (prev === 0 ? 59 : prev - 1))}
                      style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                    >
                      <Feather name="chevron-up" size={20} color={theme.text} />
                    </Pressable>
                    <ThemedText type="h2" style={styles.timeValue}>
                      {selectedMinute.toString().padStart(2, "0")}
                    </ThemedText>
                    <Pressable
                      onPress={() => setSelectedMinute((prev) => (prev === 59 ? 0 : prev + 1))}
                      style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                    >
                      <Feather name="chevron-down" size={20} color={theme.text} />
                    </Pressable>
                  </View>
                </View>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
                First alarm at {selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Repeat Every (minutes)
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={intervalMinutes}
                onChangeText={setIntervalMinutes}
                placeholder="30"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </>
        ) : null}

        {mode === "duration-pattern" ? (
          <>
            <View style={styles.section}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Duration (seconds)
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={durationSeconds}
                onChangeText={setDurationSeconds}
                placeholder="20"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                How long to feed/act
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Every (minutes)
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={patternMinutes}
                onChangeText={setPatternMinutes}
                placeholder="5"
                placeholderTextColor={theme.textSecondary}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                Interval between each reminder
              </ThemedText>
            </View>
          </>
        ) : null}

        {mode === "one-time" ? (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              Set Time
            </ThemedText>
            <View style={styles.timePickerContainer}>
              <View style={[styles.timePickerColumn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Hour</ThemedText>
                <View style={styles.timeButtonsRow}>
                  <Pressable
                    onPress={() => setSelectedHour((prev) => (prev === 0 ? 23 : prev - 1))}
                    style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="chevron-up" size={20} color={theme.text} />
                  </Pressable>
                  <ThemedText type="h2" style={styles.timeValue}>
                    {selectedHour.toString().padStart(2, "0")}
                  </ThemedText>
                  <Pressable
                    onPress={() => setSelectedHour((prev) => (prev === 23 ? 0 : prev + 1))}
                    style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="chevron-down" size={20} color={theme.text} />
                  </Pressable>
                </View>
              </View>

              <ThemedText type="h2" style={{ marginHorizontal: Spacing.sm }}>:</ThemedText>

              <View style={[styles.timePickerColumn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>Minute</ThemedText>
                <View style={styles.timeButtonsRow}>
                  <Pressable
                    onPress={() => setSelectedMinute((prev) => (prev === 0 ? 59 : prev - 1))}
                    style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="chevron-up" size={20} color={theme.text} />
                  </Pressable>
                  <ThemedText type="h2" style={styles.timeValue}>
                    {selectedMinute.toString().padStart(2, "0")}
                  </ThemedText>
                  <Pressable
                    onPress={() => setSelectedMinute((prev) => (prev === 59 ? 0 : prev + 1))}
                    style={[styles.timeButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="chevron-down" size={20} color={theme.text} />
                  </Pressable>
                </View>
              </View>
            </View>
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
              Alarm will trigger at {selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Notifications
          </ThemedText>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Feather name="volume-2" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Sound</ThemedText>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.border, true: Colors.dark.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Feather name="smartphone" size={20} color={theme.textSecondary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Vibration</ThemedText>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: theme.border, true: Colors.dark.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modeOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textInput: {
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    ...Typography.body,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerColumn: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 100,
  },
  timeButtonsRow: {
    alignItems: "center",
  },
  timeButton: {
    width: 44,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  timeValue: {
    marginVertical: Spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
});
