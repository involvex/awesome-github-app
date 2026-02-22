import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../lib/theme";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Section({ title, children, style }: SectionProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.section, style]}>
      <Text style={[styles.title, { color: theme.subtle }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.content,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  title: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  content: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
