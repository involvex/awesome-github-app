import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../components/ui/Card";
import { useAppTheme } from "../lib/theme";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/(tabs)/feed" : "/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Card>
        <Text style={[styles.title, { color: theme.text }]}>
          awesome-github-app
        </Text>
        <View style={styles.hero}>
          <Ionicons
            name="logo-github"
            size={80}
            color={theme.text}
          />
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            A modern GitHub client, built for developers.
          </Text>
        </View>
        <Button
          title="Go to Login page"
          onPress={() => router.push("/login")}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 32,
    paddingBottom: 48,
  },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    backgroundColor: "#1f2328",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonIcon: {},
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  legal: { textAlign: "center", fontSize: 12, marginTop: 16 },
});
