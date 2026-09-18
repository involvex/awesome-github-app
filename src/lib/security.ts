/**
 * Security utilities for URL validation and sanitization.
 * Only allow known-safe domains to prevent open redirect / phishing.
 */

const ALLOWED_HOSTNAMES = new Set([
  "github.com",
  "api.github.com",
  "raw.githubusercontent.com",
  "avatars.githubusercontent.com",
  "user-images.githubusercontent.com",
]);

/**
 * Validates that a URL is safe to open externally.
 * Only allows GitHub-owned domains with HTTPS (or HTTP for localhost dev).
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    // Allow localhost for dev (expo dev server)
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      return true;
    return ALLOWED_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Validates that a URL is a GitHub web URL (not API).
 * Useful for "Open in GitHub" buttons.
 */
export function isGitHubWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return parsed.hostname === "github.com";
  } catch {
    return false;
  }
}

/**
 * Extracts a safe GitHub web URL from a notification subject URL.
 * Falls back to null if the URL is not a safe GitHub URL.
 */
export function toSafeGitHubUrl(url: string): string | null {
  if (isGitHubWebUrl(url)) return url;
  // Try to convert API URL to web URL
  // https://api.github.com/repos/owner/repo/issues/123
  // -> https://github.com/owner/repo/issues/123
  const match = url.match(
    /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/(issues|pulls|discussions|releases|commits)(?:\/(\d+))?/,
  );
  if (match) {
    const [, owner, repo, type, number] = match;
    const path = type === "pulls" ? "pull" : type;
    return number
      ? `https://github.com/${owner}/${repo}/${path}/${number}`
      : `https://github.com/${owner}/${repo}/${path}`;
  }
  return null;
}
