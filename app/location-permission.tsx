import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { auth } from "../firebaseConfig";
import { userActions } from "../store/actions/slices/userSlice";

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
      const currentUser = auth.currentUser;

      // Store user data in Redux
      const userData = {
        uid: currentUser?.uid,
        email: currentUser?.email,
        displayName: currentUser?.displayName,
        photoURL: currentUser?.photoURL,
        mobileNumber: null,
        location: {
          cityName: cityName,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        biometricEnabled: false,
      };

      dispatch(userActions.setUserData(userData));

      // Store location and token in AsyncStorage
      await AsyncStorage.setItem("userToken", "location-granted-token");
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
