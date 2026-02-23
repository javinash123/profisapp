import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, Pressable, ScrollView, Share, Platform, ActivityIndicator, Dimensions } from "react-native";
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
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryLine } from "victory-native";

import { formatWeight, formatDuration } from "@/lib/utils";
import { MatchState } from "@/lib/types";
import { getMatchHistory, getUser } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
        let activeMatch: MatchState | null = null;
        
        console.log("Initializing match summary with params:", !!params?.matchData, "lastCompleted:", !!lastCompletedMatch);
        
        if (params?.matchData) {
          activeMatch = params.matchData;
        } else if (lastCompletedMatch) {
          activeMatch = lastCompletedMatch;
        } else {
          const history = await getMatchHistory();
          if (history && history.length > 0) {
            activeMatch = history[0];
          }
        }
        
        if (activeMatch) {
          console.log("Match data found:", activeMatch.id);
          setMatch(activeMatch);
        } else {
          console.log("No match data found in initialization");
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
        const totalWeightValue = match.nets.reduce((sum, net) => sum + net.weight, 0);
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
              totalWeight: totalWeightValue,
              duration: match.config.durationMinutes / 60,
              nets: match.nets
            },
            summary: `Match at ${match.config.name} finished with total weight ${formatWeight(totalWeightValue, match.config.unit)}`,
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
      
      const totalWeightValue = match.nets.reduce((sum, net) => sum + net.weight, 0);
      const summaryText = `PegPro Match Summary\n\n` +
        `Match: ${match.config.name}\n` +
        `Peg: ${match.config.pegNumber}\n` +
        `Duration: ${formatDuration(match.config.durationMinutes)}\n` +
        `Total Weight: ${formatWeight(totalWeightValue, match.config.unit)}\n\n` +
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

  const catchChartData = useMemo(() => {
    if (!match) return [];
    return (match.catches?.map(c => {
      const elapsedMins = Math.floor((c.timestamp - match.startTime) / 60000);
      return {
        time: elapsedMins,
        weight: match.config.unit === "lb/oz" ? c.weight / 453.592 : c.weight / 1000,
        label: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }) || []);
  }, [match]);

  const cumulativeData = useMemo(() => {
    const data: any[] = [];
    if (match) {
      let currentTotal = 0;
      [...(match.catches || [])].sort((a, b) => a.timestamp - b.timestamp).forEach(c => {
        currentTotal += c.weight;
        const elapsedMins = Math.floor((c.timestamp - match.startTime) / 60000);
        data.push({
          time: elapsedMins,
          total: match.config.unit === "lb/oz" ? currentTotal / 453.592 : currentTotal / 1000,
          label: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
    }
    return data;
  }, [match]);

  const minuteReport = useMemo(() => {
    if (!match) return [];
    const start = match.startTime;
    const end = match.endTime || Date.now();
    const durationMins = Math.floor((end - start) / 60000);
    const report = [];
    
    // Group catches by minute
    const catchesByMinute: { [key: number]: any[] } = {};
    (match.catches || []).forEach(c => {
      const minute = Math.floor((c.timestamp - start) / 60000);
      if (!catchesByMinute[minute]) catchesByMinute[minute] = [];
      catchesByMinute[minute].push(c);
    });

    for (let i = 0; i <= durationMins; i++) {
      const minuteCatches = catchesByMinute[i] || [];
      if (minuteCatches.length > 0) {
        const weight = minuteCatches.reduce((sum, c) => sum + c.weight, 0);
        const minuteTime = start + i * 60000;
        report.push({
          minute: i,
          time: new Date(minuteTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          weight: formatWeight(weight, match.config.unit),
          fishCount: minuteCatches.length
        });
      }
    }
    return report;
  }, [match]);

  const totalWeight = useMemo(() => {
    return match ? match.nets.reduce((sum, net) => sum + net.weight, 0) : 0;
  }, [match]);

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
            <ThemedText type="body" style={{ color: theme.textSecondary }}>{match.config.lakeName}</ThemedText>
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
                <Feather name="sun" size={18} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  {match.config.weatherDescription}
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  {formatDuration(match.config.durationMinutes)}
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Catch Progression (Cumulative Weight)</ThemedText>
          <Card elevation={1} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            {cumulativeData.length > 0 ? (
              <VictoryChart theme={VictoryTheme.material} domainPadding={20} width={SCREEN_WIDTH - Spacing.xl * 4}>
                <VictoryAxis 
                  label="Match Minute" 
                  style={{ axisLabel: { padding: 30, fill: theme.textSecondary }, tickLabels: { fill: theme.textSecondary } }}
                />
                <VictoryAxis 
                  dependentAxis 
                  label={match.config.unit === "lb/oz" ? "Total lb" : "Total kg"}
                  style={{ axisLabel: { padding: 40, fill: theme.textSecondary }, tickLabels: { fill: theme.textSecondary } }}
                />
                <VictoryLine 
                  data={cumulativeData} 
                  x="time" 
                  y="total" 
                  style={{ data: { stroke: Colors.dark.primary, strokeWidth: 3 } }} 
                />
              </VictoryChart>
            ) : (
              <ThemedText style={{ textAlign: 'center', padding: Spacing.lg, color: theme.textSecondary }}>No progression data recorded</ThemedText>
            )}
          </Card>

          <ThemedText type="h4" style={styles.sectionTitle}>Catch Distribution (Per Minute)</ThemedText>
          <Card elevation={1} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            {catchChartData.length > 0 ? (
              <VictoryChart theme={VictoryTheme.material} domainPadding={20} width={SCREEN_WIDTH - Spacing.xl * 4}>
                <VictoryAxis 
                  label="Match Minute"
                  style={{ axisLabel: { padding: 30, fill: theme.textSecondary }, tickLabels: { fill: theme.textSecondary } }}
                />
                <VictoryAxis 
                  dependentAxis 
                  label={match.config.unit === "lb/oz" ? "lb" : "kg"}
                  style={{ axisLabel: { padding: 40, fill: theme.textSecondary }, tickLabels: { fill: theme.textSecondary } }}
                />
                <VictoryBar data={catchChartData} x="time" y="weight" style={{ data: { fill: Colors.dark.secondary } }} />
              </VictoryChart>
            ) : (
              <ThemedText style={{ textAlign: 'center', padding: Spacing.lg, color: theme.textSecondary }}>No individual catch data recorded</ThemedText>
            )}
          </Card>

          <ThemedText type="h4" style={styles.sectionTitle}>Minute-by-Minute Activity</ThemedText>
          <Card elevation={1} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            {minuteReport.length > 0 ? (
              minuteReport.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <View>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>Min {item.minute} ({item.time})</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>{item.fishCount} catch{item.fishCount > 1 ? 'es' : ''}</ThemedText>
                  </View>
                  <ThemedText type="body" style={{ fontWeight: '600', color: Colors.dark.primary }}>{item.weight}</ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={{ textAlign: 'center', padding: Spacing.lg, color: theme.textSecondary }}>No activity recorded</ThemedText>
            )}
          </Card>

          <ThemedText type="h4" style={styles.sectionTitle}>Per-Net Breakdown</ThemedText>

          {match.nets.map((net, index) => {
            const percentage = net.capacity ? (net.weight / net.capacity) * 100 : 0;
            const isOverCapacity = percentage > 100;

            return (
              <Card key={index} elevation={1} style={styles.netCard}>
                <View style={styles.netCardContent}>
                  <View style={styles.netInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>{net.name || `Net ${index + 1}`}</ThemedText>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
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
