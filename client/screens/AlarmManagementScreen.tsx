import React from "react";
import { View, StyleSheet, Pressable, FlatList, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Alarm } from "@/lib/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AlarmManagementScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { alarms, updateAlarm, deleteAlarm, settings } = useApp();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("AddEditAlarm", {})}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="plus" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const handleToggleAlarm = (alarm: Alarm) => {
    updateAlarm(alarm.id, { enabled: !alarm.enabled });
    if (settings.haptics) {
      Haptics.selectionAsync();
    }
  };

  const handleDeleteAlarm = (id: string) => {
    deleteAlarm(id);
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const getAlarmDescription = (alarm: Alarm): string => {
    switch (alarm.mode) {
      case "one-time":
        if (alarm.time) {
          const date = new Date(alarm.time);
          return `At ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }
        return "One-time alarm";
      case "repeat":
        return `Every ${alarm.intervalMinutes} min`;
      case "duration-pattern":
        return `${alarm.durationSeconds}s every ${alarm.patternMinutes} min`;
      default:
        return "Alarm";
    }
  };

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
      <Card
        elevation={1}
        style={styles.alarmCard}
        onPress={() => navigation.navigate("AddEditAlarm", { alarmId: item.id })}
      >
        <View style={styles.alarmContent}>
          <View style={styles.alarmInfo}>
            <View style={styles.alarmIcons}>
              {item.soundEnabled ? (
                <Feather name="volume-2" size={16} color={theme.textSecondary} />
              ) : null}
              {item.vibrationEnabled ? (
                <Feather name="smartphone" size={16} color={theme.textSecondary} />
              ) : null}
            </View>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.label || getAlarmDescription(item)}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
              {getAlarmDescription(item)}
            </ThemedText>
          </View>
          <View style={styles.alarmActions}>
            <Switch
              value={item.enabled}
              onValueChange={() => handleToggleAlarm(item)}
              trackColor={{ false: theme.border, true: Colors.dark.primary }}
              thumbColor="#FFFFFF"
            />
            <Pressable
              onPress={() => handleDeleteAlarm(item.id)}
              hitSlop={8}
              style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="trash-2" size={18} color={Colors.dark.error} />
            </Pressable>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="bell-off" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={{ marginTop: Spacing.xl }}>
        No Alarms Set
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}
      >
        Tap the + button to add reminders for feeding times or match intervals
      </ThemedText>
      <Pressable
        onPress={() => navigation.navigate("AddEditAlarm", {})}
        style={({ pressed }) => [
          styles.addButton,
          { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600" }}>
          Add Alarm
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarm}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
  },
  alarmCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
  },
  alarmContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alarmInfo: {
    flex: 1,
  },
  alarmIcons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  alarmActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
});
