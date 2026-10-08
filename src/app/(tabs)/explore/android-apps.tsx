import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { SearchRepoItem, RepoSortOption } from "../../../lib/api/hooks";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { StatBar } from "../../../components/ui/StatBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useSearch } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";

type SortOption = "best-match" | RepoSortOption;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Best Match", value: "best-match" },
  { label: "Stars", value: "stars" },
  { label: "Updated", value: "updated" },
];

const LANGUAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Kotlin", value: "Kotlin" },
  { label: "Java", value: "Java" },
  { label: "Dart", value: "Dart" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "C++", value: "C++" },
  { label: "Rust", value: "Rust" },
];

/** GitHub Search forbids OR between qualifiers (topic:/language:). */
const TOPIC_OPTIONS: { label: string; value: string }[] = [
  { label: "Android", value: "android" },
  { label: "APK", value: "apk" },
  { label: "Android app", value: "android-app" },
];

const BASE_STARS = "stars:>50";

function RepoRow({ item }: { item: SearchRepoItem }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <Pressable
      style={[styles.repoRow, { borderBottomColor: theme.border }]}
      onPress={() => router.push(`/repo/${item.owner?.login}/${item.name}`)}
    >
      <Avatar
        uri={item.owner?.avatar_url}
        name={item.owner?.login ?? ""}
        size={32}
      />
      <View style={styles.repoInfo}>
        <Text style={[styles.repoName, { color: theme.primary }]}>
          {item.full_name}
        </Text>
        {!!item.description && (
          <Text
            style={[styles.repoDesc, { color: theme.subtle }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
        <View style={styles.repoMeta}>
          <LanguageDot language={item.language} />
          <StatBar
            stars={item.stargazers_count}
            forks={item.forks_count}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function AndroidAppsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("stars");
  const [topic, setTopic] = useState("android");
  const [language, setLanguage] = useState("");

  const query = useMemo(() => {
    let q = `topic:${topic} ${BASE_STARS}`;
    if (language) q += ` language:${language}`;
    return q;
  }, [topic, language]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearch(query, "repositories", {
    sort: sortBy === "best-match" ? undefined : sortBy,
    order: "desc",
  });

  const repos = data?.pages.flatMap(p => p as SearchRepoItem[]) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Android apps
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtle }]}>
            Open-source apps shipping on GitHub
          </Text>
        </View>
      </View>

      <View style={[styles.filters, { borderBottomColor: theme.border }]}>
        <ChipFilter
          options={TOPIC_OPTIONS}
          value={topic}
          onChange={setTopic}
        />
        <ChipFilter
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
        />
        <ChipFilter
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={setLanguage}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : isError ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color={theme.muted}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Search failed
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
            {error instanceof Error ? error.message : "Try again."}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.retryText, { color: theme.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={repos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <RepoRow item={item} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={{ paddingVertical: 16 }}
                color={theme.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={theme.muted}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Android apps found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
                Try another topic, language, or sort order.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSubtitle: { fontSize: 13 },
  filters: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 4,
  },
  loader: { flex: 1 },
  repoRow: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  repoInfo: { flex: 1, gap: 4 },
  repoName: { fontSize: 14, fontWeight: "600" },
  repoDesc: { fontSize: 13, lineHeight: 18 },
  repoMeta: { flexDirection: "row", gap: 12, alignItems: "center" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 48,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  retryText: { fontSize: 14, fontWeight: "600" },
});
