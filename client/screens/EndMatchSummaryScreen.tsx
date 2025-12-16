import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatWeight, formatDuration } from "@/lib/utils";
import { MatchState } from "@/lib/types";
import { getMatchHistory } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EndMatchSummaryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { settings } = useApp();

  const [match, setMatch] = useState<MatchState | null>(null);

  useEffect(() => {
    loadLastMatch();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleShare}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="share" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme, match]);

  const loadLastMatch = async () => {
    const history = await getMatchHistory();
    if (history.length > 0) {
      setMatch(history[0]);
    }
  };

  const handleShare = async () => {
    if (!match) return;
    
    const totalWeight = match.nets.reduce((sum, net) => sum + net.weight, 0);
    const summaryText = `PegPro Match Summary\n\n` +
      `Match: ${match.config.name}\n` +
      `Peg: ${match.config.pegNumber}\n` +
      `Duration: ${formatDuration(match.config.durationMinutes)}\n` +
      `Total Weight: ${formatWeight(totalWeight, match.config.unit)}\n\n` +
      match.nets.map((net, i) => `Net ${i + 1}: ${formatWeight(net.weight, match.config.unit)}`).join("\n");

    try {
      await Share.share({ message: summaryText });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleNewMatch = () => {
    navigation.replace("MatchSetup");
  };

  if (!match) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const totalWeight = match.nets.reduce((sum, net) => sum + net.weight, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100)}>
          <Card elevation={1} style={styles.totalCard}>
            <View style={styles.totalHeader}>
              <Feather name="award" size={32} color={Colors.dark.primary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                Total Weight
              </ThemedText>
            </View>
            <ThemedText style={styles.totalWeight}>
              {formatWeight(totalWeight, match.config.unit)}
            </ThemedText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.matchInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="flag" size={18} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                Peg {match.config.pegNumber}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Feather name="clock" size={18} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                {formatDuration(match.config.durationMinutes)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Feather name="grid" size={18} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                {match.config.numberOfNets} Nets
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <ThemedText type="h4" style={styles.sectionTitle}>Per-Net Breakdown</ThemedText>

        {match.nets.map((net, index) => {
          const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
          const isOverCapacity = percentage > 100;

          return (
            <Animated.View key={index} entering={FadeInUp.delay(300 + index * 50)}>
              <Card elevation={1} style={styles.netCard}>
                <View style={styles.netCardContent}>
                  <View style={styles.netInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>Net {index + 1}</ThemedText>
                    {isOverCapacity ? (
                      <View style={[styles.overCapacityBadge, { backgroundColor: Colors.dark.error + "30" }]}>
                        <Feather name="alert-circle" size={12} color={Colors.dark.error} />
                        <ThemedText type="caption" style={{ color: Colors.dark.error, marginLeft: 4 }}>
                          Over Capacity
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                  <ThemedText type="h4">{formatWeight(net.weight, match.config.unit)}</ThemedText>
                </View>
                {net.capacity ? (
                  <View style={styles.capacityInfo}>
                    <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverCapacity ? Colors.dark.error : Colors.dark.success,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 4 }}>
                      {Math.round(percentage)}% of capacity
                    </ThemedText>
                  </View>
                ) : null}
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleNewMatch}
          style={({ pressed }) => [
            styles.newMatchButton,
            { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
          <ThemedText type="body" style={styles.newMatchButtonText}>
            New Match
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  totalCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  totalHeader: {
    alignItems: "center",
  },
  totalWeight: {
    ...Typography.timer,
    marginTop: Spacing.sm,
  },
  matchInfo: {
    marginTop: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  netCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
  },
  netCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  overCapacityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  capacityInfo: {
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
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  newMatchButton: {
    height: 56,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  newMatchButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
