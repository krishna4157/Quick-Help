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
  alert("Fetched user data for UID: " + uid);
  if (docSnap.exists()) {
    console.log("User data:", docSnap.data());
  }
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
  alert("Saving user data for UID: " + user.uid);
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    loggedAt: new Date(),
  });
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
