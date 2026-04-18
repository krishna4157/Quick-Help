import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

const getAvailableProviders = async (serviceType) => {
  try {
    const providersRef = collection(db, "providers");
    // Query: Find providers where role is 'plumber' and they are available
    const q = query(
      providersRef,
      // Use 'in' to match multiple values
      where("workType", "in", serviceType),
      where("isAvailable", "==", true),
    );

    const querySnapshot = await getDocs(q);
    const providersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return providersList; // Set this to your React Native state
  } catch (error) {
    console.error("Error fetching providers: ", error);
  }
};

export default getAvailableProviders;
