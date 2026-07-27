import {
  useTrending,
  type TrendingMode,
  type TrendingPeriod,
} from "../../../lib/api/hooks";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TrendingCard } from "../../../components/explore";
import { useToast } from "../../../contexts/ToastContext";
import { useFavorites } from "../../../lib/favorites";
import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

const PERIODS: { label: string; value: TrendingPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const MODES: { label: string; value: TrendingMode }[] = [
  { label: "Hot", value: "hot" },
  { label: "New", value: "new" },
  { label: "Released", value: "released" },
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

function parseMode(value: string | string[] | undefined): TrendingMode {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "new" || raw === "released" || raw === "hot") return raw;
  return "hot";
}

function parsePeriod(value: string | string[] | undefined): TrendingPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "today" || raw === "week" || raw === "month") return raw;
  return "week";
}

export default function TrendingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string | string[];
    period?: string | string[];
  }>();
  const initialMode = useMemo(() => parseMode(params.mode), [params.mode]);
  const initialPeriod = useMemo(
    () => parsePeriod(params.period),
    [params.period],
  );
  const [period, setPeriod] = useState<TrendingPeriod>(initialPeriod);
  const [mode, setMode] = useState<TrendingMode>(initialMode);
  const [language, setLanguage] = useState("all");
  const { data, isLoading, refetch } = useTrending(
    period,
    language === "all" ? undefined : language,
    mode,
  );
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setPeriod(initialPeriod);
  }, [initialPeriod]);

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
          options={MODES}
          value={mode}
          onChange={setMode}
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
              showReleaseDate={mode === "released"}
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
                Try another mode, language, or time range.
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
