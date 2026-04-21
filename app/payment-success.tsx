import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const PaymentSuccess = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const scaleValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  const bounceValue = new Animated.Value(1);

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    // navigation.navigate("track");
    navigation.navigate("tab-layout", {
      screen: "track",
      //   orderId: generatedOrderId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Success Checkmark Lottie Animation */}
        <Animated.View
          style={[
            styles.animationContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LottieView
            source={require("../Heart.json")} // Success animation (checkmark/confetti)
            style={styles.lottie}
            autoPlay
            loop={false}
          />
        </Animated.View>

        {/* Bouncing Success Badge */}
        <Animated.View
          style={[
            styles.successBadge,
            {
              transform: [{ scale: bounceValue }],
            },
          ]}
        >
          <ThemedText type="titleLarge" style={styles.badgeText}>
            ✓
          </ThemedText>
        </Animated.View>

        {/* Success Messages */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText type="title" style={styles.title}>
            {t("payment.success")}!
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {t("payment.orderPlaced")}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t("payment.thankYou")}
          </ThemedText>
        </Animated.View>

        {/* Track Order Button */}
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <ThemedText style={styles.trackButtonText}>
            📦 {t("payment.trackOrder")}
          </ThemedText>
        </TouchableOpacity>

        {/* Decorative Elements */}
        <View style={styles.decorations}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f0f",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  animationContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  successBadge: {
    marginBottom: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 3,
    borderColor: "rgba(34, 197, 94, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#22c55e",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: "#22c55e",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  trackButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  trackButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  decorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  circle1: {
    top: 50,
    left: 20,
    width: 80,
    height: 80,
  },
  circle2: {
    bottom: 100,
    right: 30,
    width: 60,
    height: 60,
  },
  circle3: {
    top: 200,
    right: 50,
    width: 100,
    height: 100,
  },
});

export default PaymentSuccess;
