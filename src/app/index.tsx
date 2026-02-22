import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../lib/theme";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function HomeScreen() {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Card>
        <Text style={[styles.title, { color: theme.text }]}>awesome-github-app</Text>
        <Text style={[styles.description, { color: theme.subtle }]}>A modern Expo app created with create-magic-expo-app</Text>
        <Button title="Start building" onPress={() => console.log("Ready to build")} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
