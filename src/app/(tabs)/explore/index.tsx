import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type {
  SearchRepoItem,
  SearchUserItem,
  RepoSortOption,
} from "../../../lib/api/hooks";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { useSearch, useTrending } from "../../../lib/api/hooks";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useSearchHistory } from "../../../lib/searchHistory";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingCard } from "../../../components/explore";
import { useToast } from "../../../contexts/ToastContext";
import { StatBar } from "../../../components/ui/StatBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useFavorites } from "../../../lib/favorites";
import { ChipFilter } from "../../../components/ui";
import { useAppTheme } from "../../../lib/theme";
import { haptic } from "../../../lib/haptics";
import { Ionicons } from "@expo/vector-icons";

type SortOption = "best-match" | RepoSortOption;
type StarsMin = "" | ">100" | ">1000" | ">10000" | ">50000";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Best Match", value: "best-match" },
  { label: "⭐ Stars", value: "stars" },
  { label: "🍴 Forks", value: "forks" },
  { label: "🕐 Updated", value: "updated" },
];

const LANGUAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "Python", value: "Python" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "Go", value: "Go" },
  { label: "Rust", value: "Rust" },
  { label: "Java", value: "Java" },
  { label: "Swift", value: "Swift" },
  { label: "Kotlin", value: "Kotlin" },
  { label: "C++", value: "C++" },
  { label: "PHP", value: "PHP" },
];

const STARS_OPTIONS: { label: string; value: StarsMin }[] = [
  { label: "Any Stars", value: "" },
  { label: ">100", value: ">100" },
  { label: ">1k", value: ">1000" },
  { label: ">10k", value: ">10000" },
  { label: ">50k", value: ">50000" },
];

const QUICK_TOPICS = [
  { label: "Android / APK", query: "topic:android stars:>50" },
  { label: "Web", query: "topic:web stars:>1000" },
  { label: "Mobile", query: "topic:mobile stars:>500" },
  { label: "Security", query: "topic:security stars:>500" },
  { label: "DevOps", query: "topic:devops stars:>500" },
  { label: "Games", query: "topic:game stars:>500" },
  { label: "Data", query: "topic:data-science stars:>500" },
  { label: "Rust", query: "language:rust stars:>500" },
];

