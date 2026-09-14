with open(
    "D:/repos/awesome-github-app/src/app/repo/[owner]/[repo]/index.tsx", "r"
) as f:
    lines = f.readlines()

# Find and remove the ComingSoonTab function (lines 1059-1094, 0-indexed = 1058-1093)
new_lines = []
for i, line in enumerate(lines):
    if i >= 1058 and i <= 1093:  # 0-indexed, so lines 1059-1094
        continue
    new_lines.append(line)

with open(
    "D:/repos/awesome-github-app/src/app/repo/[owner]/[repo]/index.tsx", "w"
) as f:
    f.writelines(new_lines)
print("Done")
