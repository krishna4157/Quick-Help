import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateEmail,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
// import {  } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { registerForPushNotificationsAsync } from "./firebaseMethodToGetPushNotificationToken";
// const signup = (email, password) =>
//   createUserWithEmailAndPassword(auth, email, password);

// const login = (email, password) =>
//   signInWithEmailAndPassword(auth, email, password);

const logout = () => signOut(auth);

const signup = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      alert("User created successfully!");
      // Save user data with welcome bonus
      await saveUserData(userCredential.user);
      resolve(userCredential.user);
      console.log("User:", userCredential.user);
    } catch (error) {
      reject(error.message);
      alert(JSON.stringify(error.message));

      console.log(error.message);
    }
  });
};

const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("User data:", docSnap.data());
    return { id: uid, ...docSnap.data() };
  }
  return null;
};

const login = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      alert("Logged in successfully!");
      console.log("Logged in:", userCredential.user);
      // Wait for saveUserData to complete before resolving
      await saveUserData(userCredential.user);
      resolve(userCredential.user);
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        reject("User not found");
      } else if (error.code === "auth/invalid-credential") {
        reject("Invalid Username or Password");
      } else {
        reject(error.message);
      }
      alert(JSON.stringify(error.message));
      console.log(error.message);
    }
  });
};

export const handleTruecallerSuccess = async (
  tcData,
  setLoading,
  handleLogin,
) => {
  try {
    setLoading(true);
    alert("Handling Truecaller success with data: " + JSON.stringify(tcData));

    // 1. Generate a valid Firebase session using the Web SDK
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    // 2. Get the current device's Push Token
    // (Crucial if they log in on a new phone!)
    let token = "";
    try {
      const tokenData = await registerForPushNotificationsAsync();
      token = tokenData;
    } catch (e) {
      console.log("Could not fetch push token during login", e);
    }

    // 2. Save the Truecaller payload to Firestore
    const userRef = doc(db, "users", tcData.email);
    await setDoc(
      userRef,
      {
        uid: firebaseUser.uid,
        displayName: tcData.firstName + " " + tcData.lastName,
        firstName: tcData.firstName || "",
        lastName: tcData.lastName || "",
        email: tcData.email || "",
        phoneNumber: tcData.phoneNumber || "", // Populates once whitelisted
        loginMethod: "truecaller",
        pushToken: token,
        updatedAt: serverTimestamp(), // Use serverTimestamp() if you want Firestore to set the time on the server
      },
      { merge: true },
    );

    // 3. Trigger your existing Redux/Navigation flow
    await handleLogin(firebaseUser);
  } catch (error) {
    console.error("Truecaller Firebase Error:", error);
    alert(t("alerts.loginFailed") + " " + error.message);
  } finally {
    setLoading(false);
  }
};

// export const processTruecallerAuth = async (tcProfile, handleLoginCallback) => {
//   try {
//     // 1. Authenticate with Firebase
//     // Using Anonymous auth to generate a valid Firebase UID for Firestore
//     const userCredential = await signInAnonymously(auth);
//     const firebaseUser = userCredential.user;

//     if (tcProfile.email) {
//       try {
//         await updateEmail(firebaseUser, tcProfile.email);
//       } catch (emailError) {
//         console.warn("Could not attach email to Auth object:", emailError);
//       }
//     }

//     // 2. Check if this is a Login or a Signup
//     const userRef = doc(db, "users", firebaseUser.uid);
//     const userSnap = await getDoc(userRef);

//     const isFirstTimeSignup = !userSnap.exists();

//     // 3. Save/Merge data to Firestore
//     await syncTruecallerDataToFirestore(firebaseUser.uid, tcProfile);

