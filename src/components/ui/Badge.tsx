import { StyleSheet, Text, View } from "react-native";

interface BadgeProps {
  count?: number;
  color?: string;
}

export function Badge({ count, color = "#F85149" }: BadgeProps) {
  if (!count || count === 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
