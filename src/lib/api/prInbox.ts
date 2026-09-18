import { getOctokit } from "./github";

export type PrSource = "assigned" | "review";

export interface AssignedPr {
  id: number;
  number: number;
  title: string;
  updated_at: string;
  html_url: string;
  repo_full_name: string;
  draft: boolean;
  source: PrSource;
}

const QUERIES: { q: string; source: PrSource }[] = [
  { q: "is:open is:pr assignee:@me", source: "assigned" },
  { q: "is:open is:pr review-requested:@me", source: "review" },
];

const MAX_PRS = 10;

export function repoFullNameFromUrl(url: string | undefined): string {
  if (!url) return "unknown";
  return url.split("/repos/")[1] ?? "unknown";
}

/**
 * PRs assigned to (or awaiting review from) the authenticated user,
 * merged across both search queries and sorted by recency.
 * Each query is isolated so a rate-limited search doesn't wipe the other.
 */
export async function fetchAssignedPrs(): Promise<AssignedPr[]> {
  const octokit = await getOctokit();
  const seen = new Map<number, AssignedPr>();
  for (const { q, source } of QUERIES) {
    try {
      const { data } = await octokit.search.issuesAndPullRequests({
        q,
        per_page: MAX_PRS,
        sort: "updated",
        order: "desc",
      });
      for (const item of data.items) {
        if (seen.has(item.id)) continue;
        seen.set(item.id, {
          id: item.id,
          number: item.number,
          title: item.title,
          updated_at: item.updated_at,
          html_url: item.html_url,
          repo_full_name: repoFullNameFromUrl(item.repository_url),
          draft: (item as unknown as { draft?: boolean }).draft ?? false,
          source,
        });
      }
    } catch {
      // Search rate limits (30 req/min) fail one query, not the sync.
    }
  }
  return [...seen.values()]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, MAX_PRS);
}

/**
 * Discriminated union for PR filter logic.
 * Ensures exhaustive matching in switch statements.
 */
export type PrInboxFilter =
  | { kind: "all" }
  | { kind: "assigned" }
  | { kind: "review" }
  | { kind: "draft" };

export function filterPrInboxItems(
  prs: AssignedPr[],
  filter: PrInboxFilter,
): AssignedPr[] {
  switch (filter.kind) {
    case "assigned":
      return prs.filter(p => p.source === "assigned");
    case "review":
      return prs.filter(p => p.source === "review");
    case "draft":
      return prs.filter(p => p.draft);
    case "all":
    default:
      return prs;
  }
}
