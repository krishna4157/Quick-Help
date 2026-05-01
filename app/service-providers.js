import { useColorScheme } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import Loader from "@/Loader";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getAvailableServices } from "../firebaseMethodsToGetData";
import { triggerUserNotifications } from "../firebaseMethodToTriggerTargettedNotifications";
// ─── Category Theme Helper ───
const getCategoryTheme = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("electric")) {
    return {
      primary: "#F59E0B",
      secondary: "#FEF3C7",
      border: "#FDE68A",
      icon: "bolt",
      image: require("../CARD_IMAGES/ElectricServices.png"),
    };
  }
  if (cat.includes("beauty") || cat.includes("home")) {
    return {
      primary: "#EC4899",
      secondary: "#FCE7F3",
      border: "#FBCFE8",
      icon: "magic",
      image: require("../CARD_IMAGES/BeautyServices.png"),
    };
  }
  if (cat.includes("care") || cat.includes("taker")) {
    return {
      primary: "#10B981",
      secondary: "#D1FAE5",
      border: "#A7F3D0",
      icon: "heart",
      image: require("../CARD_IMAGES/CareTakerServices.png"),
    };
  }
  if (cat.includes("laundry") || cat.includes("clean")) {
    return {
      primary: "#3B82F6",
      secondary: "#DBEAFE",
      border: "#BFDBFE",
      icon: "tint",
      image: require("../CARD_IMAGES/LaundryServices.png"),
    };
  }
  return {
    primary: "#6366F1",
    secondary: "#E0E7FF",
    border: "#C7D2FE",
    icon: "wrench",
    image: require("../CARD_IMAGES/ElectricServices.png"),
  };
};

