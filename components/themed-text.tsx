import { StyleSheet, Text, type TextProps } from "react-native";

import { useColorScheme } from "./themed-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  // const { theme } = useContext(ThemeContext);
  const deviceTheme = useColorScheme();
  // alert(deviceTheme);
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const finalColor =
    // deviceTheme === "system"
    deviceTheme === "dark" ? "white" : "black";
  // : theme === "dark"
  //   ? "white"
  //   : "black";

  return (
    <Text
      style={[
        { color: finalColor },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "PlusJakartaSans",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: "Montserrat-ExtraBold",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Montserrat-ExtraBold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
    fontFamily: "PlusJakartaSans",
  },
});