function RepoRow({ item }: { item: SearchRepoItem }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <Pressable
      style={[styles.repoRow, { borderBottomColor: theme.border }]}
      onPress={() => {
        haptic("light");
        router.push(`/repo/${item.owner?.login}/${item.name}`);
      }}
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

export default function ExploreScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string | string[] }>();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [suggestionsQuery, setSuggestionsQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("best-match");
  const [language, setLanguage] = useState("");
  const [starsMin, setStarsMin] = useState<StarsMin>("");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const {
    favorites,
    removeFavorite,
    isLoading: isFavoritesLoading,
  } = useFavorites();
  const {
    history,
    addSearch,
    removeSearch: removeSearchHistory,
    clearHistory,
  } = useSearchHistory();
  const { showToast } = useToast();

  const incomingQuery = useMemo(() => {
    if (!params.q) return "";
    return Array.isArray(params.q) ? params.q[0] : params.q;
  }, [params.q]);

  const effectiveQuery = useMemo(() => {
    if (!activeQuery) return "";
    let q = activeQuery;
    if (language && !q.toLowerCase().includes("language:")) {
      q += ` language:${language}`;
    }
    if (starsMin) {
      q += ` stars:${starsMin}`;
    }
    return q;
  }, [activeQuery, language, starsMin]);

  const activeFiltersCount =
    (sortBy !== "best-match" ? 1 : 0) + (language ? 1 : 0) + (starsMin ? 1 : 0);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearch(effectiveQuery, "repositories", {
      sort: sortBy === "best-match" ? undefined : sortBy,
      order: "desc",
    });

  const { data: trendingPreview, isLoading: isTrendingPreviewLoading } =
    useTrending("week", undefined, "hot");
  const { data: hotReleasesPreview, isLoading: isHotReleasesLoading } =
    useTrending("week", undefined, "released");

  const repos = data?.pages.flatMap(p => p as SearchRepoItem[]) ?? [];
  const trendingTop = (trendingPreview ?? []).slice(0, 5);
  const releasesTop = (hotReleasesPreview ?? []).slice(0, 5);

  useEffect(() => {
    if (incomingQuery) {
      setQuery(incomingQuery);
      setActiveQuery(incomingQuery);
    }
  }, [incomingQuery]);

  const handleSearch = (text: string) => {
    setQuery(text);
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setActiveQuery("");
      setSuggestionsQuery("");
      setSortBy("best-match");
      setLanguage("");
      setStarsMin("");
      setShowFilters(false);
    }
  };

  const handleSubmitSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      setActiveQuery(trimmed);
      setSuggestionsQuery("");
      addSearch(trimmed);
    }
  };

  const handleSuggestionPress = (suggestion: SuggestionItem) => {
    if (suggestion.kind === "user") {
      const login = suggestion.data.login;
      setQuery(login);
      setActiveQuery(login);
      setSuggestionsQuery("");
      addSearch(login);
      return;
    }
    const fullName = suggestion.data.full_name ?? suggestion.data.name;
    setQuery(fullName);
    setActiveQuery(fullName);
    setSuggestionsQuery("");
    addSearch(fullName);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length >= 2 && !activeQuery) {
      debounceRef.current = setTimeout(() => {
        setSuggestionsQuery(trimmed);
      }, 300);
    } else {
      setSuggestionsQuery("");
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeQuery]);

  const { data: reposSuggestions, isLoading: isReposLoading } = useSearch(
    suggestionsQuery,
    "repositories",
    {
      sort: undefined,
      order: "desc",
    },
  );
  const { data: usersSuggestions, isLoading: isUsersLoading } = useSearch(
    suggestionsQuery,
    "users",
    {
      sort: undefined,
      order: "desc",
    },
  );
  const { data: topicsSuggestions, isLoading: isTopicsLoading } = useSearch(
    suggestionsQuery,
    "topics",
    {
      sort: undefined,
      order: "desc",
    },
  );

  const isSuggestionsLoading =
    isReposLoading || isUsersLoading || isTopicsLoading;

  type SuggestionItem =
    | { kind: "repo"; data: SearchRepoItem }
    | { kind: "user"; data: SearchUserItem }
    | { kind: "topic"; data: SearchRepoItem };

  const suggestions: SuggestionItem[] = [
    ...((reposSuggestions?.pages[0] ?? []) as SearchRepoItem[])
      .slice(0, 4)
      .map(data => ({ kind: "repo" as const, data })),
    ...((usersSuggestions?.pages[0] ?? []) as SearchUserItem[])
      .slice(0, 3)
      .map(data => ({ kind: "user" as const, data })),
    ...((topicsSuggestions?.pages[0] ?? []) as SearchRepoItem[])
      .slice(0, 3)
      .map(data => ({ kind: "topic" as const, data })),
  ];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    setQuery("");
    setActiveQuery("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          {!!(activeQuery || incomingQuery) && (
            <Pressable
              onPress={handleBack}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={theme.text}
              />
            </Pressable>
          )}
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Explore
          </Text>
        </View>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="search"
              size={16}
              color={theme.muted}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search repos, users, topics…"
              placeholderTextColor={theme.muted}
              value={query}
              onChangeText={handleSearch}
              onSubmitEditing={handleSubmitSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => {
                  haptic("light");
                  handleSearch("");
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={theme.muted}
                />
              </Pressable>
            )}
          </View>
          {suggestionsQuery.length >= 2 && !activeQuery && (
            <View
              style={[
                styles.suggestionsDropdown,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {isSuggestionsLoading ? (
                <View style={styles.suggestionsSkeleton}>
                  {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} />
                  ))}
                </View>
              ) : suggestions.length === 0 ? (
                <View style={styles.suggestionEmpty}>
                  <Text
                    style={[
                      styles.suggestionEmptyText,
                      { color: theme.subtle },
                    ]}
                  >
                    No suggestions found
                  </Text>
                </View>
              ) : (
                suggestions.map((item, idx) => {
                  const key =
                    item.kind === "user"
                      ? String(item.data.id)
                      : `suggestion-${idx}`;
                  return (
                    <Pressable
                      key={key}
                      style={[
                        styles.suggestionRow,
                        { borderBottomColor: theme.border },
                      ]}
                      onPress={() => {
                        haptic("light");
                        handleSuggestionPress(item);
                      }}
                    >
                      <Avatar
                        uri={
                          item.kind === "user"
                            ? (item.data as SearchUserItem).avatar_url
                            : (item.data as SearchRepoItem).owner?.avatar_url
                        }
                        name={
                          item.kind === "user"
                            ? (item.data as SearchUserItem).login
                            : ((item.data as SearchRepoItem).owner?.login ?? "")
                        }
                        size={28}
                      />
                      <View style={styles.suggestionInfo}>
                        <Text
                          style={[styles.suggestionName, { color: theme.text }]}
                        >
                          {item.kind === "user"
                            ? (item.data as SearchUserItem).login
                            : (item.data as SearchRepoItem).full_name}
                        </Text>
                        {item.kind === "repo" && !!item.data.description && (
                          <Text
                            style={[
                              styles.suggestionDesc,
                              { color: theme.subtle },
                            ]}
                            numberOfLines={1}
                          >
                            {item.data.description}
                          </Text>
                        )}
                        {item.kind === "topic" && !!item.data.description && (
                          <Text
                            style={[
                              styles.suggestionDesc,
                              { color: theme.subtle },
                            ]}
                            numberOfLines={1}
                          >
                            {item.data.description}
                          </Text>
                        )}
                      </View>
                      {item.kind === "topic" ? (
                        <View
                          style={[
                            styles.topicBadge,
                            { borderColor: theme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.topicBadgeText,
                              { color: theme.primary },
                            ]}
                          >
                            Topic
                          </Text>
                        </View>
                      ) : item.kind === "user" ? (
                        <View
                          style={[
                            styles.userBadge,
                            { borderColor: theme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.userBadgeText,
                              { color: theme.subtle },
                            ]}
                          >
                            User
                          </Text>
                        </View>
                      ) : (
                        <LanguageDot
                          language={(item.data as SearchRepoItem).language}
                        />
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>
          )}
          {!!activeQuery && (
            <Pressable
              style={[
                styles.filterToggle,
                {
                  backgroundColor:
                    showFilters || activeFiltersCount > 0
                      ? theme.primary + "20"
                      : theme.surface,
                  borderColor:
                    showFilters || activeFiltersCount > 0
                      ? theme.primary
                      : theme.border,
                },
              ]}
              onPress={() => {
                haptic("selection");
                setShowFilters(v => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel="Toggle filters"
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={
                  showFilters || activeFiltersCount > 0
                    ? theme.primary
                    : theme.muted
                }
              />
              {activeFiltersCount > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.filterBadgeText}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>

      {activeQuery ? (
        <>
          {showFilters && (
            <View
              style={[styles.filterBar, { borderBottomColor: theme.border }]}
            >
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
              <ChipFilter
                options={STARS_OPTIONS}
                value={starsMin}
                onChange={setStarsMin}
              />
            </View>
          )}
          {isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              color={theme.primary}
            />
          ) : (
            <FlatList
              data={repos}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => <RepoRow item={item} />}
              contentContainerStyle={
                repos.length === 0 ? styles.listEmptyContainer : undefined
              }
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
                    name="search"
                    size={24}
                    color={theme.muted}
                  />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No matches found
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
                    Try another topic or keyword.
                  </Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {history.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Searches
              </Text>
              <Pressable
                onPress={() => {
                  haptic("medium");
                  clearHistory();
                  showToast("Search history cleared", "success");
                }}
              >
                <Text style={[styles.clearText, { color: theme.primary }]}>
                  Clear
                </Text>
              </Pressable>
            </View>
          )}
          {history.length > 0 && (
            <View style={styles.historyRow}>
              {history.map(item => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.historyChip,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    haptic("light");
                    handleSearch(item.query);
                  }}
                >
                  <Text style={[styles.historyText, { color: theme.text }]}>
                    {item.query}
                  </Text>
                  <Pressable
                    style={styles.historyRemove}
                    onPress={e => {
                      e?.stopPropagation?.();
                      haptic("light");
                      removeSearchHistory(item.query);
                      showToast("Search removed", "success");
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={12}
                      color={theme.muted}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Trending
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/explore/trending",
                  params: { mode: "hot", period: "week" },
                })
              }
            >
              <Text style={[styles.seeAll, { color: theme.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>
          {isTrendingPreviewLoading ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              color={theme.primary}
            />
          ) : (
            <View style={styles.previewList}>
              {trendingTop.map((item, index) => (
                <TrendingCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  compact
                />
              ))}
              {trendingTop.length === 0 && (
                <Text style={[styles.emptyFavText, { color: theme.subtle }]}>
                  No trending repos right now.
                </Text>
              )}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Hot releases
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/explore/trending",
                  params: { mode: "released", period: "week" },
                })
              }
            >
              <Text style={[styles.seeAll, { color: theme.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>
          {isHotReleasesLoading ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              color={theme.primary}
            />
          ) : (
            <View style={styles.previewList}>
              {releasesTop.map((item, index) => (
                <TrendingCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  compact
                  showReleaseDate
                />
              ))}
              {releasesTop.length === 0 && (
                <Text style={[styles.emptyFavText, { color: theme.subtle }]}>
                  No recent releases found.
                </Text>
              )}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Discover
          </Text>
          <View style={styles.trendingButtons}>
            <Pressable
              style={[
                styles.trendBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push("/(tabs)/explore/android-apps")}
            >
              <Ionicons
                name="phone-portrait"
                size={22}
                color="#3DDC84"
              />
              <View style={styles.trendBtnCopy}>
                <Text style={[styles.trendBtnText, { color: theme.text }]}>
                  Android apps
                </Text>
                <Text style={[styles.trendBtnSub, { color: theme.subtle }]}>
                  Browse open-source apps on GitHub
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.trendBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push("/(tabs)/explore/trending")}
            >
              <Ionicons
                name="flame"
                size={22}
                color="#F85149"
              />
              <Text style={[styles.trendBtnText, { color: theme.text }]}>
                Trending Repos
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.trendBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push("/(tabs)/explore/developers")}
            >
              <Ionicons
                name="people"
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.trendBtnText, { color: theme.text }]}>
                Trending Developers
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.trendBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push("/(tabs)/explore/topics")}
            >
              <Ionicons
                name="pricetag"
                size={22}
                color="#3FB950"
              />
              <Text style={[styles.trendBtnText, { color: theme.text }]}>
                Browse Topics
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.trendBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push("/(tabs)/explore/languages")}
            >
              <Ionicons
                name="code-slash"
                size={22}
                color="#3178c6"
              />
              <Text style={[styles.trendBtnText, { color: theme.text }]}>
                Browse Languages
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Topics
          </Text>
          <View style={styles.topicGrid}>
            {QUICK_TOPICS.map(t => (
              <Pressable
                key={t.label}
                style={[
                  styles.topicChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => handleSearch(t.query)}
              >
                <Text style={[styles.topicChipText, { color: theme.text }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.favHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Favorites
            </Text>
            {!isFavoritesLoading && favorites.length > 0 && (
              <Text style={[styles.favCount, { color: theme.subtle }]}>
                {favorites.length}
              </Text>
            )}
          </View>
          {isFavoritesLoading ? (
            <ActivityIndicator
              style={{ marginTop: 4 }}
              color={theme.primary}
            />
          ) : favorites.length === 0 ? (
            <View style={styles.emptyFavorites}>
              <Ionicons
                name="heart-outline"
                size={16}
                color={theme.muted}
              />
              <Text style={[styles.emptyFavText, { color: theme.subtle }]}>
                Save trending topics or languages to see them here.
              </Text>
            </View>
          ) : (
            <View style={styles.favGrid}>
              {favorites.map(fav => (
                <Pressable
                  key={fav.id}
                  style={[
                    styles.favChip,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => handleSearch(fav.query)}
                >
                  <Text style={[styles.favChipText, { color: theme.text }]}>
                    {fav.label}
                  </Text>
                  <Pressable
                    style={styles.removeBtn}
                    onPress={e => {
                      e.stopPropagation?.();
                      removeFavorite(fav.id);
                      showToast(
                        `${fav.label} removed from favorites`,
                        "success",
                      );
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color={theme.muted}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterToggle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 4,
  },
  loader: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
  },
  seeAll: { fontSize: 13, fontWeight: "600" },
  previewList: { gap: 8, marginBottom: 8 },
  trendingButtons: { gap: 8, marginBottom: 8 },
  trendBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  trendBtnCopy: { flex: 1, gap: 2 },
  trendBtnText: { flex: 1, fontSize: 15, fontWeight: "600" },
  trendBtnSub: { fontSize: 12 },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  topicChipText: { fontSize: 14 },
  favHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  favCount: { fontSize: 13, fontWeight: "600" },
  favGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  favChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  favChipText: { fontSize: 14 },
  removeBtn: { padding: 2 },
  emptyFavorites: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  emptyFavText: { fontSize: 13, flex: 1, flexWrap: "wrap" },
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
  listEmptyContainer: {
    flexGrow: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  clearText: { fontSize: 13, fontWeight: "600" },
  historyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  historyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  historyText: { fontSize: 13, fontWeight: "500" },
  historyRemove: { padding: 2 },
  suggestionsDropdown: {
    maxHeight: 360,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionInfo: { flex: 1, gap: 2 },
  suggestionName: { fontSize: 14, fontWeight: "600" },
  suggestionDesc: { fontSize: 13 },
  suggestionEmpty: {
    alignItems: "center",
    paddingVertical: 16,
  },
  suggestionEmptyText: { fontSize: 14 },
  suggestionsSkeleton: { padding: 12, gap: 10 },
  topicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicBadgeText: { fontSize: 11, fontWeight: "600" },
  userBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  userBadgeText: { fontSize: 11, fontWeight: "600" },
});
