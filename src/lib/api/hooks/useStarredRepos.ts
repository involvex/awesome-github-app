import { useInfiniteQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

export interface StarredRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: { login: string; avatar_url: string };
}

export function useStarredRepos(username: string) {
  return useInfiniteQuery({
    queryKey: ["starredRepos", username],
    enabled: !!username,
    queryFn: async ({ pageParam = 1 }) => {
      const octokit = await getOctokit();
      const { data } =
        await octokit.activity.listReposStarredByAuthenticatedUser({
          per_page: 30,
          page: pageParam as number,
        });
      return data as StarredRepo[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
  });
}
