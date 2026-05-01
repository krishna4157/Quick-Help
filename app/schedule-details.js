import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

// Component Imports
import { getThemeColor, useColorScheme } from "@/components/themed-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { auth } from "@/firebaseConfig";
// import { useColorScheme } from "";
import Loader from "@/Loader";
import DatePicker from "react-native-date-picker";
import RazorpayCheckout from "react-native-razorpay";
import AwesomeButton from "react-native-really-awesome-button";
import { saveOrders } from "../firebaseMethodsToGetData";

const { width, height } = Dimensions.get("window");

const ScheduleDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const userData = useSelector((state) => state.user.data);

  // Calculate minimum date: if today, minimum time is current time + 30 minutes
  const getMinimumDate = () => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setMinutes(now.getMinutes() + 30);
    return minDate;
  };

  const [loading, setLoading] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [date, setDate] = useState(getMinimumDate());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

  // Get wallet balance from Redux
  const walletBalance = useSelector(
    (state) => state.user.data?.walletBalance ?? 0,
  );

  // Calculate wallet deduction (min of wallet balance and price)
  const walletDeduction = useWallet ? Math.min(walletBalance, price) : 0;
  const finalPrice = price;

  // Update minimum date every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const newMinDate = getMinimumDate();
      // Only update if current date is before the new minimum
      if (date < newMinDate) {
        setDate(newMinDate);
      }
    }, 30 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [date]);

  const minimumDate = getMinimumDate();

  // Get ALL params from route with robust fallbacks
  const params = route.params || {};
  const service = params.service || {};
  const highlights = params.highlights || [];
  const exclusionList = params.exclusionList || [];
  const passedTheme = params.theme || {};

  // Service data with comprehensive fallbacks
  const serviceName = service.serviceType || service.name || "Service";
  const serviceImage = service.photoUrl
    ? { uri: service.photoUrl }
    : passedTheme.image || require("../CARD_IMAGES/ElectricServices.png");
  const price = service.price || service.amount || params.amountInRupees || 50;
  const duration = service.timeTaken || "30-45 mins";
  const category = service.category || "General";
  const rating = service.rating || "4.8";
  const reviewCount = service.reviewCount || "1,247";
  const workType = service.workType || category;

  // Parse highlights/important notes
  const importantNotes =
    highlights.length > 0
      ? highlights
      : service.importantNotes
        ? Array.isArray(service.importantNotes)
          ? service.importantNotes
          : String(service.importantNotes)
              .split(",")
              .map((s) => s.trim())
        : [
            "Professional & experienced staff",
            "Quality service guaranteed",
            "On-time service delivery",
          ];

  // Parse exclusions
  const exclusions =
    exclusionList.length > 0
      ? exclusionList
      : service.exclusions
        ? Array.isArray(service.exclusions)
          ? service.exclusions
          : String(service.exclusions)
              .split(",")
              .map((s) => s.trim())
        : [];

  const iconColor = getThemeColor(true) || "black";
  const textColor = getThemeColor(false) || "black";

  useEffect(() => {
    if (isFocused && params.time) {
      setDate(new Date(params.time));
    }
  }, [isFocused, params.time]);

  const onProceedCheckout = async () => {
    const amountInRupees = price;
    // alert(finalPrice);
    alert(JSON.stringify(userData));
    try {
      setLoading(true);

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
      const generatedOrderId = orderData.id;

      setLoading(false);

      var options = {
        description: `Booking for ${serviceName}`,
        image: "https://i.imgur.com/3g7nmJC.png",
        currency: "INR",
        key: "rzp_test_SgBqTpv6Y1PLRl",
        amount: (amountInRupees * 100).toString(),
        name: "DeliveryApp",
        order_id: generatedOrderId,
        prefill: {
          email: auth.currentUser?.email || "user@example.com",
          contact: auth.currentUser?.phoneNumber || "919331919",
          name: auth.currentUser?.displayName || "Customer",
        },
        theme: { color: isDark ? "#10B981" : "#059669" },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          // alert(`Success: ${data.razorpay_payment_id}`);
          console.log("DATA : ", userData);

          const obj = {
            orderId: generatedOrderId,
            // id: data.razorpay_payment_id,
            orderTitle: serviceName,
            workType: workType,
            serviceType: service.serviceType || "Service",
            scheduleDate: date.toISOString(),
            paymentSuccessTransactionId: data.razorpay_payment_id,
            customerId: auth.currentUser?.email ?? "",
            orderAdditionalDescription: additionalInfo,
            orderPlaced: new Date().toISOString(),
            orderStatus: "Pending",
            amountPaid: amountInRupees.toString(),
            location: userData.location,
            walletDeduction: walletDeduction.toString(),
            phoneNumber:
              auth.currentUser?.phoneNumber ||
              userData.mobileNumber ||
              userData.phoneNumber,
            userId: auth.currentUser?.uid,
            category: category,
          };

          saveOrders(obj, generatedOrderId).then(() => {
            alert("Order saved successfully!");
            navigation.navigate("payment-success", {
              orderId: generatedOrderId,
            });
          });
        })
        .catch((error) => {
          alert(`Error: ${error.code} | ${error.description}`);
        });
    } catch (error) {
      setLoading(false);
      console.error("Payment API Error:", error);
      alert("Could not initialize payment. Please try again.");
    }
  };

  const formatDate = (d) => {
    return d?.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (d) => {
    return d?.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Dynamic gradient colors based on category
  const getCategoryGradient = () => {
    const gradients = {
      Electric: ["#F59E0B", "#D97706"],
      Home: ["#3B82F6", "#2563EB"],
      Laundry: ["#06B6D4", "#0891B2"],
      Care: ["#EC4899", "#DB2777"],
      Beauty: ["#8B5CF6", "#7C3AED"],
      default: ["#10B981", "#059669"],
    };
    return gradients[category] || gradients.default;
  };

  const categoryGradient = getCategoryGradient();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ThemedView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0B1120" : "#F1F5F9" },
        ]}
      >
        {loading && <Loader />}

        {/* Hero Image Banner */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={serviceImage}
            style={styles.heroImage}
            imageStyle={{
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
              style={styles.heroGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name="chevron-back-circle"
                    size={36}
                    color="white"
                  />
                </Pressable>
                <ThemedText style={styles.headerTitle}>
                  {t("schedule.schedule")}
                </ThemedText>
                <View style={styles.headerButton} />
              </View>

              {/* Hero Content */}
              <View style={styles.heroContent}>
                <View style={styles.categoryPill}>
                  <LinearGradient
                    colors={categoryGradient}
                    style={styles.categoryPillGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <FontAwesome name="tag" size={10} color="white" />
                    <ThemedText style={styles.categoryPillText}>
                      {category}
                    </ThemedText>
                  </LinearGradient>
                </View>
                <ThemedText style={styles.heroServiceName} numberOfLines={2}>
                  {serviceName}
                </ThemedText>
                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <ThemedText style={styles.heroMetaText}>
                      {rating} ({reviewCount})
                    </ThemedText>
                  </View>
                  <View style={styles.heroMetaDivider} />
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="time-outline" size={14} color="#FBBF24" />
                    <ThemedText style={styles.heroMetaText}>
                      {duration} mins
                    </ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <SafeAreaView edges={["top"]} style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Service Highlights */}
            {/* {importantNotes.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIconBg,
                      { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10B981"
                    />
                  </View>
                  <ThemedText style={styles.sectionTitle}>
                    {t("service.included")}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.highlightsCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    },
                  ]}
                >
                  {importantNotes.slice(0, 4).map((note, index) => (
                    <View key={index} style={styles.highlightItem}>
                      <View
                        style={[
                          styles.checkIconBg,
                          { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                        ]}
                      >
                        <Ionicons name="checkmark" size={14} color="#10B981" />
                      </View>
                      <ThemedText style={styles.highlightText}>
                        {note}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )} */}

            {/* Date & Time Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBg,
                    { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                  ]}
                >
                  <Ionicons name="calendar-clear" size={18} color="#3B82F6" />
                </View>
                <ThemedText style={styles.sectionTitle}>
                  Select Date & Time
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setOpenDatePicker(true)}
                style={({ pressed }) => [
                  styles.dateCard,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={styles.dateMain}>
                  <View style={styles.dateBlock}>
                    <View style={styles.dateIconRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#3B82F6"
                      />
                      <ThemedText style={styles.dateValue}>
                        {date == undefined ? "" : formatDate(date)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.dateSubtext,
                        { color: isDark ? "#64748B" : "#94A3B8" },
                      ]}
                    >
                      Selected Date
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.dateDivider,
                      { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
                    ]}
                  />

                  <View style={styles.dateBlock}>
                    <View style={styles.dateIconRow}>
                      <Ionicons name="time-outline" size={20} color="#F59E0B" />
                      <ThemedText style={styles.dateValue}>
                        {date == undefined ? "" : formatTime(date)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.dateSubtext,
                        { color: isDark ? "#64748B" : "#94A3B8" },
                      ]}
                    >
                      Selected Time
                    </ThemedText>
                  </View>
                </View>

                <View
                  style={[
                    styles.editIcon,
                    { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                  ]}
                >
                  <Ionicons name="create-outline" size={18} color="#3B82F6" />
                </View>
              </Pressable>

              <DatePicker
                modal
                open={openDatePicker}
                date={date}
                onConfirm={(selectedDate) => {
                  setOpenDatePicker(false);
                  setDate(selectedDate);
                }}
                onCancel={() => setOpenDatePicker(false)}
                minimumDate={minimumDate}
              />
            </View>

            {/* Additional Notes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBg,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="note-text-outline"
                    size={18}
                    color="#F59E0B"
                  />
                </View>
                <ThemedText style={styles.sectionTitle}>
                  Additional Notes
                </ThemedText>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                ]}
              >
                <TextInput
                  placeholder={t("schedule.additionalInfo")}
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  value={additionalInfo}
                  multiline={true}
                  numberOfLines={4}
                  onChangeText={setAdditionalInfo}
                  style={[
                    styles.input,
                    { color: isDark ? "#F1F5F9" : "#0F172A" },
                  ]}
                />
                <View style={styles.inputHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={isDark ? "#475569" : "#CBD5E1"}
                  />
                  <ThemedText
                    style={[
                      styles.inputHintText,
                      { color: isDark ? "#475569" : "#CBD5E1" },
                    ]}
                  >
                    Add any specific requirements or instructions
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Booking Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBg,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Ionicons name="receipt-outline" size={18} color="#10B981" />
                </View>
                <ThemedText style={styles.sectionTitle}>
                  Booking Summary
                </ThemedText>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                ]}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Service
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    {serviceName}
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="folder-open-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Category
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    {category}
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Date
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    {formatDate(date)}
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Time
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    {formatTime(date)}
                  </ThemedText>
                </View>

                {additionalInfo ? (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelRow}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={isDark ? "#64748B" : "#94A3B8"}
                      />
                      <ThemedText
                        style={[
                          styles.summaryLabel,
                          { color: isDark ? "#94A3B8" : "#64748B" },
                        ]}
                      >
                        Notes
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.summaryValue,
                        {
                          color: isDark ? "#F1F5F9" : "#0F172A",
                          maxWidth: 150,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {additionalInfo}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Booking Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconBg,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Ionicons name="receipt-outline" size={18} color="#10B981" />
                </View>
                <ThemedText style={styles.sectionTitle}>Billing</ThemedText>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                ]}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Charges
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    {price}
                    {/* {serviceName} */}
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="folder-open-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Service Charges
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    0
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Other Charges
                      {/* Date */}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    100
                    {/* {formatDate(date)} */}
                  </ThemedText>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isDark ? "#64748B" : "#94A3B8"}
                    />
                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Delivery Charges
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    10
                    {/* {formatTime(date)} */}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => {
                    setUseWallet((p) => !p);
                  }}
                  style={styles.summaryRow}
                >
                  <View style={styles.summaryLabelRow}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isDark ? "#34D399" : "#059669",
                          backgroundColor: useWallet
                            ? isDark
                              ? "#34D399"
                              : "#059669"
                            : "transparent",
                        },
                      ]}
                    >
                      {useWallet && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                    <Ionicons
                      name="wallet"
                      size={20}
                      color={isDark ? "#34D399" : "#059669"}
                    />

                    <ThemedText
                      style={[
                        styles.summaryLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Wallet Balance
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.summaryValue,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    - {walletBalance}
                    {/* {formatTime(date)} */}
                  </ThemedText>
                </Pressable>

                {additionalInfo ? (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryLabelRow}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={isDark ? "#64748B" : "#94A3B8"}
                      />
                      <ThemedText
                        style={[
                          styles.summaryLabel,
                          { color: isDark ? "#94A3B8" : "#64748B" },
                        ]}
                      >
                        Notes
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.summaryValue,
                        {
                          color: isDark ? "#F1F5F9" : "#0F172A",
                          maxWidth: 150,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {additionalInfo}
                    </ThemedText>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.summaryDivider,
                    { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
                  ]}
                />

                <View style={styles.summaryTotalRow}>
                  <ThemedText
                    style={[
                      styles.summaryTotal,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    Total Amount
                  </ThemedText>
                  <View style={styles.priceTag}>
                    <ThemedText style={styles.priceCurrency}>₹</ThemedText>
                    <ThemedText style={styles.priceAmount}>
                      {price - (useWallet ? walletBalance : 0)}
                    </ThemedText>
                  </View>
                </View>

                {useWallet && walletDeduction > 0 && (
                  <View style={styles.walletDeductionRow}>
                    <ThemedText
                      style={[
                        styles.walletDeductionLabel,
                        { color: isDark ? "#64748B" : "#94A3B8" },
                      ]}
                    >
                      Wallet Discount
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.walletDeductionAmount,
                        { color: isDark ? "#34D399" : "#059669" },
                      ]}
                    >
                      -₹{walletDeduction}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>

        {/* Fixed Bottom Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark
                ? "rgba(11, 17, 32, 0.95)"
                : "rgba(241, 245, 249, 0.95)",
              borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.bottomContent}>
            <View style={styles.totalContainer}>
              <View style={styles.totalLabelRow}>
                <ThemedText
                  style={[
                    styles.bottomTotalLabel,
                    { color: isDark ? "#64748B" : "#94A3B8" },
                  ]}
                >
                  Total Amount
                </ThemedText>
                <View style={styles.secureBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <ThemedText style={styles.secureText}>Secure</ThemedText>
                </View>
              </View>
              <View style={styles.priceTag}>
                <ThemedText
                  style={[
                    styles.bottomPriceCurrency,
                    { color: isDark ? "#34D399" : "#059669" },
                  ]}
                >
                  ₹ {price - walletBalance}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.bottomTotalAmount,
                    { color: isDark ? "#34D399" : "#059669" },
                  ]}
                >
                  {finalPrice}
                </ThemedText>
              </View>
            </View>
            <AwesomeButton
              width={200}
              height={56}
              borderRadius={16}
              backgroundColor="#10B981"
              backgroundDarker="#059669"
              backgroundShadow={isDark ? "#065F46" : "#047857"}
              raiseLevel={4}
              onPress={onProceedCheckout}
            >
              <View style={styles.proceedButtonContent}>
                <ThemedText style={styles.proceedText}>
                  {t("schedule.proceed")}
                </ThemedText>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="white"
                  style={{ marginLeft: 8 }}
                />
              </View>
            </AwesomeButton>
          </View>
        </View>
      </ThemedView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  // Hero Banner
  heroContainer: {
    width: width,
    height: height * 0.32,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    fontFamily: "PlusJakartaSans",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Hero Content
  heroContent: {
    gap: 8,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    overflow: "hidden",
  },
  categoryPillGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
    fontFamily: "PlusJakartaSans",
  },
  heroServiceName: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
    fontFamily: "PlusJakartaSans",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  heroMetaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    fontFamily: "PlusJakartaSans",
  },

  // Section
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },

  // Highlights Card
  highlightsCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    gap: 14,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },

  // Date Card
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  dateMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  dateDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  editIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dateBlock: {
    flex: 1,
    gap: 4,
    // backgroundColor: "red",
  },
  dateIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  dateSubtext: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 28,
    fontFamily: "PlusJakartaSans",
  },

  // ─── Input ───
  inputContainer: {
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    minHeight: 140,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "PlusJakartaSans",
    textAlignVertical: "top",
    minHeight: 80,
  },
  inputHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    fontFamily: "PlusJakartaSans",
    textAlignVertical: "top",
    minHeight: 80,
  },
  inputHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  inputHintText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },

  // ─── Summary Card ───
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  priceTag: {
    flexDirection: "row",
    // alignItems: "flex-end",
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginRight: 2,
    fontFamily: "PlusJakartaSans",
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#10B981",
    fontFamily: "PlusJakartaSans",
  },

  // ─── Bottom Bar ───
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    // paddingVertical: 14,
    // paddingBottom: 28,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 5,
    // backgroundColor: "blue",
    alignItems: "center",
  },
  totalContainer: {
    flexDirection: "column",
    // backgroundColor: "red",
    gap: 2,
  },
  totalLabelRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  bottomTotalLabel: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  secureText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
    fontFamily: "PlusJakartaSans",
  },
  bottomPriceCurrency: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 2,
    fontFamily: "PlusJakartaSans",
  },
  bottomTotalAmount: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans",
  },
  proceedButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  proceedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    fontFamily: "PlusJakartaSans",
  },

  // Wallet Styles
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
  walletBalance: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  walletDeductionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  walletDeductionLabel: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans",
  },
  walletDeductionAmount: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
});

export default ScheduleDetails;
