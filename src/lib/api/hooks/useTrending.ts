import type { SearchRepoItem } from "./useSearch";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { getOctokit } from "../github";

export type TrendingPeriod = "today" | "week" | "month";
export type TrendingMode = "hot" | "new" | "released";

export interface TrendingRepoItem extends SearchRepoItem {
  latestReleaseAt?: string | null;
}

const PERIOD_CONFIG: Record<
  TrendingPeriod,
  { hotStars: number; newStars: number; releasedStars: number; daysAgo: number }
> = {
  today: { hotStars: 50, newStars: 10, releasedStars: 20, daysAgo: 1 },
  week: { hotStars: 100, newStars: 50, releasedStars: 50, daysAgo: 7 },
  month: { hotStars: 200, newStars: 100, releasedStars: 100, daysAgo: 30 },
};

function buildQuery(
  period: TrendingPeriod,
  mode: TrendingMode,
  language?: string,
): string {
  const cfg = PERIOD_CONFIG[period];
  const since = format(subDays(new Date(), cfg.daysAgo), "yyyy-MM-dd");
  const langFilter =
    language && language !== "all" ? `+language:${language}` : "";

  if (mode === "hot") {
    return `stars:>${cfg.hotStars}+pushed:>${since}${langFilter}`;
  }
  if (mode === "new") {
    return `stars:>${cfg.newStars}+created:>${since}${langFilter}`;
  }
  return `stars:>${cfg.releasedStars}+pushed:>${since}${langFilter}`;
}

async function enrichWithLatestRelease(
  items: SearchRepoItem[],
): Promise<TrendingRepoItem[]> {
  const octokit = await getOctokit();
  const enriched = await Promise.all(
    items.map(async item => {
      const owner = item.owner?.login;
      if (!owner) {
        return { ...item, latestReleaseAt: null };
      }
      try {
        const { data } = await octokit.repos.listReleases({
          owner,
          repo: item.name,
          per_page: 1,
        });
        const latest = data[0];
        return {
          ...item,
          latestReleaseAt: latest?.published_at ?? latest?.created_at ?? null,
        };
      } catch {
        return { ...item, latestReleaseAt: null };
      }
    }),
  );

  return enriched
    .filter(item => !!item.latestReleaseAt)
    .sort(
      (a, b) =>
        new Date(b.latestReleaseAt!).getTime() -
        new Date(a.latestReleaseAt!).getTime(),
    );
}

export function useTrending(
  period: TrendingPeriod = "today",
  language?: string,
  mode: TrendingMode = "hot",
) {
  return useQuery({
    queryKey: ["trending", period, language, mode],
    queryFn: async (): Promise<TrendingRepoItem[]> => {
      const octokit = await getOctokit();
      const q = buildQuery(period, mode, language);
      const { data } = await octokit.search.repos({
        q,
        sort: "stars",
        order: "desc",
        per_page: 30,
      });
      const items = data.items as SearchRepoItem[];
      if (mode === "released") {
        return enrichWithLatestRelease(items);
      }
      return items;
    },
    staleTime: 15 * 60 * 1000,
  });
}
