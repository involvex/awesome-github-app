import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getItem, setItem } from "./storage";

const HISTORY_KEY = "search_history";
const HISTORY_QUERY_KEY = ["search_history"];
const MAX_HISTORY_ITEMS = 20;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

async function loadHistory(): Promise<SearchHistoryItem[]> {
  const stored = await getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as SearchHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

async function persistHistory(history: SearchHistoryItem[]) {
  await setItem(HISTORY_KEY, JSON.stringify(history));
}

export function useSearchHistory() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: loadHistory,
    staleTime: Infinity,
  });

  const addSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current =
      (queryClient.getQueryData(HISTORY_QUERY_KEY) as SearchHistoryItem[]) ??
      data;
    const filtered = current.filter(item => item.query !== trimmed);
    const next = [
      { id: `${trimmed}-${Date.now()}`, query: trimmed, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS);
    await persistHistory(next);
    queryClient.setQueryData(HISTORY_QUERY_KEY, next);
    return next;
  };

  const removeSearch = async (query: string) => {
    const current =
      (queryClient.getQueryData(HISTORY_QUERY_KEY) as SearchHistoryItem[]) ??
      data;
    const next = current.filter(item => item.query !== query);
    await persistHistory(next);
    queryClient.setQueryData(HISTORY_QUERY_KEY, next);
    return next;
  };

  const clearHistory = async () => {
    await persistHistory([]);
    queryClient.setQueryData(HISTORY_QUERY_KEY, []);
  };

  return {
    history: data,
    isLoading,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
