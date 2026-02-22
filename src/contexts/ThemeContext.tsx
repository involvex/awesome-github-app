import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";
type ColorScheme = "light" | "dark";
type ColorSchemeName = ColorScheme | null | undefined;

const THEME_STORAGE_KEY = "@app_theme_mode";

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  const colorScheme: ColorScheme =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  // Load theme mode from storage on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          saved &&
          (saved === "light" || saved === "dark" || saved === "system")
        ) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme mode:", error);
      }
    };
    loadThemeMode();
  }, []);

  // Save theme mode to storage when it changes
  useEffect(() => {
    const saveThemeMode = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
      } catch (error) {
        console.error("Failed to save theme mode:", error);
      }
    };
    saveThemeMode();
  }, [themeMode]);

  // Apply dark class to root element for web
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (colorScheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [colorScheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, colorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
