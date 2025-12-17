import React, { useState, useRef } from "react";
import { View, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
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

const LB_VALUES = Array.from({ length: 101 }, (_, i) => i);
const OZ_VALUES = Array.from({ length: 16 }, (_, i) => i);
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export default function ManualWeightEditModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { theme } = useTheme();
  const { currentMatch, setNetWeight, settings } = useApp();

  const netIndex = route.params?.netIndex ?? 0;
  const currentWeight = currentMatch?.nets[netIndex]?.weight || 0;
  const unit = currentMatch?.config.unit || settings.unit;

  const currentLb = Math.floor(currentWeight / 453.592);
  const currentOz = Math.round((currentWeight % 453.592) / 28.3495);

  const [selectedLb, setSelectedLb] = useState(Math.min(currentLb, 100));
  const [selectedOz, setSelectedOz] = useState(Math.min(currentOz, 15));

  const lbScrollRef = useRef<ScrollView>(null);
  const ozScrollRef = useRef<ScrollView>(null);

  const handleConfirm = () => {
    const weightInGrams = (selectedLb * 16 + selectedOz) * 28.3495;
    setNetWeight(netIndex, weightInGrams);
    
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleLbScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, LB_VALUES.length - 1));
    if (clampedIndex !== selectedLb) {
      setSelectedLb(clampedIndex);
      if (settings.haptics) {
        Haptics.selectionAsync();
      }
    }
  };

  const handleOzScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, OZ_VALUES.length - 1));
    if (clampedIndex !== selectedOz) {
      setSelectedOz(clampedIndex);
      if (settings.haptics) {
        Haptics.selectionAsync();
      }
    }
  };

  const selectLb = (value: number) => {
    setSelectedLb(value);
    lbScrollRef.current?.scrollTo({ y: value * ITEM_HEIGHT, animated: true });
    if (settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  const selectOz = (value: number) => {
    setSelectedOz(value);
    ozScrollRef.current?.scrollTo({ y: value * ITEM_HEIGHT, animated: true });
    if (settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  const renderPickerItem = (value: number, isSelected: boolean, unit: string) => (
    <View
      key={value}
      style={[
        styles.pickerItem,
        isSelected && styles.pickerItemSelected,
      ]}
    >
      <ThemedText
        style={[
          styles.pickerItemText,
          { color: isSelected ? theme.text : theme.textSecondary },
          isSelected && styles.pickerItemTextSelected,
        ]}
      >
        {value}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          <ThemedText type="h3">Edit Net {netIndex + 1} Weight</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Current: {formatWeight(currentWeight, unit)}
          </ThemedText>
        </View>

        <View style={styles.pickersContainer}>
          <View style={styles.pickerColumn}>
            <ThemedText type="small" style={[styles.pickerLabel, { color: theme.textSecondary }]}>
              Pounds (lb)
            </ThemedText>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.backgroundDefault }]}>
              <View style={[styles.selectionIndicator, { backgroundColor: Colors.dark.primary + "30", borderColor: Colors.dark.primary }]} />
              <ScrollView
                ref={lbScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleLbScroll}
                onScrollEndDrag={handleLbScroll}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                contentOffset={{ x: 0, y: selectedLb * ITEM_HEIGHT }}
              >
                {LB_VALUES.map((value) => (
                  <Pressable key={value} onPress={() => selectLb(value)}>
                    {renderPickerItem(value, value === selectedLb, "lb")}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.pickerColumn}>
            <ThemedText type="small" style={[styles.pickerLabel, { color: theme.textSecondary }]}>
              Ounces (oz)
            </ThemedText>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.backgroundDefault }]}>
              <View style={[styles.selectionIndicator, { backgroundColor: Colors.dark.primary + "30", borderColor: Colors.dark.primary }]} />
              <ScrollView
                ref={ozScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleOzScroll}
                onScrollEndDrag={handleOzScroll}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                contentOffset={{ x: 0, y: selectedOz * ITEM_HEIGHT }}
              >
                {OZ_VALUES.map((value) => (
                  <Pressable key={value} onPress={() => selectOz(value)}>
                    {renderPickerItem(value, value === selectedOz, "oz")}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={[styles.previewCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Selected Weight</ThemedText>
          <ThemedText style={styles.previewText}>
            {selectedLb} lb {selectedOz} oz
          </ThemedText>
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
  pickersContainer: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    position: "relative",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderWidth: 2,
    borderRadius: BorderRadius.xs,
    zIndex: 1,
    pointerEvents: "none",
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerItemSelected: {},
  pickerItemText: {
    ...Typography.h3,
    fontWeight: "400",
  },
  pickerItemTextSelected: {
    fontWeight: "700",
  },
  previewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  previewText: {
    ...Typography.h2,
    marginTop: Spacing.xs,
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
