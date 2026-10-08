import { useQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

export interface FileContent {
  content: string;
  size: number;
  sha: string;
  htmlUrl: string | null;
  truncated: boolean;
}

function decodeBase64(content: string): string {
  const clean = content.replace(/\n/g, "");
  try {
    return decodeURIComponent(escape(atob(clean)));
  } catch {
    return atob(clean);
  }
}

/**
 * Fetches a single text file's content via `GET /repos/{owner}/{repo}/contents/{path}`.
 * Returns null for directories. Binary/large files are left to the caller's
 * fallback (open in browser) — see `FileViewer` and `isViewableTextFile`.
 */
export function useFileContent(
  owner: string,
  repo: string,
  path: string | null,
) {
  return useQuery({
    queryKey: ["repo", owner, repo, "file", path],
    queryFn: async (): Promise<FileContent | null> => {
      if (!path) return null;
      const octokit = await getOctokit();
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      if (Array.isArray(data)) return null;
      const file = data as unknown as {
        type: string;
        content?: string;
        encoding?: string;
        size: number;
        sha: string;
        html_url?: string | null;
      };
      if (file.type !== "file" || !file.content) return null;
      const content =
        file.encoding === "base64" ? decodeBase64(file.content) : file.content;
      return {
        content,
        size: file.size,
        sha: file.sha,
        htmlUrl: file.html_url ?? null,
        truncated: false,
      };
    },
    enabled: !!(owner && repo && path),
    staleTime: 5 * 60 * 1000,
  });
}

const TEXT_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "json",
  "jsonc",
  "md",
  "mdx",
  "txt",
  "yml",
  "yaml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "env",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "swift",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "php",
  "html",
  "css",
  "scss",
  "xml",
  "svg",
  "sql",
  "sh",
  "bash",
  "zsh",
  "dockerfile",
  "gitignore",
  "gitattributes",
  "editorconfig",
  "prettierrc",
  "eslintrc",
  "tsconfig",
  "gradle",
  "properties",
  "vue",
  "svelte",
]);

const ALWAYS_BINARY = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "bmp",
  "pdf",
  "zip",
  "gz",
  "tar",
  "rar",
  "7z",
  "mp4",
  "mp3",
  "wav",
  "ogg",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  "apk",
  "aab",
  "ipa",
  "exe",
  "dll",
  "so",
  "dylib",
]);

/** Heuristic: open text-ish files in-app, send binary to the browser. */
export function isViewableTextFile(name: string, size: number): boolean {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
  if (!ext) {
    return size <= 200 * 1024 && !ALWAYS_BINARY.has(lower);
  }
  if (ALWAYS_BINARY.has(ext)) return false;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return size <= 100 * 1024;
}

export function languageFromFileName(name: string): string {
  const lower = name.toLowerCase();
  if (lower === "dockerfile") return "Dockerfile";
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    json: "JSON",
    md: "Markdown",
    mdx: "Markdown",
    yml: "YAML",
    yaml: "YAML",
    toml: "TOML",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    java: "Java",
    kt: "Kotlin",
    kts: "Kotlin",
    swift: "Swift",
    c: "C",
    h: "C",
    cpp: "C++",
    cs: "C#",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    xml: "XML",
    svg: "SVG",
    sql: "SQL",
    sh: "Shell",
  };
  return map[ext] ?? (ext ? ext.toUpperCase() : "Text");
}
