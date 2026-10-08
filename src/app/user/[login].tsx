import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { useLocalSearchParams } from "expo-router";
import { getOctokit } from "../../lib/api/github";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import * as Clipboard from "expo-clipboard";
import { haptic } from "../../lib/haptics";
import { useRouter } from "expo-router";
import { Share } from "react-native";

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
  const router = useRouter();
  const { showToast } = useToast();
  const { data: user, isLoading } = useUser(login!);

  async function handleCopyLink() {
    if (!user?.html_url) return;
    await Clipboard.setStringAsync(user.html_url);
    showToast("Profile link copied", "success");
    haptic("success");
  }

  async function handleShare() {
    if (!user?.html_url) return;
    try {
      await Share.share({ message: user.html_url });
      haptic("light");
    } catch {
      // share sheet dismissed — ignore
    }
  }

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
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {user.login}
        </Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleCopyLink}>
            <Ionicons
              name="copy-outline"
              size={20}
              color={theme.text}
            />
          </Pressable>
          <Pressable onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.text}
            />
          </Pressable>
        </View>
      </View>

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
        {!!user.name && (
          <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
        )}
        <Text style={[styles.login, { color: theme.subtle }]}>
          @{user.login}
        </Text>
        {!!user.bio && (
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
          {!!user.company && (
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
          {!!user.location && (
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: "800" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
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
