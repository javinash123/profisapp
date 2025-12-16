import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatWeight } from "@/lib/utils";

type RouteType = RouteProp<RootStackParamList, "ManualWeightEdit">;

const KEYPAD_BUTTONS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "del"],
];

export default function ManualWeightEditModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { theme } = useTheme();
  const { currentMatch, setNetWeight, settings } = useApp();

  const netIndex = route.params?.netIndex ?? 0;
  const currentWeight = currentMatch?.nets[netIndex]?.weight || 0;
  const unit = currentMatch?.config.unit || settings.unit;

  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (key: string) => {
    if (settings.haptics) {
      Haptics.selectionAsync();
    }

    if (key === "del") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!inputValue.includes(".")) {
        setInputValue((prev) => (prev === "" ? "0." : prev + "."));
      }
    } else {
      setInputValue((prev) => {
        if (prev === "0" && key !== ".") return key;
        return prev + key;
      });
    }
  };

  const handleConfirm = () => {
    const numValue = parseFloat(inputValue) || 0;
    const weightInGrams = unit === "kg/g" ? numValue : numValue * 28.3495 * 16;
    setNetWeight(netIndex, weightInGrams);
    
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          <ThemedText type="h3">Edit Net {netIndex + 1} Weight</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Current: {formatWeight(currentWeight, unit)}
          </ThemedText>
        </View>

        <View style={[styles.display, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.displayValue}>
            {inputValue || "0"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {unit === "kg/g" ? "grams" : "pounds"}
          </ThemedText>
        </View>

        <View style={styles.keypad}>
          {KEYPAD_BUTTONS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => handleKeyPress(key)}
                  style={({ pressed }) => [
                    styles.keypadButton,
                    {
                      backgroundColor: key === "del" ? theme.backgroundTertiary : theme.backgroundDefault,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {key === "del" ? (
                    <Feather name="delete" size={24} color={theme.text} />
                  ) : (
                    <ThemedText style={styles.keypadButtonText}>{key}</ThemedText>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.actionButton,
              styles.cancelButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="body" style={{ fontWeight: "600" }}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.actionButton,
              styles.confirmButton,
              { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>Confirm</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  display: {
    height: 80,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  displayValue: {
    ...Typography.h1,
    fontVariant: ["tabular-nums"],
  },
  keypad: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  keypadRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  keypadButton: {
    flex: 1,
    height: 64,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  keypadButtonText: {
    ...Typography.h2,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {},
  confirmButton: {},
});
