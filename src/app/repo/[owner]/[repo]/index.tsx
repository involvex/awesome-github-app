import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useRepo,
  useRepoTopics,
  useRepoReadme,
} from "../../../../lib/api/hooks";
import { LanguageDot } from "../../../../components/ui/LanguageDot";
import { Markdown } from "../../../../components/ui/Markdown";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Avatar } from "../../../../components/ui/Avatar";
import { useAppTheme } from "../../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const TABS = ["About", "Issues", "PRs", "Actions", "Branches"] as const;
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
  const { data, isLoading } = useRepo(owner!, repo!);
  const [activeTab, setActiveTab] = useState<RepoTab>("About");

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
          <ComingSoonTab
            name="Branches"
            icon="git-branch-outline"
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
});
