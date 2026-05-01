import { useColorScheme } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { getAvailableOrders } from "@/firebaseMethodsToGetData";
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
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// ─── Order Status Theme Helper ───
const getOrderStatusTheme = (status: string) => {
  switch (status) {
    case "Assigned":
      return {
        primary: "#F59E0B",
        secondary: "#FEF3C7",
        border: "#FDE68A",
        bg: "#FFFBEB",
        text: "#92400E",
        icon: "user",
      };
    case "Completed":
      return {
        primary: "#10B981",
        secondary: "#D1FAE5",
        border: "#A7F3D0",
        bg: "#ECFDF5",
        text: "#065F46",
        icon: "check-circle",
      };
    case "Pending":
      return {
        primary: "#3B82F6",
        secondary: "#DBEAFE",
        border: "#BFDBFE",
        bg: "#EFF6FF",
        text: "#1E40AF",
        icon: "clock-o",
      };
    case "Cancelled":
      return {
        primary: "#EF4444",
        secondary: "#FEE2E2",
        border: "#FECACA",
        bg: "#FEF2F2",
        text: "#991B1B",
        icon: "times-circle",
      };
    default:
      return {
        primary: "#6366F1",
        secondary: "#E0E7FF",
        border: "#C7D2FE",
        bg: "#EEF2FF",
        text: "#3730A3",
        icon: "shopping-bag",
      };
  }
};

// ─── Service Image Helper ───
const getServiceImage = (workType?: string) => {
  if (!workType) return require("../../CARD_IMAGES/ElectricServices.png");
  const type = workType.toLowerCase();
  if (type.includes("electric"))
    return require("../../CARD_IMAGES/ElectricServices.png");
  if (type.includes("beauty") || type.includes("care"))
    return require("../../CARD_IMAGES/BeautyServices.png");
  if (type.includes("care") || type.includes("taker"))
    return require("../../CARD_IMAGES/CareTakerServices.png");
  return require("../../CARD_IMAGES/ElectricServices.png");
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
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

  // ─── API Call ───
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
      callOrdersApi();
    }
  }, [isFocused]);

  // ─── Stats ───
  const totalOrders = orders.length;
  const assignedOrders = orders.filter(
    (o) => o.orderStatus === "Assigned",
  ).length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending",
  ).length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "Completed",
  ).length;

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

  // ─── Render Order Card ───
  const renderOrderCard = ({ item, index }: { item: any; index: number }) => {
    const statusTheme = getOrderStatusTheme(item.orderStatus || "Open");
    const serviceImage = item.image || getServiceImage(item.workType);

    return (
      <Pressable
        onPressIn={() => handlePressIn(index)}
        onPressOut={() => handlePressOut(index)}
        onPress={() => {
          // Navigate to order details if needed
          // navigation.navigate("order-details", { order: item });
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
          {/* Status Strip */}
          <View
            style={[
              styles.statusStrip,
              { backgroundColor: statusTheme.primary },
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
                  <ThemedText style={styles.orderTitle} numberOfLines={1}>
                    {item.workType || "Service Order"}
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
                      {item.orderStatus || "Open"}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.orderId}>
                  #{item.id?.slice(-6) || "N/A"}
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

            {/* Description */}
            {item.orderAdditionalDescription ? (
              <View
                style={[
                  styles.descContainer,
                  {
                    backgroundColor: isDark ? "#374151" : "#F9FAFB",
                    borderLeftColor: statusTheme.primary,
                  },
                ]}
              >
                <ThemedText style={styles.descText} numberOfLines={2}>
                  {item.orderAdditionalDescription}
                </ThemedText>
              </View>
            ) : null}

            {/* Metadata Grid */}
            <View style={styles.detailsGrid}>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="rupee"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {item.amountPaid || "0"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="calendar"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Date</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1}>
                  {item.orderPlaced
                    ? new Date(item.orderPlaced).toLocaleDateString()
                    : "N/A"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                ]}
              >
                <FontAwesome
                  name="user"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <ThemedText style={styles.detailLabel}>Worker</ThemedText>
                <ThemedText style={styles.detailValue} numberOfLines={1}>
                  {item.workerAssigned || "Unassigned"}
                </ThemedText>
              </View>
            </View>

            {/* OTP & Status Bar */}
            <View
              style={[
                styles.actionBar,
                { backgroundColor: statusTheme.secondary },
              ]}
            >
              <View style={styles.actionItem}>
                <FontAwesome
                  name="lock"
                  size={14}
                  color={statusTheme.primary}
                />
                <ThemedText
                  style={[styles.actionText, { color: statusTheme.primary }]}
                >
                  OTP: {item.orderOTP || "N/A"}
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
                  name="clock-o"
                  size={14}
                  color={statusTheme.primary}
                />
                <ThemedText
                  style={[styles.actionText, { color: statusTheme.primary }]}
                >
                  {item.orderPlaced
                    ? new Date(item.orderPlaced).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
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
            Orders
          </ThemedText>
          {/* <Pressable
            onPress={() => logout()}
            style={[
              styles.logoutBtn,
              { backgroundColor: isDark ? "#DC2626" : "#EF4444" },
            ]}
          >
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </Pressable> */}
        </View>

        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
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
                    {totalOrders}
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
                    {assignedOrders}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#FCA5A5" : "#991B1B" },
                    ]}
                  >
                    Assigned
                  </ThemedText>
                </View>
                <View
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
                    {completedOrders}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#6EE7B7" : "#065F46" },
                    ]}
                  >
                    Completed
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: isDark ? "#78350F" : "#FEF3C7" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statNumber,
                      { color: isDark ? "#FCD34D" : "#92400E" },
                    ]}
                  >
                    {pendingOrders}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#FCD34D" : "#92400E" },
                    ]}
                  >
                    Pending
                  </ThemedText>
                </View>
              </View>

              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <FontAwesome name="list-alt" size={20} color={theme.icon} />
                <ThemedText style={styles.sectionTitle}>All Orders</ThemedText>
              </View>

              {/* Orders List */}
              <FlatList
                data={orders}
                renderItem={renderOrderCard}
                keyExtractor={(item, index) => item.id || index.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <FontAwesome name="inbox" size={48} color={theme.icon} />
                    <ThemedText style={styles.emptyText}>
                      No orders found
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
}

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
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
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

  // ─── Order Card ───
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
  orderTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
    flex: 1,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.6,
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
  descContainer: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  descText: {
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
