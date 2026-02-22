import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Pressable,
} from "react-native";
import { SettingsRow } from "../../../components/ui/SettingsRow";
import { useTheme } from "../../../contexts/ThemeContext";
import { Section } from "../../../components/ui/Section";
import { useAuth } from "../../../contexts/AuthContext";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

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
        <SettingsRow
          icon="sunny-outline"
          label="Light"
          showChevron={false}
          rightElement={
            <Switch
              value={themeMode === "light"}
              onValueChange={v => {
                if (v) setThemeMode("light");
              }}
            />
          }
        />
        <SettingsRow
          icon="moon-outline"
          label="Dark"
          showChevron={false}
          rightElement={
            <Switch
              value={themeMode === "dark"}
              onValueChange={v => {
                if (v) setThemeMode("dark");
              }}
            />
          }
        />
        <SettingsRow
          icon="phone-portrait-outline"
          label="System"
          showChevron={false}
          rightElement={
            <Switch
              value={themeMode === "system"}
              onValueChange={v => {
                if (v) setThemeMode("system");
              }}
            />
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
});
