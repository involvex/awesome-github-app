import type { TrendingRepoItem } from "../../lib/api/hooks/useTrending";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LanguageDot } from "../ui/LanguageDot";
import { formatDistanceToNow } from "date-fns";
import { useAppTheme } from "../../lib/theme";
import { StatBar } from "../ui/StatBar";
import { useRouter } from "expo-router";
import { Avatar } from "../ui/Avatar";

export interface TrendingCardProps {
  item: TrendingRepoItem;
  rank: number;
  compact?: boolean;
  showReleaseDate?: boolean;
}

export function TrendingCard({
  item,
  rank,
  compact = false,
  showReleaseDate = false,
}: TrendingCardProps) {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Pressable
      style={[
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => router.push(`/repo/${item.owner?.login}/${item.name}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.rank, { color: theme.muted }]}>#{rank}</Text>
        <Avatar
          uri={item.owner?.avatar_url}
          name={item.owner?.login ?? ""}
          size={compact ? 22 : 24}
        />
        <Text
          style={[styles.fullName, { color: theme.text }]}
          numberOfLines={1}
        >
          {item.full_name}
        </Text>
      </View>
      {!!item.description && (
        <Text
          style={[styles.desc, { color: theme.subtle }]}
          numberOfLines={compact ? 1 : 2}
        >
          {item.description}
        </Text>
      )}
      <View style={styles.cardFooter}>
        <LanguageDot
          language={item.language}
          showLabel={!compact}
        />
        <StatBar
          stars={item.stargazers_count}
          forks={item.forks_count}
          watchers={compact ? undefined : item.watchers_count}
          compact={compact}
        />
      </View>
      {showReleaseDate && !!item.latestReleaseAt && (
        <Text style={[styles.releaseDate, { color: theme.muted }]}>
          Released{" "}
          {formatDistanceToNow(new Date(item.latestReleaseAt), {
            addSuffix: true,
          })}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  cardCompact: {
    padding: 12,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rank: { fontSize: 13, fontWeight: "700", minWidth: 24 },
  fullName: { flex: 1, fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: "row", gap: 12, alignItems: "center" },
  releaseDate: { fontSize: 12 },
});
