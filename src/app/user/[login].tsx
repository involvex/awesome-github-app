import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "../../components/ui/Avatar";
import { useLocalSearchParams } from "expo-router";
import { getOctokit } from "../../lib/api/github";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

function useUser(login: string) {
  return useQuery({
    queryKey: ["user", login],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.users.getByUsername({ username: login });
      return data;
    },
    enabled: !!login,
  });
}

export default function UserProfileScreen() {
  const { login } = useLocalSearchParams<{ login: string }>();
  const theme = useAppTheme();
  const { data: user, isLoading } = useUser(login!);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
    >
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Avatar
          uri={user.avatar_url}
          name={user.login}
          size={80}
        />
        {user.name && (
          <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
        )}
        <Text style={[styles.login, { color: theme.subtle }]}>
          @{user.login}
        </Text>
        {user.bio && (
          <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
        )}

        <View style={styles.statsRow}>
          {[
            { label: "Repos", value: user.public_repos },
            { label: "Followers", value: user.followers },
            { label: "Following", value: user.following },
          ].map(s => (
            <View
              key={s.label}
              style={styles.stat}
            >
              <Text style={[styles.statValue, { color: theme.text }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtle }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          {user.company && (
            <View style={styles.metaItem}>
              <Ionicons
                name="business-outline"
                size={13}
                color={theme.subtle}
              />
              <Text style={[styles.metaText, { color: theme.subtle }]}>
                {user.company}
              </Text>
            </View>
          )}
          {user.location && (
            <View style={styles.metaItem}>
              <Ionicons
                name="location-outline"
                size={13}
                color={theme.subtle}
              />
              <Text style={[styles.metaText, { color: theme.subtle }]}>
                {user.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 60 },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: "700" },
  login: { fontSize: 15 },
  bio: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 32, marginTop: 8 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
});
