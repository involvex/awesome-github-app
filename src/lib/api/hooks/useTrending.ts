import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { getOctokit } from "../github";

export type TrendingPeriod = "today" | "week" | "month";

const PERIOD_CONFIG: Record<
  TrendingPeriod,
  { minStars: number; daysAgo: number }
> = {
  today: { minStars: 10, daysAgo: 1 },
  week: { minStars: 50, daysAgo: 7 },
  month: { minStars: 100, daysAgo: 30 },
};

export function useTrending(
  period: TrendingPeriod = "today",
  language?: string,
) {
  return useQuery({
    queryKey: ["trending", period, language],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { minStars, daysAgo } = PERIOD_CONFIG[period];
      const since = format(subDays(new Date(), daysAgo), "yyyy-MM-dd");
      const langFilter =
        language && language !== "all" ? `+language:${language}` : "";
      const q = `stars:>${minStars}+created:>${since}${langFilter}`;
      const { data } = await octokit.search.repos({
        q,
        sort: "stars",
        order: "desc",
        per_page: 30,
      });
      return data.items;
    },
    staleTime: 15 * 60 * 1000,
  });
}
