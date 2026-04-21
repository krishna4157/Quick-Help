import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import OrdersScreen from "./orders";
import VerificationScreen from "./verifies";
import WorkersScreen from "./workers";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const [dimensions, setDimensions] = useState({ height: 60, width: 300 });

  const buttonWidth = dimensions.width / state.routes.length;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(state.index * buttonWidth, {
            damping: 12,
            stiffness: 150,
            mass: 0.8,
          }),
        },
      ],
    };
  });

  const isFavourites = state.routes[state.index].name === "favourites";

  const jellyStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(isFavourites ? 60 : 60, {
        damping: 12,
        stiffness: 150,
        mass: 0.8,
      }),
    };
  });

  const jellyGlowStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(isFavourites ? 50 : 60, {
        damping: 12,
        stiffness: 150,
        mass: 0.8,
      }),
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: 30, overflow: "hidden" },
        ]}
      >
        <BlurView
          tint={colorScheme === "dark" ? "dark" : "light"}
          intensity={80}
          style={StyleSheet.absoluteFill}
        />
        {/* iOS-style Liquid Glass Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(0, 0, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
              borderColor:
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              borderRadius: 30,
            },
          ]}
        />
      </View>

      <View
        onLayout={(e: LayoutChangeEvent) =>
          setDimensions({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
        style={styles.tabBarContent}
      >
        <Animated.View
          style={[
            styles.activeBackground,
            { width: buttonWidth },
            animatedStyle,
          ]}
        >
          <Animated.View style={[styles.jellyPillGlow, jellyGlowStyle]} />
          <Animated.View style={[styles.jellyPill, jellyStyle]} />
        </Animated.View>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              // testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              {isFocused ? (
                <Text style={styles.activeText}>
                  {options.title !== undefined ? options.title : route.name}
                </Text>
              ) : (
                options.tabBarIcon &&
                options.tabBarIcon({
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                  size: 28,
                  focused: isFocused,
                })
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 25,
    left: 10,
    right: 10,
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    // width: "100%",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  activeBackground: {
    position: "absolute",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  jellyPill: {
    // width: "50%",
    height: "95%",
    backgroundColor: "#d20303", // Blue background
    borderRadius: 30,
    paddingHorizontal: 50,
  },
  jellyPillGlow: {
    position: "absolute",
    height: "80%",
    backgroundColor: "#d2030325", // Translucent Blue
    borderRadius: 20,
    paddingHorizontal: 40,
    transform: [{ scale: 1.3 }],
    shadowColor: "#d20303",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  activeText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Montserrat-ExtraBold",
  },
});

export default function AdminLayout() {
  const Tabs = createBottomTabNavigator();
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        component={WorkersScreen}
        name="index"
        options={{
          title: "Workers",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        component={OrdersScreen}
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        component={VerificationScreen}
        name="verification-screen"
        options={{
          title: "Verifies",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="favorite" size={28} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        component={ProfileScreen}
        name="profile"
        options={{
          title: t("navigation.profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      /> */}
    </Tabs.Navigator>
  );
}
