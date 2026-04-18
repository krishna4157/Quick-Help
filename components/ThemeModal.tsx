import { ThemeContext } from "@/app/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ThemeMode = "light" | "dark" | "system";

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ThemeModal({ visible, onClose }: ThemeModalProps) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const selectTheme = async (mode: ThemeMode) => {
    await AsyncStorage.setItem("theme", mode);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText style={styles.title}>
            {t("settings.displayTheme")}
          </ThemedText>
          <TouchableOpacity
            style={[styles.radioItem, theme === "light" && styles.selected]}
            onPress={() => {
              selectTheme("light");
              toggleTheme("light");
            }}
          >
            <View style={styles.radioCircle}>
              {theme === "light" && <View style={styles.radioDot} />}
            </View>
            <ThemedText style={styles.radioLabel}>
              {t("settings.light")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioItem, theme === "dark" && styles.selected]}
            onPress={() => {
              selectTheme("dark");
              toggleTheme("dark");
            }}
          >
            <View style={styles.radioCircle}>
              {theme === "dark" && <View style={styles.radioDot} />}
            </View>
            <ThemedText style={styles.radioLabel}>
              {t("settings.dark")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioItem, theme === "system" && styles.selected]}
            onPress={() => {
              selectTheme("system");
              toggleTheme("system");
            }}
          >
            <View style={styles.radioCircle}>
              {theme === "system" && <View style={styles.radioDot} />}
            </View>
            <ThemedText style={styles.radioLabel}>
              {t("settings.systemAutomatic")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeText}>
              {t("common.close")}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    // backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    overflow: "hidden",
    padding: 24,
    width: "85%",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  selected: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
  },
  radioLabel: {
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
