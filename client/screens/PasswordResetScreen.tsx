import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PasswordResetRouteProp = RouteProp<RootStackParamList, "PasswordReset">;

export default function PasswordResetScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PasswordResetRouteProp>();
  const { theme } = useTheme();

  const [email, setEmail] = useState(route.params?.email || "");
  const [token, setToken] = useState(route.params?.token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">(route.params?.token ? "reset" : "request");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.token) {
          Alert.alert("Token Received (Demo)", `Your reset token is: ${data.token}`);
          setToken(data.token);
          setStep("reset");
        } else {
          Alert.alert("Success", "If an account exists with that email, a reset link has been sent.");
        }
      } else {
        throw new Error(data.error || "Failed to request reset");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Password reset successfully", [
          { text: "Login", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <ThemedText type="h1" style={styles.title}>
            {step === "request" ? "Forgot Password" : "Reset Password"}
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === "request" 
              ? "Enter your email to receive a password reset token" 
              : "Enter the token you received and your new password"}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          {step === "request" ? (
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
          ) : (
            <>
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={styles.label}>Reset Token</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <Feather name="key" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={token}
                    onChangeText={setToken}
                    placeholder="Enter token"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={styles.label}>New Password</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="New password"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={styles.label}>Confirm New Password</ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry
                  />
                </View>
              </View>
            </>
          )}

          <Pressable
            onPress={step === "request" ? handleRequestReset : handleResetPassword}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: Colors.dark.primary, opacity: pressed || loading ? 0.8 : 1 }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {step === "request" ? "Send Reset Token" : "Reset Password"}
              </ThemedText>
            )}
          </Pressable>

          {step === "reset" && (
            <Pressable onPress={() => setStep("request")} style={styles.linkButton}>
              <ThemedText style={{ color: Colors.dark.primary }}>Back to request</ThemedText>
            </Pressable>
          )}

          <Pressable onPress={() => navigation.navigate("Login")} style={styles.linkButton}>
            <ThemedText style={{ color: theme.textSecondary }}>Back to Login</ThemedText>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: 40 },
  header: { marginBottom: Spacing.xl },
  title: { marginBottom: Spacing.xs },
  subtitle: { marginBottom: Spacing.xl },
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
