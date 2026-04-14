import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

interface StatBarProps {
  stars?: number;
  forks?: number;
  watchers?: number;
  compact?: boolean;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function StatBar({
  stars = 0,
  forks = 0,
  watchers,
  compact = false,
}: StatBarProps) {
  const theme = useAppTheme();
  const iconSize = compact ? 12 : 14;
  const textSize = compact ? 11 : 12;
  const gap = compact ? 8 : 14;
  return (
    <View style={[styles.row, { gap }]}>
      <View style={styles.stat}>
        <Ionicons
          name="star-outline"
          size={iconSize}
          color={theme.subtle}
        />
        <Text
          style={[styles.text, { color: theme.subtle, fontSize: textSize }]}
        >
          {fmt(stars)}
        </Text>
      </View>
      <View style={styles.stat}>
        <Ionicons
          name="git-branch-outline"
          size={iconSize}
          color={theme.subtle}
        />
        <Text
          style={[styles.text, { color: theme.subtle, fontSize: textSize }]}
        >
          {fmt(forks)}
        </Text>
      </View>
      {watchers !== undefined && (
        <View style={styles.stat}>
          <Ionicons
            name="eye-outline"
            size={iconSize}
            color={theme.subtle}
          />
          <Text
            style={[styles.text, { color: theme.subtle, fontSize: textSize }]}
          >
            {fmt(watchers)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  text: { fontSize: 12 },
});
