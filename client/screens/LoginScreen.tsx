import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }), // Using email as username for now as per schema
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      navigation.replace("MatchSetup");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
        <ThemedText type="h1" style={styles.title}>Welcome Back</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Login to your account
        </ThemedText>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>Email Address</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [styles.button, { backgroundColor: Colors.dark.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register" as any)} style={styles.linkButton}>
            <ThemedText style={{ color: Colors.dark.primary }}>Don't have an account? Register</ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: 100 },
  title: { marginBottom: Spacing.xs },
  subtitle: { marginBottom: Spacing.xl },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  label: { textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 52, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, borderWidth: 1 },
  button: { height: 56, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginTop: Spacing.md },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  linkButton: { alignItems: "center", padding: Spacing.md },
});
