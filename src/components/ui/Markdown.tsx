import MarkdownDisplay from "react-native-markdown-display";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../../lib/theme";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  const theme = useAppTheme();

  const markdownStyles = StyleSheet.create({
    body: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
    },
    heading1: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
      marginTop: 20,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    heading2: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "700",
      marginTop: 18,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    heading3: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 6,
    },
    link: {
      color: theme.primary,
      textDecorationLine: "none",
    },
    code_inline: {
      backgroundColor: theme.surface,
      color: theme.primary,
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: theme.surface,
      color: theme.text,
      borderRadius: 8,
      padding: 12,
      fontFamily: "monospace",
      marginVertical: 10,
    },
    blockquote: {
      backgroundColor: theme.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 10,
    },
    hr: {
      backgroundColor: theme.border,
      height: 1,
      marginVertical: 20,
    },
    list_item: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    bullet_list: {
      marginVertical: 10,
    },
    ordered_list: {
      marginVertical: 10,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
    },
    thead: {
      backgroundColor: theme.surface,
    },
    tr: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: "row",
    },
    th: {
      padding: 8,
      fontWeight: "bold",
    },
    td: {
      padding: 8,
    },
  });

  return (
    <View style={styles.container}>
      <MarkdownDisplay style={markdownStyles}>{children}</MarkdownDisplay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
