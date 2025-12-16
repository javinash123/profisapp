import React from "react";
import { View, StyleSheet, Pressable, Switch, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { WeightUnit } from "@/lib/types";

const AVATAR_PRESETS = [
  { icon: "user", color: Colors.dark.primary },
  { icon: "anchor", color: Colors.dark.secondary },
  { icon: "target", color: Colors.dark.success },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { settings, updateSettings } = useApp();

  const handleUnitChange = (unit: WeightUnit) => {
    updateSettings({ unit });
    if (settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  const handleAvatarChange = (index: number) => {
    updateSettings({ avatarPreset: index });
    if (settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  const handleToggle = (key: "haptics" | "sound", value: boolean) => {
    updateSettings({ [key]: value });
    if (key !== "haptics" && settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Profile
          </ThemedText>
          <Card elevation={1} style={styles.sectionCard}>
            <View style={styles.avatarSection}>
              <ThemedText type="body" style={{ marginBottom: Spacing.md }}>Avatar</ThemedText>
              <View style={styles.avatarOptions}>
                {AVATAR_PRESETS.map((preset, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleAvatarChange(index)}
                    style={[
                      styles.avatarOption,
                      {
                        backgroundColor:
                          settings.avatarPreset === index
                            ? preset.color
                            : theme.backgroundTertiary,
                        borderColor:
                          settings.avatarPreset === index ? preset.color : "transparent",
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Feather
                      name={preset.icon as any}
                      size={24}
                      color={settings.avatarPreset === index ? "#FFFFFF" : theme.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <ThemedText type="body">Display Name</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {settings.displayName}
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Units
          </ThemedText>
          <Card elevation={1} style={styles.sectionCard}>
            <View style={styles.unitSelector}>
              <Pressable
                onPress={() => handleUnitChange("lb/oz")}
                style={[
                  styles.unitOption,
                  {
                    backgroundColor:
                      settings.unit === "lb/oz" ? Colors.dark.primary : theme.backgroundTertiary,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: settings.unit === "lb/oz" ? "#FFFFFF" : theme.text,
                    fontWeight: "600",
                  }}
                >
                  lb / oz
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: settings.unit === "lb/oz" ? "#FFFFFF" : theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Imperial
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleUnitChange("kg/g")}
                style={[
                  styles.unitOption,
                  {
                    backgroundColor:
                      settings.unit === "kg/g" ? Colors.dark.primary : theme.backgroundTertiary,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: settings.unit === "kg/g" ? "#FFFFFF" : theme.text,
                    fontWeight: "600",
                  }}
                >
                  kg / g
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: settings.unit === "kg/g" ? "#FFFFFF" : theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Metric
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Feedback
          </ThemedText>
          <Card elevation={1} style={styles.sectionCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Feather name="smartphone" size={20} color={theme.textSecondary} />
                <View style={{ marginLeft: Spacing.md }}>
                  <ThemedText type="body">Haptic Feedback</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    Vibrate on actions
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.haptics}
                onValueChange={(value) => handleToggle("haptics", value)}
                trackColor={{ false: theme.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Feather name="volume-2" size={20} color={theme.textSecondary} />
                <View style={{ marginLeft: Spacing.md }}>
                  <ThemedText type="body">Sound Effects</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    Play sounds on alarms
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={(value) => handleToggle("sound", value)}
                trackColor={{ false: theme.border, true: Colors.dark.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            About
          </ThemedText>
          <Card elevation={1} style={styles.sectionCard}>
            <View style={styles.infoRow}>
              <ThemedText type="body">Version</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                1.0.0
              </ThemedText>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  sectionLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: Spacing.lg,
  },
  avatarSection: {},
  avatarOptions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  unitOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});
