import { useQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

export interface RepoRelease {
  id: number;
  name: string | null;
  tag_name: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
  zipball_url: string;
  tarball_url: string;
  author: string;
}

export function useRepoReleases(owner: string, repo: string) {
  return useQuery({
    queryKey: ["repoReleases", owner, repo],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.listReleases({
        owner,
        repo,
        per_page: 30,
      });
      return data.map(r => ({
        id: r.id,
        name: r.name ?? null,
        tag_name: r.tag_name ?? "Unknown",
        body: r.body ?? null,
        draft: r.draft,
        prerelease: r.prerelease,
        published_at: r.published_at,
        html_url: r.html_url,
        zipball_url: r.zipball_url,
        tarball_url: r.tarball_url,
        author: r.author?.login ?? "unknown",
      }));
    },
    enabled: !!(owner && repo),
    staleTime: 15 * 60 * 1000,
  });
}
