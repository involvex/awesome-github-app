import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LanguageDot } from "../../../../components/ui/LanguageDot";
import { useRepo, useRepoTopics } from "../../../../lib/api/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatBar } from "../../../../components/ui/StatBar";
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

  if (!data) return null;

  return (
    <View style={styles.tabContent}>
      {data.description && (
        <Text style={[styles.description, { color: theme.text }]}>
          {data.description}
        </Text>
      )}
      {data.homepage && (
        <Pressable
          style={styles.link}
          onPress={() => Linking.openURL(data.homepage!)}
        >
          <Ionicons
            name="link-outline"
            size={14}
            color={theme.primary}
          />
          <Text style={[styles.linkText, { color: theme.primary }]}>
            {data.homepage}
          </Text>
        </Pressable>
      )}
      <View style={styles.infoGrid}>
        {[
          {
            icon: "git-branch-outline" as const,
            label: "Default branch",
            value: data.default_branch,
          },
          {
            icon: "document-outline" as const,
            label: "License",
            value: data.license?.name ?? "None",
          },
          {
            icon: "eye-outline" as const,
            label: "Watchers",
            value: String(data.watchers_count),
          },
          {
            icon: "alert-circle-outline" as const,
            label: "Open issues",
            value: String(data.open_issues_count),
          },
        ].map(item => (
          <View
            key={item.label}
            style={[styles.infoItem, { borderColor: theme.border }]}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={theme.subtle}
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>
                {item.label}
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {topics && topics.length > 0 && (
        <View style={styles.topics}>
          <Text style={[styles.topicsLabel, { color: theme.subtle }]}>
            Topics
          </Text>
          <View style={styles.topicChips}>
            {topics.map(t => (
              <View
                key={t}
                style={[
                  styles.topicChip,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.primary,
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
      )}
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
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <View style={styles.repoTitleRow}>
            <Avatar
              uri={data.owner.avatar_url}
              name={data.owner.login}
              size={28}
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
          <StatBar
            stars={data.stargazers_count}
            forks={data.forks_count}
            watchers={data.watchers_count}
          />
          <LanguageDot language={data.language} />

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
                  { color: activeTab === tab ? theme.primary : theme.subtle },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
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
            <Text style={[styles.description, { color: theme.primary }]}>
              View workflows and runs →
            </Text>
          </Pressable>
        )}
        {(activeTab === "Issues" ||
          activeTab === "PRs" ||
          activeTab === "Branches") && (
          <View style={styles.tabContent}>
            <Text style={[styles.description, { color: theme.subtle }]}>
              Coming soon.
            </Text>
          </View>
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
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  repoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ownerText: { fontSize: 15 },
  slashText: { fontSize: 15 },
  repoNameText: { fontSize: 17, fontWeight: "700" },
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
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: "600" },
  tabContent: { padding: 16, gap: 10 },
  description: { fontSize: 15, lineHeight: 22 },
  link: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkText: { fontSize: 14 },
  infoGrid: { gap: 10 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoText: { gap: 1 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  topics: { gap: 8 },
  topicsLabel: { fontSize: 12, fontWeight: "600" },
  topicChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicText: { fontSize: 12, fontWeight: "600" },
});
