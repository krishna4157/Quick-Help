import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Helper: Ask phone for Push Token
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    }).catch((error) => {
      console.error("Error setting notification channel:", error);
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token!");

      return null;
    }

    // IMPORTANT: Replace with your actual Expo Project ID from app.json
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "fe56afcc-171d-49b7-8856-ad44c893baf3",
      }).catch((error) => {
        console.error("Error getting Expo push token:", error);
      })
    ).data;
    // alert("hello");
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}
