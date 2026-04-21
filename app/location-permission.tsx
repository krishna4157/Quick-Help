import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebaseConfig";
import { userActions } from "../store/actions/slices/userSlice";

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const reduxUserData = useSelector((state: any) => state.user.data);
  const { t } = useTranslation();

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
        Alert.alert(
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
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
        photoURL: auth.currentUser?.photoURL,
        mobileNumber: reduxUserData?.mobileNumber ?? null,
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
      Alert.alert(t("alerts.error"), t("alerts.failedToGetLocation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {t("location.enableLocation")}
      </ThemedText>
      <ThemedText style={styles.description}>
        {t("location.locationDesc")}
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? t("common.requesting") : t("location.allowAccess")}
          onPress={requestPermission}
          disabled={loading}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { marginBottom: 20, textAlign: "center" },
  description: { textAlign: "center", marginBottom: 40, fontSize: 16 },
  buttonContainer: {
    marginTop: 20,
  },
});
