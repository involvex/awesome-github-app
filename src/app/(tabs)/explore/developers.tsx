import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { Avatar } from "../../../components/ui/Avatar";
import { useSearch } from "../../../lib/api/hooks";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const LANG_OPTIONS = [
  { label: "All", value: "all" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "Python", value: "Python" },
  { label: "Go", value: "Go" },
  { label: "Rust", value: "Rust" },
  { label: "Java", value: "Java" },
  { label: "Swift", value: "Swift" },
  { label: "Kotlin", value: "Kotlin" },
];

export default function DevelopersScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [language, setLanguage] = useState("all");
  const q =
    language === "all"
      ? "followers:>1000"
      : `language:${language} followers:>100`;
  const { data, isLoading } = useSearch(q, "users");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
        <Text style={[styles.title, { color: theme.text }]}>
          Trending Developers
        </Text>
      </View>

      <ChipFilter
        options={LANG_OPTIONS}
        value={language}
        onChange={setLanguage}
      />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.primary}
        />
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() => router.push(`/user/${item.login}`)}
            >
              <Avatar
                uri={item.avatar_url}
                name={item.login}
                size={48}
              />
              <View style={styles.info}>
                <Text style={[styles.login, { color: theme.text }]}>
                  {item.login}
                </Text>
                {item.type === "Organization" && (
                  <Text style={[styles.type, { color: theme.subtle }]}>
                    Organization
                  </Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.muted}
              />
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  back: { padding: 4 },
  title: { flex: 1, fontSize: 22, fontWeight: "800" },
  loader: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  info: { flex: 1 },
  login: { fontSize: 15, fontWeight: "600" },
  type: { fontSize: 12 },
});
