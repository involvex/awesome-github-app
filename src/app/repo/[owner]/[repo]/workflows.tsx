import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useCancelRun,
  useDispatchWorkflow,
  useWorkflowRuns,
  useWorkflows,
} from "../../../../lib/api/hooks";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "../../../../lib/theme";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type WorkflowItem = NonNullable<
  ReturnType<typeof useWorkflows>["data"]
>[number];
type WorkflowRun = NonNullable<
  ReturnType<typeof useWorkflowRuns>["data"]
>[number];

const STATUS_ICON: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  completed: { icon: "checkmark-circle", color: "#3FB950" },
  success: { icon: "checkmark-circle", color: "#3FB950" },
  failure: { icon: "close-circle", color: "#F85149" },
  in_progress: { icon: "sync-circle", color: "#D29922" },
  queued: { icon: "time-outline", color: "#8B949E" },
  waiting: { icon: "hourglass-outline", color: "#8B949E" },
  cancelled: { icon: "ban-outline", color: "#8B949E" },
};

function RunRow({
  run,
  owner,
  repo,
}: {
  run: WorkflowRun;
  owner: string;
  repo: string;
}) {
  const theme = useAppTheme();
  const { mutate: cancel, isPending } = useCancelRun(owner, repo);
  const statusKey = run.conclusion ?? run.status ?? "";
  const { icon, color } = STATUS_ICON[statusKey] ?? {
    icon: "ellipse-outline" as const,
    color: theme.muted,
  };

  return (
    <View style={[styles.runRow, { borderBottomColor: theme.border }]}>
      <Ionicons
        name={icon}
        size={20}
        color={color}
      />
      <View style={styles.runInfo}>
        <Text
          style={[styles.runName, { color: theme.text }]}
          numberOfLines={1}
        >
          {run.name}
        </Text>
        <Text style={[styles.runMeta, { color: theme.subtle }]}>
          #{run.run_number} · {run.actor?.login} ·{" "}
          {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
        </Text>
      </View>
      {(run.status === "in_progress" || run.status === "queued") && (
        <Pressable
          onPress={() => cancel(run.id)}
          disabled={isPending}
          style={[styles.cancelBtn, { borderColor: theme.danger }]}
        >
          <Text style={[styles.cancelText, { color: theme.danger }]}>
            {isPending ? "…" : "Cancel"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function WorkflowsScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { data: workflows, isLoading: loadingWorkflows } = useWorkflows(
    owner!,
    repo!,
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | undefined>(
    undefined,
  );
  const { data: runs, isLoading: loadingRuns } = useWorkflowRuns(
    owner!,
    repo!,
    selectedWorkflow,
  );
  const { mutate: dispatch, isPending: isDispatching } = useDispatchWorkflow(
    owner!,
    repo!,
  );

  const handleDispatch = (workflowId: number) => {
    Alert.alert(
      "Trigger Workflow",
      "Run this workflow on the default branch?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Run",
          onPress: () => dispatch({ workflowId, ref: "main" }),
        },
      ],
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
        <Text style={[styles.title, { color: theme.text }]}>Actions</Text>
      </View>

      {loadingWorkflows ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : !workflows?.length ? (
        <EmptyState
          icon="play-circle-outline"
          title="No workflows"
          description="No GitHub Actions workflows found in this repository."
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Workflow selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workflowTabs}
          >
            <Pressable
              style={[
                styles.wfTab,
                {
                  borderColor: !selectedWorkflow ? theme.primary : theme.border,
                  backgroundColor: !selectedWorkflow
                    ? theme.primary + "20"
                    : theme.surface,
                },
              ]}
              onPress={() => setSelectedWorkflow(undefined)}
            >
              <Text
                style={[
                  styles.wfTabText,
                  { color: !selectedWorkflow ? theme.primary : theme.text },
                ]}
              >
                All runs
              </Text>
            </Pressable>
            {workflows.map((wf: WorkflowItem) => (
              <Pressable
                key={wf.id}
                style={[
                  styles.wfTab,
                  {
                    borderColor:
                      selectedWorkflow === wf.id ? theme.primary : theme.border,
                    backgroundColor:
                      selectedWorkflow === wf.id
                        ? theme.primary + "20"
                        : theme.surface,
                  },
                ]}
                onPress={() => setSelectedWorkflow(wf.id)}
              >
                <Text
                  style={[
                    styles.wfTabText,
                    {
                      color:
                        selectedWorkflow === wf.id ? theme.primary : theme.text,
                    },
                  ]}
                >
                  {wf.name}
                </Text>
                <Pressable
                  onPress={() => handleDispatch(wf.id)}
                  style={styles.dispatchBtn}
                  disabled={isDispatching}
                >
                  <Ionicons
                    name="play"
                    size={12}
                    color={theme.primary}
                  />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>

          {/* Runs list */}
          {loadingRuns ? (
            <ActivityIndicator
              style={styles.loader}
              color={theme.primary}
            />
          ) : (
            <FlatList
              data={runs ?? []}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <RunRow
                  run={item}
                  owner={owner!}
                  repo={repo!}
                />
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: theme.subtle }]}>
                  No runs yet.
                </Text>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  back: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontWeight: "700" },
  loader: { flex: 1 },
  workflowTabs: { flexDirection: "row", gap: 8, padding: 12 },
  wfTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  wfTabText: { fontSize: 13, fontWeight: "600" },
  dispatchBtn: { padding: 2 },
  runRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  runInfo: { flex: 1, gap: 3 },
  runName: { fontSize: 14, fontWeight: "600" },
  runMeta: { fontSize: 12 },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: { fontSize: 12, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 60, fontSize: 15 },
});
