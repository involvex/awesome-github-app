import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../../lib/api/hooks";
import { Badge } from "../../../components/ui/Badge";
import { useAppTheme } from "../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type Segment = "all" | "participating" | "assigned" | "mentioned";

type NotificationItem = NonNullable<
  ReturnType<typeof useNotifications>["data"]
>[number];

const SEGMENTS: { label: string; value: Segment }[] = [
  { label: "All", value: "all" },
  { label: "Participating", value: "participating" },
  { label: "Assigned", value: "assigned" },
  { label: "Mentioned", value: "mentioned" },
];

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Issue: "alert-circle-outline",
  PullRequest: "git-pull-request",
  Release: "rocket-outline",
  Discussion: "chatbubble-outline",
  Commit: "git-commit-outline",
};

function NotifRow({ item }: { item: NotificationItem }) {
  const theme = useAppTheme();
  const { mutate: markRead } = useMarkNotificationRead();
  const isUnread = item.unread;
  const icon = TYPE_ICON[item.subject?.type] ?? "notifications-outline";

  return (
    <Pressable
      style={[
        styles.row,
        {
          borderBottomColor: theme.border,
          backgroundColor: isUnread ? theme.surface : theme.background,
        },
      ]}
      onPress={() => markRead(item.id)}
    >
      <View style={styles.rowLeft}>
        {isUnread && (
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
        )}
        <Ionicons
          name={icon}
          size={18}
          color={isUnread ? theme.primary : theme.muted}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.repo, { color: theme.subtle }]}>
          {item.repository?.full_name}
        </Text>
        <Text
          style={[styles.subject, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.subject?.title}
        </Text>
        <Text style={[styles.time, { color: theme.muted }]}>
          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
        </Text>
      </View>
      {isUnread && (
        <Pressable
          onPress={() => markRead(item.id)}
          style={styles.readBtn}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={theme.primary}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useAppTheme();
  const [segment, setSegment] = useState<Segment>("all");
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const { mutate: markAll, isPending } = useMarkAllRead();

  const filtered = (data ?? []).filter((n: NotificationItem) => {
    if (segment === "all") return true;
    if (segment === "participating") return n.reason === "participating";
    if (segment === "assigned") return n.reason === "assign";
    if (segment === "mentioned") return n.reason === "mention";
    return true;
  });

  const unreadCount = (data ?? []).filter(
    (n: NotificationItem) => n.unread,
  ).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && <Badge count={unreadCount} />}
          <Pressable
            onPress={() => markAll()}
            disabled={isPending}
          >
            <Text style={[styles.markAll, { color: theme.primary }]}>
              {isPending ? "…" : "Mark all read"}
            </Text>
          </Pressable>
        </View>
        <View
          style={[
            styles.segmentBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {SEGMENTS.map(s => (
            <Pressable
              key={s.value}
              style={[
                styles.segment,
                segment === s.value && {
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                },
              ]}
              onPress={() => setSegment(s.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: segment === s.value ? "#fff" : theme.subtle },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotifRow item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subtle }]}>
              {segment === "all"
                ? "You're all caught up! 🎉"
                : `No ${segment} notifications.`}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
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
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800", flex: 1 },
  markAll: { fontSize: 13, fontWeight: "600" },
  segmentBar: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 2,
  },
  segment: { flex: 1, paddingVertical: 7, alignItems: "center" },
  segmentText: { fontSize: 12, fontWeight: "600" },
  loader: { flex: 1 },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingTop: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  rowContent: { flex: 1, gap: 3 },
  repo: { fontSize: 11, fontWeight: "600" },
  subject: { fontSize: 14 },
  time: { fontSize: 12 },
  readBtn: { padding: 4 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 15 },
});
