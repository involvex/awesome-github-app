import {
  ImageStyle,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import MarkdownDisplay, {
  ASTNode,
  RenderRules,
} from "react-native-markdown-display";
import { useAppTheme } from "../../lib/theme";
import { Image } from "expo-image";
import { ReactNode } from "react";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  const theme = useAppTheme();

  const rules: RenderRules = {
    image: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      styles: Record<string, ViewStyle | TextStyle | ImageStyle>,
    ) => {
      const { src, alt } = node.attributes;
      return (
        <Image
          key={node.key}
          source={{ uri: src }}
          style={[
            styles.image,
            { maxWidth: "100%", height: "auto", minHeight: 20 },
          ]}
          contentFit="contain"
          accessibilityLabel={alt}
        />
      );
    },
  };

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
    paragraph: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginVertical: 4,
    },
    image: {
      marginVertical: 4,
      marginRight: 6,
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
      <MarkdownDisplay
        style={markdownStyles}
        rules={rules}
      >
        {children}
      </MarkdownDisplay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
