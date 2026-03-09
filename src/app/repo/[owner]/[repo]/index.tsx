import {
  useRepo,
  useRepoTopics,
  useRepoReadme,
  useRepoContents,
  useCreateFork,
  useBranches,
} from "../../../../lib/api/hooks";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LanguageDot } from "../../../../components/ui/LanguageDot";
import { Markdown } from "../../../../components/ui/Markdown";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "../../../../contexts/ToastContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { Avatar } from "../../../../components/ui/Avatar";
import { useAppTheme } from "../../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const TABS = ["About", "Code", "Issues", "PRs", "Actions", "Branches"] as const;
type RepoTab = (typeof TABS)[number];

function AboutTab({ owner, repo }: { owner: string; repo: string }) {
  const theme = useAppTheme();
  const { data } = useRepo(owner, repo);
  const { data: topics } = useRepoTopics(owner, repo);
  const { data: readme, isLoading: isReadmeLoading } = useRepoReadme(
    owner,
    repo,
  );

  if (!data) return null;

  return (
    <View style={styles.tabContent}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
        {!!data.description && (
          <Text style={[styles.description, { color: theme.text }]}>
            {data.description}
          </Text>
        )}
        {!!data.homepage && (
          <Pressable
            style={styles.link}
            onPress={() => Linking.openURL(data.homepage!)}
          >
            <Ionicons
              name="link-outline"
              size={14}
              color={theme.primary}
            />
            <Text
              style={[styles.linkText, { color: theme.primary }]}
              numberOfLines={1}
            >
              {data.homepage}
            </Text>
          </Pressable>
        )}

        <View style={styles.topics}>
          <View style={styles.topicChips}>
            {topics?.map(t => (
              <View
                key={t}
                style={[
                  styles.topicChip,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.topicText, { color: theme.primary }]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoGrid}>
          {[
            {
              icon: "star-outline" as const,
              label: "Stars",
              value: String(data.stargazers_count),
            },
            {
              icon: "eye-outline" as const,
              label: "Watching",
              value: String(data.subscribers_count ?? data.watchers_count),
            },
            {
              icon: "git-network-outline" as const,
              label: "Forks",
              value: String(data.forks_count),
            },
          ].map(item => (
            <View
              key={item.label}
              style={styles.miniStat}
            >
              <Ionicons
                name={item.icon}
                size={14}
                color={theme.subtle}
              />
              <Text style={[styles.miniStatValue, { color: theme.text }]}>
                {item.value}
              </Text>
              <Text style={[styles.miniStatLabel, { color: theme.muted }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            marginTop: 16,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Ionicons
            name="book-outline"
            size={18}
            color={theme.text}
          />
          <Text
            style={[styles.cardTitle, { color: theme.text, marginLeft: 8 }]}
          >
            README.md
          </Text>
        </View>
        {isReadmeLoading ? (
          <ActivityIndicator
            color={theme.primary}
            style={{ marginVertical: 20 }}
          />
        ) : readme ? (
          <Markdown>{readme}</Markdown>
        ) : (
          <Text style={[styles.emptyText, { color: theme.subtle }]}>
            No README available for this repository.
          </Text>
        )}
      </View>
    </View>
  );
}

function CodeTab({ owner, repo }: { owner: string; repo: string }) {
  const theme = useAppTheme();
  const [currentPath, setCurrentPath] = useState("");
  const { data, isLoading } = useRepoContents(owner, repo, currentPath);

  const pathParts = currentPath ? currentPath.split("/") : [];

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <View style={styles.tabContent}>
      {/* Breadcrumb */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.breadcrumb}
        contentContainerStyle={styles.breadcrumbContent}
      >
        <Pressable onPress={() => setCurrentPath("")}>
          <Text style={[styles.breadcrumbPart, { color: theme.primary }]}>
            {repo}
          </Text>
        </Pressable>
        {pathParts.map((part, i) => (
          <View
            key={i}
            style={styles.breadcrumbItem}
          >
            <Text style={[styles.breadcrumbSep, { color: theme.muted }]}>
              {" / "}
            </Text>
            <Pressable
              onPress={() =>
                setCurrentPath(pathParts.slice(0, i + 1).join("/"))
              }
            >
              <Text
                style={[
                  styles.breadcrumbPart,
                  {
                    color:
                      i === pathParts.length - 1 ? theme.text : theme.primary,
                  },
                ]}
              >
                {part}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            color={theme.primary}
            style={{ marginVertical: 20 }}
          />
        ) : !data?.length ? (
          <Text style={[styles.emptyText, { color: theme.subtle }]}>
            This directory is empty.
          </Text>
        ) : (
          <>
            {/* Directories first, then files */}
            {[
              ...data.filter(f => f.type === "dir"),
              ...data.filter(f => f.type !== "dir"),
            ].map((item, idx, arr) => (
              <Pressable
                key={item.sha + item.path}
                style={[
                  styles.fileRow,
                  idx < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => {
                  if (item.type === "dir") {
                    setCurrentPath(item.path);
                  } else if (item.html_url) {
                    Linking.openURL(item.html_url);
                  }
                }}
              >
                <Ionicons
                  name={item.type === "dir" ? "folder" : "document-outline"}
                  size={16}
                  color={item.type === "dir" ? "#e3b341" : theme.subtle}
                  style={styles.fileIcon}
                />
                <Text
                  style={[styles.fileName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.type !== "dir" && item.size > 0 && (
                  <Text style={[styles.fileSize, { color: theme.muted }]}>
                    {formatSize(item.size)}
                  </Text>
                )}
                {item.type === "dir" && (
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={theme.muted}
                  />
                )}
              </Pressable>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

function BranchesTab({ owner, repo }: { owner: string; repo: string }) {
  const theme = useAppTheme();
  const { data: repoData } = useRepo(owner, repo);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBranches(owner, repo);

  const branches = data?.pages.flatMap(p => p) ?? [];
  const defaultBranch = repoData?.default_branch;

  if (isLoading) {
    return (
      <ActivityIndicator
        style={{ flex: 1, padding: 32 }}
        color={theme.primary}
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {branches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="git-branch-outline"
            size={32}
            color={theme.muted}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No branches
          </Text>
        </View>
      ) : (
        branches.map(item => (
          <View
            key={item.name}
            style={[
              styles.branchRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="git-branch-outline"
              size={16}
              color={theme.muted}
            />
            <Text
              style={[styles.branchName, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.name === defaultBranch && (
              <View
                style={[
                  styles.branchBadge,
                  {
                    backgroundColor: theme.primary + "20",
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text
                  style={[styles.branchBadgeText, { color: theme.primary }]}
                >
                  default
                </Text>
              </View>
            )}
            {item.protected && (
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={theme.muted}
              />
            )}
          </View>
        ))
      )}
      {isFetchingNextPage && (
        <ActivityIndicator
          style={{ paddingVertical: 16 }}
          color={theme.primary}
        />
      )}
      {hasNextPage && !isFetchingNextPage && (
        <Pressable
          style={[
            styles.loadMoreBtn,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => fetchNextPage()}
        >
          <Text style={[styles.loadMoreText, { color: theme.primary }]}>
            Load more
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ComingSoonTab({
  name,
  icon,
}: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.emptyState}>
      <View
        style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={theme.muted}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
        The {name.toLowerCase()} feature is coming soon to the app.
      </Text>
      <View
        style={[
          styles.comingSoonBadge,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.comingSoonText, { color: theme.primary }]}>
          COMING SOON
        </Text>
      </View>
    </View>
  );
}

export default function RepoDetailScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading } = useRepo(owner!, repo!);
  const [activeTab, setActiveTab] = useState<RepoTab>("About");
  const forkMutation = useCreateFork(owner!, repo!);

  const isOwner = !!data && !!user && data.owner.login === user.login;

  async function handleShare() {
    if (!data) return;
    try {
      await Share.share({ message: data.html_url });
    } catch {
      // share sheet dismissed — ignore
    }
  }

  async function handleFork() {
    try {
      await forkMutation.mutateAsync();
      showToast("Fork created successfully!", "success");
    } catch {
      showToast("Failed to create fork. Please try again.", "error");
    }
  }

  if (isLoading || !data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView stickyHeaderIndices={[1]}>
        {/* Repo Header */}
        <View
          style={[
            styles.repoHeader,
            {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.repoTitleRow}>
            <Avatar
              uri={data.owner.avatar_url}
              name={data.owner.login}
              size={24}
            />
            <Text style={[styles.ownerText, { color: theme.subtle }]}>
              {data.owner.login}
            </Text>
            <Text style={[styles.slashText, { color: theme.muted }]}>/</Text>
            <Text style={[styles.repoNameText, { color: theme.text }]}>
              {data.name}
            </Text>
            {data.private && (
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
          </View>

          <View style={styles.headerMeta}>
            <LanguageDot language={data.language} />
            <Text style={[styles.headerMetaText, { color: theme.subtle }]}>
              {data.language}
            </Text>
          </View>

          <View style={styles.actionRow}>
            {isOwner && (
              <Pressable
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => router.push(`/repo/${owner}/${repo}/settings`)}
              >
                <Ionicons
                  name="settings-outline"
                  size={16}
                  color={theme.text}
                />
                <Text style={[styles.actionBtnText, { color: theme.text }]}>
                  Settings
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => router.push(`/repo/${owner}/${repo}/workflows`)}
            >
              <Ionicons
                name="play-circle-outline"
                size={16}
                color={theme.success}
              />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                Actions
              </Text>
            </Pressable>
            {isOwner && (
              <Pressable
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => router.push(`/repo/${owner}/${repo}/pages`)}
              >
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={theme.primary}
                />
                <Text style={[styles.actionBtnText, { color: theme.text }]}>
                  Pages
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={16}
                color={theme.text}
              />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>
                Share
              </Text>
            </Pressable>
            {!isOwner && (
              <Pressable
                style={[
                  styles.actionBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={handleFork}
                disabled={forkMutation.isPending}
              >
                {forkMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.primary}
                  />
                ) : (
                  <Ionicons
                    name="git-branch-outline"
                    size={16}
                    color={theme.primary}
                  />
                )}
                <Text style={[styles.actionBtnText, { color: theme.text }]}>
                  Fork
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Tab Bar */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {TABS.map(tab => (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && [
                    styles.tabActive,
                    { borderBottomColor: theme.primary },
                  ],
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? theme.text : theme.subtle },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === "About" && (
          <AboutTab
            owner={owner!}
            repo={repo!}
          />
        )}
        {activeTab === "Code" && (
          <CodeTab
            owner={owner!}
            repo={repo!}
          />
        )}
        {activeTab === "Actions" && (
          <Pressable
            style={styles.tabContent}
            onPress={() => router.push(`/repo/${owner}/${repo}/workflows`)}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  padding: 16,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Ionicons
                  name="play-circle"
                  size={20}
                  color={theme.success}
                />
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, marginLeft: 8 },
                  ]}
                >
                  Workflows
                </Text>
              </View>
              <Text
                style={[
                  styles.description,
                  { color: theme.text, marginTop: 8 },
                ]}
              >
                View automated CI/CD workflows, build logs, and deployment
                status.
              </Text>
              <View
                style={[
                  styles.actionBtn,
                  {
                    marginTop: 12,
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    alignSelf: "flex-start",
                  },
                ]}
              >
                <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                  View runs →
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        {activeTab === "Issues" && (
          <ComingSoonTab
            name="Issues"
            icon="alert-circle-outline"
          />
        )}
        {activeTab === "PRs" && (
          <ComingSoonTab
            name="Pull Requests"
            icon="git-pull-request-outline"
          />
        )}
        {activeTab === "Branches" && (
          <BranchesTab
            owner={owner!}
            repo={repo!}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1 },
  repoHeader: {
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  repoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ownerText: { fontSize: 16 },
  slashText: { fontSize: 16 },
  repoNameText: { fontSize: 18, fontWeight: "700" },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  headerMetaText: {
    fontSize: 13,
  },
  privateTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  privateText: { fontSize: 11, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: "600" },
  tabContent: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  description: { fontSize: 15, lineHeight: 22 },
  link: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  linkText: { fontSize: 14, flex: 1 },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  miniStat: {
    alignItems: "center",
    flex: 1,
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  miniStatLabel: {
    fontSize: 11,
  },
  topics: { marginTop: 4 },
  topicChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicText: { fontSize: 12, fontWeight: "600" },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  comingSoonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  branchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  branchName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  branchBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  branchBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  loadMoreBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  breadcrumb: { marginBottom: 8 },
  breadcrumbContent: { flexDirection: "row", alignItems: "center" },
  breadcrumbItem: { flexDirection: "row", alignItems: "center" },
  breadcrumbPart: { fontSize: 14, fontWeight: "600" },
  breadcrumbSep: { fontSize: 14 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  fileIcon: { width: 18 },
  fileName: { flex: 1, fontSize: 14 },
  fileSize: { fontSize: 12 },
});
