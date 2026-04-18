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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import TabLayout from "./BottomTabs/TabLayout";
import EditProfile from "./edit-profile";
import LocationPermissionScreen from "./location-permission";
import LoginScreen from "./login";
import PhoneLogin from "./loginviaphn";
import ModalScreen from "./modal";
import ServiceProviders from "./service-providers";
import WorkerRegistration from "./worker-registration";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<any>();

  const [loaded, error] = useFonts({
    "Montserrat-ExtraBold": require("../ttf/Montserrat-ExtraBold.ttf"),
    PlusJakartaSans: require("../ttf/PlusJakartaSans[wght].ttf"),
    "zillah-modern": require("../ttf/zillah-modern-offset-outline.ttf"),
  });

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isAuthChecking]);

  // Navigate to correct screen based on auth status
  // useEffect(() => {
  //   if (!loaded || isAuthChecking) return;

  //   if (isAuthenticated) {
  //     navigation.navigate("location-permission");
  //   } else {
  //     navigation.navigate("login");
  //   }
  // }, [loaded, isAuthChecking, isAuthenticated]);

  if (!loaded || isAuthChecking) {
    return null;
  }

  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <Stack.Navigator initialRouteName="login">
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
          </Stack.Navigator>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaView>
  );
}
