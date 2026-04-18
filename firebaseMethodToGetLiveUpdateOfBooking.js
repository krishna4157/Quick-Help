import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";

const listenToBookingStatus = (bookingId) => {
  const unsub = onSnapshot(doc(db, "bookings", bookingId), (doc) => {
    if (doc.exists()) {
      console.log("Current status: ", doc.data().status);
      // Update your UI here (e.g., change pending -> accepted)
    }
  });

  // Call unsub() when the component unmounts to prevent memory leaks!
  return unsub;
};
