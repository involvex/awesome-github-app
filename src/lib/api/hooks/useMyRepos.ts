import { useInfiniteQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

// "forks" and "sources" are not valid Octokit API values; map them to "all" with client-side filter
export type RepoFilter =
  | "all"
  | "owner"
  | "public"
  | "private"
  | "forks"
  | "member";
export type RepoSort = "created" | "updated" | "pushed" | "full_name";

type OctokitRepoType = "all" | "owner" | "public" | "private" | "member";

export function useMyRepos(
  type: RepoFilter = "owner",
  sort: RepoSort = "updated",
) {
  const apiType: OctokitRepoType = type === "forks" ? "all" : type;
  return useInfiniteQuery({
    queryKey: ["myRepos", type, sort],
    queryFn: async ({ pageParam = 1 }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.listForAuthenticatedUser({
        type: apiType,
        sort,
        per_page: 30,
        page: pageParam as number,
      });
      // Client-side filter for forks
      return type === "forks" ? data.filter(r => r.fork) : data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
  });
}
