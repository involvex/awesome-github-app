import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  languageFromFileName,
  useFileContent,
} from "../../lib/api/hooks/useFileContent";
import { useToast } from "../../contexts/ToastContext";
import { toSafeGitHubUrl } from "../../lib/security";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../lib/theme";
import * as Clipboard from "expo-clipboard";
import { useMemo } from "react";

const LARGE_FILE_BYTES = 100 * 1024; // 100KB - show warning
const STREAMING_THRESHOLD_BYTES = 1024 * 1024; // 1MB - suggest browser instead

interface FileViewerProps {
  owner: string;
  repo: string;
  path: string | null;
  htmlUrl?: string | null;
  visible: boolean;
  onClose: () => void;
}

export function FileViewer({
  owner,
  repo,
  path,
  htmlUrl,
  visible,
  onClose,
}: FileViewerProps) {
  const theme = useAppTheme();
  const { showToast } = useToast();
  const { data, isLoading, isError } = useFileContent(owner, repo, path);

  const fileName = useMemo(() => path?.split("/").pop() ?? "", [path]);
  const language = useMemo(() => languageFromFileName(fileName), [fileName]);
  const numberedContent = useMemo(() => {
    if (!data) return "";
    return data.content
      .split("\n")
      .map((line, i) => `${String(i + 1).padStart(4, " ")}  ${line}`)
      .join("\n");
  }, [data]);
  const lineCount = useMemo(
    () => (data ? data.content.split("\n").length : 0),
    [data],
  );
  const isLarge = (data?.size ?? 0) > LARGE_FILE_BYTES;

  async function handleCopy() {
    if (!data) return;
    await Clipboard.setStringAsync(data.content);
    showToast("File content copied", "success");
  }

  async function handleOpenBrowser() {
    const url = data?.htmlUrl ?? htmlUrl;
    if (!url) return;
    const safeUrl = toSafeGitHubUrl(url);
    if (!safeUrl) {
      showToast("Unsafe link blocked", "error");
      return;
    }
    try {
      await Linking.openURL(safeUrl);
    } catch {
      showToast("Could not open file in browser", "error");
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text
                style={[styles.title, { color: theme.text }]}
                numberOfLines={1}
              >
                {fileName || "File"}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {language}
                {data ? ` · ${lineCount} lines` : ""}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityLabel="Close file viewer"
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.text}
              />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={handleCopy}
              disabled={!data}
            >
              <Ionicons
                name="copy-outline"
                size={15}
                color={theme.text}
              />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Copy
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={handleOpenBrowser}
            >
              <Ionicons
                name="open-outline"
                size={15}
                color={theme.text}
              />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Open in GitHub
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator
              color={theme.primary}
              style={styles.loader}
            />
          ) : isError || (!data && !isLoading) ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.subtle }]}>
                Could not load this file in-app.
              </Text>
              <Pressable
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                    marginTop: 8,
                  },
                ]}
                onPress={handleOpenBrowser}
              >
                <Text style={[styles.actionText, { color: "#fff" }]}>
                  Open in browser instead
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {(data?.size ?? 0) >= STREAMING_THRESHOLD_BYTES ? (
                <View style={styles.empty}>
                  <Text style={[styles.emptyText, { color: theme.subtle }]}>
                    File is too large ({(data?.size ?? 0) / 1024 / 1024} MB) to
                    preview in-app.
                  </Text>
                  <Pressable
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                        marginTop: 8,
                      },
                    ]}
                    onPress={handleOpenBrowser}
                  >
                    <Text style={[styles.actionText, { color: "#fff" }]}>
                      Open in GitHub
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {isLarge && (
                    <Text style={[styles.warning, { color: theme.muted }]}>
                      Large file — showing all {lineCount} lines may be slow.
                    </Text>
                  )}
                  <ScrollView
                    style={[
                      styles.codeBox,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.code, { color: theme.text }]}
                      selectable
                    >
                      {numberedContent}
                    </Text>
                  </ScrollView>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleWrap: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
  loader: { marginVertical: 32 },
  empty: { alignItems: "center", paddingVertical: 24, gap: 4 },
  emptyText: { fontSize: 14, textAlign: "center" },
  warning: { fontSize: 12 },
  codeBox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxHeight: 420,
  },
  code: { fontSize: 12, fontFamily: "monospace", lineHeight: 18 },
});
