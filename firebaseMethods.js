import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
// import {  } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
      saveUserData(userCredential.user);
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

const saveUserData = async (user) => {
  const userRef = doc(db, "users", user.uid);

  // Get existing data
  const docSnap = await getDoc(userRef);
  let userData = docSnap.exists() ? docSnap.data() : {};

  // Merge basic info
  userData.email = user.email;
  userData.loggedAt = new Date();

  // Generate pin and referralCode only if not present
  if (!userData.pin) {
    const pin = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    userData.pin = pin;
    console.log("Generated new pin:", pin);
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
