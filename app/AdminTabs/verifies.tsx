// If you don't have eas installed then install using the following command:
// npm install -g eas-cli

// eas login
// eas build:configure

// Build for local development on iOS or Android:
// eas build -p ios --profile development --local
// OR
// eas build -p android --profile development --local

// May need to install the following to build locally (which allows debugging)
// npm install -g yarn
// brew install fastlane

// After building install on your device:
// For iOS (simulator): https://docs.expo.dev/build-reference/simulators/
// For Android: https://docs.expo.dev/build-reference/apk/

// Run on installed app:
// expo start --dev-client

// */
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import Loader from "@/Loader";
import { useIsFocused } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Button as NormalButton,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  assignOrderToWorker,
  getAvailableOrders,
  getAvailableProvidersThatAreNotVerified,
  updateWorkerData,
} from "../../firebaseMethodsToGetData";

const VerificationScreen = () => {
  const [error, setError] = useState<{ error: string; message: string } | null>(
    null,
  );
  const navigation = useNavigation<any>();

  const transcriptTallyRef = useRef<string>("");
  const [transcription, setTranscription] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "starting" | "recognizing">(
    "idle",
  );
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<any>(null); // ✅ Added recording state
  const [scaleAnim] = useState(new Animated.Value(1));
  const tintColor = useThemeColor({}, "tint");
  const width = Dimensions.get("window").width;
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.user.data);
  // alert(JSON.stringify(userData));
  const AVAILABLE_SERVICES = [
    {
      id: "1",
      title: t("home.electricServices"),
      image: require("../../CARD_IMAGES/ElectricServices.png"),
      backgroundColor: "rgba(245, 158, 11)",
      opacity: 0.9,
      imageOpacity: 0.8,
      justifyContent: "center" as const,
    },
    {
      id: "2",
      title: t("home.homeServices"),
      image: require("../../CARD_IMAGES/BeautyServices.png"),
      backgroundColor: "rgba(16, 185, 129)",
      imageOpacity: 0.7,
    },
    {
      id: "3",
      title: t("home.laundryServices"),
      image: require("../../CARD_IMAGES/LaundryServices.png"),
      backgroundColor: "rgba(14, 165, 233)",
      imageOpacity: 0.7,
    },
    {
      id: "4",
      title: t("home.careTakers"),
      image: require("../../CARD_IMAGES/CareTakerServices.png"),
      backgroundColor: "rgba(244, 63, 94)",
      imageOpacity: 0.8,
    },
  ];
  const carouselData = [
    {
      id: 1,
      color: "#FF6B6B",
      title: "Card 1",
      image: require("../../CARD_IMAGES/ElectricServices.png"),
    },
    {
      id: 2,
      color: "#4ECDC4",
      title: "Card 2",
      image: require("../../CARD_IMAGES/BeautyServices.png"),
    },
    {
      id: 3,
      color: "#FFE66D",
      title: "Card 3",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
    {
      id: 4,
      color: "#FF9F1C",
      title: "Card 4",
      image: require("../../CARD_IMAGES/LaundryServices.png"),
    },
  ];

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Re-fetch the data when the user pulls down
      await callProvidersApiNotVerified();
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // all the data of workers who are verified by us
  const workersData = [
    {
      name: "John Doe",
      mobileNumber: "+91 98765 43210",
      email: "mail@gmail.com",
      workType: "Care Taker",
      experience: "10",
      assigned: false,
      location: {
        cityName: "",
        latitude: 122,
        longitude: 100,
      },
      photoUrl: "", // This now holds the valid URL from Firebase Storage
      isAvailable: true,
      //
      //       "rating": 4.8,
      // "reviewCount": 112,
      verified: false,
      // "startingPrice": "₹500 for visit",
      // "phoneNumber": "+91 98765 12345",
      bio: "hello world",
      pushToken: "", // Save the token here!

      // id: 1,
      // bio: "bio",
      // workType: "Care Taker",
      // Experience: "10",
      // assigned: false,
      // name: "HELLO",
      // isAvailable: true,
      // emailAddress: "sgsf@gmail.com",
      // phoneNumber: "+93334322322",
      // // color: "#FF6B6B",
      // title: "Card 1",
      // imageProfile: require("../../CARD_IMAGES/ElectricServices.png"),
    },
    {
      name: "John Doe",
      mobileNumber: "+91 98765 43210",
      email: "mail@gmail.com",
      workType: "Care Taker",
      experience: "10",
      assigned: false,
      location: {
        cityName: "",
        latitude: 122,
        longitude: 100,
      },
      photoUrl: "", // This now holds the valid URL from Firebase Storage
      isAvailable: true,
      //
      //       "rating": 4.8,
      // "reviewCount": 112,
      verified: false,
      // "startingPrice": "₹500 for visit",
      // "phoneNumber": "+91 98765 12345",
      bio: "hello world",
      pushToken: "", // Save the token here!
    },
    {
      name: "John Doe",
      mobileNumber: "+91 98765 43210",
      email: "mail@gmail.com",
      workType: "Care Taker",
      experience: "10",
      assigned: false,
      location: {
        cityName: "",
        latitude: 122,
        longitude: 100,
      },
      photoUrl: "", // This now holds the valid URL from Firebase Storage
      isAvailable: true,
      //
      //       "rating": 4.8,
      // "reviewCount": 112,
      verified: false,
      // "startingPrice": "₹500 for visit",
      // "phoneNumber": "+91 98765 12345",
      bio: "hello world",
      pushToken: "", // Save the token here!
    },
    {
      name: "John Doe",
      mobileNumber: "+91 98765 43210",
      email: "mail@gmail.com",
      workType: "Care Taker",
      experience: "10",
      assigned: false,
      location: {
        cityName: "",
        latitude: 122,
        longitude: 100,
      },
      photoUrl: "", // This now holds the valid URL from Firebase Storage
      isAvailable: true,
      //
      //       "rating": 4.8,
      // "reviewCount": 112,
      verified: false,
      // "startingPrice": "₹500 for visit",
      // "phoneNumber": "+91 98765 12345",
      bio: "hello world",
      pushToken: "", // Save the token here!
    },
  ];

  // 2. Define the API logic
  const callProvidersApiNotVerified = async () => {
    try {
      setLoading(true);
      const data = await getAvailableProvidersThatAreNotVerified();
      console.log("Available Providers:", data);
      console.log("Query String Used: 'Care Taker'");
      console.log("Count of results:", data?.length);
      console.log("Results:", JSON.stringify(data, null, 2));
      if (data) {
        setProviders(data); // Set providers or empty array if data is null/undefined
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // 3. Effect Hook
  useEffect(() => {
    if (isFocused) {
      callProvidersApiNotVerified();
    }
  }, [isFocused]);

  const triggerBioMetric = async () => {
    alert("CALLED");
    LocalAuthentication.authenticateAsync()
      .then(() => {
        alert("SUCCESS");
      })
      .catch((c) => {
        alert("FAILURE");
      });
  };

  useEffect(() => {
    // triggerBioMetric();
  }, []);

  return (
    <SafeAreaProvider>
      {/* <AppContainer> */}
      <StatusBar style="dark" />
      <ThemedView style={styles.container}>
        {loading && <Loader />}
        <SafeAreaView edges={["top"]} style={styles.container}>
          <View style={styles.scrollWrapper}>
            <NormalButton
              title="CHECK PAYMENT GATEWAY"
              // onPress={startPayment}
              onPress={() => {
                // var options = {
                //   description: "Credits towards consultation",
                //   image: "https://i.imgur.com/3g7nmJC.png",
                //   currency: "INR",
                //   key: "rzp_test_SfU1v0PCraZ3LQ", // Your api key
                //   amount: "5000",
                //   name: "foo",
                //   prefill: {
                //     email: "void@razorpay.com",
                //     contact: "9191919191",
                //     name: "Razorpay Software",
                //   },
                //   theme: { color: "#F37254" },
                // };
              }}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  // Optional: Add styling like tintColor for iOS or colors for Android
                  tintColor={tintColor}
                />
              }
            >
              <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={providers}
                ListFooterComponent={() => <View style={{ height: 200 }} />}
                renderItem={({ index, item }) => {
                  const displayText = t(`professions.${item}`);
                  return (
                    <Pressable
                      style={{
                        borderRadius: 5,
                        borderWidth: 10,
                        borderColor: item.verified ? "green" : "red",
                        marginVertical: 10,
                      }}
                      onPress={() => {
                        // callOrdersApi()
                        //   .then(() => {
                        //     setSelectedEmailId(item.email);
                        //     setShowWorkTypeModal(true);
                        //   })
                        //   .catch((error) => {
                        //     alert("Failed to update: " + JSON.stringify(error));
                        //   });
                        setLoading(true);
                        updateWorkerData(item.email, {
                          verified: !item.verified,
                        })
                          .then(() => {
                            // setLoading(false);
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

                        // Toggle the current value
                        // const newAssignedStatus = !item.assigned;
                        // const updatePayload = { assigned: newAssignedStatus };

                        // updateWorkerData(item.email, updatePayload)
                        //   .then(() => {
                        //     // Update local state so UI reflects the change immediately
                        //     setProviders((prev) =>
                        //       prev.map((worker) =>
                        //         worker.email === item.email
                        //           ? { ...worker, assigned: newAssignedStatus }
                        //           : worker,
                        //       ),
                        //     );
                        //     setLoading(false);
                        //   })
                        //   .catch((error) => {
                        //     setLoading(false);
                        //     alert("Failed to update: " + error.message);
                        //   });
                      }}
                    >
                      <ThemedView>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                          }}
                        >
                          <View style={{ maxWidth: "70%" }}>
                            <ThemedText>Name: {item.name}</ThemedText>
                            <ThemedText>
                              Experience: {item.experience}
                            </ThemedText>
                            <ThemedText>Bio: {item.bio}</ThemedText>
                            <ThemedText style={{ fontSize: 14 }}>
                              Email: {item.email}
                            </ThemedText>
                            <ThemedText>Mobile: {item.mobileNumber}</ThemedText>
                            <ThemedText>
                              Verified:{" "}
                              {JSON.stringify(item.verified) ?? "false"}
                            </ThemedText>
                          </View>
                          <Image
                            source={{ uri: item.photoUrl }}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 20,
                            }}
                          />
                        </View>
                      </ThemedView>
                    </Pressable>
                  );
                }}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
        <Modal
          onDismiss={() => {
            alert("called");
          }}
          transparent
          visible={showWorkTypeModal}
          onRequestClose={() => {
            setShowWorkTypeModal(false);
          }}
          // presentationStyle=""
          // style={{ marginTop: 100 }}
        >
          <Pressable
            // pointerEvents="none"
            style={{ flex: 1, marginBottom: -20 }}
            onPress={() => {
              // alert("hello");
              setShowWorkTypeModal(false);
            }}
          ></Pressable>
          <SafeAreaView
            edges={["bottom"]}
            style={{
              backgroundColor: "transparent",
              zIndex: 10,
              height: 300,
            }}
          >
            <ThemedView
              style={{
                padding: 15,
                paddingLeft: 35,
                borderRadius: 20,
                elevation: 5,
                // backgroundColor: "red",
                borderTopWidth: 2,
                // overflow: "hidden",
                borderColor: "grey",
                height: 400,
                width: "100%",
                bottom: 0,
                position: "absolute",
                paddingBottom: 30,
              }}
            >
              <ThemedText style={{ marginBottom: 20 }} type="subtitle">
                {t("profile.chooseWorkType")}
              </ThemedText>
              <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={orders}
                renderItem={({ index, item }) => {
                  const displayText = t(`professions.${item}`);
                  return (
                    <Pressable
                      disabled={item.orderStatus === "Assigned"}
                      onPress={() => {
                        setLoading(true);
                        console.log(
                          "Assigning order to worker with email:",
                          selectedEmailId,
                        );
                        console.log("Order ID being assigned:");
                        // setShowWorkTypeModal(false);
                        alert(
                          "Assigning order to worker..." +
                            JSON.stringify({
                              email: selectedEmailId,
                              orderId: item.id,
                            }),
                        );
                        assignOrderToWorker(selectedEmailId, "order_JwXYZ12345")
                          .then(() => {
                            alert("Worker assigned successfully!");
                            setShowWorkTypeModal(false);
                          })
                          .catch((error) => {
                            alert("Failed to update: " + error.message);
                          });
                        // setWorkType(displayText);
                      }}
                      style={{
                        padding: 15,
                        backgroundColor:
                          item.orderStatus === "Assigned" ? "orange" : "green",
                        borderRadius: 10,
                      }}
                    >
                      <ThemedText type="defaultSemiBold">{item.id}</ThemedText>
                      <ThemedText type="defaultSemiBold">
                        {item.amountPaid}
                      </ThemedText>
                      <ThemedText type="defaultSemiBold">
                        {item.orderStatus}
                      </ThemedText>
                      <ThemedText type="defaultSemiBold">
                        {item.orderAdditionalDescription}
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            </ThemedView>
          </SafeAreaView>
        </Modal>
      </ThemedView>
      {/* </AppContainer> */}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
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
  scrollContent: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 12 },
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

export default VerificationScreen;
