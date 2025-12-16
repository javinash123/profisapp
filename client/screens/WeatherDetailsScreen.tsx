import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function WeatherDetailsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { weather, refreshWeather } = useApp();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    if (!weather) {
      handleRefresh();
    }
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleRefresh}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Feather name="refresh-cw" size={22} color={theme.text} />
          )}
        </Pressable>
      ),
    });
  }, [navigation, theme, isRefreshing]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWeather();
    setIsRefreshing(false);
  };

  const formatLastUpdated = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!weather) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText type="body" style={{ marginTop: Spacing.lg, color: theme.textSecondary }}>
            Loading weather data...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const weatherMetrics = [
    {
      icon: "thermometer",
      label: "Temperature",
      value: `${weather.temperature}°C`,
      color: Colors.dark.primary,
    },
    {
      icon: "droplet",
      label: "Humidity",
      value: `${weather.humidity}%`,
      color: Colors.dark.secondary,
    },
    {
      icon: "wind",
      label: "Wind Speed",
      value: `${weather.windSpeed} mph`,
      color: Colors.dark.warning,
    },
    {
      icon: "bar-chart-2",
      label: "Pressure",
      value: `${weather.pressure} mb`,
      color: Colors.dark.success,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {weather.isOffline ? (
          <View style={[styles.offlineBanner, { backgroundColor: Colors.dark.warning + "30" }]}>
            <Feather name="wifi-off" size={16} color={Colors.dark.warning} />
            <ThemedText type="small" style={{ color: Colors.dark.warning, marginLeft: Spacing.sm }}>
              Offline - Showing cached data
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.lastUpdated}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            Last updated: {formatLastUpdated(weather.lastUpdated)}
          </ThemedText>
        </View>

        <Animated.View entering={FadeInUp.delay(100)}>
          <Card elevation={1} style={styles.mainCard}>
            <View style={styles.mainWeather}>
              <Feather name="cloud" size={48} color={Colors.dark.secondary} />
              <ThemedText type="h1" style={{ marginTop: Spacing.md }}>
                {weather.temperature}°C
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                {weather.description}
              </ThemedText>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.metricsGrid}>
          {weatherMetrics.map((metric, index) => (
            <Animated.View
              key={metric.label}
              entering={FadeInUp.delay(200 + index * 50)}
              style={styles.metricWrapper}
            >
              <Card elevation={1} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: metric.color + "20" }]}>
                  <Feather name={metric.icon as any} size={20} color={metric.color} />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                  {metric.label}
                </ThemedText>
                <ThemedText type="h4" style={{ marginTop: Spacing.xs }}>
                  {metric.value}
                </ThemedText>
              </Card>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(400)}>
          <Card elevation={1} style={styles.pressureCard}>
            <View style={styles.pressureHeader}>
              <ThemedText type="h4">Pressure Trend</ThemedText>
              <View style={styles.trendBadge}>
                <Feather
                  name={
                    weather.pressureTrend === "rising"
                      ? "trending-up"
                      : weather.pressureTrend === "falling"
                      ? "trending-down"
                      : "minus"
                  }
                  size={16}
                  color={
                    weather.pressureTrend === "rising"
                      ? Colors.dark.success
                      : weather.pressureTrend === "falling"
                      ? Colors.dark.error
                      : theme.textSecondary
                  }
                />
                <ThemedText
                  type="small"
                  style={{
                    marginLeft: Spacing.xs,
                    color:
                      weather.pressureTrend === "rising"
                        ? Colors.dark.success
                        : weather.pressureTrend === "falling"
                        ? Colors.dark.error
                        : theme.textSecondary,
                    textTransform: "capitalize",
                  }}
                >
                  {weather.pressureTrend}
                </ThemedText>
              </View>
            </View>

            <View style={styles.pressureGraph}>
              <View style={[styles.graphBar, { backgroundColor: theme.backgroundTertiary }]}>
                <View
                  style={[
                    styles.graphFill,
                    {
                      height: `${Math.min(((weather.pressure - 990) / 50) * 100, 100)}%`,
                      backgroundColor: Colors.dark.secondary,
                    },
                  ]}
                />
              </View>
              <View style={styles.graphLabels}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  1040 mb
                </ThemedText>
                <ThemedText type="h3">{weather.pressure} mb</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  990 mb
                </ThemedText>
              </View>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
              {weather.pressureTrend === "rising"
                ? "Rising pressure often indicates improving weather conditions."
                : weather.pressureTrend === "falling"
                ? "Falling pressure may indicate approaching weather changes."
                : "Stable pressure suggests consistent weather conditions."}
            </ThemedText>
          </Card>
        </Animated.View>
      </ScrollView>
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
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  mainCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing["2xl"],
  },
  mainWeather: {
    alignItems: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricWrapper: {
    width: "48%",
  },
  metricCard: {
    padding: Spacing.lg,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  pressureCard: {
    padding: Spacing.lg,
  },
  pressureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  pressureGraph: {
    flexDirection: "row",
    height: 120,
    gap: Spacing.lg,
  },
  graphBar: {
    width: 24,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  graphFill: {
    width: "100%",
    borderRadius: BorderRadius.xs,
  },
  graphLabels: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});
