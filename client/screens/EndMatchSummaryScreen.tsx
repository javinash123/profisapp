import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Pressable, ScrollView, Share, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp } from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatWeight, formatDuration } from "@/lib/utils";
import { MatchState } from "@/lib/types";
import { getMatchHistory, getUser } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EndMatchSummaryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { theme } = useTheme();
  const { lastCompletedMatch } = useApp();
  const summaryRef = useRef<View>(null);
  
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeMatch = async () => {
      setLoading(true);
      try {
        const params = route.params as any;
        if (params?.matchData) {
          setMatch(params.matchData);
          setLoading(false);
          return;
        }

        if (lastCompletedMatch) {
          setMatch(lastCompletedMatch);
          setLoading(false);
          return;
        }
        
        const history = await getMatchHistory();
        if (history && history.length > 0) {
          setMatch(history[0]);
        }
      } catch (e) {
        console.error("Error loading match data in summary:", e);
      } finally {
        setLoading(false);
      }
    };

    initializeMatch();
  }, [lastCompletedMatch, route.params]);

  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saveMatch = async () => {
      if (!match || hasSaved) return;
      if ((match as any)._id || (match as any).dbId) {
        setHasSaved(true);
        return;
      }
      
      try {
        setHasSaved(true);
        const user = await getUser();
        if (!user) return;
        
        const baseUrl = getApiUrl();
        const apiPath = `${baseUrl}/api/matches`;
        const totalWeight = match.nets.reduce((sum, net) => sum + net.weight, 0);
        await fetch(apiPath, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            details: {
              venue: match.config.name,
              totalWeight: totalWeight,
              duration: match.config.durationMinutes / 60,
              nets: match.nets
            },
            summary: `Match at ${match.config.name} finished with total weight ${formatWeight(totalWeight, match.config.unit)}`,
            status: 'completed'
          }),
        });
      } catch (error) {
        console.error("Error saving match:", error);
      }
    };
    
    saveMatch();
  }, [match, hasSaved]);

  const handleShare = async () => {
    if (!match) return;
    
    try {
      let shareUri = "";
      if (summaryRef.current && Platform.OS !== "web") {
        try {
          shareUri = await captureRef(summaryRef, {
            format: "png",
            quality: 1,
            result: "tmpfile",
          });
        } catch (captureError) {
          console.warn("Capture failed, falling back to text-only share:", captureError);
        }
      }
      
      const totalWeight = match.nets.reduce((sum, net) => sum + net.weight, 0);
      const summaryText = `PegPro Match Summary\n\n` +
        `Match: ${match.config.name}\n` +
        `Peg: ${match.config.pegNumber}\n` +
        `Duration: ${formatDuration(match.config.durationMinutes)}\n` +
        `Total Weight: ${formatWeight(totalWeight, match.config.unit)}\n\n` +
        match.nets.map((net, i) => `Net ${i + 1}: ${formatWeight(net.weight, match.config.unit)}`).join("\n");
      
      if (Platform.OS === "web") {
        await Share.share({ message: summaryText });
      } else {
        await Share.share({
          url: shareUri || undefined,
          message: summaryText,
          title: "PegPro Match Summary",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleNewMatch = () => {
    navigation.replace("MatchSetup");
  };

  const totalWeight = match ? match.nets.reduce((sum, net) => sum + net.weight, 0) : 0;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText style={{ marginTop: Spacing.md }}>Loading Summary...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!match) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: Spacing.md }}>No match data found</ThemedText>
          <Pressable onPress={handleNewMatch} style={[styles.newMatchButton, { backgroundColor: Colors.dark.primary, marginTop: Spacing.xl, paddingHorizontal: Spacing.xl }]}>
            <ThemedText style={{ color: '#000', fontWeight: '600' }}>Back to Setup</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View ref={summaryRef} collapsable={false} style={[styles.summaryContainer, { backgroundColor: Colors.dark.backgroundRoot }]}>
          <View style={styles.summaryHeader}>
            <ThemedText type="h3" style={styles.summaryTitle}>PegPro Match Summary</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{match.config.name}</ThemedText>
          </View>

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

          <View style={styles.matchInfo}>
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
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>Per-Net Breakdown</ThemedText>

          {match.nets.map((net, index) => {
            const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
            const isOverCapacity = percentage > 100;

            return (
              <Card key={index} elevation={1} style={styles.netCard}>
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
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareButton,
            { backgroundColor: theme.backgroundTertiary, opacity: pressed ? 0.8 : 1, marginBottom: Spacing.sm },
          ]}
        >
          <Feather name="share-2" size={20} color={theme.text} />
          <ThemedText type="body" style={{ color: theme.text, fontWeight: "600", marginLeft: Spacing.sm }}>
            Share Summary
          </ThemedText>
        </Pressable>
        
        <Pressable
          onPress={handleNewMatch}
          style={({ pressed }) => [
            styles.newMatchButton,
            { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={22} color="#000000" />
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
  summaryContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  summaryHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    marginBottom: Spacing.xs,
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
  shareButton: {
    height: 50,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#000000",
    fontWeight: "600",
  },
});
