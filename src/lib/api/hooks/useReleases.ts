import { useQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

export interface Release {
  id: number;
  name: string | null;
  tag_name: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  html_url: string;
  zipball_url: string;
  tarball_url: string;
  author: {
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    full_name: string;
  };
}

export function useReleases(username: string) {
  return useQuery({
    queryKey: ["releases", username],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.listForUser({
        username,
        sort: "updated",
        per_page: 20,
      });

      const reposWithReleases: Release[] = [];

      for (const repo of data) {
        if (repo.fork || !repo.owner?.login) continue;
        try {
          const releasesResp = await octokit.repos.listReleases({
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 3,
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
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!username,
  });
}
