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
import { LanguageDot } from "../../../components/ui/LanguageDot";
import type { SearchRepoItem } from "../../../lib/api/hooks";
import { StatBar } from "../../../components/ui/StatBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useSearch } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const QUICK_TOPICS = [
  { label: "🤖 AI & ML", query: "topic:machine-learning stars:>500" },
  { label: "🌐 Web", query: "topic:web stars:>1000" },
  { label: "📱 Mobile", query: "topic:mobile stars:>500" },
  { label: "🔒 Security", query: "topic:security stars:>500" },
  { label: "🐳 DevOps", query: "topic:devops stars:>500" },
  { label: "🎮 Games", query: "topic:game stars:>500" },
  { label: "📊 Data", query: "topic:data-science stars:>500" },
  { label: "🦀 Rust", query: "language:rust stars:>500" },
];

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
        {item.description && (
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
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const { data, isLoading } = useSearch(activeQuery, "repositories");

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length >= 2) setActiveQuery(text);
    else setActiveQuery("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
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
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color={theme.muted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {activeQuery ? (
        isLoading ? (
          <ActivityIndicator
            style={styles.loader}
            color={theme.primary}
          />
        ) : (
          <FlatList
            data={data as SearchRepoItem[]}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <RepoRow item={item} />}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Trending
          </Text>
          <View style={styles.trendingButtons}>
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
  headerTitle: { fontSize: 28, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  loader: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
  },
  trendingButtons: { gap: 8, marginBottom: 8 },
  trendBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  trendBtnText: { flex: 1, fontSize: 15, fontWeight: "600" },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  topicChipText: { fontSize: 14 },
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
});
