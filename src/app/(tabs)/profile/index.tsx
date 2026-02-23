import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import type { ContributionDay, ContributionWeek } from "../../../lib/api/hooks";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { useContributions } from "../../../lib/api/hooks";
import { StatBar } from "../../../components/ui/StatBar";
import { useAuth } from "../../../contexts/AuthContext";
import { usePinnedRepos } from "../../../lib/api/hooks";
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
  const {
    data: pinnedData,
    isLoading: pinsLoading,
    isError: pinsError,
  } = usePinnedRepos();
  const pinnedRepos = pinnedData?.repos ?? [];

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
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push("/(tabs)/profile/menu")}>
              <Ionicons
                name="star-outline"
                size={22}
                color={theme.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/(tabs)/profile/settings")}>
              <Ionicons
                name="settings-outline"
                size={22}
                color={theme.text}
              />
            </Pressable>
          </View>
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
          {!!user.name && (
            <Text style={[styles.name, { color: theme.text }]}>
              {user.name}
            </Text>
          )}
          <Text style={[styles.login, { color: theme.subtle }]}>
            @{user.login}
          </Text>
          {!!user.bio && (
            <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
          )}
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
            {!!user.blog && (
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Pinned Repositories
          </Text>
          {!!pinnedData?.totalCount && (
            <Text style={[styles.sectionBadge, { color: theme.subtle }]}>
              {pinnedData.totalCount}
            </Text>
          )}
        </View>
        {pinsLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : pinsError ? (
          <View style={styles.sectionEmpty}>
            <Ionicons
              name="warning-outline"
              size={16}
              color={theme.muted}
            />
            <Text style={[styles.emptyText, { color: theme.subtle }]}>
              Unable to load pinned repositories.
            </Text>
          </View>
        ) : pinnedRepos.length === 0 ? (
          <View style={styles.sectionEmpty}>
            <Ionicons
              name="bookmark-outline"
              size={16}
              color={theme.muted}
            />
            <Text style={[styles.emptyText, { color: theme.subtle }]}>
              Pin repositories on GitHub to see them here.
            </Text>
          </View>
        ) : (
          <View style={styles.pinnedList}>
            {pinnedRepos.map(repo => (
              <Pressable
                key={repo.id}
                style={[
                  styles.pinnedCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() =>
                  router.push(`/repo/${repo.owner.login}/${repo.name}`)
                }
              >
                <View style={styles.pinnedHeader}>
                  <View style={styles.pinnedTitleRow}>
                    <Ionicons
                      name="bookmark"
                      size={16}
                      color={theme.primary}
                    />
                    <Text style={[styles.repoName, { color: theme.primary }]}>
                      {repo.nameWithOwner}
                    </Text>
                  </View>
                  <StatBar
                    stars={repo.stargazerCount}
                    forks={repo.forkCount}
                  />
                </View>
                {!!repo.description && (
                  <Text style={[styles.repoDesc, { color: theme.text }]}>
                    {repo.description}
                  </Text>
                )}
                <View style={styles.pinnedMeta}>
                  <LanguageDot language={repo.primaryLanguage?.name} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  repoName: { fontSize: 14, fontWeight: "600" },
  repoDesc: { fontSize: 13, lineHeight: 18 },
  section: { paddingHorizontal: 16, marginTop: 12, gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  sectionBadge: { fontSize: 13, fontWeight: "600" },
  sectionEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  emptyText: { fontSize: 13 },
  pinnedList: { gap: 10 },
  pinnedCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  pinnedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  pinnedTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pinnedMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
});
