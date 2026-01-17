import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/company_logo.jpg");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      const forwardedHost = typeof window !== 'undefined' && window.location ? window.location.host : null;
      const baseUrl = forwardedHost 
        ? `${window.location.protocol}//${forwardedHost}`
        : `https://${process.env.EXPO_PUBLIC_DOMAIN || 'dd43d061-044d-4880-a3e2-2e5533344070-00-1xtamqd5lazbp.kirk.replit.dev'}`;
      
      console.log("Attempting login at:", `${baseUrl}/api/login`);
      
      const response = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = "Invalid email or password";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          if (text && text.length < 100) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      if (contentType && contentType.includes("application/json")) {
        const userData = await response.json();
        console.log("Login success:", userData);
        navigation.reset({
          index: 0,
          routes: [{ name: "MatchSetup" }],
        });
      } else {
        throw new Error("Server returned an unexpected response format");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: "#1A2332" }]}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <ThemedText type="h1" style={styles.title}>Welcome Back</ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Login to your PegPro account
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>Email Address</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <Feather name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>Password</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: Colors.dark.primary, opacity: pressed || loading ? 0.8 : 1 }
            ]}
          >
            <ThemedText style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</ThemedText>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register" as any)} style={styles.linkButton}>
            <ThemedText style={{ color: Colors.dark.primary }}>Don't have an account? Register</ThemedText>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  logoImage: { width: 70, height: 70 },
  title: { marginBottom: Spacing.xs },
  subtitle: { marginBottom: Spacing.xl, textAlign: "center" },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  label: { textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, height: "100%", fontSize: 16 },
  button: { height: 56, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginTop: Spacing.md },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  linkButton: { alignItems: "center", padding: Spacing.md },
});
