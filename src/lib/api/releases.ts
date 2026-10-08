import type { Release } from "./hooks/useReleases";
import type { Octokit } from "@octokit/rest";

/**
 * Shared release fetcher used by the foreground `useReleases` hook and the
 * background widget sync. Foreground uses (20 repos x 3 releases);
 * background uses a slim (10 x 1) pass to stay within task time limits.
 */
export async function fetchReleasesForUser(
  octokit: Octokit,
  username: string,
  repoLimit = 20,
  perRepo = 3,
): Promise<Release[]> {
  const { data } = await octokit.repos.listForUser({
    username,
    sort: "updated",
    per_page: repoLimit,
  });

  const reposWithReleases: Release[] = [];

  for (const repo of data) {
    if (repo.fork || !repo.owner?.login) continue;
    try {
      const releasesResp = await octokit.repos.listReleases({
        owner: repo.owner.login,
        repo: repo.name,
        per_page: perRepo,
      });
      if (releasesResp.data.length > 0) {
        for (const release of releasesResp.data) {
          if (!release.author?.login) continue;
          const rName = release.name ?? null;
          const rBody = release.body;
          reposWithReleases.push({
            id: release.id,
            name: rName,
            tag_name: release.tag_name ?? "Unknown",
            body: rBody ?? null,
            draft: release.draft,
            prerelease: release.prerelease,
            created_at: release.created_at,
            published_at: release.published_at,
            html_url: release.html_url ?? "",
            zipball_url: release.zipball_url ?? "",
            tarball_url: release.tarball_url ?? "",
            author: {
              login: release.author.login,
              avatar_url: release.author.avatar_url,
            },
            repo: {
              id: repo.id,
              name: repo.name,
              full_name: repo.full_name,
            },
          });
        }
      }
    } catch {
      // Skip repos without releases access
    }
  }

  return reposWithReleases.sort(
    (a, b) =>
      new Date(b.published_at ?? b.created_at).getTime() -
      new Date(a.published_at ?? a.created_at).getTime(),
  );
}
