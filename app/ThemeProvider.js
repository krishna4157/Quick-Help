import React, { useState } from "react";
import { useColorScheme } from "react-native";

export const ThemeContext = React.createContext({
  theme: "light",
  toggleTheme: (param) => {},
});

const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState("system");

  const toggleTheme = (param) => {
    if (param === "light") {
      setTheme("light");
    } else if (param === "dark") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeProvider;
