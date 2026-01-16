import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function MatchHistoryScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const baseUrl = "https://da7a3336-bfd3-4ef2-88f2-973b9d4bb439-00-77or596362ye.spock.replit.dev";
      const response = await fetch(`${baseUrl}/api/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="h4">{item.details?.venue || "Unnamed Venue"}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.summary}>{item.summary}</ThemedText>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Feather name="anchor" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.statText}>{item.details?.totalWeight || 0}kg</ThemedText>
        </View>
        <View style={styles.statItem}>
          <Feather name="clock" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.statText}>{item.details?.duration || 0}h</ThemedText>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Match History</ThemedText>
      </View>
      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText style={{ color: theme.textSecondary }}>No matches found</ThemedText>
          </View>
        }
      />
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
  list: { padding: Spacing.xl, gap: Spacing.md },
  card: { padding: Spacing.lg },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  summary: { marginBottom: Spacing.md, fontSize: 14 },
  stats: { flexDirection: "row", gap: Spacing.lg },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
