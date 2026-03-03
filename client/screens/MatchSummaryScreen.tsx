import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MatchSummaryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { matchData } = route.params as { matchData: any };

  const GRAMS_PER_LB = 453.592;
  const GRAMS_PER_OZ = 28.3495;

  const formatWeight = (grams: number) => {
    const lb = Math.floor(grams / GRAMS_PER_LB);
    const oz = Math.round((grams % GRAMS_PER_LB) / GRAMS_PER_OZ);
    return `${lb}lb ${oz}oz`;
  };

  const chartData = useMemo(() => {
    if (!matchData?.details?.catches) return [];
    return matchData.details.catches.map((c: any) => ({
      time: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weight: c.weight / GRAMS_PER_LB,
      fullDate: new Date(c.timestamp).toLocaleString()
    }));
  }, [matchData]);

  const minuteReport = useMemo(() => {
    if (!matchData?.details?.catches || !matchData.startTime) return [];
    
    const report: { [key: number]: { count: number, weight: number } } = {};
    const startTime = new Date(matchData.startTime).getTime();

    matchData.details.catches.forEach((c: any) => {
      const minuteOffset = Math.floor((new Date(c.timestamp).getTime() - startTime) / 60000);
      if (!report[minuteOffset]) {
        report[minuteOffset] = { count: 0, weight: 0 };
      }
      report[minuteOffset].count += 1;
      report[minuteOffset].weight += c.weight;
    });

    return Object.entries(report)
      .map(([minute, data]) => ({
        minute: parseInt(minute),
        ...data
      }))
      .sort((a, b) => a.minute - b.minute);
  }, [matchData]);

  if (!matchData) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No match data found</ThemedText>
      </ThemedView>
    );
  }

  const date = new Date(matchData.createdAt).toLocaleDateString();
  const venue = matchData.details?.venue || "Unnamed Venue";
  const weight = matchData.details?.totalWeight ? (matchData.details.totalWeight / GRAMS_PER_LB).toFixed(2) : "0";
  const duration = matchData.details?.duration ? matchData.details.duration.toFixed(1) : "0";
  const pegNumber = matchData.details?.pegNumber || "N/A";
  const nets = matchData.details?.nets || [];
  const catches = matchData.details?.catches || [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Match Summary</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.summaryCard}>
          <ThemedText type="h3" style={styles.venueTitle}>{venue}</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>{date}</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Feather name="anchor" size={24} color={Colors.dark.primary} />
              <ThemedText type="h4" style={styles.statValue}>{weight}lb</ThemedText>
              <ThemedText style={styles.statLabel}>Total Weight</ThemedText>
            </View>
            <View style={styles.statBox}>
              <Feather name="clock" size={24} color={Colors.dark.primary} />
              <ThemedText type="h4" style={styles.statValue}>{duration}h</ThemedText>
              <ThemedText style={styles.statLabel}>Duration</ThemedText>
            </View>
            <View style={styles.statBox}>
              <Feather name="map-pin" size={24} color={Colors.dark.primary} />
              <ThemedText type="h4" style={styles.statValue}>{pegNumber}</ThemedText>
              <ThemedText style={styles.statLabel}>Peg</ThemedText>
            </View>
          </View>
        </Card>

        {chartData.length > 0 && (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Catch Progression</ThemedText>
            <Card style={styles.chartCard}>
              <VictoryChart
                theme={VictoryTheme.material}
                width={SCREEN_WIDTH - Spacing.xl * 2 - 20}
                height={220}
                domainPadding={{ x: 20 }}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryAxis
                  tickLabelComponent={<VictoryTooltip />}
                  style={{
                    axis: { stroke: theme.textMuted },
                    tickLabels: { fill: theme.textSecondary, fontSize: 8 },
                    grid: { stroke: "transparent" }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Weight (lb)"
                  style={{
                    axis: { stroke: theme.textMuted },
                    tickLabels: { fill: theme.textSecondary, fontSize: 8 },
                    axisLabel: { fill: theme.textSecondary, fontSize: 10, padding: 30 },
                    grid: { stroke: theme.backgroundTertiary }
                  }}
                />
                <VictoryBar
                  data={chartData}
                  x="time"
                  y="weight"
                  style={{
                    data: { fill: Colors.dark.primary, width: 12 }
                  }}
                  labels={({ datum }) => `${datum.weight.toFixed(1)}lb`}
                  labelComponent={<VictoryTooltip />}
                />
              </VictoryChart>
            </Card>
          </>
        )}

        {minuteReport.length > 0 && (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Minute-by-Minute Report</ThemedText>
            <Card style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <ThemedText type="small" style={styles.reportHeaderCell}>Minute</ThemedText>
                <ThemedText type="small" style={styles.reportHeaderCell}>Catches</ThemedText>
                <ThemedText type="small" style={styles.reportHeaderCell}>Weight</ThemedText>
                <ThemedText type="small" style={styles.reportHeaderCell}>Avg</ThemedText>
              </View>
              {minuteReport.map((row, idx) => (
                <View key={idx} style={[styles.reportRow, idx % 2 === 0 && { backgroundColor: theme.backgroundTertiary }]}>
                  <ThemedText style={styles.reportCell}>{row.minute}m</ThemedText>
                  <ThemedText style={styles.reportCell}>{row.count}</ThemedText>
                  <ThemedText style={styles.reportCell}>{formatWeight(row.weight)}</ThemedText>
                  <ThemedText style={styles.reportCell}>{formatWeight(row.weight / row.count)}</ThemedText>
                </View>
              ))}
            </Card>
          </>
        )}

        {catches.length > 0 && (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Catch History</ThemedText>
            <View style={styles.catchesList}>
              {catches.map((c: any, index: number) => (
                <Card key={index} style={styles.catchItem}>
                  <View style={styles.catchInfo}>
                    <ThemedText type="h4">{formatWeight(c.weight)}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </ThemedText>
                  </View>
                  <View style={styles.catchTag}>
                    <ThemedText type="caption" style={{ color: Colors.dark.primary }}>Net {c.netIndex + 1}</ThemedText>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {nets.length > 0 && (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Net Breakdown</ThemedText>
            <View style={styles.netsGrid}>
              {nets.map((net: any, index: number) => (
                <Card key={index} style={styles.netCard}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>Net {index + 1}</ThemedText>
                  <ThemedText type="h4" style={styles.netWeight}>{formatWeight(net.weight)}</ThemedText>
                  {net.capacity && (
                    <ThemedText type="small" style={{ color: theme.textMuted }}>
                      Cap: {formatWeight(net.capacity)}
                    </ThemedText>
                  )}
                </Card>
              ))}
            </View>
          </>
        )}

        <ThemedText type="h4" style={styles.sectionTitle}>Performance</ThemedText>
        <Card style={styles.card}>
           <ThemedText style={styles.description}>
             {matchData.summary || "No detailed summary provided for this match."}
           </ThemedText>
        </Card>

        {matchData.details?.weather && (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Conditions</ThemedText>
            <Card style={styles.card}>
              <View style={styles.conditionRow}>
                <Feather name="sun" size={20} color={theme.textSecondary} />
                <ThemedText style={styles.conditionText}>
                  {matchData.details.weather.temperature}°F, {matchData.details.weather.description}
                </ThemedText>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    paddingTop: 60,
    gap: Spacing.md,
  },
  backButton: { padding: 4 },
  scrollContent: { padding: Spacing.xl },
  summaryCard: { padding: Spacing.xl, alignItems: "center", marginBottom: Spacing.lg },
  venueTitle: { marginBottom: Spacing.xs },
  statsGrid: { flexDirection: "row", width: "100%", justifyContent: "space-around", marginTop: Spacing.md },
  statBox: { alignItems: "center" },
  statValue: { marginTop: Spacing.xs },
  statLabel: { color: Colors.dark.textSecondary, fontSize: 12 },
  sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  netsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  netCard: { flex: 1, minWidth: "45%", padding: Spacing.md, alignItems: "center" },
  netWeight: { marginTop: 4 },
  card: { padding: Spacing.lg },
  chartCard: { padding: Spacing.md, alignItems: "center", overflow: 'hidden' },
  reportCard: { padding: 0, overflow: 'hidden' },
  reportHeader: { flexDirection: 'row', backgroundColor: Colors.dark.primary + '20', padding: Spacing.sm },
  reportHeaderCell: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  reportRow: { flexDirection: 'row', padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.dark.backgroundTertiary },
  reportCell: { flex: 1, textAlign: 'center', fontSize: 12 },
  catchesList: { gap: Spacing.sm },
  catchItem: { padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catchInfo: { gap: 2 },
  catchTag: { backgroundColor: Colors.dark.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  description: { lineHeight: 20 },
  conditionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  conditionText: { textTransform: "capitalize" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    paddingTop: 60,
    gap: Spacing.md,
  },
  backButton: { padding: 4 },
  scrollContent: { padding: Spacing.xl },
  summaryCard: { padding: Spacing.xl, alignItems: "center", marginBottom: Spacing.lg },
  venueTitle: { marginBottom: Spacing.xs },
  statsGrid: { flexDirection: "row", width: "100%", justifyContent: "space-around", marginTop: Spacing.md },
  statBox: { alignItems: "center" },
  statValue: { marginTop: Spacing.xs },
  statLabel: { color: Colors.dark.textSecondary, fontSize: 12 },
  sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  netsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  netCard: { flex: 1, minWidth: "45%", padding: Spacing.md, alignItems: "center" },
  netWeight: { marginTop: 4 },
  card: { padding: Spacing.lg },
  description: { lineHeight: 20 },
  conditionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  conditionText: { textTransform: "capitalize" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
