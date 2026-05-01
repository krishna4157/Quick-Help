import { useColorScheme } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import Loader from "@/Loader";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "expo-router";
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
import {
  getAvailableOrders,
  getAvailableProvidersThatAreNotVerified,
  updateWorkerData,
} from "../../firebaseMethodsToGetData";

// ─── Verification Status Theme Helper ───
const getVerificationTheme = (verified: boolean) => {
  if (verified) {
    return {
      primary: "#10B981",
      secondary: "#D1FAE5",
      border: "#A7F3D0",
      icon: "check-circle",
      badge: "Verified",
    };
  }
  return {
    primary: "#EF4444",
    secondary: "#FEE2E2",
    border: "#FECACA",
    icon: "times-circle",
    badge: "Unverified",
  };
};

const VerificationScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const scaleAnimsRef = React.useRef<Animated.Value[]>([]);

  const getScaleAnim = (index: number) => {
    if (!scaleAnimsRef.current[index]) {
      scaleAnimsRef.current[index] = new Animated.Value(1);
    }
    return scaleAnimsRef.current[index];
  };

  // ─── API Calls ───
  const callProvidersApiNotVerified = async () => {
    try {
      setLoading(true);
      const data = await getAvailableProvidersThatAreNotVerified();
      if (data) {
        setProviders(data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const callOrdersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableOrders();
      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      callProvidersApiNotVerified();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await callProvidersApiNotVerified();
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Stats ───
  const totalProviders = providers.length;
  const verifiedCount = providers.filter((p) => p.verified).length;
  const unverifiedCount = providers.filter((p) => !p.verified).length;

  // ─── Press Animation ───
  const handlePressIn = (index: number) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(getScaleAnim(index), {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // ─── Toggle Verification ───
  const handleToggleVerify = (item: any) => {
    setLoading(true);
    updateWorkerData(item.email, {
      verified: !item.verified,
    })
      .then(() => {
        setProviders((prev) =>
          prev.map((worker) =>
            worker.email === item.email
              ? { ...worker, verified: !item.verified }
              : worker,
          ),
        );
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert("Failed to update: " + error.message);
      });
  };

  // ─── Render Worker Card ───
  const renderWorkerCard = ({ item, index }: { item: any; index: number }) => {
    const statusTheme = getVerificationTheme(item.verified);
    const initials = item.name
      ? item.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "??";

    return (
      <Pressable
        onPressIn={() => handlePressIn(index)}
        onPressOut={() => handlePressOut(index)}
        onPress={() => handleToggleVerify(item)}
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
          {/* Status Strip */}
          <View
            style={[
              styles.statusStrip,
              { backgroundColor: statusTheme.primary },
            ]}
          />

          <View style={styles.cardContent}>
            {/* Header: Avatar + Name + Badge */}
            <View style={styles.cardHeader}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: statusTheme.primary },
                  ]}
                >
                  <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                </View>
              )}

              <View style={styles.headerInfo}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.workerName} numberOfLines={1}>
                    {item.name || "Unnamed Worker"}
                  </ThemedText>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: statusTheme.secondary,
                        borderColor: statusTheme.border,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={statusTheme.icon as any}
                      size={10}
                      color={statusTheme.primary}
                    />
                    <ThemedText
                      style={[styles.badgeText, { color: statusTheme.primary }]}
                    >
                      {statusTheme.badge}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.workType}>
                  {item.workType || "General"}
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

            {/* Bio */}
            {item.bio ? (
              <View
                style={[
                  styles.bioContainer,
                  {
                    backgroundColor: isDark ? "#374151" : "#F9FAFB",
                    borderLeftColor: statusTheme.primary,
                  },
                ]}
              >
                <ThemedText style={styles.bioText} numberOfLines={2}>
                  "{item.bio}"
                </ThemedText>
              </View>
            ) : null}

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="briefcase"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Experience</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {item.experience || "0"} yrs
                </ThemedText>
              </View>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="phone"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Contact</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1}>
                  {item.mobileNumber || "N/A"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="map-marker"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Location</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1}>
                  {item.location?.cityName || "Not set"}
                </ThemedText>
              </View>
            </View>

            {/* Email & Action Bar */}
            <View
              style={[
                styles.actionBar,
                { backgroundColor: statusTheme.secondary },
              ]}
            >
              <View style={styles.actionItem}>
                <FontAwesome
                  name="envelope-o"
                  size={14}
                  color={statusTheme.primary}
                />
                <ThemedText
                  style={[styles.actionText, { color: statusTheme.primary }]}
                  numberOfLines={1}
                >
                  {item.email ? item.email.split("@")[0] : "No email"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.actionDivider,
                  { backgroundColor: isDark ? "#4B5563" : "#E5E7EB" },
                ]}
              />
              <View style={styles.actionItem}>
                <FontAwesome
                  name={item.verified ? "check" : "warning"}
                  size={14}
                  color={statusTheme.primary}
                />
                <ThemedText
                  style={[styles.actionText, { color: statusTheme.primary }]}
                >
                  Tap to {item.verified ? "Unverify" : "Verify"}
                </ThemedText>
              </View>
            </View>
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
          {/* <Pressable onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              size={32}
              color={theme.text}
            />
          </Pressable> */}
          <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
            Verifications
          </ThemedText>
          <View style={{ width: 60 }} />
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
              {/* Stats Header */}
              <View style={styles.statsContainer}>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statNumber,
                      { color: isDark ? "#93C5FD" : "#1E40AF" },
                    ]}
                  >
                    {totalProviders}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#93C5FD" : "#1E40AF" },
                    ]}
                  >
                    Total
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statNumber,
                      { color: isDark ? "#FCA5A5" : "#991B1B" },
                    ]}
                  >
                    {unverifiedCount}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#FCA5A5" : "#991B1B" },
                    ]}
                  >
                    Unverified
                  </ThemedText>
                </View>
                {/* <View
                  style={[
                    styles.statCard,
                    { backgroundColor: isDark ? "#064E3B" : "#D1FAE5" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statNumber,
                      { color: isDark ? "#6EE7B7" : "#065F46" },
                    ]}
                  >
                    {verifiedCount}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#6EE7B7" : "#065F46" },
                    ]}
                  >
                    Verified
                  </ThemedText>
                </View> */}
              </View>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <FontAwesome name="shield" size={20} color={theme.icon} />
                <ThemedText style={styles.sectionTitle}>
                  Pending Verifications
                </ThemedText>
              </View>

              {/* Workers List */}
              <FlatList
                data={providers}
                renderItem={renderWorkerCard}
                keyExtractor={(item, index) => item.email || index.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <FontAwesome
                      name="check-circle"
                      size={48}
                      color={theme.icon}
                    />
                    <ThemedText style={styles.emptyText}>
                      All workers verified
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

  // ─── Worker Card ───
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  headerInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  workerName: {
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
  bioContainer: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    fontFamily: "PlusJakartaSans",
  },
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

export default VerificationScreen;
