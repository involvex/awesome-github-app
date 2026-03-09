import { useInfiniteQuery } from "@tanstack/react-query";
import { Octokit } from "@octokit/rest";
import { getOctokit } from "../github";

export type SearchType = "repositories" | "users" | "issues";

type OctokitInst = InstanceType<typeof Octokit>;
export type SearchRepoItem = Awaited<
  ReturnType<OctokitInst["search"]["repos"]>
>["data"]["items"][number];
export type SearchUserItem = Awaited<
  ReturnType<OctokitInst["search"]["users"]>
>["data"]["items"][number];
export type SearchIssueItem = Awaited<
  ReturnType<OctokitInst["search"]["issuesAndPullRequests"]>
>["data"]["items"][number];

export type RepoSortOption = "stars" | "forks" | "updated";

export interface SearchOptions {
  sort?: RepoSortOption;
  order?: "asc" | "desc";
}

export function useSearch(
  query: string,
  type: SearchType = "repositories",
  options: SearchOptions = {},
) {
  const { sort, order = "desc" } = options;
  return useInfiniteQuery({
    queryKey: ["search", type, query, sort ?? "best-match", order],
    queryFn: async ({ pageParam }) => {
      const octokit = await getOctokit();
      if (type === "repositories") {
        const { data } = await octokit.search.repos({
          q: query,
          per_page: 30,
          page: pageParam,
          ...(sort ? { sort, order } : {}),
        });
        return data.items;
      } else if (type === "users") {
        const { data } = await octokit.search.users({
          q: query,
          per_page: 30,
          page: pageParam,
          sort: "followers",
          order: "desc",
        });
        return data.items;
      } else {
        const { data } = await octokit.search.issuesAndPullRequests({
          q: query,
          per_page: 30,
          page: pageParam,
        });
        return data.items;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
