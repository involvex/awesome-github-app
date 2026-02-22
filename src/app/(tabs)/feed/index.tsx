import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useActivity } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

function EventCard({ event }: { event: any }) {
  const theme = useAppTheme();
  const iconMap: Record<string, { icon: string; label: string }> = {
    PushEvent: { icon: "git-commit", label: "pushed to" },
    WatchEvent: { icon: "star", label: "starred" },
    ForkEvent: { icon: "git-branch", label: "forked" },
    PullRequestEvent: { icon: "git-pull-request", label: "pull request on" },
    IssuesEvent: { icon: "alert-circle", label: "opened issue on" },
    CreateEvent: { icon: "add-circle", label: "created" },
    ReleaseEvent: { icon: "rocket", label: "released on" },
    IssueCommentEvent: { icon: "chatbubble", label: "commented on" },
    DeleteEvent: { icon: "trash", label: "deleted from" },
    PublicEvent: { icon: "globe", label: "made public" },
  };
  const { icon, label } = iconMap[event.type] ?? {
    icon: "ellipsis-horizontal",
    label: "activity on",
  };

  return (
    <View
      style={[
        styles.eventCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={theme.primary}
        style={styles.eventIcon}
      />
      <View style={styles.eventBody}>
        <Text style={[styles.eventActor, { color: theme.text }]}>
          {event.actor?.login}{" "}
          <Text style={[styles.eventLabel, { color: theme.subtle }]}>
            {label}{" "}
          </Text>
          <Text style={[styles.eventRepo, { color: theme.primary }]}>
            {event.repo?.name}
          </Text>
        </Text>
        {event.type === "PushEvent" && event.payload?.commits?.[0] && (
          <Text
            style={[styles.eventMeta, { color: theme.subtle }]}
            numberOfLines={1}
          >
            {event.payload.commits[0].message}
          </Text>
        )}
        <Text style={[styles.eventTime, { color: theme.muted }]}>
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { user } = useAuth();
  const theme = useAppTheme();
  const { data, isLoading, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useActivity(user?.login ?? "");
  const events = data?.pages.flat() ?? [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Feed</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subtle }]}>
              No recent activity. Follow some users!
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
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  loader: { flex: 1 },
  list: { padding: 12, gap: 10 },
  eventCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  eventIcon: { marginTop: 2 },
  eventBody: { flex: 1, gap: 3 },
  eventActor: { fontSize: 14, fontWeight: "600" },
  eventLabel: { fontWeight: "400" },
  eventRepo: { fontWeight: "600" },
  eventMeta: { fontSize: 13 },
  eventTime: { fontSize: 12 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 15 },
});
