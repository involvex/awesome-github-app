import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { useToast } from "../../../contexts/ToastContext";
import { useFavorites } from "../../../lib/favorites";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "Systems", value: "systems" },
  { label: "Data", value: "data" },
];

const LANGUAGES: Record<
  string,
  { icon: string; label: string; query: string; color: string }[]
> = {
  all: [
    {
      icon: "📜",
      label: "TypeScript",
      query: "language:typescript",
      color: "#3178c6",
    },
    {
      icon: "🟨",
      label: "JavaScript",
      query: "language:javascript",
      color: "#f1e05a",
    },
    { icon: "🐍", label: "Python", query: "language:python", color: "#3572A5" },
    { icon: "🐹", label: "Go", query: "language:go", color: "#00ADD8" },
    { icon: "🦀", label: "Rust", query: "language:rust", color: "#dea584" },
    { icon: "☕", label: "Java", query: "language:java", color: "#b07219" },
    { icon: "🍎", label: "Swift", query: "language:swift", color: "#F05138" },
    { icon: "🟣", label: "Kotlin", query: "language:kotlin", color: "#A97BFF" },
    { icon: "🎯", label: "Dart", query: "language:dart", color: "#00B4AB" },
    { icon: "💎", label: "Ruby", query: "language:ruby", color: "#701516" },
    { icon: "🐘", label: "PHP", query: "language:php", color: "#4F5D95" },
    { icon: "🐚", label: "Shell", query: "language:shell", color: "#89e051" },
    { icon: "⚙️", label: "C++", query: "language:cpp", color: "#f34b7d" },
    { icon: "♯", label: "C#", query: "language:csharp", color: "#178600" },
    { icon: "🎨", label: "CSS", query: "language:css", color: "#563d7c" },
    { icon: "📄", label: "HTML", query: "language:html", color: "#e34c26" },
  ],
  web: [
    {
      icon: "📜",
      label: "TypeScript",
      query: "language:typescript",
      color: "#3178c6",
    },
    {
      icon: "🟨",
      label: "JavaScript",
      query: "language:javascript",
      color: "#f1e05a",
    },
    { icon: "🎨", label: "CSS", query: "language:css", color: "#563d7c" },
    { icon: "📄", label: "HTML", query: "language:html", color: "#e34c26" },
    { icon: "🐘", label: "PHP", query: "language:php", color: "#4F5D95" },
    { icon: "💎", label: "Ruby", query: "language:ruby", color: "#701516" },
  ],
  mobile: [
    { icon: "🟣", label: "Kotlin", query: "language:kotlin", color: "#A97BFF" },
    { icon: "🍎", label: "Swift", query: "language:swift", color: "#F05138" },
    { icon: "🎯", label: "Dart", query: "language:dart", color: "#00B4AB" },
    {
      icon: "📜",
      label: "TypeScript",
      query: "language:typescript",
      color: "#3178c6",
    },
    { icon: "☕", label: "Java", query: "language:java", color: "#b07219" },
  ],
  systems: [
    { icon: "🦀", label: "Rust", query: "language:rust", color: "#dea584" },
    { icon: "⚙️", label: "C++", query: "language:cpp", color: "#f34b7d" },
    { icon: "🐹", label: "Go", query: "language:go", color: "#00ADD8" },
    { icon: "C", label: "C", query: "language:c", color: "#555555" },
    { icon: "Zig", label: "Zig", query: "language:zig", color: "#ec915c" },
  ],
  data: [
    { icon: "🐍", label: "Python", query: "language:python", color: "#3572A5" },
    { icon: "R", label: "R", query: "language:r", color: "#198CE7" },
    { icon: "SQL", label: "SQL", query: "language:sql", color: "#e38c00" },
    { icon: "📊", label: "Julia", query: "language:julia", color: "#a270ba" },
  ],
};

export default function LanguagesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const languages = LANGUAGES[category] ?? LANGUAGES.all;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

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
        <Text style={[styles.title, { color: theme.text }]}>
          Browse Languages
        </Text>
      </View>

      <ChipFilter
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
      />

      <ScrollView contentContainerStyle={styles.grid}>
        {languages.map(l => {
          const favoriteItem = {
            id: `language:${l.label}`,
            label: l.label,
            query: `${l.query} stars:>500`,
            type: "language" as const,
          };
          const isFav = isFavorite(favoriteItem.id);
          return (
            <Pressable
              key={l.label}
              style={[
                styles.tile,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/explore",
                  params: { q: `${l.query} stars:>500` },
                });
              }}
            >
              <Pressable
                style={styles.heartBtn}
                onPress={e => {
                  e.stopPropagation?.();
                  const wasFav = isFavorite(favoriteItem.id);
                  toggleFavorite(favoriteItem);
                  showToast(
                    wasFav
                      ? `${favoriteItem.label} removed from favorites`
                      : `${favoriteItem.label} added to favorites`,
                    "success",
                  );
                }}
              >
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={16}
                  color={isFav ? theme.primary : theme.text}
                />
              </Pressable>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: l.color + "20" },
                ]}
              >
                <Text style={[styles.tileIcon, { color: l.color }]}>
                  {l.icon}
                </Text>
              </View>
              <Text style={[styles.tileLabel, { color: theme.text }]}>
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10 },
  tile: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 8,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tileIcon: { fontSize: 24, fontWeight: "700" },
  tileLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
});
