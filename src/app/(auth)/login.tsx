import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <Ionicons
          name="logo-github"
          size={80}
          color={theme.text}
        />
        <Text style={[styles.title, { color: theme.text }]}>
          awesome-github
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>
          A modern GitHub client, built for developers.
        </Text>
      </View>

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={signIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="logo-github"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Continue with GitHub</Text>
          </>
        )}
      </Pressable>

      <Text style={[styles.legal, { color: theme.subtle }]}>
        By continuing, you agree to GitHub's Terms of Service.
      </Text>
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
