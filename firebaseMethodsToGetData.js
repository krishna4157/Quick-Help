import {
  collection,
  doc,
  getDoc,
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
    // const providersList = querySnapshot.docs.map((doc) => ({
    //   id: doc.id,
    //   ...doc.data(),
    // }));

    const providersList = querySnapshot.docs.map((doc) => ({
      ...doc.data(), // 1. Put the document data first
      id: doc.id, // 2. Force the ID to be the real Firestore Document ID
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

export const assignOrderToWorker = async (workerEmail, newOrderId) => {
  const batch = writeBatch(db);

  try {
    const workerRef = doc(db, "providers", workerEmail);
    const newOrderRef = doc(db, "orders", newOrderId);

    // 1. Fetch the worker's CURRENT state before making changes
    const workerSnap = await getDoc(workerRef);
    if (!workerSnap.exists()) {
      console.error("Worker not found");
      return false;
    }

    const workerData = workerSnap.data();
    const previousOrderId = workerData.currentOrderId;

    // 2. Are they already assigned to this exact order?
    // If yes, do nothing and return.
    if (previousOrderId === newOrderId) {
      console.log("Worker is already assigned to this order.");
      return true;
    }

    // 3. UN-ASSIGN THE OLD ORDER (The Missing Logic!)
    // If the worker had a previous order, put it back in the pool
    if (previousOrderId) {
      const oldOrderRef = doc(db, "orders", previousOrderId);
      batch.update(oldOrderRef, {
        workerAssigned: "", // Remove the worker's email
        orderStatus: "Pending", // Make it available for others again
      });
      console.log(
        `Unassigned order ${previousOrderId} and returning it to pool.`,
      );
    }

    // 4. ASSIGN THE NEW ORDER
    batch.update(newOrderRef, {
      workerAssigned: workerEmail,
      orderStatus: "Assigned",
    });

    // 5. UPDATE THE WORKER
    batch.update(workerRef, {
      assigned: true,
      currentOrderId: newOrderId,
    });

    // 6. Execute all 3 updates simultaneously
    await batch.commit();

    console.log("Successfully swapped/linked Worker and Order!");
    return true;
  } catch (error) {
    console.error("Batch write failed: ", error);
    return false;
  }
};

export const completeOrder = async (orderId, workerEmail) => {
  const batch = writeBatch(db);

  try {
    const orderRef = doc(db, "orders", orderId);
    const workerRef = doc(db, "providers", workerEmail);

    // 1. Update order status to "Completed"
    batch.update(orderRef, {
      orderStatus: "Completed",
    });

    // 2. Update worker - mark as not assigned and available again
    batch.update(workerRef, {
      assigned: false,
      isAvailable: true,
      currentOrderId: "", // Clear the current order
    });

    // 3. Execute both updates simultaneously
    await batch.commit();

    console.log("Order marked as completed successfully!");
    return true;
  } catch (error) {
    console.error("Failed to complete order: ", error);
    return false;
  }
};

export const getAvailableServices = async (categories) => {
  try {
    const servicesRef = collection(db, "services");
    let q;

    // If categories is provided (string or array), filter by category
    if (
      categories !== undefined &&
      categories !== null &&
      (Array.isArray(categories) ? categories.length > 0 : categories !== "")
    ) {
      // Normalize to array for consistent handling
      const categoryArray = Array.isArray(categories)
        ? categories
        : [categories];
      q = query(servicesRef, where("category", "in", categoryArray));
    } else {
      // No filter - return all services
      q = query(servicesRef);
    }

    const querySnapshot = await getDocs(q);
    const servicesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return servicesList;
  } catch (error) {
    console.error("Error fetching services: ", error);
    return [];
  }
};
