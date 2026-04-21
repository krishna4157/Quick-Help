import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { logout } from "@/firebaseMethods";
import { getAvailableOrders } from "@/firebaseMethodsToGetData";
import Loader from "@/Loader";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const isFocused = useIsFocused();

  // 2. Define the API logic to get get order list
  const callOrdersApi = async () => {
    try {
      setLoading(true);
      const data = await getAvailableOrders();
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
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={38} color={"black"} />
          </Pressable>
          <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
            {/* {t("booking.chooseExpert")} */}
            Schedule
          </ThemedText>
          <Pressable
            onPress={() => {
              logout();
            }}
            style={{ backgroundColor: "red", padding: 10, borderRadius: 10 }}
          >
            <ThemedText style={{ color: "white" }}>Logout</ThemedText>
          </Pressable>
        </View>
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
                renderItem={({ index, item }) => {
                  const displayText = t(`professions.${item}`);
                  return (
                    <Pressable
                      onPress={() => {
                        // setShowWorkTypeModal(false);
                        // setWorkType(displayText);
                      }}
                      style={{
                        padding: 15,
                        backgroundColor:
                          item.orderStatus == "Assigned" ? "orange" : "red",
                        borderRadius: 10,
                        marginVertical: 10,
                      }}
                    >
                      <ThemedView>
                        <ThemedText>{item.title}</ThemedText>
                        <ThemedText>{item.orderPlaced}</ThemedText>
                        <ThemedText>
                          {JSON.stringify(item.orderAdditionalDescription)}
                        </ThemedText>
                        <ThemedText>{item.orderStatus}</ThemedText>
                        <ThemedText>{item.workerAssigned}</ThemedText>
                        <ThemedText>{item.orderOTP}</ThemedText>
                      </ThemedView>
                    </Pressable>
                  );
                }}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </ThemedView>
      {/* </AppContainer> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
    // marginTop: 40, // Adjust for status bar
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  textLabel: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  textSubtle: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
  },
  textOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  textInput: {
    height: 30,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  mb2: {
    marginBottom: 8,
  },
  gap1: {
    gap: 4,
  },
  container: { flex: 1 },
  scrollWrapper: { flex: 1 },
  scrollContent: { paddingTop: 30, paddingBottom: 20 },
  content: { padding: 32, gap: 16 },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  colorBlock: {
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
  },
  cardText: {
    color: "white",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    fontFamily: "PlusJakartaSans",
    fontWeight: "bold",
    padding: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    fontSize: 18,
  },
  stickySearch: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 13,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 4,
    fontSize: 16,
    includeFontPadding: false,
  },
  micContainer: { padding: 4 },
});
