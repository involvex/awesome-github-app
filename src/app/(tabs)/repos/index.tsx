import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMyRepos, type RepoFilter } from "../../../lib/api/hooks";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { StatBar } from "../../../components/ui/StatBar";
import { useAppTheme } from "../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

type MyRepo = NonNullable<
  ReturnType<typeof useMyRepos>["data"]
>["pages"][number][number];

const FILTERS: { label: string; value: RepoFilter }[] = [
  { label: "Owner", value: "owner" },
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Forked", value: "forks" },
];

function RepoCard({ item }: { item: MyRepo }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => router.push(`/repo/${item.owner.login}/${item.name}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.repoName, { color: theme.primary }]}>
          {item.name}
        </Text>
        {item.private && (
          <View style={[styles.privateTag, { borderColor: theme.border }]}>
            <Ionicons
              name="lock-closed"
              size={10}
              color={theme.subtle}
            />
            <Text style={[styles.privateText, { color: theme.subtle }]}>
              Private
            </Text>
          </View>
        )}
        {item.fork && (
          <View style={[styles.privateTag, { borderColor: theme.border }]}>
            <Ionicons
              name="git-branch"
              size={10}
              color={theme.subtle}
            />
            <Text style={[styles.privateText, { color: theme.subtle }]}>
              Fork
            </Text>
          </View>
        )}
      </View>
      {!!item.description && (
        <Text
          style={[styles.desc, { color: theme.subtle }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}
      <View style={styles.meta}>
        <LanguageDot language={item.language} />
        <StatBar
          stars={item.stargazers_count}
          forks={item.forks_count}
        />
        {item.updated_at && (
          <Text style={[styles.time, { color: theme.muted }]}>
            Updated{" "}
            {formatDistanceToNow(new Date(item.updated_at), {
              addSuffix: true,
            })}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function ReposScreen() {
  const theme = useAppTheme();
  const [filter, setFilter] = useState<RepoFilter>("owner");
  const [search, setSearch] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useMyRepos(filter, "updated");
  const allRepos = data?.pages.flat() ?? [];
  const filtered = search
    ? allRepos.filter((r: MyRepo) =>
        r.name.toLowerCase().includes(search.toLowerCase()),
      )
    : allRepos;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Repositories
        </Text>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name="search"
            size={15}
            color={theme.muted}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Find a repository…"
            placeholderTextColor={theme.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ChipFilter
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <RepoCard item={item} />}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subtle }]}>
              No repositories found.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 4,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  loader: { flex: 1 },
  list: { padding: 12, gap: 10 },
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  repoName: { fontSize: 15, fontWeight: "700", flex: 1 },
  privateTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  privateText: { fontSize: 11 },
  desc: { fontSize: 13, lineHeight: 18 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  time: { fontSize: 11 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 15 },
});
