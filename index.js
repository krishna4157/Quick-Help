import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import "./i18n"; // Just importing it runs the config
// import HomeScreen from "./src/screens/HomeScreen";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import RootLayout from "./app/Route";
import store, { persistor } from "./store";

const Stack = createNativeStackNavigator();

import * as Notifications from "expo-notifications";

// This forces the drop-down banner to show even if the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <RootLayout />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

// This is the Expo equivalent of AppRegistry.registerComponent
registerRootComponent(App);
