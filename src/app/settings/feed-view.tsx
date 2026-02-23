import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePreferences } from "../../lib/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import { useRouter } from "expo-router";

const options = [
  { value: "activity", label: "Recent activity" },
  { value: "repos", label: "Repositories" },
] as const;

export default function FeedViewSettings() {
  const theme = useAppTheme();
  const router = useRouter();
  const { preferences, updatePreference } = usePreferences();

  const handleSelect = (value: (typeof options)[number]["value"]) => {
    updatePreference("defaultFeedView", value);
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Default feed</Text>
      </View>

      <View style={styles.list}>
        {options.map(option => {
          const selected = preferences.defaultFeedView === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.row,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={[styles.label, { color: theme.text }]}>
                {option.label}
              </Text>
              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.primary}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={20}
                  color={theme.muted}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
