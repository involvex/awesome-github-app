import { useColorScheme } from "react-native";

const light = {
  background: "#F8FAFC",
  text: "#0F172A",
  subtle: "#475569",
};

const dark = {
  background: "#020617",
  text: "#E2E8F0",
  subtle: "#94A3B8",
};

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? dark : light;
}
