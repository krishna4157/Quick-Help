import { useColorScheme, View, type ViewProps } from "react-native";

import { ThemeContext } from "@/app/ThemeProvider";
import { useContext } from "react";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useContext(ThemeContext);
  const deviceTheme = useColorScheme();
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const finalColor =
    theme === "system"
      ? deviceTheme === "dark"
        ? "black"
        : "white"
      : theme === "dark"
        ? "black"
        : "white";
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return (
    <View style={[{ backgroundColor: finalColor }, style]} {...otherProps} />
  );
}
