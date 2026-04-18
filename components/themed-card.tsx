import { useColorScheme, View, type ViewProps } from "react-native";

import { ThemeContext } from "@/app/ThemeProvider";
import { useContext } from "react";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedCard({
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
        ? "rgba(255, 255, 255, 0.5)"
        : "rgba(0, 0, 0, 0.5)"
      : theme === "dark"
        ? "rgba(255, 255, 255, 0.5)"
        : "rgba(0, 0, 0, 0.5)";
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return (
    <View
      style={[{ borderColor: finalColor, borderWidth: 1 }, style]}
      {...otherProps}
    />
  );
}
