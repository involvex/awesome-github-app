import { StyleSheet, Text, View } from "react-native";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C#": "#178600",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

interface LanguageDotProps {
  language?: string | null;
  showLabel?: boolean;
}

export function LanguageDot({ language, showLabel = true }: LanguageDotProps) {
  if (!language) return null;
  const color = LANG_COLORS[language] ?? "#8B949E";
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {showLabel && <Text style={styles.label}>{language}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  label: { fontSize: 12, color: "#8B949E" },
});
