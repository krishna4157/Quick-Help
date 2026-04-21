import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getAvailableOrdersByEmail } from "@/firebaseMethodsToGetData";
import Loader from "@/Loader";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TrackScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const isFocused = useIsFocused();

  // 2. Define the API logic to get get order list
  const callOrdersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableOrdersByEmail();
      console.log("Available Orders:", data);
      console.log("Query String Used: 'Care Taker'");
      console.log("Count of results:", data?.length);
      console.log("Results:", JSON.stringify(data, null, 2));
      if (data) {
        setOrders(data); // Set providers or empty array if data is null/undefined
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const ordersData = [
    {
      id: 1,
      orderAdditionalDescription: "bbfbfbb",
      orderPlaced: "Time",
      orderStatus: "Status",
      workerAssigned: "",
      amountPaid: "",
      color: "#FF6B6B",
      title: "Card 1",
      image: require("../../CARD_IMAGES/ElectricServices.png"),
    },
    {
      id: 2,
      orderAdditionalDescription: "bbfbfbb",
      orderPlaced: "Time",
      orderStatus: "Status",
      workerAssigned: "",
      amountPaid: "",
      color: "#4ECDC4",
      title: "Card 2",
      image: require("../../CARD_IMAGES/BeautyServices.png"),
    },
    {
      id: 3,
      orderAdditionalDescription: "bbfbfbb",
      orderPlaced: "Time",
      orderStatus: "Status",
      workerAssigned: "",
      amountPaid: "",
      color: "#FFE66D",
      title: "Card 3",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
    {
      id: 4,
      orderAdditionalDescription: "bbfbfbb",
      orderPlaced: "Time",
      orderStatus: "Status",
      workerAssigned: "",
      amountPaid: "",
      orderOTP: "STATIC OTP",
      color: "#FF9F1C",
      title: "Card 4",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
  ];

  // 3. Effect Hook
  useEffect(() => {
    if (isFocused) {
      callOrdersApi();
    }
  }, [isFocused]);

  return (
    <SafeAreaProvider>
      {/* <AppContainer> */}
      {/* <StatusBar style="dark" /> */}
      <ThemedView style={styles.container}>
        {loading && <Loader />}
        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={orders}
                ListFooterComponent={() => <View style={{ height: 200 }} />}
                renderItem={({ index, item }) => (
                  <Pressable
                    onPress={() => {
                      // Navigate to order details or show modal
                    }}
                    style={[
                      styles.orderCard,
                      {
                        borderLeftColor:
                          item.orderStatus === "Assigned"
                            ? "#F59E0B"
                            : item.orderStatus === "Pending"
                              ? "#3B82F6"
                              : "#10B981",
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.statusIndicator} />
                      <ThemedText type="subtitle" style={styles.orderId}>
                        Order #{item.id}
                      </ThemedText>
                    </View>

                    <View style={styles.serviceInfo}>
                      <ThemedText type="title" style={styles.serviceTitle}>
                        {item.orderTitle || "Service"}
                      </ThemedText>
                      <View style={styles.dateContainer}>
                        <ThemedText style={styles.dateLabel}>
                          {new Date(item.orderPlaced).toLocaleDateString()}
                        </ThemedText>
                        {isToday(item.orderPlaced) && (
                          <View style={styles.todayBadge}>
                            <ThemedText style={styles.todayText}>
                              TODAY
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.workerName}>
                        {item.workerAssigned || "Worker Assigned"}
                      </ThemedText>
                    </View>

                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>
                          Status
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.detailValue,
                            {
                              color:
                                item.orderStatus === "Assigned"
                                  ? "#F59E0B"
                                  : item.orderStatus === "Pending"
                                    ? "#3B82F6"
                                    : "#10B981",
                            },
                          ]}
                        >
                          {item.orderStatus}
                        </ThemedText>
                      </View>
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>
                          Placed
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {new Date(item.orderPlaced).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.bottomRow}>
                      <View style={styles.amountContainer}>
                        <ThemedText style={styles.currency}>₹</ThemedText>
                        <ThemedText style={styles.amount}>
                          {item.amountPaid}
                        </ThemedText>
                      </View>
                      {item.orderOTP && (
                        <View style={styles.otpContainer}>
                          <ThemedText style={styles.otpLabel}>OTP</ThemedText>
                          <ThemedText style={styles.otp}>
                            {item.orderOTP}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>
                )}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </ThemedView>
      {/* </AppContainer> */}
    </SafeAreaProvider>
  );
}

const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 100 },

  // Beautiful Order Card Styles
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Today highlighting
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginRight: 8,
  },
  todayBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "800",
    color: "white",
    textTransform: "uppercase",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  orderId: {
    fontWeight: "700",
    fontSize: 16,
  },
  serviceInfo: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    color: "white",
  },
  workerName: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 20,
    fontWeight: "800",
    color: "#10B981",
    marginRight: 2,
  },
  amount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#10B981",
  },
  otpContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  otpLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginBottom: 2,
  },
  otp: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3B82F6",
    textAlign: "center",
  },

  // Keep existing styles
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  header: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  // ... other existing styles remain the same
});
