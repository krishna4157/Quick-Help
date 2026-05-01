import { useColorScheme } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import Loader from "@/Loader";
import { PopupContext } from "@/PopupProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import AwesomeButton from "react-native-really-awesome-button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  assignOrderToWorker,
  completeOrder,
  getAvailableOrders,
  getAvailableProviders,
} from "../../firebaseMethodsToGetData";

// ─── Color Code Logic ───
const getWorkerStatusTheme = (item: any) => {
  if (item.assigned) {
    return {
      primary: "#EF4444",
      secondary: "#FEE2E2",
      border: "#FECACA",
      badge: "Busy",
      icon: "briefcase",
    };
  }
  if (item.isAvailable) {
    return {
      primary: "#10B981",
      secondary: "#D1FAE5",
      border: "#A7F3D0",
      badge: "Available",
      icon: "user",
    };
  }
  return {
    primary: "#6B7280",
    secondary: "#F3F4F6",
    border: "#E5E7EB",
    badge: "Offline",
    icon: "user-times",
  };
};

const getOrderStatusTheme = (status: string) => {
  switch (status) {
    case "Assigned":
      return {
        bg: "#FEE2E2",
        text: "#991B1B",
        border: "#FECACA",
        icon: "lock",
      };
    case "Completed":
      return {
        bg: "#D1FAE5",
        text: "#065F46",
        border: "#A7F3D0",
        icon: "check",
      };
    case "Pending":
      return {
        bg: "#FEF3C7",
        text: "#92400E",
        border: "#FDE68A",
        icon: "clock-o",
      };
    default:
      return {
        bg: "#E0F2FE",
        text: "#075985",
        border: "#BAE6FD",
        icon: "shopping-cart",
      };
  }
};

