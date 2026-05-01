import React, { useContext, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

// 1. Import ONLY from "firebase/auth" (The Web SDK)
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

// 2. Import your existing Web auth object
import { PopupContext } from "@/PopupProvider";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Image } from "expo-image";
import { ThemedText } from "../components/themed-text";
import { auth } from "../firebaseConfig";
import Loader from "../Loader";
import ButtonComponent from "./ButtonComponent";

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { customAlert } = useContext(PopupContext);
  // This ref acts as the "appVerifier" that Firebase demands
  const recaptchaVerifier = useRef<any>(null);

  // STEP 1: Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    // Prevent argument-error: Check if the verifier is actually ready
    if (!recaptchaVerifier.current) {
      customAlert("Wait", "Recaptcha is loading, please wait a second.");
      setLoading(false);
      return;
    }

    const phoneNumberWithCode = "+91" + phoneNumber;
    // Prevent argument-error: Ensure phone number is formatted perfectly
    const cleanNumber = phoneNumberWithCode.replace(/[\s-]/g, "");
    if (!cleanNumber.startsWith("+")) {
      customAlert(
        "Error",
        "Phone number must start with a + (e.g., +919876543210)",
      );
      setLoading(false);

      return;
    }

    try {
      const phoneProvider = new PhoneAuthProvider(auth);

      // Pass the cleaned string and the modal's current ref
      const vid = await phoneProvider.verifyPhoneNumber(
        cleanNumber,
        recaptchaVerifier.current,
      );

      setVerificationId(vid);
      setLoading(false);
      customAlert("Success", "OTP sent to your phone!");
    } catch (error: any) {
      setLoading(false);
      console.log("Send OTP Error:", error.message);
      customAlert("Error", error.message);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async () => {
    setLoading(false);

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode,
      );
      await signInWithCredential(auth, credential);
      customAlert("Success", "User signed in successfully!");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      console.log("Verify OTP Error:", error.message);
      customAlert("Error", "Invalid OTP code.");
    }
  };

  // return (
  //   <ThemedView style={styles.container}>
  //     {/* This Modal creates a hidden WebView to satisfy the Web SDK's
  //       requirement for a DOM/Document.
  //     */}
  //     <FirebaseRecaptchaVerifierModal
  //       ref={recaptchaVerifier}
  //       firebaseConfig={auth.app.options}
  //       // attemptInvisibleVerification={true} // <-- Uncomment this to try making it completely invisible
  //     />

  //     <ThemedText type="title" style={{ marginBottom: 20 }}>
  //       Login
  //     </ThemedText>

  //     {!verificationId ? (
  //       <>
  //         <TextInput
  //           style={styles.input}
  //           placeholder="+91 9876543210"
  //           placeholderTextColor="#888"
  //           keyboardType="phone-pad"
  //           value={phoneNumber}
  //           onChangeText={setPhoneNumber}
  //         />
  //         <Button title="Get Verification Code" onPress={handleSendOTP} />
  //       </>
  //     ) : (
  //       <>
  //         <TextInput
  //           style={styles.input}
  //           placeholder="123456"
  //           placeholderTextColor="#888"
  //           keyboardType="number-pad"
  //           value={verificationCode}
  //           onChangeText={setVerificationCode}
  //         />
  //         <Button title="Confirm OTP" onPress={handleVerifyOTP} />
  //       </>
  //     )}
  //   </ThemedView>
  // );

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        // attemptInvisibleVerification={true} // <-- Uncomment this to try making it completely invisible
      />

      {loading && <Loader />}
      {/* GIF Background */}
      <Image
        source={require("../video.gif")}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
        contentFit="cover"
        recyclingKey="bg-gif"
      />

      {/* Gradient Overlay */}
      {/* <LinearGradient
        colors={[
          "rgba(10, 10, 10, 0.8)",
          "rgba(45, 243, 23, 0.5)",
          // "rgba(10, 10, 10, 0.9)",
          "rgba(23, 23, 23, 0.8)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      /> */}

      {/* UI Layer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            Login with Mobile
          </ThemedText>

          {!verificationId ? (
            <>
              <TextInput
                placeholder="Enter Phone Number without +91"
                onChangeText={setPhoneNumber}
                maxLength={50}
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="number-pad"
                autoCapitalize="none"
                // --- The OS Triggers ---
                textContentType="username" // iOS
                autoComplete="tel"
              />

              <View style={{ height: 10 }} />

              <View style={styles.buttonContainer}>
                <ButtonComponent
                  onPress={() => {
                    // handleLogin();
                    handleSendOTP();
                  }}
                  text="GET OTP"
                />
              </View>
            </>
          ) : (
            <>
              <TextInput
                value={verificationCode}
                placeholder="Enter OTP Recieved"
                onChangeText={setVerificationCode}
                maxLength={6}
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="decimal-pad"
                autoCapitalize="none"
                // --- The OS Triggers ---
                textContentType="oneTimeCode" // iOS
                autoComplete="sms-otp"
              />

              <View style={{ height: 10 }} />

              <View style={styles.buttonContainer}>
                <ButtonComponent
                  onPress={() => {
                    // handleLogin();
                    handleVerifyOTP();
                  }}
                  text="VERIFY OTP"
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  keyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(23, 23, 23, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
});

export default PhoneLogin;
