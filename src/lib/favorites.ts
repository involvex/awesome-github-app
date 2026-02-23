import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getItem, setItem } from "./storage";

export type FavoriteType = "language" | "topic";

export interface FavoriteItem {
  id: string;
  label: string;
  query: string;
  type: FavoriteType;
}

const FAVORITES_KEY = "favorites";
const FAVORITES_QUERY_KEY = ["favorites"];

async function loadFavorites(): Promise<FavoriteItem[]> {
  const stored = await getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as FavoriteItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function persistFavorites(favorites: FavoriteItem[]) {
  await setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: loadFavorites,
    staleTime: Infinity,
  });

  const setFavorites = async (
    updater: (current: FavoriteItem[]) => FavoriteItem[],
  ) => {
    const current =
      (queryClient.getQueryData(FAVORITES_QUERY_KEY) as FavoriteItem[]) ?? data;
    const next = updater(current);
    await persistFavorites(next);
    queryClient.setQueryData(FAVORITES_QUERY_KEY, next);
    return next;
  };

  const toggleFavorite = async (item: FavoriteItem) => {
    return setFavorites(current => {
      const exists = current.some(fav => fav.id === item.id);
      if (exists) {
        return current.filter(fav => fav.id !== item.id);
      }
      return [...current, item];
    });
  };

  const removeFavorite = async (id: string) => {
    return setFavorites(current => current.filter(fav => fav.id !== id));
  };

  const isFavorite = (id: string) => data.some(fav => fav.id === id);

  return {
    favorites: data,
    isLoading,
    toggleFavorite,
    removeFavorite,
    isFavorite,
  };
}
