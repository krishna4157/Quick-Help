import { ThemedCard } from "@/components/themed-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemeModal } from "@/components/ThemeModal";
import { logout } from "@/firebaseMethods";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Loader from "@/Loader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../store/actions/slices/userSlice";
import { ThemeContext } from "../ThemeProvider";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const biometricEnabled = useSelector(
    (state: any) => state.user.data?.biometricEnabled ?? false,
  );

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "te" : "en";
    setLoading(true);
    setTimeout(() => {
      i18n.changeLanguage(newLang).then(() => {
        setLoading(false);
      }); // This one line updates the WHOLE app
    }, 2000);
  };

  const profileItems = [
    {
      id: "edit-profile",
      name: t("profile.editProfile"),
      icon: "person-outline",
    },
    {
      id: "change-language",
      name: t("profile.changeLanguageToEnglish"),
      icon: "g-translate",
    },
    {
      id: "admin-panel",
      name: "ADMIN PANEL",
      icon: "admin-panel-settings",
    },
    { id: "my-address", name: t("profile.myAddress"), icon: "location-on" },
    {
      id: "biometrics",
      name: biometricEnabled
        ? "Disable Biometrics"
        : t("profile.enableBiometrics"),
      icon: "fingerprint",
    },
    { id: "help", name: t("profile.helpAndSupport"), icon: "help-outline" },
    {
      id: "theme",
      name: t("settings.displayTheme"),
      icon: "brightness-medium",
    },
    { id: "about", name: t("profile.aboutUs"), icon: "info-outline" },
    { id: "wallet", name: t("profile.wallet"), icon: "account-balance-wallet" },

    {
      id: "worker-registration",
      name: t("profile.workerRegistration"),
      icon: "work-outline",
    },
    { id: "logout", name: t("profile.logout"), icon: "logout" },
  ];

  const handleItemPress = async (id: string) => {
    switch (id) {
      case "edit-profile":
        navigation.navigate("edit-profile" as any);
        // Alert.alert("Edit Profile", "Edit profile details");
        break;
      case "wallet":
        navigation.navigate("wallet" as any);
        break;
      case "admin-panel":
        navigation.navigate("admin-layout" as any);
        break;
      case "change-language":
        toggleLanguage();
        // setThemeModalVisible(true);
        break;
      case "my-address":
        Alert.alert("My Address", "Manage delivery addresses");
        break;
      case "biometrics":
        const newBiometricState = !biometricEnabled;
        dispatch(userActions.updateBiometricEnabled(newBiometricState));
        Alert.alert(
          t("profile.enableBiometrics"),
          newBiometricState
            ? "Biometrics enabled successfully"
            : "Biometrics disabled",
        );
        break;
      case "help":
        Alert.alert("Help", "Contact support or FAQ");
        break;
      case "theme":
        setThemeModalVisible(true);
        break;
      case "worker-registration":
        navigation.navigate("worker-registration" as any);
        break;
      case "about":
        Alert.alert("About", "App information and version");
        break;
      case "logout":
        setLoading(true);
        await AsyncStorage.multiRemove([
          "userToken",
          "userLocation",
          "userData",
        ]);
        dispatch(userActions.clearUserData());
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
      <ThemedCard
        style={[
          styles.card,
          item.id === "logout" ? { borderColor: "red" } : {},
        ]}
      >
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
        <Pressable
          onPress={() => {
            //
            // customAlert("HELLO")
          }}
        >
          <ThemedText>Test Popup</ThemedText>
        </Pressable>
        {loading && <Loader />}

        <FlatList
          data={profileItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListFooterComponent={() => {
            return <View style={{ height: 100 }} />;
          }}
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
