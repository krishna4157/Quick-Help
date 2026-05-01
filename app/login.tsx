import { ThemedText } from "@/components/themed-text";
import { getUserData, login, processTruecallerAuth } from "@/firebaseMethods";
import Loader from "@/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
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
import TruecallerLoginComponent from "../TrueCallerLoginComponent";
import ButtonComponent from "./ButtonComponent";
const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  GoogleSignin.configure({
    webClientId:
      "537567428840-d5gg04dr5uml8pdn3v1d6q63pn67qiqn.apps.googleusercontent.com",
  });

  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showEmailLogin, setShowEmailLogin] = React.useState(false);
  const [isRegisterFlow, setIsRegisterFlow] = React.useState(false);
  const ui = useSelector((state: any) => state);
  const { customAlert } = useContext(PopupContext);

  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "te" : "en";
    setLoading(true);
    setTimeout(() => {
      i18n.changeLanguage(newLang).then(() => {
        setLoading(false);
      });
    }, 2000);
  };

  const dispatch = useDispatch();

  const handleLogin = useCallback(
    async (
      firebaseUser: any,
      isFirstTimeSignup: boolean = false,
      emailAsId?: string,
    ) => {
      try {
        await AsyncStorage.setItem("userToken", "login-token");
        // Use emailAsId (document ID) for Truecaller, fallback to UID for other methods
        const userId = emailAsId;
        let userData = await getUserData(userId);

        // Check if user is new (no existing data) - add welcome bonus of 250
        if (!userData) {
          userData = {
            id: userId,
            uid: userId,
            email: firebaseUser?.email || emailAsId,
            mobileNumber: firebaseUser?.mobileNumber || null,
            displayName: firebaseUser?.displayName || null,
            walletBalance: 250, // Welcome bonus for new users
            createdAt: new Date().toISOString(),
          };
          console.log("New user detected - adding welcome bonus of 250");

          // Save new user data to Firebase
          const { saveUserData } = await import("@/firebaseMethods");
          await saveUserData(userId);
        }

        dispatch(userActions.setUserData(userData));
        console.log("User data loaded to Redux:", userData);
      } catch (e) {
        console.error("Failed to set token or load user data", e);
      }

      if (isFirstTimeSignup) {
        navigation.navigate("edit-profile");
      } else {
        setLoading(false);
        navigation.navigate("location-permission");
      }
    },
    [dispatch, navigation],
  );

  const currentLanguage = i18n.language;
  const isEnglish = currentLanguage === "en";

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      <Image
        source={require("../video.gif")}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
        contentFit="cover"
        recyclingKey="bg-gif"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            {showEmailLogin
              ? isRegisterFlow
                ? t("auth.createAccount")
                : t("auth.welcomeBack")
              : t("auth.welcomeBack")}
          </ThemedText>

          {showEmailLogin ? (
            <>
              <TextInput
                placeholder={t("placeholders.email")}
                onChangeText={setUserName}
                maxLength={50}
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="username"
                autoComplete="email"
              />

              <TextInput
                maxLength={50}
                placeholder={
                  isRegisterFlow
                    ? t("placeholders.newPassword")
                    : t("placeholders.password")
                }
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#888"
                textContentType="password"
                autoComplete="password"
              />

              {isRegisterFlow && (
                <TextInput
                  maxLength={50}
                  placeholder={t("placeholders.reEnterPassword")}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#888"
                />
              )}

              <View style={{ height: 10 }} />

              {isRegisterFlow ? (
                <ButtonComponent
                  onPress={() => {
                    alert("State Values : " + JSON.stringify(ui));
                  }}
                  color="green"
                  text={t("auth.register")}
                />
              ) : (
                <ButtonComponent
                  onPress={() => {
                    if (!userName || !password) {
                      customAlert(
                        "title",
                        t("alerts.pleaseEnterUserPassword"),
                        [{ title: "OK", onPress: (e: any) => e.close() }],
                      );
                      return;
                    }
                    setLoading(true);
                    login(userName, password)
                      .then((val) => {
                        handleLogin(val);
                        // setLoading(false);
                      })
                      .catch((error) => {
                        setLoading(false);
                        alert(t("alerts.loginFailed") + error);
                      });
                  }}
                  text={t("auth.login")}
                />
              )}

              <Pressable
                style={styles.toggleButton}
                onPress={() => setIsRegisterFlow(!isRegisterFlow)}
              >
                <Text style={styles.toggleText}>
                  {isRegisterFlow
                    ? t("auth.alreadyHaveAccount")
                    : t("auth.dontHaveAccount")}
                  <Text style={styles.toggleTextHighlight}>
                    {isRegisterFlow ? t("auth.login") : t("auth.signup")}
                  </Text>
                </Text>
              </Pressable>

              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setShowEmailLogin(false);
                  setIsRegisterFlow(false);
                }}
              >
                <Text style={styles.backButtonText}>
                  ← {t("auth.backToLoginOptions")}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Truecaller Login */}
              <View style={styles.truecallerContainer}>
                <TruecallerLoginComponent
                  callback={(s: any) => {
                    const obj = {
                      ...s,
                      mobileNumber: s.phoneNumber,
                      displayName: s.firstName + " " + s.lastName,
                      email: s.email,
                    };
                    console.log("Truecaller callback data: ", s);
                    setLoading(true);
                    processTruecallerAuth(obj, handleLogin);
                  }}
                />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {t("auth.orContinueWith")}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login with Email */}
              <Pressable
                style={styles.emailLoginButton}
                onPress={() => setShowEmailLogin(true)}
              >
                <Text style={styles.emailLoginButtonText}>
                  📧 {t("auth.loginWithEmail")}
                </Text>
              </Pressable>
            </>
          )}

          {/* Join Us */}
          <Pressable
            style={styles.joinUsButton}
            onPress={() => navigation.navigate("worker-registration")}
          >
            <Text style={styles.joinUsButtonText}>{t("auth.joinUs")}</Text>
          </Pressable>

          {/* Language Toggle */}
          <Pressable style={styles.languageToggle} onPress={toggleLanguage}>
            <ThemedText type="link">
              {isEnglish
                ? "భాషను తెలుగులోకి మార్చండి"
                : "Change Language to English"}
            </ThemedText>
          </Pressable>
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
  toggleButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  toggleTextHighlight: {
    color: "#fff",
    fontWeight: "600",
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignSelf: "center",
  },
  backButtonText: {
    color: "#888",
    fontSize: 14,
  },
  truecallerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    color: "#888",
    fontSize: 12,
    marginHorizontal: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emailLoginButton: {
    width: "100%",
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 16,
  },
  emailLoginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  joinUsButton: {
    width: "100%",
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginTop: 8,
  },
  joinUsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  languageToggle: {
    marginTop: 20,
    paddingVertical: 8,
    alignSelf: "center",
  },
});

export default LoginScreen;
