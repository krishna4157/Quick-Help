import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

// Component Imports
import { ThemedCard } from "@/components/themed-card";
import { getThemeColor } from "@/components/themed-color";
import Loader from "@/Loader";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import getAvailableProviders from "../firebaseMethodsToGetData";
import { triggerTargetedNotifications } from "../firebaseMethodToTriggerTargettedNotifications";
const { width } = Dimensions.get("window");

const ServiceProviders = () => {
  // 1. Declare all hooks at the very top
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  // Get theme color safely
  const iconColor = getThemeColor(true) || "black";

  // 2. Define the API logic
  const callProvidersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableProviders(["Care Taker"]);
      console.log("Available Providers:", data);
      console.log("Query String Used: 'Care Taker'");
      console.log("Count of results:", data.length);
      console.log("Results:", JSON.stringify(data, null, 2));

      if (data) {
        setProviders(data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Effect Hook
  useEffect(() => {
    if (isFocused) {
      callProvidersApi();
    }
  }, [isFocused]);

  // Render Item for FlatList
  const renderProvider = ({ item }) => (
    <Pressable onPress={() => alert(`Selected ${item.name}`)}>
      <ThemedCard style={styles.providerCard}>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Image
              style={styles.profileImage}
              source={{
                uri: item.photoUrl || "https://via.placeholder.com/80",
              }}
            />
            <View style={styles.infoColumn}>
              <ThemedText style={{ color: "white" }} type="subtitle">
                {item.name}
              </ThemedText>
              <ThemedText style={{ color: "white" }} type="default">
                {item.workType}
              </ThemedText>
              <ThemedText style={{ color: "white" }}>
                Exp: {item.experience}
              </ThemedText>
            </View>
          </View>
          <ThemedText>{t("booking.verified")}</ThemedText>
        </View>

        <Button
          title={t("booking.addToFavorites")}
          onPress={() => alert("Added to favorites")}
        />
      </ThemedCard>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={38} color={iconColor} />
        </Pressable>
        <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
          {t("booking.chooseExpert")}
        </ThemedText>
      </View>
      <Button
        title="trigger all notifications"
        onPress={() => {
          triggerTargetedNotifications("Care Taker");
        }}
      />
      {/* Content */}
      <FlatList
        data={providers}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProvider}
        ListEmptyComponent={
          !loading && (
            <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
              {t("alerts.noProvidersFound")}
            </ThemedText>
          )
        }
      />

      {/* Loading Overlay */}
      {loading && <Loader />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    marginTop: 40, // Adjust for status bar
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  providerCard: {
    width: "95%",
    padding: 15,
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  infoColumn: {
    flexDirection: "column",
    paddingLeft: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default ServiceProviders;
