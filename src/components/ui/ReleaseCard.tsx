import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Release } from "../../lib/api/hooks";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import { Avatar } from "./Avatar";

export interface ReleaseCardProps {
  release: Release;
  onPress?: () => void;
}

export function ReleaseCard({ release, onPress }: ReleaseCardProps) {
  const theme = useAppTheme();
  const isPrerelease = release.prerelease;
  const date = release.published_at ?? release.created_at;
  const releaseName = release.name ?? release.tag_name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Avatar
          uri={release.author.avatar_url}
          name={release.author.login}
          size={28}
        />
        <View style={styles.headerText}>
          <Text
            style={[styles.repoName, { color: theme.text }]}
            numberOfLines={1}
          >
            {release.repo.full_name}
          </Text>
          <Text style={[styles.authorName, { color: theme.subtle }]}>
            by {release.author.login}
          </Text>
        </View>
        {isPrerelease && (
          <View style={[styles.badge, { backgroundColor: theme.muted + "20" }]}>
            <Text style={[styles.badgeText, { color: theme.muted }]}>beta</Text>
          </View>
        )}
      </View>

      <View style={styles.tagRow}>
        <Ionicons
          name="pricetag"
          size={16}
          color={theme.primary}
        />
        <Text style={[styles.tag, { color: theme.primary }]}>
          {release.tag_name}
        </Text>
      </View>

      {releaseName && (
        <Text
          style={[styles.name, { color: theme.text }]}
          numberOfLines={2}
        >
          {releaseName}
        </Text>
      )}

      {release.body && (
        <Text
          style={[styles.body, { color: theme.subtle }]}
          numberOfLines={3}
        >
          {release.body}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.time, { color: theme.muted }]}>
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </Text>
        <Pressable style={styles.downloadBtn}>
          <Ionicons
            name="download-outline"
            size={14}
            color={theme.subtle}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  pressed: { opacity: 0.7 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { flex: 1 },
  repoName: { fontSize: 13, fontWeight: "600" },
  authorName: { fontSize: 11 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tag: { fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  name: { fontSize: 15, fontWeight: "600" },
  body: { fontSize: 13, lineHeight: 18 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  time: { fontSize: 12 },
  downloadBtn: { padding: 4 },
});
