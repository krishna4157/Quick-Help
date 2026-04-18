import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const createBooking = async (providerId, serviceDetails) => {
  try {
    // Get the currently logged-in user's ID
    const userId = auth.currentUser.uid;

    const bookingData = {
      customerId: userId,
      providerId: providerId,
      status: "pending", // pending, accepted, completed, cancelled
      details: serviceDetails, // e.g., "Leaky pipe in kitchen"
      createdAt: serverTimestamp(), // Let Google's servers handle the exact time
    };

    // addDoc auto-generates a unique ID for this booking
    const docRef = await addDoc(collection(db, "bookings"), bookingData);
    console.log("Booking created with ID: ", docRef.id);
  } catch (error) {
    console.error("Error creating booking: ", error);
  }
};
