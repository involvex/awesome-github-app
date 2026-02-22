import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";

interface SettingsRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  showChevron = true,
  rightElement,
}: SettingsRowProps) {
  const theme = useAppTheme();
  const color = destructive ? theme.danger : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={styles.right}>
        {value && (
          <Text style={[styles.value, { color: theme.subtle }]}>{value}</Text>
        )}
        {rightElement}
        {showChevron && onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.muted}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  icon: {},
  label: { flex: 1, fontSize: 15 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 14 },
});
