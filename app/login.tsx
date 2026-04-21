import { ThemedText } from "@/components/themed-text";
import { getUserData, login } from "@/firebaseMethods";
import Loader from "@/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { PopupContext } from "../PopupProvider";
import { userActions } from "../store/actions/slices/userSlice";
import ButtonComponent from "./ButtonComponent";
const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  GoogleSignin.configure({
    // This must MATCH the Web client ID from the Firebase Console exactly
    webClientId:
      "537567428840-d5gg04dr5uml8pdn3v1d6q63pn67qiqn.apps.googleusercontent.com",
  });

  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isRegisterFlow, setIsRegisterFlow] = React.useState(false);
  const ui = useSelector((state: any) => state);
  const { showPopup } = useContext(PopupContext);

  const navigation = useNavigation<any>();

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "te" : "en";
    setLoading(true);
    setTimeout(() => {
      i18n.changeLanguage(newLang).then(() => {
        setLoading(false);
      }); // This one line updates the WHOLE app
    }, 2000);
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response) {
        alert(
          "Google Sign-In successful! Welcome, " + JSON.stringify(response),
        );
        // setUserName(response?.data);
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      alert("Google Sign-In error: " + JSON.stringify(error));
      // if (isErrorWithCode(error)) {
      // switch (error?.code) {
      // case statusCodes.IN_PROGRESS:
      //   // operation (eg. sign in) already in progress
      //   break;
      // case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      //   // Android only, play services not available or outdated
      //   break;
      // default:
      // some other error happened
      // }
    }
  };

  const dispatch = useDispatch();

  const handleLogin = useCallback(
    async (firebaseUser: any) => {
      try {
        await AsyncStorage.setItem("userToken", "login-token");

        // Fetch and set user data from Firestore to Redux
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          dispatch(userActions.setUserData(userData));
          console.log("User data loaded to Redux:", userData);
        }
      } catch (e) {
        console.error("Failed to set token or load user data", e);
      }
      navigation.navigate("location-permission");
    },
    [dispatch, navigation],
  );

  const currentLanguage = i18n.language;
  const isEnglish = currentLanguage === "en";

  return (
    <View style={styles.container}>
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
            {isRegisterFlow ? t("auth.createAccount") : t("auth.welcomeBack")}
          </ThemedText>

          <TextInput
            placeholder={t("placeholders.email")}
            onChangeText={(e) => {
              setUserName(e);
            }}
            maxLength={50}
            style={styles.input}
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            // --- The OS Triggers ---
            textContentType="username" // iOS
            autoComplete="email"
          />

          <TextInput
            maxLength={50}
            placeholder={
              isRegisterFlow
                ? t("placeholders.newPassword")
                : t("placeholders.password")
            }
            onChangeText={(e) => {
              setPassword(e);
            }}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
            // --- The OS Triggers ---
            textContentType="password" // iOS
            autoComplete="password" // Android
          />
          {isRegisterFlow && (
            <TextInput
              maxLength={50}
              placeholder={t("placeholders.reEnterPassword")}
              onChangeText={(e) => {
                setPassword(e);
              }}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#888"
            />
          )}

          <View style={{ height: 10 }} />
          <View style={styles.buttonContainer}>
            {!isRegisterFlow && (
              <ButtonComponent
                onPress={() => {
                  if (!userName || !password) {
                    showPopup("title", t("alerts.pleaseEnterUserPassword"), [
                      {
                        title: "OK",
                        onPress: (e: any) => e.close(),
                      },
                    ]);
                    // alert();
                    return;
                  }
                  setLoading(true);
                  login(userName, password)
                    .then((val) => {
                      handleLogin(val);
                      setLoading(false);
                    })
                    .catch((error) => {
                      setLoading(false);
                      alert(t("alerts.loginFailed") + error);
                    });
                }}
                text={t("auth.login")}
              />
            )}
            <View style={{ marginTop: 10 }} />
            {isRegisterFlow ? (
              <ButtonComponent
                onPress={() => {
                  alert("State Values : " + JSON.stringify(ui));
                  return;
                  // if (!userName || !password) {
                  //   alert(t("alerts.pleaseEnterEmailPassword"));
                  //   return;
                  // }
                  // setLoading(true);
                  // signup(userName, password)
                  //   .then((val) => {
                  //     setLoading(false);
                  //     setIsRegisterFlow(false);
                  //     alert(t("alerts.loggedInSuccessfully") + val);
                  //   })
                  //   .catch((error) => {
                  //     setLoading(false);
                  //     alert(t("alerts.loginFailed") + error);
                  //   });
                }}
                color="green"
                text={t("auth.register")}
              />
            ) : (
              <Pressable
                style={{
                  width: 200,
                  height: 50,
                  borderRadius: 18,
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "grey",
                  backgroundColor: "#171717",
                }}
                onPress={() => {
                  setIsRegisterFlow(true);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  {t("auth.signup")}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                // navigation.navigate("");
                navigation.navigate("worker-registration");
              }}
            >
              <ThemedText
                type="default"
                style={{ fontSize: 20, marginTop: 20 }}
              >
                {t("auth.joinUs")}
              </ThemedText>
            </Pressable>
            <GoogleSigninButton
              onPress={signInWithGoogle}
              style={{ borderRadius: 20, width: 160, marginTop: 10 }}
            />
            <Pressable style={{ marginTop: 10 }} onPress={toggleLanguage}>
              <ThemedText type="link">
                {isEnglish
                  ? "భాషను తెలుగులోకి మార్చండి"
                  : "Change Language to English"}
              </ThemedText>
            </Pressable>
          </View>
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

export default LoginScreen;
