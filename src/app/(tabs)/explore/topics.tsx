import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChipFilter } from "../../../components/ui/ChipFilter";
import { useAppTheme } from "../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "AI/ML", value: "ai" },
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "DevOps", value: "devops" },
  { label: "Security", value: "security" },
  { label: "Data", value: "data" },
  { label: "Tools", value: "tools" },
];

const TOPICS: Record<string, { icon: string; label: string; query: string }[]> =
  {
    all: [
      {
        icon: "🤖",
        label: "Machine Learning",
        query: "topic:machine-learning",
      },
      { icon: "⚛️", label: "React", query: "topic:react" },
      { icon: "🐍", label: "Python", query: "topic:python" },
      { icon: "🦀", label: "Rust", query: "topic:rust" },
      { icon: "📦", label: "CLI Tools", query: "topic:cli" },
      { icon: "🔒", label: "Security", query: "topic:security" },
      { icon: "🐳", label: "Docker", query: "topic:docker" },
      { icon: "☸️", label: "Kubernetes", query: "topic:kubernetes" },
      { icon: "⚡", label: "Performance", query: "topic:performance" },
      { icon: "🎮", label: "Games", query: "topic:game-development" },
      { icon: "📱", label: "Android", query: "topic:android" },
      { icon: "🍎", label: "iOS", query: "topic:ios" },
      { icon: "🌍", label: "Web Scraping", query: "topic:web-scraping" },
      { icon: "📊", label: "Data Viz", query: "topic:data-visualization" },
      { icon: "🤝", label: "API", query: "topic:api" },
      { icon: "🧪", label: "Testing", query: "topic:testing" },
    ],
    ai: [
      {
        icon: "🤖",
        label: "Machine Learning",
        query: "topic:machine-learning",
      },
      { icon: "🧠", label: "Deep Learning", query: "topic:deep-learning" },
      { icon: "💬", label: "NLP", query: "topic:natural-language-processing" },
      { icon: "👁️", label: "Computer Vision", query: "topic:computer-vision" },
      {
        icon: "🎯",
        label: "Reinforcement Learning",
        query: "topic:reinforcement-learning",
      },
      { icon: "🔢", label: "Neural Networks", query: "topic:neural-network" },
    ],
    web: [
      { icon: "⚛️", label: "React", query: "topic:react" },
      { icon: "💚", label: "Vue.js", query: "topic:vue" },
      { icon: "🅰️", label: "Angular", query: "topic:angular" },
      { icon: "⚡", label: "Next.js", query: "topic:nextjs" },
      { icon: "🎨", label: "CSS", query: "topic:css" },
      { icon: "🟡", label: "JavaScript", query: "topic:javascript" },
    ],
    mobile: [
      { icon: "📱", label: "React Native", query: "topic:react-native" },
      { icon: "💙", label: "Flutter", query: "topic:flutter" },
      { icon: "🍎", label: "SwiftUI", query: "topic:swiftui" },
      { icon: "🤖", label: "Jetpack Compose", query: "topic:jetpack-compose" },
    ],
    devops: [
      { icon: "🐳", label: "Docker", query: "topic:docker" },
      { icon: "☸️", label: "Kubernetes", query: "topic:kubernetes" },
      { icon: "🔁", label: "CI/CD", query: "topic:ci-cd" },
      { icon: "☁️", label: "Cloud Native", query: "topic:cloud-native" },
    ],
    security: [
      { icon: "🔒", label: "Security", query: "topic:security" },
      {
        icon: "🕵️",
        label: "Penetration Testing",
        query: "topic:penetration-testing",
      },
      { icon: "🔐", label: "Cryptography", query: "topic:cryptography" },
    ],
    data: [
      { icon: "📊", label: "Data Viz", query: "topic:data-visualization" },
      { icon: "🗄️", label: "Database", query: "topic:database" },
      {
        icon: "⚡",
        label: "Data Engineering",
        query: "topic:data-engineering",
      },
    ],
    tools: [
      { icon: "📦", label: "CLI", query: "topic:cli" },
      { icon: "✍️", label: "Editor", query: "topic:editor" },
      { icon: "🐚", label: "Shell", query: "topic:shell" },
    ],
  };

export default function TopicsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const topics = TOPICS[category] ?? TOPICS.all;

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
        <Text style={[styles.title, { color: theme.text }]}>Browse Topics</Text>
      </View>

      <ChipFilter
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
      />

      <ScrollView contentContainerStyle={styles.grid}>
        {topics.map(t => (
          <Pressable
            key={t.label}
            style={[
              styles.tile,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => {
              router.push({
                pathname: "/(tabs)/explore",
                params: { q: t.query },
              });
            }}
          >
            <Text style={styles.tileIcon}>{t.icon}</Text>
            <Text style={[styles.tileLabel, { color: theme.text }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
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
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10 },
  tile: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 8,
  },
  tileIcon: { fontSize: 28 },
  tileLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
});
