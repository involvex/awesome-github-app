import re

with open(
    "D:/repos/awesome-github-app/src/app/repo/[owner]/[repo]/index.tsx", "r"
) as f:
    content = f.read()

# Remove the ComingSoonTab function
old = """}
}

function ComingSoonTab({
  name,
  icon,
}: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.emptyState}>
      <View
        style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={theme.muted}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.subtle }]}>
        The {name.toLowerCase()} feature is coming soon to the app.
      </Text>
      <View
        style={[
          styles.comingSoonBadge,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.comingSoonText, { color: theme.primary }]}>
          COMING SOON
        </Text>
      </View>
    </View>
  );
}

export default function RepoDetailScreen() {"""

new = """}
}

export default function RepoDetailScreen() {"""

content = content.replace(old, new)
with open(
    "D:/repos/awesome-github-app/src/app/repo/[owner]/[repo]/index.tsx", "w"
) as f:
    f.write(content)
print("Done")
