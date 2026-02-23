import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useActivity } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { Avatar } from "../../../components/ui";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

type ActivityEvent = NonNullable<
  ReturnType<typeof useActivity>["data"]
>["pages"][number][number];

type EventFilter =
  | "PushEvent"
  | "PullRequestEvent"
  | "IssuesEvent"
  | "WatchEvent"
  | "ForkEvent"
  | "IssueCommentEvent"
  | "CreateEvent"
  | "ReleaseEvent";

const ALL_FILTERS: EventFilter[] = [
  "PushEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "WatchEvent",
  "ForkEvent",
  "IssueCommentEvent",
  "CreateEvent",
  "ReleaseEvent",
];

const EVENT_TYPES: {
  value: EventFilter;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "PushEvent",
    label: "Push",
    description: "Code pushes to branches",
    icon: "git-commit-outline",
  },
  {
    value: "PullRequestEvent",
    label: "Pull Requests",
    description: "Opened, closed, or merged",
    icon: "git-pull-request-outline",
  },
  {
    value: "IssuesEvent",
    label: "Issues",
    description: "Opened or closed issues",
    icon: "alert-circle-outline",
  },
  {
    value: "WatchEvent",
    label: "Stars",
    description: "Repository stars",
    icon: "star-outline",
  },
  {
    value: "ForkEvent",
    label: "Forks",
    description: "Repository forks",
    icon: "git-branch-outline",
  },
  {
    value: "IssueCommentEvent",
    label: "Comments",
    description: "Issue & PR comments",
    icon: "chatbubble-outline",
  },
  {
    value: "CreateEvent",
    label: "Create",
    description: "Branches, tags, repositories",
    icon: "add-circle-outline",
  },
  {
    value: "ReleaseEvent",
    label: "Releases",
    description: "New releases published",
    icon: "rocket-outline",
  },
];

const ICON_MAP: Record<string, { icon: string; label: string }> = {
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

function EventCard({ event }: { event: ActivityEvent }) {
  const theme = useAppTheme();
  const { icon, label } = ICON_MAP[event.type ?? ""] ?? {
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

function FilterModal({
  visible,
  activeFilters,
  onSave,
  onClose,
}: {
  visible: boolean;
  activeFilters: EventFilter[];
  onSave: (filters: EventFilter[]) => void;
  onClose: () => void;
}) {
  const theme = useAppTheme();
  const [draft, setDraft] = useState<EventFilter[]>(activeFilters);

  useEffect(() => {
    if (visible) setDraft([...activeFilters]);
  }, [visible]);

  function toggle(value: EventFilter) {
    setDraft(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    );
  }

  function handleSave() {
    onSave(draft.length === 0 ? [...ALL_FILTERS] : draft);
    onClose();
  }

  const isAll = draft.length === ALL_FILTERS.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.backdropPress}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              Filter Events
            </Text>
            <Text style={[styles.sheetCount, { color: theme.subtle }]}>
              {isAll ? "All types" : `${draft.length} selected`}
            </Text>
          </View>

          <ScrollView
            style={styles.filterList}
            showsVerticalScrollIndicator={false}
          >
            {EVENT_TYPES.map(et => {
              const checked = draft.includes(et.value);
              return (
                <Pressable
                  key={et.value}
                  onPress={() => toggle(et.value)}
                  style={({ pressed }) => [
                    styles.filterRow,
                    { borderBottomColor: theme.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View
                    style={[
                      styles.filterIcon,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <Ionicons
                      name={et.icon}
                      size={18}
                      color={theme.subtle}
                    />
                  </View>
                  <View style={styles.filterInfo}>
                    <Text style={[styles.filterLabel, { color: theme.text }]}>
                      {et.label}
                    </Text>
                    <Text style={[styles.filterDesc, { color: theme.subtle }]}>
                      {et.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      checked
                        ? {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          }
                        : {
                            backgroundColor: "transparent",
                            borderColor: theme.border,
                          },
                    ]}
                  >
                    {checked && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color="#fff"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.sheetFooter, { borderTopColor: theme.border }]}>
            <Pressable
              onPress={() => setDraft([...ALL_FILTERS])}
              style={({ pressed }) => [
                styles.btnReset,
                { borderColor: theme.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.btnResetText, { color: theme.text }]}>
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.btnSave,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.btnSaveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function FeedScreen() {
  const { user } = useAuth();
  const theme = useAppTheme();
  const { data, isLoading, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useActivity(user?.login ?? "");
  const [activeFilters, setActiveFilters] =
    useState<EventFilter[]>(ALL_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  const allEvents = data?.pages.flat() ?? [];
  const hasCustomFilter = activeFilters.length < ALL_FILTERS.length;
  const events = hasCustomFilter
    ? allEvents.filter(e => activeFilters.includes(e.type as EventFilter))
    : allEvents;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Feed</Text>
        <Pressable
          onPress={() => setFilterVisible(true)}
          style={({ pressed }) => [
            styles.filterBtn,
            pressed && { opacity: 0.6 },
          ]}
          accessibilityLabel="Filter events"
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={hasCustomFilter ? theme.primary : theme.subtle}
          />
          {hasCustomFilter && (
            <View
              style={[styles.filterDot, { backgroundColor: theme.primary }]}
            />
          )}
        </Pressable>
      </View>

      <FilterModal
        visible={filterVisible}
        activeFilters={activeFilters}
        onSave={setActiveFilters}
        onClose={() => setFilterVisible(false)}
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
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  filterBtn: { paddingBottom: 4 },
  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    position: "absolute",
    top: 0,
    right: -1,
  },
  loader: { flex: 1 },
  list: { padding: 12, gap: 10 },
  // Event card
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
  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingBottom: 34,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700" },
  sheetCount: { fontSize: 13 },
  filterList: { flexGrow: 0 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterInfo: { flex: 1 },
  filterLabel: { fontSize: 15, fontWeight: "500" },
  filterDesc: { fontSize: 12, marginTop: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btnReset: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  btnResetText: { fontSize: 15, fontWeight: "600" },
  btnSave: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSaveText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
