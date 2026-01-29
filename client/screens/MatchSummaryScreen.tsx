import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function MatchSummaryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { matchData } = route.params as { matchData: any };

  if (!matchData) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No match data found</ThemedText>
      </ThemedView>
    );
  }

  const date = new Date(matchData.createdAt).toLocaleDateString();
  const venue = matchData.details?.venue || "Unnamed Venue";
  const weight = matchData.details?.totalWeight ? (matchData.details.totalWeight / 453.592).toFixed(2) : "0";
  const duration = matchData.details?.duration ? matchData.details.duration.toFixed(1) : "0";
  const pegNumber = matchData.details?.pegNumber || "N/A";
  const nets = matchData.details?.nets || [];
  const totalFish = matchData.details?.totalFish || 0;

  const GRAMS_PER_LB = 453.592;
  const GRAMS_PER_OZ = 28.3495;

  const formatWeight = (grams: number) => {
    const lb = Math.floor(grams / GRAMS_PER_LB);
    const oz = Math.round((grams % GRAMS_PER_LB) / GRAMS_PER_OZ);
    return `${lb}lb ${oz}oz`;
  };

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
            <View style={styles.statBox}>
              <Feather name="activity" size={24} color={Colors.dark.primary} />
              <ThemedText type="h4" style={styles.statValue}>{totalFish}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Fish</ThemedText>
            </View>
          </View>
        </Card>

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
  description: { lineHeight: 20 },
  conditionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  conditionText: { textTransform: "capitalize" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
