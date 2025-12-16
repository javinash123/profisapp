import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/generated_images/pegpro_fishing_float_app_icon.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const features = [
  {
    icon: "clock" as const,
    title: "Match Timer",
    description: "Track your match duration with precision countdown timer",
  },
  {
    icon: "grid" as const,
    title: "Multi-Net Tracking",
    description: "Monitor up to 6 nets with weight tracking and capacity alerts",
  },
  {
    icon: "cloud" as const,
    title: "Weather Integration",
    description: "Stay informed with real-time weather and pressure data",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { settings, updateSettings } = useApp();

  React.useEffect(() => {
    if (settings.onboardingComplete) {
      navigation.replace("MatchSetup");
    }
  }, [settings.onboardingComplete, navigation]);

  const handleGetStarted = async () => {
    await updateSettings({ onboardingComplete: true });
    navigation.replace("MatchSetup");
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <ThemedText type="h1" style={styles.title}>
            PegPro
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your fishing match companion
          </ThemedText>
        </Animated.View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.delay(200 + index * 100).springify()}
            >
              <Card elevation={1} style={styles.featureCard}>
                <View style={styles.featureContent}>
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: Colors.dark.primary + "20" },
                    ]}
                  >
                    <Feather name={feature.icon} size={24} color={Colors.dark.primary} />
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText type="h4">{feature.title}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary, marginTop: 4 }}
                    >
                      {feature.description}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.footer}>
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText type="body" style={styles.buttonText}>
              Get Started
            </ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
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
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  features: {
    flex: 1,
    gap: Spacing.md,
  },
  featureCard: {
    padding: Spacing.lg,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.xl,
  },
  primaryButton: {
    height: 56,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
