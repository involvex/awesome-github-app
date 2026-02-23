import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar, ChipFilter } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { useActivity } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type ActivityEvent = NonNullable<
  ReturnType<typeof useActivity>["data"]
>["pages"][number][number];

type EventFilter =
  | "all"
  | "PushEvent"
  | "PullRequestEvent"
  | "IssuesEvent"
  | "WatchEvent"
  | "ForkEvent"
  | "IssueCommentEvent"
  | "CreateEvent"
  | "ReleaseEvent";

const FILTER_OPTIONS: { label: string; value: EventFilter }[] = [
  { label: "All", value: "all" },
  { label: "Push", value: "PushEvent" },
  { label: "Pull Request", value: "PullRequestEvent" },
  { label: "Issues", value: "IssuesEvent" },
  { label: "Stars", value: "WatchEvent" },
  { label: "Forks", value: "ForkEvent" },
  { label: "Comments", value: "IssueCommentEvent" },
  { label: "Create", value: "CreateEvent" },
  { label: "Release", value: "ReleaseEvent" },
];

function EventCard({ event }: { event: ActivityEvent }) {
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
  const { icon, label } = iconMap[event.type ?? ""] ?? {
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
      <View style={styles.eventLeft}>
        <Avatar
          uri={event.actor?.avatar_url}
          name={event.actor?.login}
          size={32}
        />
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={14}
          color={theme.primary}
          style={[styles.eventIconBadge, { backgroundColor: theme.surface }]}
        />
      </View>
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
        {event.type === "PushEvent" &&
          (event.payload as { commits?: Array<{ message: string }> })
            ?.commits?.[0] && (
            <Text
              style={[styles.eventMeta, { color: theme.subtle }]}
              numberOfLines={1}
            >
              {
                (
                  event.payload as {
                    commits?: Array<{ message: string }>;
                  }
                ).commits![0].message
              }
            </Text>
          )}
        <Text style={[styles.eventTime, { color: theme.muted }]}>
          {event.created_at
            ? formatDistanceToNow(new Date(event.created_at), {
                addSuffix: true,
              })
            : ""}
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
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");

  const allEvents = data?.pages.flat() ?? [];
  const events =
    activeFilter === "all"
      ? allEvents
      : allEvents.filter(e => e.type === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Feed</Text>
      </View>
      <ChipFilter
        options={FILTER_OPTIONS}
        value={activeFilter}
        onChange={setActiveFilter}
      />
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
  eventLeft: { alignItems: "center", width: 32 },
  eventIconBadge: {
    marginTop: -8,
    borderRadius: 8,
    padding: 1,
  },
  eventBody: { flex: 1, gap: 3 },
  eventActor: { fontSize: 14, fontWeight: "600" },
  eventLabel: { fontWeight: "400" },
  eventRepo: { fontWeight: "600" },
  eventMeta: { fontSize: 13 },
  eventTime: { fontSize: 12 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 15 },
});
