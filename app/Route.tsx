// import ThemeProvider from "@/app/ThemeProvider";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFonts } from "expo-font";
// import { Stack, usePathname, useRouter } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";
// import "react-native-reanimated";
// import { auth } from "../firebaseConfig";

// export const unstable_settings = {
//   initialRouteName: "login",
//   anchor: "(tabs)",
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded, error] = useFonts({
//     "Montserrat-ExtraBold": require("../ttf/Montserrat-ExtraBold.ttf"),
//     PlusJakartaSans: require("../ttf/PlusJakartaSans[wght].ttf"),
//     "zillah-modern": require("../ttf/zillah-modern-offset-outline.ttf"),
//   });
//   const navigation = useNavigation<any>();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (loaded || error) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded, error]);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const token = await AsyncStorage.getItem("userToken");
//         if (!token && pathname !== "/login") {
//           router.replace("/login");
//         }
//       } catch (e) {
//         console.error("Auth check failed", e);
//         if (pathname !== "/login") {
//           router.replace("/login");
//         }
//       }
//     };

//     if (loaded) {
//       checkAuth();
//     }
//   }, [loaded, pathname]);

//   if (!loaded && !error) {
//     return null;
//   }

//   const userAuthenticated = auth.currentUser != null;

//   return (
//     <ThemeProvider>
//       <Stack initialRouteName="login">
//         <Stack.Screen name="login" options={{ headerShown: false }} />
//         {/* {userAuthenticated && ( */}

//         <Stack.Screen
//           name="location-permission"
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen
//           name="modal"
//           options={{ presentation: "modal", headerShown: false }}
//         />

//         {/* )} */}
//       </Stack>
//     </ThemeProvider>
//   );
// }
import ThemeProvider from "@/app/ThemeProvider";
import { useColorScheme } from "@/components/themed-color";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { auth } from "../firebaseConfig";
import AdminLayout from "./AdminTabs/TabLayout";
import AIAssistantScreen from "./ai-assistant";
import TabLayout from "./BottomTabs/TabLayout";
import WalletScreen from "./BottomTabs/wallet";
import EditProfile from "./edit-profile";
import LocationPermissionScreen from "./location-permission";
import LoginScreen from "./login";
import PhoneLogin from "./loginviaphn";
import ModalScreen from "./modal";
import PaymentSuccess from "./payment-success";
import ScheduleDetails from "./schedule-details";
import ServiceDetails from "./service-details";
import ServiceProviders from "./service-providers";
import ServiceRegistration from "./service-registration";
import WorkerRegistration from "./worker-registration";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.user?.data);
  const persistedState = useSelector((state: any) => state);

  const [loaded, error] = useFonts({
    "Montserrat-ExtraBold": require("../ttf/Montserrat-ExtraBold.ttf"),
    PlusJakartaSans: require("../ttf/PlusJakartaSans[wght].ttf"),
    "zillah-modern": require("../ttf/zillah-modern-offset-outline.ttf"),
  });

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | undefined>(
    undefined,
  );

  // Check for persisted user data to determine initial route
  useEffect(() => {
    if (loaded && !isAuthChecking) {
      // Check if user data exists in persisted Redux state
      const hasUserData = userData && Object.keys(userData).length > 0;
      const hasUserId =
        userData?.uid || userData?.email || userData?.mobileNumber;

      console.log("Checking persisted user data:", userData);

      if (hasUserData && hasUserId) {
        // User is logged in, go to location-permission (or tab-layout if location exists)
        if (userData?.location?.latitude && userData?.location?.longitude) {
          // alert("CALLED");
          setInitialRoute("tab-layout");
        } else {
          setInitialRoute("location-permission");
        }
      } else {
        // No user data, go to login
        setInitialRoute("login");
      }

      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthChecking, userData]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Hide splash screen when fonts and auth check are done
  useEffect(() => {
    if ((loaded || error) && !isAuthChecking) {
      // Don't hide here, we handle it in the other effect after checking user data
    }
  }, [loaded, error, isAuthChecking]);

  // Don't render navigator until fonts loaded, auth checked, AND initial route determined
  if (!loaded || isAuthChecking || !initialRoute) {
    return null;
  }

  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen
              name="login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="phn-login"
              component={PhoneLogin}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              component={LocationPermissionScreen}
              name="location-permission"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tab-layout"
              component={TabLayout}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="admin-layout"
              component={AdminLayout}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              component={ModalScreen}
              name="modal"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              component={WorkerRegistration}
              name="worker-registration"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              component={ServiceProviders}
              name="service-providers"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="edit-profile"
              component={EditProfile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="service-details"
              component={ServiceDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="schedule-details"
              component={ScheduleDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="wallet"
              component={WalletScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment-success"
              component={PaymentSuccess}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="service-registration"
              component={ServiceRegistration}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ai-assistant"
              component={AIAssistantScreen}
              options={{
                headerShown: false,
                animation: "fade",
                animationDuration: 300,
              }}
            />
          </Stack.Navigator>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaView>
  );
}
