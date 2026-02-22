import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import type { ContributionDay, ContributionWeek } from "../../../lib/api/hooks";
import { useContributions } from "../../../lib/api/hooks";
import { useAuth } from "../../../contexts/AuthContext";
import { Avatar } from "../../../components/ui/Avatar";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function ContributionGraph({ username }: { username: string }) {
  const theme = useAppTheme();
  const { data, isLoading } = useContributions(username);

  if (isLoading)
    return (
      <ActivityIndicator
        color={theme.primary}
        style={{ marginVertical: 20 }}
      />
    );
  if (!data) return null;

  return (
    <View style={cgStyles.container}>
      <Text style={[cgStyles.label, { color: theme.subtle }]}>
        Contributions this year
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={cgStyles.graph}>
          {data.map((week: ContributionWeek, wi: number) => (
            <View
              key={wi}
              style={cgStyles.week}
            >
              {week.contributionDays.map((day: ContributionDay, di: number) => (
                <View
                  key={di}
                  style={[
                    cgStyles.cell,
                    {
                      backgroundColor:
                        day.contributionCount === 0 ? theme.border : day.color,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const cgStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  graph: { flexDirection: "row", gap: 3 },
  week: { flexDirection: "column", gap: 3 },
  cell: { width: 11, height: 11, borderRadius: 2 },
});

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Profile
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/profile/settings")}>
            <Ionicons
              name="settings-outline"
              size={22}
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
          name={user.name ?? user.login}
          size={72}
        />
        <View style={styles.profileInfo}>
          {user.name && (
            <Text style={[styles.name, { color: theme.text }]}>
              {user.name}
            </Text>
          )}
          <Text style={[styles.login, { color: theme.subtle }]}>
            @{user.login}
          </Text>
          {user.bio && (
            <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
          )}
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
            {user.blog && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="link-outline"
                  size={13}
                  color={theme.subtle}
                />
                <Text
                  style={[styles.metaText, { color: theme.primary }]}
                  numberOfLines={1}
                >
                  {user.blog}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Repos", value: user.public_repos },
          { label: "Followers", value: user.followers },
          { label: "Following", value: user.following },
        ].map(s => (
          <View
            key={s.label}
            style={[
              styles.statBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
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

      <ContributionGraph username={user.login} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 60 },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "800", flex: 1 },
  profileCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontSize: 20, fontWeight: "700" },
  login: { fontSize: 15 },
  bio: { fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12 },
});
