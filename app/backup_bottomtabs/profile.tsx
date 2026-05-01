import { ThemedCard } from "@/components/themed-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemeModal } from "@/components/ThemeModal";
import { logout } from "@/firebaseMethods";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Loader from "@/Loader";
import { PopupContext } from "@/PopupProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../ThemeProvider";

const profileItems = [
  { id: "edit-profile", name: "Edit Profile", icon: "person-outline" },
  { id: "my-address", name: "My Address", icon: "location-on" },
  { id: "biometrics", name: "Enable Biometrics", icon: "fingerprint" },
  { id: "help", name: "Help and Support", icon: "help-outline" },
  { id: "theme", name: "Display Theme", icon: "brightness-medium" },
  { id: "about", name: "About Us", icon: "info-outline" },
  {
    id: "worker-registration",
    name: "Worker Registration",
    icon: "work-outline",
  },
  { id: "logout", name: "Log Out", icon: "logout" },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const { customAlert } = useContext(PopupContext);

  const handleItemPress = async (id: string) => {
    switch (id) {
      case "edit-profile":
        customAlert("Edit Profile", "Edit profile details");
        break;
      case "my-address":
        customAlert("My Address", "Manage delivery addresses");
        break;
      case "biometrics":
        customAlert("Biometrics", "Enable fingerprint login");
        break;
      case "help":
        customAlert("Help", "Contact support or FAQ");
        break;
      case "theme":
        setThemeModalVisible(true);
        break;
      case "worker-registration":
        navigation.navigate("worker-registration" as any);
        break;
      case "about":
        customAlert("About", "App information and version");
        break;
      case "logout":
        setLoading(true);
        await AsyncStorage.multiRemove(["userToken", "userLocation"]);
        logout()
          .then(() => {
            setLoading(false);
            navigation.navigate("login");

            alert("Logged out successfully!");
          })
          .catch((error) => {
            setLoading(false);
            alert("Logout failed: " + error);
          });

        break;
    }
  };

  const finalColor =
    theme === "system"
      ? colorScheme === "dark"
        ? "white"
        : "black"
      : theme === "dark"
        ? "white"
        : "black";

  const renderItem = ({ item }: { item: (typeof profileItems)[0] }) => (
    <Pressable onPress={() => handleItemPress(item.id)}>
      <ThemedCard style={styles.card}>
        <View style={styles.cardContent}>
          <MaterialIcons name={item.icon as any} size={24} color={finalColor} />
          <ThemedText style={styles.cardText}>{item.name}</ThemedText>
        </View>
      </ThemedCard>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {loading && <Loader />}

        <FlatList
          data={profileItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
      <ThemeModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
  },
  card: {
    // backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cardText: {
    fontSize: 16,
    flex: 1,
  },
});
