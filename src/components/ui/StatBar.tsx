import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

interface StatBarProps {
  stars?: number;
  forks?: number;
  watchers?: number;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function StatBar({ stars = 0, forks = 0, watchers }: StatBarProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Ionicons
          name="star-outline"
          size={14}
          color={theme.subtle}
        />
        <Text style={[styles.text, { color: theme.subtle }]}>{fmt(stars)}</Text>
      </View>
      <View style={styles.stat}>
        <Ionicons
          name="git-branch-outline"
          size={14}
          color={theme.subtle}
        />
        <Text style={[styles.text, { color: theme.subtle }]}>{fmt(forks)}</Text>
      </View>
      {watchers !== undefined && (
        <View style={styles.stat}>
          <Ionicons
            name="eye-outline"
            size={14}
            color={theme.subtle}
          />
          <Text style={[styles.text, { color: theme.subtle }]}>
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