const WorkersScreen = () => {
  const colorScheme = useColorScheme();
  const { customAlert } = useContext(PopupContext);
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [error, setError] = useState<{ error: string; message: string } | null>(
    null,
  );
  const navigation = useNavigation<any>();
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [selectedWorkerName, setSelectedWorkerName] = useState("");
  const [scaleAnim] = useState(new Animated.Value(1));
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.user.data);

  // ─── API Calls ───
  const callProvidersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableProviders();
      if (data) setProviders(data);
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
      if (data) setOrders(data);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) callProvidersApi();
  }, [isFocused]);

  const triggerBioMetric = async () => {
    LocalAuthentication.authenticateAsync()
      .then(() => console.log("Biometric success"))
      .catch(() => console.log("Biometric failure"));
  };

  useEffect(() => {
    triggerBioMetric();
  }, []);

  // ─── Stats (only verified workers shown) ───
  const totalWorkers = providers.length;
  const availableWorkers = providers.filter(
    (p) => !p.assigned && p.isAvailable,
  ).length;
  const busyWorkers = providers.filter((p) => p.assigned).length;

  // ─── Render Worker Card ───
  const renderWorkerCard = ({ item }: { item: any }) => {
    const statusTheme = getWorkerStatusTheme(item);
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
        style={({ pressed }) => [
          styles.cardContainer,
          {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            shadowColor: isDark ? "#000" : "#000",
          },
          pressed && styles.cardPressed,
        ]}
        onPress={() => {
          callOrdersApi().then(() => {
            setSelectedEmailId(item.email);
            setSelectedWorkerName(item.name || "Worker");
            setShowWorkTypeModal(true);
          });
        }}
      >
        {/* Status Indicator Strip */}
        <View
          style={[styles.statusStrip, { backgroundColor: statusTheme.primary }]}
        />

        <View style={styles.cardContent}>
          {/* Top Row: Avatar + Badge + Work Type */}
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

          {/* Bio */}
          {item.bio ? (
            <View
              style={[
                styles.bioContainer,
                {
                  backgroundColor: isDark ? "#374151" : "#F9FAFB",
                  borderLeftColor: isDark ? "#4B5563" : "#E5E7EB",
                },
              ]}
            >
              <ThemedText style={styles.bioText} numberOfLines={2}>
                "{item.bio}"
              </ThemedText>
            </View>
          ) : null}

          {/* Bottom Action Bar */}
          <View
            style={[
              styles.actionBar,
              { backgroundColor: statusTheme.secondary },
            ]}
          >
            <View style={styles.actionItem}>
              <FontAwesome
                name={item.assigned ? "ban" : "check-circle-o"}
                size={14}
                color={item.assigned ? "#EF4444" : "#10B981"}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  { color: item.assigned ? "#EF4444" : "#10B981" },
                ]}
              >
                {item.assigned ? "Assigned" : "Free"}
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
                name={item.verified ? "shield" : "warning"}
                size={14}
                color={item.verified ? "#10B981" : "#F59E0B"}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  { color: item.verified ? "#10B981" : "#F59E0B" },
                ]}
              >
                {item.verified ? "Verified" : "Unverified"}
              </ThemedText>
            </View>
            {/* <View
              style={[
                styles.actionDivider,
                { backgroundColor: isDark ? "#4B5563" : "#E5E7EB" },
              ]}
            /> */}
            {/* <View style={styles.actionItem}>
              <FontAwesome
                name="envelope-o"
                size={14}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
                numberOfLines={1}
              >
                {item.email ? item.email.split("@")[0] : "No email"}
              </ThemedText>
            </View> */}
          </View>
        </View>
      </Pressable>
    );
  };

  const completeOrderOnOTP = (item: any) => {
    setLoading(true);
    completeOrder(item.id, selectedEmailId)
      .then(() => {
        customAlert("Success", "Order marked as completed!");
        callOrdersApi();
        callProvidersApi();
      })
      .catch((error) => {
        customAlert("Error", "Failed to complete order: " + error.message);
      })
      .finally(() => setLoading(false));
  };

  // ─── Render Order Card ───
  const renderOrderCard = ({ item }: { item: any }) => {
    const orderTheme = getOrderStatusTheme(item.orderStatus || "Open");
    return (
      <Pressable
        disabled={item.orderStatus === "Assigned"}
        style={[
          styles.orderCard,
          { backgroundColor: orderTheme.bg, borderColor: orderTheme.border },
          item.orderStatus === "Assigned" && styles.orderCardDisabled,
        ]}
        onPress={() => {
          setLoading(true);
          assignOrderToWorker(selectedEmailId, item.id || "order_JwXYZ12345")
            .then(() => {
              customAlert("Success", "Worker assigned successfully!");
              // alert("Worker assigned successfully!");
              setShowWorkTypeModal(false);
              callProvidersApi();
            })
            .catch((error) => {
              alert("Failed to update: " + error.message);
            })
            .finally(() => setLoading(false));
        }}
      >
        <View style={styles.orderHeader}>
          <View
            style={[
              styles.orderIconCircle,
              { backgroundColor: orderTheme.text },
            ]}
          >
            <FontAwesome name={orderTheme.icon as any} size={16} color="#FFF" />
          </View>
          <View style={styles.orderHeaderText}>
            <ThemedText style={[styles.orderId, { color: orderTheme.text }]}>
              Order #{item.id?.slice(-6) || "N/A"}
              {`\n Phone : ${item.phoneNumber}`}
              {`\n Title : ${item.orderTitle}`}
              {`\n Work Type : ${item.workType}`}
              {`\n Service Type : ${item.serviceType}`}
              {`\n Amount Paid : ${item.amountPaid}`}
              {`\n Order Placed : ${item.orderPlaced}`}
            </ThemedText>
            <View
              style={[styles.statusPill, { backgroundColor: orderTheme.text }]}
            >
              <ThemedText style={styles.statusPillText}>
                {item.orderStatus || "Open"}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.orderBody}>
          <ThemedText
            style={[styles.orderDesc, { color: orderTheme.text }]}
            // numberOfLines={2}
          >
            Additional Details:
            {JSON.stringify(item)}
            {item.orderAdditionalDescription || "No description"}
          </ThemedText>
          {item.orderStatus === "Assigned" && (
            <AwesomeButton
              width={150}
              height={50}
              backgroundColor="green"
              textColor="white"
              onPress={() => {
                // alert("CALL");
                customAlert("Success", "Order marked as completed!");
              }}
              style={[styles.orderDesc, { color: orderTheme.text }]}
            >
              Complete
            </AwesomeButton>
          )}
          <View style={styles.orderMetaRow}>
            <View style={styles.orderMeta}>
              <FontAwesome name="rupee" size={12} color={orderTheme.text} />
              <ThemedText
                style={[styles.orderMetaText, { color: orderTheme.text }]}
              >
                {item.amountPaid || "0"}
              </ThemedText>
            </View>
            <View style={styles.orderMeta}>
              <FontAwesome name="calendar" size={12} color={orderTheme.text} />
              <ThemedText
                style={[styles.orderMetaText, { color: orderTheme.text }]}
              >
                {item.orderPlaced
                  ? new Date(item.orderPlaced).toLocaleDateString()
                  : "N/A"}
              </ThemedText>
            </View>
          </View>
        </View>
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
        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Stats Header — 3 cards only (no verified since all are verified) */}
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
                    {totalWorkers}
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
                    { backgroundColor: isDark ? "#064E3B" : "#D1FAE5" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statNumber,
                      { color: isDark ? "#6EE7B7" : "#065F46" },
                    ]}
                  >
                    {availableWorkers}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#6EE7B7" : "#065F46" },
                    ]}
                  >
                    Available
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
                    {busyWorkers}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.statLabel,
                      { color: isDark ? "#FCA5A5" : "#991B1B" },
                    ]}
                  >
                    Busy
                  </ThemedText>
                </View>
              </View>

              {/* Section Title */}
              {/* <View style={styles.sectionHeader}>
                <FontAwesome name="users" size={20} color={theme.icon} />
                <ThemedText style={styles.sectionTitle}>
                  Workers Directory
                </ThemedText>
              </View> */}

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
                      name="user-times"
                      size={48}
                      color={theme.icon}
                    />
                    <ThemedText style={styles.emptyText}>
                      No workers found
                    </ThemedText>
                  </View>
                )}
              />
            </ScrollView>
          </View>
        </SafeAreaView>

        {/* Order Assignment Modal */}
        <Modal
          transparent
          visible={showWorkTypeModal}
          animationType="slide"
          onRequestClose={() => setShowWorkTypeModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowWorkTypeModal(false)}
          />

          <ThemedView
            style={[
              styles.modalSheet,
              { backgroundColor: isDark ? "#1F2937" : "#FFFFFF" },
            ]}
          >
            {/* Modal Handle */}
            <View
              style={[
                styles.modalHandle,
                { backgroundColor: isDark ? "#4B5563" : "#D1D5DB" },
              ]}
            />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalTitle}>Assign Order</ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  Select an order to assign to{" "}
                  <ThemedText style={styles.modalWorkerName}>
                    {selectedWorkerName}
                  </ThemedText>
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setShowWorkTypeModal(false)}
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? "#374151" : "#F3F4F6" },
                ]}
              >
                <FontAwesome
                  name="times"
                  size={20}
                  color={isDark ? "#D1D5DB" : "#6B7280"}
                />
              </Pressable>
            </View>

            {/* Orders List */}
            <FlatList
              data={orders}
              renderItem={renderOrderCard}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <FontAwesome
                    name="shopping-basket"
                    size={48}
                    color={theme.icon}
                  />
                  <ThemedText style={styles.emptyText}>
                    No orders available
                  </ThemedText>
                </View>
              )}
            />
          </ThemedView>
        </Modal>
      </ThemedView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 40, paddingHorizontal: 16 },

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
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans",
  },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2, opacity: 0.8 },

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
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
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
  workType: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 14,
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
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  bioContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  bioText: {
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
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
  },

  // ─── Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "transparent",
    zIndex: 10,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    height: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalWorkerName: {
    fontWeight: "700",
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
  },

  // ─── Order Card ───
  orderCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderCardDisabled: {
    opacity: 0.5,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  orderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  orderHeaderText: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 15,
    width: "70%",
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  orderBody: {
    gap: 8,
  },
  orderDesc: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  orderMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderMetaText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default WorkersScreen;
