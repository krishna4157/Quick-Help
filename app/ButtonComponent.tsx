import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Easing,
  GestureResponderEvent,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"; // Import Reanimated

interface ButtonComponentProps {
  onPress?: (event: GestureResponderEvent) => void;
  color?: string;
  text: string;
}

const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 50;
const GRADIENT_SQUARE_SIZE = 350;

// Create an animated version of Pressable so it can accept Reanimated styles
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  onPress,
  color,
  text = "",
}) => {
  // --- 1. ROTATION ANIMATION (Core RN) ---
  const spinValue = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(spinValue, {
      toValue: 5000,
      duration: 3000 * 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 5000],
    outputRange: ["0deg", "3600000deg"],
  });

  // --- 2. JELLY BOUNCE ANIMATION (Reanimated 4.x) ---
  const scale = useSharedValue(1);

  const jellyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  //   const handlePressIn = () => {
  //     // Squish down quickly when pressed
  //     scale.value = withSpring(0.92, {
  //       damping: 10,
  //       stiffness: 400,
  //     });
  //   };

  //   const handlePressOut = () => {
  //     // Bounce back up like jelly when released
  //     // Lower damping = more wobble/bounciness
  //     scale.value = withSpring(1, {
  //       damping: 4,
  //       stiffness: 300,
  //       mass: 0.5,
  //     });
  //   };

  const handlePressIn = () => {
    // 1. Deeper Squish: Changed from 0.92 to 0.85
    // The smaller the number, the deeper it pushes into the screen.
    scale.value = withSpring(0.85, {
      damping: 15, // Keep damping high here so it squishes smoothly without wobbling on the way down
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    // 2. Stronger Bounce: Adjusted the spring physics
    scale.value = withSpring(1, {
      damping: 2, // Lower damping = LOTS more wobble (was 4)
      stiffness: 500, // Higher stiffness = faster, harder snap back up (was 300)
      mass: 0.8, // Slightly higher mass gives the wobble more momentum
    });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      // Combine your container style with the new jelly scale style
      style={[styles.container, jellyAnimatedStyle]}
    >
      <RNAnimated.View
        style={[styles.gradientContainer, { transform: [{ rotate: spin }] }]}
      >
        <LinearGradient
          colors={[
            "#171717",
            color ? color : "rgba(243, 23, 23, 0.8)",
            "#171717",
          ]}
          locations={[0.2, 0.5, 0.8]} // Spread of the glowing red beam
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </RNAnimated.View>

      <View style={styles.innerButton}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#171717",
  },
  gradientContainer: {
    position: "absolute",
    width: GRADIENT_SQUARE_SIZE,
    height: GRADIENT_SQUARE_SIZE,
    top: (BUTTON_HEIGHT - GRADIENT_SQUARE_SIZE) / 2,
    left: (BUTTON_WIDTH - GRADIENT_SQUARE_SIZE) / 2,
  },
  innerButton: {
    position: "absolute",
    width: BUTTON_WIDTH - 4, // 4px border (8px total subtracted)
    height: BUTTON_HEIGHT - 4,
    borderRadius: 14,
    backgroundColor: "#171717",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ButtonComponent;
