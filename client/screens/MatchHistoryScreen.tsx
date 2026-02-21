import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

import { RootStackParamList } from "@/navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Storage from "../lib/storage";
import { getApiUrl } from "../lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchHistoryScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lakeFilter, setLakeFilter] = useState("");
  const [pegFilter, setPegFilter] = useState("");
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    let result = matches;
    if (lakeFilter) {
      result = result.filter(m => 
        m.details?.lakeName?.toLowerCase().includes(lakeFilter.toLowerCase()) ||
        m.details?.venue?.toLowerCase().includes(lakeFilter.toLowerCase())
      );
    }
    if (pegFilter) {
      result = result.filter(m => m.details?.pegNumber?.toString().includes(pegFilter));
    }
    setFilteredMatches(result);
  }, [lakeFilter, pegFilter, matches]);

  const fetchMatches = async () => {
    try {
      const user = await Storage.getUser();
      if (!user) {
        console.warn("No user found in storage, cannot fetch matches");
        setLoading(false);
        return;
      }
      const baseUrl = getApiUrl();
      const apiPath = `${baseUrl}/api/matches?userId=${user._id}`;
      
      console.log("Fetching matches from:", apiPath);
      const response = await fetch(apiPath, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        },
        credentials: "include"
      });
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
        <Pressable onPress={() => navigation.navigate("MatchSummary" as any, { matchData: item })}>
          <View>
            <ThemedText type="h4" style={{ color: Colors.dark.primary, textDecorationLine: "underline" }}>
              {item.details?.lakeName || item.details?.venue || "Unnamed Venue"}
            </ThemedText>
            {item.details?.lakeName && item.details?.venue && (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {item.details.venue}
              </ThemedText>
            )}
          </View>
        </Pressable>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.summary}>{item.summary}</ThemedText>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Feather name="anchor" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.statText}>
            {item.details?.totalWeight ? (item.details.totalWeight / 453.592).toFixed(1) : 0}lb
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <Feather name="flag" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.statText}>Peg {item.details?.pegNumber || "N/A"}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <Feather name="sun" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.statText}>{item.details?.weatherDescription || "N/A"}</ThemedText>
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

      <View style={styles.filterContainer}>
        <View style={[styles.filterInputWrapper, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="search" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.filterInput, { color: theme.text }]}
            placeholder="Filter by Lake..."
            placeholderTextColor={theme.textSecondary}
            value={lakeFilter}
            onChangeText={setLakeFilter}
          />
        </View>
        <View style={[styles.filterInputWrapper, { width: 100, backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <TextInput
            style={[styles.filterInput, { color: theme.text }]}
            placeholder="Peg #"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={pegFilter}
            onChangeText={setPegFilter}
          />
        </View>
      </View>

      <FlatList
        data={filteredMatches}
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  filterInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  filterInput: {
    flex: 1,
    height: "100%",
    marginLeft: Spacing.xs,
    fontSize: 14,
  },
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