const ServiceProviders = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const route = useRoute();
  const categoryParam = route.params?.category;

  const scaleAnimsRef = React.useRef([]);

  const getScaleAnim = (index) => {
    if (!scaleAnimsRef.current[index]) {
      scaleAnimsRef.current[index] = new Animated.Value(1);
    }
    return scaleAnimsRef.current[index];
  };

  // ─── API Call ───
  const callServicesApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableServices(categoryParam);
      if (data) {
        setServices(data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      callServicesApi();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await callServicesApi();
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Stats ───
  const totalServices = services.length;
  const electricCount = services.filter((s) =>
    (s.category || "").toLowerCase().includes("electric"),
  ).length;
  const beautyCount = services.filter((s) =>
    (s.category || "").toLowerCase().includes("beauty"),
  ).length;

  // ─── Press Animation ───
  const handlePressIn = (index) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // ─── Render Service Card ───
  const renderServiceCard = ({ item, index }) => {
    const categoryTheme = getCategoryTheme(item.category);
    const serviceImage = item.photoUrl
      ? { uri: item.photoUrl }
      : categoryTheme.image;

    // Parse highlights and exclusions if they exist
    const highlights = Array.isArray(item.importantNotes)
      ? item.importantNotes
      : item.importantNotes
        ? String(item.importantNotes)
            .split(",")
            .map((s) => s.trim())
        : [];
    const exclusionList = Array.isArray(item.exclusions)
      ? item.exclusions
      : item.exclusions
        ? String(item.exclusions)
            .split(",")
            .map((s) => s.trim())
        : [];

    return (
      <Pressable
        onPressIn={() => handlePressIn(index)}
        onPressOut={() => handlePressOut(index)}
        onPress={() => {
          navigation.navigate("service-details", {
            service: item,
            theme: categoryTheme,
            highlights,
            exclusionList,
          });
        }}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              shadowColor: isDark ? "#000" : "#000",
              transform: [{ scale: getScaleAnim(index) }],
            },
          ]}
        >
          {/* Category Strip */}
          <View
            style={[
              styles.statusStrip,
              { backgroundColor: categoryTheme.primary },
            ]}
          />

          <View style={styles.cardContent}>
            {/* Header: Image + Title + Badge */}
            <View style={styles.cardHeader}>
              <Image
                source={serviceImage}
                style={styles.serviceImage}
                resizeMode="cover"
              />
              <View style={styles.headerInfo}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.serviceTitle} numberOfLines={1}>
                    {item.serviceType || "Service"}
                  </ThemedText>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: categoryTheme.secondary,
                        borderColor: categoryTheme.border,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={categoryTheme.icon}
                      size={10}
                      color={categoryTheme.primary}
                    />
                    <ThemedText
                      style={[
                        styles.badgeText,
                        { color: categoryTheme.primary },
                      ]}
                    >
                      {item.category || "General"}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.workType}>
                  {item.workType || ""}
                </ThemedText>
              </View>
            </View>

            {/* Divider */}
            <View
              style={[
                styles.divider,
                { backgroundColor: isDark ? "#374151" : "#F3F4F6" },
              ]}
            />

            {/* Highlights Preview */}
            {highlights.length > 0 && (
              <View
                style={[
                  styles.highlightsContainer,
                  {
                    backgroundColor: isDark ? "#374151" : "#F9FAFB",
                    borderLeftColor: categoryTheme.primary,
                  },
                ]}
              >
                <ThemedText style={styles.highlightsTitle}>
                  Highlights
                </ThemedText>
                {highlights.slice(0, 2).map((note, i) => (
                  <View key={i} style={styles.highlightRow}>
                    <FontAwesome name="check" size={12} color="#10B981" />
                    <ThemedText style={styles.highlightText} numberOfLines={2}>
                      {note}
                    </ThemedText>
                  </View>
                ))}
                {highlights.length > 2 && (
                  <ThemedText style={styles.moreText}>
                    +{highlights.length - 2} more
                  </ThemedText>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ThemedView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
        ]}
      >
        {loading && <Loader />}

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              size={32}
              color={theme.text}
            />
          </Pressable>
          <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
            {t("booking.chooseExpert")}
          </ThemedText>
          <Pressable
            onPress={() => {
              // triggerTargetedNotifications(
              //   undefined,
              //   "Urgent Needed",
              //   "Need Care Taker",
              // );
              triggerUserNotifications("hello", "bye");
            }}
            style={styles.notifyBtn}
          >
            <FontAwesome name="bell" size={16} color="#FFF" />
          </Pressable>
        </View>

        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.tint}
                  colors={[theme.tint]}
                />
              }
            >
              <FlatList
                data={services}
                renderItem={renderServiceCard}
                keyExtractor={(item, index) => item.id || index.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <FontAwesome name="inbox" size={48} color={theme.icon} />
                    <ThemedText style={styles.emptyText}>
                      No services found
                    </ThemedText>
                  </View>
                )}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </ThemedView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 40, paddingHorizontal: 16 },

  // ─── Header ───
  header: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  notifyBtn: {
    backgroundColor: "#F59E0B",
    padding: 10,
    borderRadius: 12,
  },

  // ─── Stats ───
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.8,
    fontFamily: "PlusJakartaSans",
  },

  // ─── Section ───
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },

  // ─── Service Card ───
  cardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  statusStrip: {
    width: "100%",
    height: 5,
  },
  cardContent: { padding: 18 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  serviceImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  headerInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
    flex: 1,
  },
  workType: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  highlightsContainer: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  highlightsTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    fontFamily: "PlusJakartaSans",
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    flexWrap: "wrap",
    width: "90%",
  },
  moreText: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.6,
    marginTop: 2,
    fontFamily: "PlusJakartaSans",
  },

  // ─── Details Grid ───
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    fontFamily: "PlusJakartaSans",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "PlusJakartaSans",
  },

  // ─── Action Bar ───
  actionBar: {
    flexDirection: "row",
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionDivider: {
    width: 1,
    marginVertical: 2,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },

  // ─── Empty State ───
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
});

export default ServiceProviders;
