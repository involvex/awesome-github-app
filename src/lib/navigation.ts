import type { NotificationThread } from "./api/hooks/useNotifications";

export interface NotificationTarget {
  /** In-app route, e.g. `/repo/owner/name`. */
  route: string;
  owner: string;
  repo: string;
  /** Issue/PR number when the URL contains one. */
  number?: number;
  kind?: "issue" | "pull" | "discussion" | "release" | "commit" | "unknown";
}

/**
 * Derives an in-app target from a notification thread.
 *
 * Prefers `subject.url` (API URL like
 * `https://api.github.com/repos/owner/repo/issues/123`) and falls back to
 * `repository.full_name`. There is no dedicated issue/PR detail route yet,
 * so the target is always the repo page — the Issues/PRs tabs live there.
 */
export function parseNotificationTarget(
  thread: Pick<NotificationThread, "subject" | "repository">,
): NotificationTarget | null {
  const apiUrl = thread.subject?.url ?? "";
  const match = apiUrl.match(
    /repos\/([^/]+)\/([^/]+)\/(issues|pulls|discussions|releases|commits)(?:\/(\d+))?/,
  );
  if (match) {
    const [, owner, repo, type, num] = match;
    const kind =
      type === "issues"
        ? ("issue" as const)
        : type === "pulls"
          ? ("pull" as const)
          : type === "discussions"
            ? ("discussion" as const)
            : type === "releases"
              ? ("release" as const)
              : type === "commits"
                ? ("commit" as const)
                : ("unknown" as const);
    const number = num ? Number(num) : undefined;
    return {
      route: `/repo/${owner}/${repo}`,
      owner,
      repo,
      number: Number.isFinite(number) ? number : undefined,
      kind,
    };
  }

  const fullName = thread.repository?.full_name;
  if (fullName && fullName.includes("/")) {
    const [owner, repo] = fullName.split("/");
    if (owner && repo) {
      return { route: `/repo/${owner}/${repo}`, owner, repo, kind: "unknown" };
    }
  }
  return null;
}
