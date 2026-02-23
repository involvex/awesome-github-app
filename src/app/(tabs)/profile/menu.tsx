import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LanguageDot } from "../../../components/ui/LanguageDot";
import { StatBar } from "../../../components/ui/StatBar";
import { useStarredRepos } from "../../../lib/api/hooks";
import { useAuth } from "../../../contexts/AuthContext";
import { Avatar } from "../../../components/ui/Avatar";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export default function ProfileMenuScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useStarredRepos(user?.login ?? "");

  const items = useMemo(() => data?.pages.flatMap(page => page) ?? [], [data]);

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Starred Repositories
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : isError ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="warning-outline"
            size={18}
            color={theme.muted}
          />
          <Text style={[styles.emptyText, { color: theme.subtle }]}>
            Unable to load starred repositories.
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={[styles.retry, { color: theme.primary }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() =>
                router.push(`/repo/${item.owner.login}/${item.name}`)
              }
            >
              <Avatar
                uri={item.owner.avatar_url}
                name={item.owner.login}
                size={36}
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
                <View style={styles.metaRow}>
                  <LanguageDot language={item.language} />
                  <StatBar
                    stars={item.stargazers_count}
                    forks={item.forks_count}
                  />
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={
            items.length === 0 ? styles.listEmptyContainer : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={18}
                color={theme.muted}
              />
              <Text style={[styles.emptyText, { color: theme.subtle }]}>
                You have no starred repositories yet.
              </Text>
            </View>
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={{ paddingVertical: 10 }}
                color={theme.primary}
              />
            ) : null
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
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
  loader: { flex: 1, justifyContent: "center" },
  row: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  repoInfo: { flex: 1, gap: 4 },
  repoName: { fontSize: 14, fontWeight: "600" },
  repoDesc: { fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  listEmptyContainer: { flexGrow: 1, padding: 24 },
  emptyState: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 20,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  retry: { fontSize: 14, fontWeight: "600", marginTop: 4 },
});
