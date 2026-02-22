import { useQuery } from "@tanstack/react-query";
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

export function useSearch(query: string, type: SearchType = "repositories") {
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      const octokit = await getOctokit();
      if (type === "repositories") {
        const { data } = await octokit.search.repos({
          q: query,
          per_page: 30,
          sort: "stars",
          order: "desc",
        });
        return data.items;
      } else if (type === "users") {
        const { data } = await octokit.search.users({
          q: query,
          per_page: 30,
          sort: "followers",
          order: "desc",
        });
        return data.items;
      } else {
        const { data } = await octokit.search.issuesAndPullRequests({
          q: query,
          per_page: 30,
        });
        return data.items;
      }
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
