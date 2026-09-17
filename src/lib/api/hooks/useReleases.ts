import { fetchReleasesForUser } from "../releases";
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
      return fetchReleasesForUser(octokit, username);
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!username,
  });
}
