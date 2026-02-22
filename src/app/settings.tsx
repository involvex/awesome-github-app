import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../lib/theme";

export default function SettingsScreen() {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: theme.subtle }]}>
        Local-first build is enabled with `expo run:android`.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});
