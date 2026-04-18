import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Example Usage: triggerTargetedNotifications("Care Taker", "New Job Available!", "A customer needs a Care Taker nearby.")
export const triggerTargetedNotifications = async (
  targetWorkType,
  title,
  bodyMessage,
) => {
  try {
    if (targetWorkType === undefined || targetWorkType === null) {
      console.error("Trigger Failed: targetWorkType is undefined or null.");
      alert("System Error: Work type is missing.");
      return;
    }
    // 1. Query Firestore for specific workers
    const providersRef = collection(db, "providers");
    const q = query(providersRef, where("workType", "==", targetWorkType));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No ${targetWorkType}s found to notify.`);
      return;
    }

    // 2. Build the notification payload array
    let messages = [];
    querySnapshot.forEach((doc) => {
      const worker = doc.data();

      // Ensure the worker actually has a valid Expo push token
      if (worker.pushToken && worker.pushToken.includes("ExponentPushToken")) {
        messages.push({
          to: worker.pushToken,
          sound: "default",
          title: title,
          body: bodyMessage,
          data: { targetType: targetWorkType }, // Optional invisible data
        });
      }
    });

    if (messages.length === 0) {
      console.log("Found workers, but none have valid push tokens.");
      return;
    }

    // 3. Send the bulk push request to Expo
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log("Push notifications sent successfully:", result);
    alert(`Successfully notified ${messages.length} ${targetWorkType}(s)!`);
  } catch (error) {
    console.error("Error triggering notifications:", error);
    alert("Failed to send notifications.");
  }
};
