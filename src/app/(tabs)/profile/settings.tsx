import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SegmentedControl } from "../../../components/ui/SegmentedControl";
import { SettingsRow } from "../../../components/ui/SettingsRow";
import { useTheme } from "../../../contexts/ThemeContext";
import { Section } from "../../../components/ui/Section";
import { useAuth } from "../../../contexts/AuthContext";
import { usePreferences } from "../../../lib/hooks";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { preferences, updatePreference } = usePreferences();

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const themeOptions = [
    {
      label: "Light",
      value: "light" as ThemeMode,
      icon: "sunny-outline" as const,
    },
    {
      label: "Dark",
      value: "dark" as ThemeMode,
      icon: "moon-outline" as const,
    },
    {
      label: "Auto",
      value: "system" as ThemeMode,
      icon: "phone-portrait-outline" as const,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <Section
        title="Appearance"
        style={styles.section}
      >
        <View style={styles.segmentedControlWrapper}>
          <Text style={[styles.label, { color: theme.subtle }]}>Theme</Text>
          <SegmentedControl
            options={themeOptions}
            value={themeMode}
            onChange={setThemeMode}
            size="md"
            fullWidth
          />
        </View>
      </Section>

      <Section
        title="Content"
        style={styles.section}
      >
        <SettingsRow
          icon="layers-outline"
          label="Default feed view"
          value={
            preferences.defaultFeedView === "activity"
              ? "Recent activity"
              : "Repositories"
          }
          onPress={() => router.push("/settings/feed-view")}
        />
        <SettingsRow
          icon="calendar-outline"
          label="Date format"
          value={
            preferences.dateFormat === "relative"
              ? "Relative (2h ago)"
              : "Absolute (Feb 23, 2026)"
          }
          onPress={() => router.push("/settings/date-format")}
        />
      </Section>

      <Section
        title="Notifications"
        style={styles.section}
      >
        <SettingsRow
          icon="notifications-outline"
          label="Push notifications"
          showChevron={false}
          rightElement={
            <Pressable
              onPress={() =>
                updatePreference("pushEnabled", !preferences.pushEnabled)
              }
            >
              <Ionicons
                name={preferences.pushEnabled ? "toggle" : "toggle-outline"}
                size={28}
                color={preferences.pushEnabled ? theme.primary : theme.muted}
              />
            </Pressable>
          }
        />
        <SettingsRow
          icon="mail-outline"
          label="Email notifications"
          value="Manage on GitHub"
          onPress={() => {}}
        />
      </Section>

      <Section
        title="Display"
        style={styles.section}
      >
        <SettingsRow
          icon="code-outline"
          label="Code font size"
          value={
            preferences.codeFontSize === "sm"
              ? "Small"
              : preferences.codeFontSize === "md"
                ? "Medium"
                : "Large"
          }
          onPress={() => router.push("/settings/font-size")}
        />
        <SettingsRow
          icon="eye-outline"
          label="Compact mode"
          showChevron={false}
          rightElement={
            <Pressable
              onPress={() =>
                updatePreference("compactMode", !preferences.compactMode)
              }
            >
              <Ionicons
                name={preferences.compactMode ? "toggle" : "toggle-outline"}
                size={28}
                color={preferences.compactMode ? theme.primary : theme.muted}
              />
            </Pressable>
          }
        />
      </Section>

      <Section
        title="Privacy & Security"
        style={styles.section}
      >
        <SettingsRow
          icon="lock-closed-outline"
          label="Two-factor authentication"
          value="Manage on GitHub"
          onPress={() => {}}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Authorized apps"
          onPress={() => {}}
        />
        <SettingsRow
          icon="analytics-outline"
          label="Analytics"
          showChevron={false}
          rightElement={
            <Pressable
              onPress={() =>
                updatePreference(
                  "analyticsEnabled",
                  !preferences.analyticsEnabled,
                )
              }
            >
              <Ionicons
                name={
                  preferences.analyticsEnabled ? "toggle" : "toggle-outline"
                }
                size={28}
                color={
                  preferences.analyticsEnabled ? theme.primary : theme.muted
                }
              />
            </Pressable>
          }
        />
      </Section>

      <Section
        title="Account"
        style={styles.section}
      >
        <SettingsRow
          icon="person-outline"
          label="GitHub Profile"
          value={user?.login}
          onPress={() => {}}
          showChevron={false}
        />
      </Section>

      <Section
        title="About"
        style={styles.section}
      >
        <SettingsRow
          icon="information-circle-outline"
          label="Version"
          value={Constants.expoConfig?.version}
          showChevron={false}
        />
        <SettingsRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => {}}
        />
        <SettingsRow
          icon="lock-closed-outline"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <SettingsRow
          icon="code-working-outline"
          label="Open source licenses"
          onPress={() => {}}
        />
      </Section>

      <Section
        title="Danger Zone"
        style={styles.section}
      >
        <SettingsRow
          icon="log-out-outline"
          label="Sign out"
          onPress={handleSignOut}
          destructive
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  back: { padding: 4 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  segmentedControlWrapper: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
