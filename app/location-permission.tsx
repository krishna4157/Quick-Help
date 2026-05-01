import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PopupContext } from "@/PopupProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebaseConfig";
import { userActions } from "../store/actions/slices/userSlice";

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const reduxUserData = useSelector((state: any) => state.user.data);
  const { t } = useTranslation();
  const { customAlert } = useContext(PopupContext);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the location icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  function generateRandom(length: number) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const requestPermission = async () => {
    setLoading(true);
    try {
      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        customAlert(
          t("alerts.permissionDenied"),
          t("alerts.locationRequired"),
          [{ text: t("alerts.ok") }],
        );
        setLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { coords } = location;

      // Reverse geocode to get city name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const cityName =
        reverseGeocode[0]?.city ||
        reverseGeocode[0]?.district ||
        "Unknown Location";

      // Use persistent pin/referral from Redux, merge location
      const updatedUserData = {
        ...reduxUserData,
        uid: auth.currentUser?.uid,
        // email: auth.currentUser?.email,
        // displayName: auth.currentUser?.displayName,
        photoURL: auth.currentUser?.photoURL,
        mobileNumber:
          reduxUserData?.mobileNumber ?? reduxUserData?.phoneNumber ?? "",
        location: {
          cityName: cityName,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        biometricEnabled: reduxUserData?.biometricEnabled ?? false,
        // pin and referralCode from login/Firestore, not regenerated
      };

      dispatch(userActions.setUserData(updatedUserData));
      console.log(
        "Updated user data with location (pin/referral persistent):",
        updatedUserData.pin,
        updatedUserData.referralCode,
      );

      // Store full user data and location in AsyncStorage (Redux persists too)
      await AsyncStorage.setItem("userToken", "location-granted-token");
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
      await AsyncStorage.setItem(
        "userLocation",
        JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          cityName: cityName,
        }),
      );

      navigation.navigate("tab-layout");
    } catch (error) {
      console.error("Location error:", error);
      customAlert(t("alerts.error"), t("alerts.failedToGetLocation"));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: "map-marker",
      title: t("location.nearbyServices") || "Find Nearby Services",
      desc:
        t("location.nearbyServicesDesc") ||
        "Discover trusted professionals in your area",
    },
    {
      icon: "truck",
      title: t("location.liveTracking") || "Live Delivery Tracking",
      desc:
        t("location.liveTrackingDesc") ||
        "Track your service provider in real-time",
    },
    {
      icon: "clock-o",
      title: t("location.fasterService") || "Faster Service",
      desc:
        t("location.fasterServiceDesc") ||
        "Get connected to the nearest available expert",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Animated Location Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <FontAwesome name="location-arrow" size={48} color="#fff" />
            </Animated.View>
          </LinearGradient>
          {/* Ripple rings */}
          <View style={[styles.rippleRing, styles.rippleRing1]} />
          <View style={[styles.rippleRing, styles.rippleRing2]} />
        </View>

        {/* Title & Description */}
        <ThemedText type="title" style={styles.title}>
          {t("location.enableLocation")}
        </ThemedText>
        <ThemedText style={styles.description}>
          {t("location.locationDesc")}
        </ThemedText>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          {benefits.map((item, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitIconWrapper}>
                <FontAwesome
                  name={item.icon as any}
                  size={18}
                  color="#667eea"
                />
              </View>
              <View style={styles.benefitTextWrapper}>
                <ThemedText style={styles.benefitTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.benefitDesc}>{item.desc}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <FontAwesome name="shield" size={14} color="#10b981" />
          <ThemedText style={styles.trustText}>
            {t("location.privacyNote") ||
              "Your location is only used to find nearby services"}
          </ThemedText>
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={requestPermission}
          disabled={loading}
          style={({ pressed }) => [
            styles.buttonWrapper,
            pressed && !loading && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <ThemedText style={styles.buttonText}>
                  {t("location.allowAccess")}
                </ThemedText>
                <FontAwesome
                  name="arrow-right"
                  size={16}
                  color="#fff"
                  style={styles.buttonIcon}
                />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 2,
  },
  rippleRing: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.25)",
    zIndex: 1,
  },
  rippleRing1: {
    width: 130,
    height: 130,
  },
  rippleRing2: {
    width: 160,
    height: 160,
    borderColor: "rgba(102, 126, 234, 0.12)",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
    paddingHorizontal: 8,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 28,
    gap: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.06)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.12)",
  },
  benefitIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  benefitTextWrapper: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    marginBottom: 2,
  },
  benefitDesc: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 18,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  trustText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 25,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
