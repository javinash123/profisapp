import React, { useState } from "react";
import { View, StyleSheet, Pressable, Switch, TextInput, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/AppContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { WeightUnit, MatchConfig } from "@/lib/types";

const logoImage = require("@/assets/images/logo.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchSetupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { settings, startMatch } = useApp();

  const [matchName, setMatchName] = useState("");
  const [hours, setHours] = useState("5");
  const [minutes, setMinutes] = useState("0");
  const [pegNumber, setPegNumber] = useState("");
  const [numberOfNets, setNumberOfNets] = useState(4);
  const [netCapacity, setNetCapacity] = useState("");
  const [unit, setUnit] = useState<WeightUnit>(settings.unit);
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation, theme]);

  const handleStartMatch = async () => {
    const durationMinutes = parseInt(hours) * 60 + parseInt(minutes);
    let capacityInGrams: number | undefined;
    if (netCapacity) {
      const capacityValue = parseFloat(netCapacity);
      if (unit === "lb/oz") {
        capacityInGrams = capacityValue * 16 * 28.3495;
      } else {
        capacityInGrams = capacityValue;
      }
    }
    const config: MatchConfig = {
      name: matchName || `Match ${new Date().toLocaleDateString()}`,
      durationMinutes: durationMinutes || 300,
      pegNumber: pegNumber || "1",
      numberOfNets,
      netCapacity: capacityInGrams,
      unit,
      keepScreenOn,
    };
    await startMatch(config);
    navigation.replace("LiveMatch");
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl + 80,
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Match Name
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g., Sunday Open Match"
            placeholderTextColor={theme.textSecondary}
            value={matchName}
            onChangeText={setMatchName}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Match Duration
          </ThemedText>
          <View style={styles.durationRow}>
            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.numberInput,
                  { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={hours}
                onChangeText={setHours}
                maxLength={2}
              />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>hours</ThemedText>
            </View>
            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.numberInput,
                  { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
                ]}
                keyboardType="number-pad"
                value={minutes}
                onChangeText={setMinutes}
                maxLength={2}
              />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>mins</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Peg Number
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g., 42"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            value={pegNumber}
            onChangeText={setPegNumber}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Number of Nets
          </ThemedText>
          <View style={styles.netSelector}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Pressable
                key={n}
                onPress={() => setNumberOfNets(n)}
                style={[
                  styles.netOption,
                  {
                    backgroundColor: numberOfNets === n ? Colors.dark.primary : theme.backgroundDefault,
                    borderColor: numberOfNets === n ? Colors.dark.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{ color: numberOfNets === n ? "#FFFFFF" : theme.text, fontWeight: "600" }}
                >
                  {n}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Per-Net Capacity (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
            ]}
            placeholder={unit === "kg/g" ? "e.g., 25000 (grams)" : "e.g., 50 (pounds)"}
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            value={netCapacity}
            onChangeText={setNetCapacity}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Weight Units
          </ThemedText>
          <View style={styles.unitToggle}>
            <Pressable
              onPress={() => setUnit("lb/oz")}
              style={[
                styles.unitOption,
                {
                  backgroundColor: unit === "lb/oz" ? Colors.dark.primary : theme.backgroundDefault,
                  borderColor: unit === "lb/oz" ? Colors.dark.primary : theme.border,
                },
              ]}
            >
              <ThemedText
                type="body"
                style={{ color: unit === "lb/oz" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
              >
                lb / oz
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setUnit("kg/g")}
              style={[
                styles.unitOption,
                {
                  backgroundColor: unit === "kg/g" ? Colors.dark.primary : theme.backgroundDefault,
                  borderColor: unit === "kg/g" ? Colors.dark.primary : theme.border,
                },
              ]}
            >
              <ThemedText
                type="body"
                style={{ color: unit === "kg/g" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
              >
                kg / g
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Feather name="monitor" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              Keep Screen On
            </ThemedText>
          </View>
          <Switch
            value={keepScreenOn}
            onValueChange={setKeepScreenOn}
            trackColor={{ false: theme.border, true: Colors.dark.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleStartMatch}
          style={({ pressed }) => [
            styles.startButton,
            { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="play" size={22} color={Colors.dark.buttonTextDark} />
          <ThemedText type="body" style={[styles.startButtonText, { color: Colors.dark.buttonTextDark }]}>
            Start Match
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
  content: {
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    ...Typography.body,
  },
  durationRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  durationInput: {
    flex: 1,
    alignItems: "center",
  },
  numberInput: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    textAlign: "center",
    marginBottom: Spacing.xs,
    ...Typography.body,
  },
  netSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  netOption: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  unitToggle: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  unitOption: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
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
  startButton: {
    height: 56,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
