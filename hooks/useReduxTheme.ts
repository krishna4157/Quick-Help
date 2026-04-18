import type { RootState } from "@/store";
import { Appearance } from "react-native";
import { useSelector } from "react-redux";

export function useReduxTheme() {
  const mode = useSelector((state: RootState) => state.theme.mode || "system");

  if (mode === "system") {
    return Appearance.getColorScheme();
  }

  return mode;
}
