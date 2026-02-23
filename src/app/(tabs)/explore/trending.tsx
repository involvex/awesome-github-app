import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useTrending, type TrendingPeriod } from "../../../lib/api/hooks";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import type { SearchRepoItem } from "../../../lib/api/hooks";
import { useToast } from "../../../contexts/ToastContext";
import { StatBar } from "../../../components/ui/StatBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useFavorites } from "../../../lib/favorites";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const PERIODS: { label: string; value: TrendingPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const LANGUAGES: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "Python", value: "Python" },
  { label: "Go", value: "Go" },
  { label: "Rust", value: "Rust" },
  { label: "Swift", value: "Swift" },
  { label: "Kotlin", value: "Kotlin" },
  { label: "Java", value: "Java" },
  { label: "C++", value: "C++" },
  { label: "C#", value: "C#" },
  { label: "Ruby", value: "Ruby" },
  { label: "PHP", value: "PHP" },
  { label: "Dart", value: "Dart" },
  { label: "Shell", value: "Shell" },
  { label: "HTML", value: "HTML" },
  { label: "CSS", value: "CSS" },
  { label: "Scala", value: "Scala" },
  { label: "Elixir", value: "Elixir" },
  { label: "Haskell", value: "Haskell" },
  { label: "Lua", value: "Lua" },
  { label: "Julia", value: "Julia" },
  { label: "Clojure", value: "Clojure" },
  { label: "OCaml", value: "OCaml" },
  { label: "Zig", value: "Zig" },
];

function TrendingCard({ item, rank }: { item: SearchRepoItem; rank: number }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => router.push(`/repo/${item.owner?.login}/${item.name}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.rank, { color: theme.muted }]}>#{rank}</Text>
        <Avatar
          uri={item.owner?.avatar_url}
          name={item.owner?.login ?? ""}
          size={24}
        />
        <Text
          style={[styles.fullName, { color: theme.text }]}
          numberOfLines={1}
        >
          {item.full_name}
        </Text>
      </View>
      {item.description && (
        <Text
          style={[styles.desc, { color: theme.subtle }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}
      <View style={styles.cardFooter}>
        <LanguageDot language={item.language} />
        <StatBar
          stars={item.stargazers_count}
          forks={item.forks_count}
          watchers={item.watchers_count}
        />
      </View>
    </Pressable>
  );
}

export default function TrendingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [period, setPeriod] = useState<TrendingPeriod>("today");
  const [language, setLanguage] = useState("all");
  const { data, isLoading, refetch } = useTrending(
    period,
    language === "all" ? undefined : language,
  );
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();

  const currentFavorite =
    language !== "all"
      ? {
          id: `language:${language}`,
          label: language,
          query: `language:${language} stars:>500`,
          type: "language" as const,
        }
      : null;
  const isLangFavorite = currentFavorite
    ? isFavorite(currentFavorite.id)
    : false;

  const handleToggleFavorite = async () => {
    if (!currentFavorite) return;
    const wasFav = isFavorite(currentFavorite.id);
    await toggleFavorite(currentFavorite);
    showToast(
      wasFav
        ? `${currentFavorite.label} removed from favorites`
        : `${currentFavorite.label} added to favorites`,
      "success",
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Trending
        </Text>
        <Pressable onPress={() => refetch()}>
          <Ionicons
            name="refresh"
            size={22}
            color={theme.primary}
          />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <ChipFilter
          options={PERIODS}
          value={period}
          onChange={setPeriod}
        />
        <ChipFilter
          options={LANGUAGES}
          value={language}
          onChange={setLanguage}
        />
        {currentFavorite && (
          <Pressable
            style={[
              styles.favoriteBtn,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isLangFavorite ? "heart" : "heart-outline"}
              size={16}
              color={isLangFavorite ? theme.primary : theme.text}
            />
            <Text
              style={[
                styles.favoriteText,
                { color: isLangFavorite ? theme.primary : theme.text },
              ]}
            >
              {isLangFavorite ? "Favorited" : "Favorite"}
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={i => String(i)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => String(item.id)}
          renderItem={({ item, index }) => (
            <TrendingCard
              item={item}
              rank={index + 1}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="trending-up"
                size={24}
                color={theme.muted}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No results found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
                Try another language or time range.
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
  headerTitle: { flex: 1, fontSize: 22, fontWeight: "800" },
  filters: { gap: 4, paddingTop: 8 },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rank: { fontSize: 13, fontWeight: "700", minWidth: 24 },
  fullName: { flex: 1, fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: "row", gap: 12, alignItems: "center" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  favoriteBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 14,
  },
  favoriteText: { fontSize: 13, fontWeight: "600" },
});
