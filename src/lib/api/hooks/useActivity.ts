import { useInfiniteQuery } from "@tanstack/react-query";
import { getOctokit } from "../github";

export function useActivity(username: string) {
  return useInfiniteQuery({
    queryKey: ["activity", username],
    queryFn: async ({ pageParam = 1 }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.activity.listReceivedEventsForUser({
        username,
        per_page: 30,
        page: pageParam as number,
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!username,
  });
}
