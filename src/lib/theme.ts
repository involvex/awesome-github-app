import { useTheme } from "../contexts/ThemeContext";

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
  // Semantic button colors
  buttonPrimary: "#0969DA",
  buttonPrimaryText: "#FFFFFF",
  buttonSecondary: "#F6F8FA",
  buttonSecondaryText: "#1F2328",
  buttonSecondaryBorder: "#D0D7DE",
  buttonOutline: "transparent",
  buttonOutlineText: "#1F2328",
  buttonOutlineBorder: "#D0D7DE",
  buttonGhost: "transparent",
  buttonGhostText: "#0969DA",
  buttonGhostHovered: "rgba(9, 105, 218, 0.08)",
  buttonDanger: "#CF222E",
  buttonDangerText: "#FFFFFF",
  // Interactive states
  pressed: "rgba(9, 105, 218, 0.15)",
  focused: "rgba(9, 105, 218, 0.25)",
  hovered: "rgba(9, 105, 218, 0.08)",
  // Surface variants
  surfaceElevated: "#FFFFFF",
  surfaceDisabled: "#E4E7EB",
  surfaceHovered: "#F3F4F6",
  // Feedback colors
  info: "#0969DA",
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
  // Semantic button colors
  buttonPrimary: "#58A6FF",
  buttonPrimaryText: "#0D1117",
  buttonSecondary: "#161B22",
  buttonSecondaryText: "#E6EDF3",
  buttonSecondaryBorder: "#30363D",
  buttonOutline: "transparent",
  buttonOutlineText: "#58A6FF",
  buttonOutlineBorder: "#30363D",
  buttonGhost: "transparent",
  buttonGhostText: "#58A6FF",
  buttonGhostHovered: "rgba(88, 166, 255, 0.15)",
  buttonDanger: "#F85149",
  buttonDangerText: "#FFFFFF",
  // Interactive states
  pressed: "rgba(88, 166, 255, 0.25)",
  focused: "rgba(88, 166, 255, 0.35)",
  hovered: "rgba(88, 166, 255, 0.12)",
  // Surface variants
  surfaceElevated: "#161B22",
  surfaceDisabled: "#30363D",
  surfaceHovered: "#1C2128",
  // Feedback colors
  info: "#58A6FF",
};

export type AppTheme = typeof light;

export function useAppTheme(): AppTheme {
  const { colorScheme } = useTheme();
  return colorScheme === "dark" ? dark : light;
}
