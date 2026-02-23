import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

interface AlarmBannerProps {
  message: string;
  onPress?: () => void;
  onClose?: () => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({ message, onPress, onClose }) => {
  return (
    <Animated.View 
      entering={FadeInDown} 
      exiting={FadeOutUp}
      style={styles.container}
    >
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.9}>
        <Feather name="bell" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.message}>
          {message}
        </Text>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={20}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 9999,
    backgroundColor: "#D32F2F", // Clear red banner
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 15,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    marginLeft: 15,
    padding: 4,
  },
});
