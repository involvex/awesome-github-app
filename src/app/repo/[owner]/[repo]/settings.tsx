import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useRepo,
  useRepoTopics,
  useUpdateRepo,
  useUpdateTopics,
} from "../../../../lib/api/hooks";
import { SettingsRow } from "../../../../components/ui/SettingsRow";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Section } from "../../../../components/ui/Section";
import { useAppTheme } from "../../../../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function RepoSettingsScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { data } = useRepo(owner!, repo!);
  const { data: topics } = useRepoTopics(owner!, repo!);
  const { mutate: updateRepo, isPending: isUpdating } = useUpdateRepo(
    owner!,
    repo!,
  );
  const { mutate: updateTopics } = useUpdateTopics(owner!, repo!);

  const [name, setName] = useState(data?.name ?? "");
  const [description, setDescription] = useState(data?.description ?? "");
  const [homepage, setHomepage] = useState(data?.homepage ?? "");
  const [newTopic, setNewTopic] = useState("");
  const [localTopics, setLocalTopics] = useState<string[]>(topics ?? []);

  const handleSave = () => {
    updateRepo(
      { name, description, homepage },
      {
        onSuccess: () => Alert.alert("Saved", "Repository settings updated."),
        onError: () => Alert.alert("Error", "Failed to update repository."),
      },
    );
  };

  const addTopic = () => {
    const t = newTopic.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || localTopics.includes(t)) return;
    const updated = [...localTopics, t];
    setLocalTopics(updated);
    updateTopics(updated);
    setNewTopic("");
  };

  const removeTopic = (t: string) => {
    const updated = localTopics.filter(x => x !== t);
    setLocalTopics(updated);
    updateTopics(updated);
  };

  const handleVisibilityToggle = () => {
    if (!data) return;
    const action = data.private ? "make public" : "make private";
    Alert.alert(
      `Change visibility`,
      `Are you sure you want to ${action} this repository?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: "destructive",
          onPress: () => updateRepo({ private: !data.private }),
        },
      ],
    );
  };

  const handleArchive = () => {
    if (!data) return;
    Alert.alert(
      data.archived ? "Unarchive" : "Archive",
      `Are you sure you want to ${data.archived ? "unarchive" : "archive"} this repository?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => updateRepo({ archived: !data.archived }),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
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
            Repository Settings
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={isUpdating}
          >
            <Text style={[styles.save, { color: theme.primary }]}>
              {isUpdating ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </View>

        <Section
          title="General"
          style={styles.section}
        >
          <View style={[styles.field, { borderBottomColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.subtle }]}>
              Name
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: theme.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Repository name"
              placeholderTextColor={theme.muted}
            />
          </View>
          <View style={[styles.field, { borderBottomColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.subtle }]}>
              Description
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
              placeholderTextColor={theme.muted}
              multiline
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.subtle }]}>
              Website
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: theme.text }]}
              value={homepage}
              onChangeText={setHomepage}
              placeholder="https://..."
              placeholderTextColor={theme.muted}
              keyboardType="url"
            />
          </View>
        </Section>

        <Section
          title="Topics / Keywords"
          style={styles.section}
        >
          <View style={[styles.topicsContainer, { padding: 12 }]}>
            <View style={styles.topicChips}>
              {localTopics.map(t => (
                <Pressable
                  key={t}
                  style={[styles.topicChip, { borderColor: theme.primary }]}
                  onPress={() => removeTopic(t)}
                >
                  <Text style={[styles.topicText, { color: theme.primary }]}>
                    {t}
                  </Text>
                  <Ionicons
                    name="close"
                    size={12}
                    color={theme.primary}
                  />
                </Pressable>
              ))}
            </View>
            <View style={[styles.topicInput, { borderColor: theme.border }]}>
              <TextInput
                style={[styles.fieldInput, { color: theme.text, flex: 1 }]}
                value={newTopic}
                onChangeText={setNewTopic}
                placeholder="Add a topic…"
                placeholderTextColor={theme.muted}
                onSubmitEditing={addTopic}
                returnKeyType="done"
              />
              <Pressable onPress={addTopic}>
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={theme.primary}
                />
              </Pressable>
            </View>
          </View>
        </Section>

        <Section
          title="Visibility"
          style={styles.section}
        >
          <SettingsRow
            icon={data?.private ? "lock-closed-outline" : "globe-outline"}
            label={data?.private ? "Private" : "Public"}
            value="Tap to change"
            onPress={handleVisibilityToggle}
          />
        </Section>

        <Section
          title="Danger Zone"
          style={styles.section}
        >
          <SettingsRow
            icon="archive-outline"
            label={
              data?.archived ? "Unarchive repository" : "Archive repository"
            }
            onPress={handleArchive}
            destructive
          />
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
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
  save: { fontSize: 16, fontWeight: "600" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  fieldInput: { fontSize: 15 },
  topicsContainer: { gap: 10 },
  topicChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicText: { fontSize: 12, fontWeight: "600" },
  topicInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
});
