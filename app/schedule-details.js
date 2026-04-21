import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

// Component Imports
import { ThemedCard } from "@/components/themed-card";
import { getThemeColor } from "@/components/themed-color";
import { auth } from "@/firebaseConfig";
import Loader from "@/Loader";
import DatePicker from "react-native-date-picker";
import RazorpayCheckout from "react-native-razorpay";
import AwesomeButton from "react-native-really-awesome-button";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { getAvailableProviders, saveOrders } from "../firebaseMethodsToGetData";

const { width } = Dimensions.get("window");

const ScheduleDetails = () => {
  // 1. Declare all hooks at the very top
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isFav, setFav] = useState(false);
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());

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
      //   callProvidersApi();
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

  const getThemeColorForText = getThemeColor(false);

  const onProceedCheckout = async () => {
    // Define the amount in Rupees (e.g., 50 INR)
    const amountInRupees = 50;

    try {
      // 1. Show your Loader while waiting for Cloudflare
      setLoading(true);

      // 2. Fetch the Order ID from your Cloudflare Worker
      const response = await fetch(
        "https://payment-api.payment-api-deliveryapp.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInRupees }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate order ID");
      }

      const orderData = await response.json();
      const generatedOrderId = orderData.id; // This is the 'order_...' string

      // Hide Loader now that we have the ID
      setLoading(false);

      // 3. Prepare Razorpay Options
      var options = {
        description: "Credits towards consultation",
        image: "https://i.imgur.com/3g7nmJC.png",
        currency: "INR",
        key: "rzp_test_SgBqTpv6Y1PLRl", // Your Razorpay Key
        amount: (amountInRupees * 100).toString(), // Razorpay expects paise (e.g., 5000)
        name: "DeliveryApp",
        order_id: generatedOrderId, // ✅ INJECTED HERE FROM CLOUDFLARE
        prefill: {
          email: auth.currentUser?.email || "user@example.com",
          contact: auth.currentUser?.phoneNumber || "919331919",
          name: "Razorpay Software",
        },
        theme: { color: "#F37254" },
      };

      // 4. Open Razorpay Checkout
      RazorpayCheckout.open(options)
        .then((data) => {
          // handle success
          alert(`Success: ${data.razorpay_payment_id}`);

          const obj = {
            id: data.razorpay_payment_id, // The payment ID
            orderTitle: "Fan Repair",
            workType: "Electrician",
            serviceType: "Fan",
            scheduleDate: date.toISOString(),
            paymentSuccessTransactionId: data.razorpay_payment_id,
            customerId: auth.currentUser?.email ?? "",
            orderAdditionalDescription: "bbfbfbb",
            orderPlaced: new Date().toISOString(),
            orderStatus: "Pending", // You might want to change this to 'Paid' or 'Success' now
            amountPaid: amountInRupees.toString(),
            phoneNumber: auth.currentUser?.phoneNumber,
            userId: auth.currentUser?.uid,
          };

          // ✅ Save to Firestore using the REAL order ID, not the hardcoded one
          saveOrders(obj, generatedOrderId).then(() => {
            alert("Orders data saved");
            navigation.navigate("payment-success", {
              orderId: generatedOrderId,
            });
          });
        })
        .catch((error) => {
          // handle failure
          alert(`Error: ${error.code} | ${error.description}`);
        });
    } catch (error) {
      // Handle any network errors with Cloudflare
      setLoading(false);
      console.error("Payment API Error:", error);
      alert("Could not initialize payment. Please try again.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={38} color={iconColor} />
        </Pressable>
        <ThemedText type="subtitle" style={{ marginLeft: 10 }}>
          {t("schedule.schedule")}
        </ThemedText>
      </View>
      {/* <Image
          source={require("../CARD_IMAGES/ElectricServices.png")}
          style={{ width: "100%", height: 290 }}
        /> */}
      {/* <RNDateTimePicker
          minimumDate={new Date()}
          mode="date"
          value={new Date()}
          // value={new Date()}
          onChange={(e) => {
            alert("HELL WORLD : " + JSON.stringify(e));
          }}
        /> */}
      <View style={{ justifyContent: "center", alignSelf: "center" }}>
        <DatePicker
          date={date}
          onDateChange={setDate}
          minimumDate={new Date()}
        />
      </View>
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 15,
          minHeight: 300,
          borderRadius: 30,
          borderWidth: 1,

          borderColor: "grey",
        }}
      >
        <TextInput
          placeholder={t("schedule.additionalInfo")}
          value={additionalInfo}
          multiline={true}
          onChangeText={setAdditionalInfo}
          // editable={false}
          style={[styles.input]}
        />
      </View>
      <View
        style={{
          flex: 1,
          // alignContent: "flex-end",
          alignItems: "flex-end",
          // alignSelf: "flex-end",
          width: "100%",
          height: 40,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <AwesomeButton
          width={150}
          backgroundColor="green"
          borderRadius={25}
          onPress={() => {}}
        >
          {t("schedule.back")}
        </AwesomeButton>
        <AwesomeButton
          borderRadius={25}
          width={150}
          backgroundColor="green"
          onPress={() => {
            onProceedCheckout();
          }}
        >
          {t("schedule.proceed")}
        </AwesomeButton>
      </View>
      {loading && <Loader />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginTop: 5,
    borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  header: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    // marginTop: 40, // Adjust for status bar
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

export default ScheduleDetails;
