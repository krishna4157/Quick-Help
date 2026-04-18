import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// ==
//
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC4sLKB9HuUF9R3I8JDHkp_2yWarRfvS9I",
//   authDomain: "deliveryapp-api-5b082.firebaseapp.com",
//   projectId: "deliveryapp-api-5b082",
//   storageBucket: "deliveryapp-api-5b082.firebasestorage.app",
//   messagingSenderId: "537567428840",
//   appId: "1:537567428840:web:7d8b33862d9223a606c95d",
//   measurementId: "G-CZRBWZNWXC"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
//

const firebaseConfig = {
  apiKey: "AIzaSyC4sLKB9HuUF9R3I8JDHkp_2yWarRfvS9I",
  authDomain: "deliveryapp-api-5b082.firebaseapp.com",
  projectId: "deliveryapp-api-5b082",
  storageBucket: "deliveryapp-api-5b082.firebasestorage.app",
  messagingSenderId: "537567428840",
  appId: "1:537567428840:web:7d8b33862d9223a606c95d",
  measurementId: "G-CZRBWZNWXC",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence so the session is saved locally
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
// export const storage = getStorage(app);
