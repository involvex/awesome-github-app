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
import { useActivity, useReleases } from "../../../lib/api/hooks";
import { Avatar, ReleaseCard } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type FeedTab = "activity" | "releases";

const FEED_TABS: {
  label: string;
  value: FeedTab;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Activity", value: "activity", icon: "pulse-outline" },
  { label: "My Releases", value: "releases", icon: "rocket-outline" },
];

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
    description: "Code pushes",
    icon: "git-commit-outline",
  },
  {
    value: "PullRequestEvent",
    label: "PRs",
    description: "Pull requests",
    icon: "git-pull-request-outline",
  },
  {
    value: "IssuesEvent",
    label: "Issues",
    description: "Issues",
    icon: "alert-circle-outline",
  },
  {
    value: "WatchEvent",
    label: "Stars",
    description: "Stars",
    icon: "star-outline",
  },
  {
    value: "ForkEvent",
    label: "Forks",
    description: "Forks",
    icon: "git-branch-outline",
  },
  {
    value: "IssueCommentEvent",
    label: "Comments",
    description: "Comments",
    icon: "chatbubble-outline",
  },
  {
    value: "CreateEvent",
    label: "Create",
    description: "Created",
    icon: "add-circle-outline",
  },
  {
    value: "ReleaseEvent",
    label: "Releases",
    description: "Releases",
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

type FeedRow =
  | { kind: "single"; event: ActivityEvent }
  | {
      kind: "pushGroup";
      id: string;
      actorLogin: string;
      actorAvatar?: string;
      repoName: string;
      events: ActivityEvent[];
      latest: ActivityEvent;
    };

function parseRepoPath(fullName: string | undefined): {
  owner: string;
  repo: string;
} | null {
  if (!fullName) return null;
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
}

function collapsePushEvents(events: ActivityEvent[]): FeedRow[] {
  const rows: FeedRow[] = [];
  let i = 0;
  while (i < events.length) {
    const event = events[i];
    if (event.type !== "PushEvent") {
      rows.push({ kind: "single", event });
      i += 1;
      continue;
    }

    const actorLogin = event.actor?.login ?? "";
    const repoName = event.repo?.name ?? "";
    const group: ActivityEvent[] = [event];
    let j = i + 1;
    while (j < events.length) {
      const next = events[j];
      if (
        next.type === "PushEvent" &&
        (next.actor?.login ?? "") === actorLogin &&
        (next.repo?.name ?? "") === repoName
      ) {
        group.push(next);
        j += 1;
      } else {
        break;
      }
    }

    if (group.length === 1) {
      rows.push({ kind: "single", event });
    } else {
      rows.push({
        kind: "pushGroup",
        id: `push-${group[0].id}-${group.length}`,
        actorLogin,
        actorAvatar: event.actor?.avatar_url,
        repoName,
        events: group,
        latest: group[0],
      });
    }
    i = j;
  }
  return rows;
}

function EventRow({
  event,
  pushCount,
}: {
  event: ActivityEvent;
  pushCount?: number;
}) {
  const theme = useAppTheme();
  const router = useRouter();
  const isGroupedPush = (pushCount ?? 1) > 1;
  const { icon, label } = isGroupedPush
    ? {
        icon: "git-commit",
        label: `pushed ${pushCount} times to`,
      }
    : (ICON_MAP[event.type ?? ""] ?? {
        icon: "ellipsis-horizontal",
        label: "activity on",
      });

  const repoPath = parseRepoPath(event.repo?.name);
  const commitMessage =
    event.type === "PushEvent"
      ? (event.payload as { commits?: Array<{ message: string }> })
          ?.commits?.[0]?.message
      : undefined;

  return (
    <View style={[styles.eventRow, { borderBottomColor: theme.border }]}>
      <Pressable
        onPress={() => {
          if (event.actor?.login) router.push(`/user/${event.actor.login}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`View ${event.actor?.login ?? "user"}`}
        style={styles.eventLeft}
      >
        <Avatar
          uri={event.actor?.avatar_url}
          name={event.actor?.login}
          size={28}
        />
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={12}
          color={theme.primary}
          style={[styles.eventIconBadge, { backgroundColor: theme.background }]}
        />
      </Pressable>
      <Pressable
        style={styles.eventBody}
        onPress={() => {
          if (repoPath) {
            router.push(`/repo/${repoPath.owner}/${repoPath.repo}`);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${event.repo?.name ?? "repository"}`}
      >
        <Text style={[styles.eventActor, { color: theme.text }]}>
          <Text
            onPress={() => {
              if (event.actor?.login) router.push(`/user/${event.actor.login}`);
            }}
            style={{ color: theme.text, fontWeight: "600" }}
          >
            {event.actor?.login}
          </Text>{" "}
          <Text style={[styles.eventLabel, { color: theme.subtle }]}>
            {label}{" "}
          </Text>
          <Text style={[styles.eventRepo, { color: theme.primary }]}>
            {event.repo?.name}
          </Text>
        </Text>
        {!!commitMessage && !isGroupedPush && (
          <Text
            style={[styles.eventMeta, { color: theme.subtle }]}
            numberOfLines={1}
          >
            {commitMessage}
          </Text>
        )}
        <Text style={[styles.eventTime, { color: theme.muted }]}>
          {event.created_at
            ? formatDistanceToNow(new Date(event.created_at), {
                addSuffix: true,
              })
            : ""}
        </Text>
      </Pressable>
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
  }, [visible, activeFilters]);

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
  const router = useRouter();
  const [tab, setTab] = useState<FeedTab>("activity");
  const [activeFilters, setActiveFilters] =
    useState<EventFilter[]>(ALL_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  const {
    data: activityData,
    isLoading: isActivityLoading,
    fetchNextPage,
    hasNextPage,
    refetch: refetchActivity,
    isRefetching: isActivityRefetching,
  } = useActivity(user?.login ?? "");

  const {
    data: releasesData,
    refetch: refetchReleases,
    isRefetching: isReleasesRefetching,
    isLoading: isReleasesLoading,
  } = useReleases(user?.login ?? "");

  const allEvents = activityData?.pages.flat() ?? [];
  const hasCustomFilter = activeFilters.length < ALL_FILTERS.length;
  const filteredEvents = hasCustomFilter
    ? allEvents.filter(e => activeFilters.includes(e.type as EventFilter))
    : allEvents;

  const feedRows = useMemo(
    () => collapsePushEvents(filteredEvents),
    [filteredEvents],
  );

  const isLoading = tab === "activity" ? isActivityLoading : isReleasesLoading;
  const isRefetching =
    tab === "activity" ? isActivityRefetching : isReleasesRefetching;
  const refetch = tab === "activity" ? refetchActivity : refetchReleases;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Feed</Text>
        {tab === "activity" && (
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
        )}
      </View>

      <View style={styles.tabFilter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {FEED_TABS.map(t => (
            <Pressable
              key={t.value}
              onPress={() => setTab(t.value)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor:
                    tab === t.value ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={tab === t.value ? "#fff" : theme.subtle}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: tab === t.value ? "#fff" : theme.text },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
      ) : tab === "activity" ? (
        <FlatList
          data={feedRows}
          keyExtractor={item =>
            item.kind === "single" ? item.event.id : item.id
          }
          renderItem={({ item }) =>
            item.kind === "single" ? (
              <EventRow event={item.event} />
            ) : (
              <EventRow
                event={item.latest}
                pushCount={item.events.length}
              />
            )
          }
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
              No recent activity from people you follow
            </Text>
          }
        />
      ) : (
        <FlatList
          data={releasesData ?? []}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <ReleaseCard
              release={item}
              onPress={() => {
                const [owner, repo] = item.repo.full_name.split("/");
                if (owner && repo) router.push(`/repo/${owner}/${repo}`);
              }}
            />
          )}
          contentContainerStyle={styles.releasesList}
          refreshControl={
            <RefreshControl
              refreshing={isReleasesRefetching}
              onRefresh={refetchReleases}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subtle }]}>
              No releases from your repositories yet.
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
    paddingBottom: 10,
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
  tabFilter: { paddingHorizontal: 16, paddingVertical: 10 },
  tabScroll: { gap: 8, paddingRight: 16 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabBtnText: { fontSize: 13, fontWeight: "600" },
  loader: { flex: 1 },
  list: { paddingBottom: 24 },
  releasesList: { padding: 12, gap: 10 },
  eventRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  eventLeft: { alignItems: "center", width: 28 },
  eventIconBadge: { marginTop: -6, borderRadius: 8, padding: 1 },
  eventBody: { flex: 1, gap: 2 },
  eventActor: { fontSize: 14, fontWeight: "600" },
  eventLabel: { fontWeight: "400" },
  eventRepo: { fontWeight: "600" },
  eventMeta: { fontSize: 13 },
  eventTime: { fontSize: 12, marginTop: 1 },
  empty: { textAlign: "center", marginTop: 80, fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  backdropPress: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
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
