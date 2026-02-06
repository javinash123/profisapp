import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AlarmBannerProps {
  message: string;
  onPress?: () => void;
  onClose?: () => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({ message, onPress, onClose }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Feather name="bell" size={20} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.message} numberOfLines={1}>
          {message}
        </Text>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});
