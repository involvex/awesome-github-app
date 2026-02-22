import { useColorScheme } from "react-native";

const light = {
  background: "#F6F8FA",
  surface: "#FFFFFF",
  text: "#1F2328",
  subtle: "#57606A",
  muted: "#8C959F",
  border: "#D0D7DE",
  primary: "#0969DA",
  success: "#1A7F37",
  danger: "#CF222E",
  warning: "#9A6700",
};

const dark = {
  background: "#0D1117",
  surface: "#161B22",
  text: "#E6EDF3",
  subtle: "#8B949E",
  muted: "#484F58",
  border: "#30363D",
  primary: "#58A6FF",
  success: "#3FB950",
  danger: "#F85149",
  warning: "#D29922",
};

export type AppTheme = typeof light;

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === "dark" ? dark : light;
}
