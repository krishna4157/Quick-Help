import { useColorScheme, type ViewProps } from "react-native";

import { ThemeContext } from "@/app/ThemeProvider";
import { useContext } from "react";

export type ThemedViewProps = ViewProps & {
  // lightColor?: string;
  // darkColor?: string;
  inverted?: boolean;
};

export const getThemeColor = ({
  // lightColor,
  // darkColor,
  inverted = false,
  ...otherProps
}: ThemedViewProps) => {
  const { theme } = useContext(ThemeContext);
  const deviceTheme = useColorScheme();
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const finalColor =
    theme === "system"
      ? deviceTheme === "dark"
        ? "rgba(255, 255, 255, 0.9)"
        : "rgba(0, 0, 0, 0.9)"
      : theme === "dark"
        ? "rgba(255, 255, 255, 0.9)"
        : "rgba(0, 0, 0, 0.9)";
  const invertColor =
    theme === "system"
      ? deviceTheme === "dark"
        ? "rgba(0, 0, 0, 0.9)"
        : "rgba(255, 255, 255, 0.9)"
      : theme === "dark"
        ? "rgba(0, 0, 0, 0.9)"
        : "rgba(255, 255, 255, 0.9)";
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  if (inverted) {
    return invertColor;
  } else {
    return finalColor;
  }
};