//     // 4. Trigger your existing Redux and Navigation flow
//     // You can pass the isFirstTimeSignup boolean if you want to navigate
//     // them to a different screen (like worker-registration) inside handleLogin
//     await handleLoginCallback(firebaseUser, isFirstTimeSignup);
//   } catch (error) {
//     console.error("Truecaller Login Error:", error);
//     alert("Could not complete Truecaller login.");
//   }
// };
export const processTruecallerAuth = async (tcProfile, handleLoginCallback) => {
  try {
    // 1. Authenticate with Firebase (Anonymous Auth gives a random UID)
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    if (tcProfile.email) {
      try {
        await updateEmail(firebaseUser, tcProfile.email);
      } catch (emailError) {
        console.warn("Could not attach email to Auth object:", emailError);
      }
    }

    // 2. CRITICAL FIX: Format the email to use as the Document ID
    const emailAsId = tcProfile.email.toLowerCase().trim();

    // 3. FIX: Check if user exists using the EMAIL, not the random UID!
    const userRef = doc(db, "users", emailAsId);
    const userSnap = await getDoc(userRef);

    const isFirstTimeSignup = !userSnap.exists();

    // 4. Save/Merge data to Firestore
    // (This calls your function which uses the emailAsId securely)
    await syncTruecallerDataToFirestore(firebaseUser.uid, tcProfile);

    // 5. Trigger your Redux/Navigation flow
    // Pass emailAsId (document ID) so handleLogin can fetch correct user data
    await handleLoginCallback(firebaseUser, isFirstTimeSignup, emailAsId);
  } catch (error) {
    console.error("Truecaller Login Error:", error);
    alert("Could not complete Truecaller login.");
  }
};

const syncTruecallerDataToFirestore = async (uid, tcProfile) => {
  // const userRef = doc(db, "users", uid);
  const emailAsId = tcProfile.email.toLowerCase().trim();

  // 3. Use the EMAIL as the Document ID, not the UID
  const userRef = doc(db, "users", emailAsId);

  let token = "";
  try {
    const pushToken = await registerForPushNotificationsAsync();
    token = pushToken;
  } catch (e) {
    console.log("Could not fetch push token during login", e);
  }
  // Map the keys exactly as the @ajitpatel28 wrapper outputs them
  const userData = {
    uid: uid,
    phoneNumber: tcProfile.phoneNumber || "",
    firstName: tcProfile.firstName || "",
    lastName: tcProfile.lastName || "",
    email: tcProfile.email || "",
    loginMethod: "truecaller",
    updatedAt: serverTimestamp(),
    pushToken: token,
  };

  // { merge: true } elegantly handles both Signups and Logins.
  // If it's a new user, it creates the doc. If returning, it updates the updatedAt stamp.
  await setDoc(userRef, userData, { merge: true });
};

const saveUserData = async (user) => {
  // Handle both string and object user references
  const userId = typeof user === "string" ? user : user.email;
  const userRef = doc(db, "users", userId);

  // Get existing data
  const docSnap = await getDoc(userRef);
  let userData = docSnap.exists() ? docSnap.data() : {};

  // Merge basic info
  userData.email = user.email || userData.email;
  userData.loggedAt = new Date();

  // Generate pin and referralCode only if not present
  if (!userData.pin) {
    const pin = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    userData.pin = pin;
    console.log("Generated new pin:", pin);
  }

  // 2. Get the current device's Push Token
  // (Crucial if they log in on a new phone!)
  let token = "";
  try {
    const tokenData = await registerForPushNotificationsAsync();
    token = tokenData;
  } catch (e) {
    console.log("Could not fetch push token during login", e);
  }

  // 3. Update their Firestore document with the latest token
  if (token) {
    // await updateDoc(doc(db, "users", emailAsId), {
    //   pushToken: token
    // });
    userData.pushToken = token;
  }

  if (!userData.referralCode) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let referralCode = "";
    for (let i = 0; i < 6; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    userData.referralCode = referralCode;
    console.log("Generated new referralCode:", referralCode);
  }

  // Add walletBalance 250 for new users only
  if (typeof userData.walletBalance === "undefined") {
    userData.walletBalance = 250;
    console.log("Generated new walletBalance: 250 coins");
  }
  console.log("USER DATA : ", userData);

  alert(
    "Saving user data for UID: " +
      user.uid +
      " with pin: " +
      userData.pin +
      ", referral: " +
      userData.referralCode,
  );

  await setDoc(userRef, userData);
};

export { getUserData, login, logout, saveUserData, signup };

//
// useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (user) {
//       console.log("User logged in:", user.uid);
//     } else {
//       console.log("No user");
//     }
//   });

//   return unsubscribe;
// }, []);
//
