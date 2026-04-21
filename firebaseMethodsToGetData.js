import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export const getAvailableProviders = async (serviceType) => {
  try {
    const providersRef = collection(db, "providers");
    // Query: Find providers where role is 'plumber' and they are available
    let q;
    if (serviceType === undefined || serviceType === null) {
      q = query(
        providersRef,
        // Use 'in' to match multiple values
        // where("workType", "in", serviceType),
        where("isAvailable", "==", true),
      );
    } else {
      q = query(
        providersRef,
        // Use 'in' to match multiple values
        where("workType", "in", serviceType),
        where("isAvailable", "==", true),
      );
    }

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

export const getAvailableProvidersThatAreNotVerified = async (serviceType) => {
  try {
    const providersRef = collection(db, "providers");
    // Query: Find providers where role is 'plumber' and they are available
    let q;
    if (serviceType === undefined || serviceType === null) {
      q = query(
        providersRef,
        // Use 'in' to match multiple values
        where("verified", "==", false),
        where("isAvailable", "==", true),
      );
    } else {
      q = query(
        providersRef,
        // Use 'in' to match multiple values
        where("workType", "in", serviceType),
        where("isAvailable", "==", true),
      );
    }

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

export const getAvailableOrders = async (serviceType) => {
  try {
    const ordersRef = collection(db, "orders");
    // Query: Find orders where status is 'Available'
    let q;
    if (serviceType === undefined || serviceType === null) {
      q = query(
        ordersRef,
        // Use 'in' to match multiple values
        // where("workType", "in", serviceType),
        // where("isAvailable", "==", true),
      );
    } else {
      q = query(
        ordersRef,
        // Use 'in' to match multiple values
        where("workType", "in", serviceType),
        where("isAvailable", "==", true),
      );
    }

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

export const getAvailableOrdersByEmail = async (serviceType) => {
  try {
    const ordersRef = collection(db, "orders");
    // Query: Find orders where status is 'Available'
    let q;
    if (serviceType === undefined || serviceType === null) {
      q = query(
        ordersRef,
        // Use 'in' to match multiple values
        where("customerId", "==", auth.currentUser.email),
        // where("isAvailable", "==", true),
      );
    } else {
      q = query(
        ordersRef,

        // Use 'in' to match multiple values
        where("workType", "in", serviceType),
        where("customerId", "==", auth.currentUser.email),
        where("isAvailable", "==", true),
      );
    }

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

export const updateWorkerData = async (mailId, updatedData) => {
  // const q = query(collection(db, "providers"), where("email", "==", mailId));
  // const querySnapshot = await getDocs(q);

  // if (querySnapshot.empty) {
  //   throw new Error("No worker found with this email");
  // }

  // // We assume email is unique, so we take the first doc found
  // const docRef = querySnapshot.docs[0].ref;
  try {
    const workerRef = doc(db, "providers", mailId);

    // updateDoc is already a Promise, just await it directly!
    await updateDoc(workerRef, updatedData);

    console.log("Firestore updated successfully");
    return true; // This acts like your resolve(true)
  } catch (error) {
    console.error("Firestore update failed:", error);
    throw error; // This acts like your reject(error)
  }
};

export const saveOrders = async (orderData, orderId) => {
  try {
    // 3. SAVE TO FIRESTORE
    // const workerData = orderData;

    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, {
      ...orderData,
      // customerId: "customer@email.com", // Link it to the user here!
      // paymentSuccessTransactionId: "",
    });
    alert("Order saved to Firestore with ID: " + orderId);
    // await setDoc(doc(db, "orders", emailToLowerCase), workerData);
    // setLoading(false);
    // alert(t("alerts.success"), t("alerts.profileSavedSuccessfully"));
  } catch (error) {
    alert("Error saving order: " + JSON.stringify(error));
    // setLoading(false);
    console.error("Upload error:", error);
    // alert(t("alerts.error"), t("workerRegistration.saveFailed"));
  }
};

export const assignOrderToWorker = async (workerEmail, orderId) => {
  // 1. Initialize a batch
  const batch = writeBatch(db);

  try {
    // 2. Setup the Worker Update
    // Assuming workers are in a "providers" collection and the doc ID is the email or a known ID
    // (If your doc ID is NOT the email, you'll need to query for the docRef first like you did before)
    const workerRef = doc(db, "providers", workerEmail);

    batch.update(workerRef, {
      assigned: true,
      currentOrderId: orderId, // Link Order to Worker
    });

    // 3. Setup the Order Update
    const orderRef = doc(db, "orders", orderId);

    batch.update(orderRef, {
      workerAssigned: workerEmail, // Link Worker to Order
      orderStatus: "Assigned",
    });

    // 4. Commit the batch (Executes both updates atomically)
    await batch.commit();

    console.log("Successfully linked Worker and Order!");
    return true;
  } catch (error) {
    console.error("Batch write failed: ", error);
    return false;
    // throw error;
  }
};

// export default { getAvailableProviders, updateWorkerData };
