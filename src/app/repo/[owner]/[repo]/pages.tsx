import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SettingsRow } from "../../../../components/ui/SettingsRow";
import { useRepo, useUpdateRepo } from "../../../../lib/api/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Section } from "../../../../components/ui/Section";
import { useAppTheme } from "../../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function PagesScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { data } = useRepo(owner!, repo!);
  const { mutate: updateRepo } = useUpdateRepo(owner!, repo!);

  const hasPages = !!(data as any)?.has_pages;
  const pagesUrl = `https://${owner}.github.io/${repo}/`;

  const [customDomain, setCustomDomain] = useState("");
  const [httpsEnforced, setHttpsEnforced] = useState(true);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
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
        <Text style={[styles.title, { color: theme.text }]}>GitHub Pages</Text>
      </View>

      {hasPages ? (
        <>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: theme.success + "20",
                borderColor: theme.success,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.success}
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                Your site is live
              </Text>
              <Text style={[styles.statusUrl, { color: theme.primary }]}>
                {pagesUrl}
              </Text>
            </View>
          </View>

          <Section
            title="Source"
            style={styles.section}
          >
            <SettingsRow
              icon="git-branch-outline"
              label="Branch"
              value={data?.default_branch ?? "main"}
              onPress={() => {}}
            />
          </Section>

          <Section
            title="Custom Domain"
            style={styles.section}
          >
            <View style={[styles.field, { padding: 12 }]}>
              <TextInput
                style={[
                  styles.fieldInput,
                  { color: theme.text, borderColor: theme.border },
                ]}
                value={customDomain}
                onChangeText={setCustomDomain}
                placeholder="e.g. www.example.com"
                placeholderTextColor={theme.muted}
              />
            </View>
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Enforce HTTPS"
              showChevron={false}
              rightElement={
                <Switch
                  value={httpsEnforced}
                  onValueChange={setHttpsEnforced}
                />
              }
            />
          </Section>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="globe-outline"
            size={56}
            color={theme.border}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            GitHub Pages not enabled
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.subtle }]}>
            Publish your repository as a website directly from GitHub.
          </Text>
          <Pressable
            style={[styles.enableBtn, { backgroundColor: theme.primary }]}
            onPress={() =>
              Alert.alert(
                "Enable Pages",
                "Go to GitHub web to enable Pages for this repository.",
              )
            }
          >
            <Text style={styles.enableBtnText}>Enable GitHub Pages</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  back: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontWeight: "700" },
  statusCard: {
    flexDirection: "row",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    alignItems: "flex-start",
  },
  statusInfo: { flex: 1, gap: 3 },
  statusTitle: { fontSize: 15, fontWeight: "600" },
  statusUrl: { fontSize: 13 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  field: {},
  fieldInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  enableBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enableBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
