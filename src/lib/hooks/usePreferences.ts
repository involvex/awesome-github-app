import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark" | "system";

const PREFERENCES_STORAGE_KEY = "@app_preferences";

/**
 * App Preferences Interface
 *
 * All user-configurable preferences in the app
 */
export interface AppPreferences {
  // Theme
  themeMode: ThemeMode;

  // Content
  defaultFeedView: "activity" | "repos";
  dateFormat: "relative" | "absolute";

  // Notifications
  pushEnabled: boolean;

  // Display
  codeFontSize: "sm" | "md" | "lg";
  compactMode: boolean;

  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

/**
 * Default preferences
 */
const defaultPreferences: AppPreferences = {
  themeMode: "system",
  defaultFeedView: "activity",
  dateFormat: "relative",
  pushEnabled: true,
  codeFontSize: "md",
  compactMode: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
};

/**
 * Load preferences from AsyncStorage
 */
async function loadPreferences(): Promise<AppPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new preference additions
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load preferences:", error);
  }
  return defaultPreferences;
}

/**
 * Save preferences to AsyncStorage
 */
async function savePreferences(preferences: AppPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

/**
 * usePreferences Hook
 *
 * Manages user preferences with automatic persistence to AsyncStorage.
 * All preference changes are automatically saved.
 *
 * @example
 * ```tsx
 * const { preferences, updatePreference, resetPreferences } = usePreferences();
 *
 * <Switch
 *   value={preferences.compactMode}
 *   onValueChange={(value) => updatePreference("compactMode", value)}
 * />
 * ```
 */
export function usePreferences() {
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences().then(loaded => {
      setPreferences(loaded);
      setIsLoaded(true);
    });
  }, []);

  // Update a single preference
  const updatePreference = <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K],
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences(updated);
  };

  // Update multiple preferences at once
  const updatePreferences = (updates: Partial<AppPreferences>) => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    savePreferences(updated);
  };

  // Reset all preferences to defaults
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    savePreferences(defaultPreferences);
  };

  return {
    preferences,
    isLoaded,
    updatePreference,
    updatePreferences,
    resetPreferences,
  };
}

/**
 * Hook for accessing a single preference value
 * Useful for components that only need one preference
 *
 * @example
 * ```tsx
 * const compactMode = usePreferenceValue("compactMode");
 * ```
 */
export function usePreferenceValue<K extends keyof AppPreferences>(
  key: K,
): AppPreferences[K] {
  const { preferences } = usePreferences();
  return preferences[key];
}
