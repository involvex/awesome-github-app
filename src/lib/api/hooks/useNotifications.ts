import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Endpoints } from "@octokit/types";
import { getOctokit } from "../github";

export type NotificationThread =
  Endpoints["GET /notifications"]["response"]["data"][number];

const NOTIFICATIONS_KEY = ["notifications"] as const;
/** GitHub caches notification list responses (~60s). */
const NOTIFICATIONS_STALE_MS = 60 * 1000;

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async (): Promise<NotificationThread[]> => {
      const octokit = await getOctokit();
      const { data } =
        await octokit.activity.listNotificationsForAuthenticatedUser({
          all: true,
          per_page: 50,
        });
      return data;
    },
    staleTime: NOTIFICATIONS_STALE_MS,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

function markThreadUnreadInCache(
  threads: NotificationThread[] | undefined,
  threadId: string,
  unread: boolean,
): NotificationThread[] | undefined {
  if (!threads) return threads;
  return threads.map(n =>
    n.id === threadId
      ? {
          ...n,
          unread,
          last_read_at: unread ? n.last_read_at : new Date().toISOString(),
        }
      : n,
  );
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const octokit = await getOctokit();
      // Path id as string — avoids Number precision loss on large thread ids.
      await octokit.request(`PATCH /notifications/threads/${threadId}`);
    },
    onMutate: async (threadId: string) => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = qc.getQueryData<NotificationThread[]>(NOTIFICATIONS_KEY);
      qc.setQueryData<NotificationThread[]>(NOTIFICATIONS_KEY, old =>
        markThreadUnreadInCache(old, threadId, false),
      );
      return { previous };
    },
    onError: (_err, _threadId, context) => {
      if (context?.previous) {
        qc.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    // Avoid immediate refetch — GitHub may return cached unread for up to ~60s.
    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: NOTIFICATIONS_KEY,
        refetchType: "none",
      });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.markNotificationsAsRead();
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = qc.getQueryData<NotificationThread[]>(NOTIFICATIONS_KEY);
      const readAt = new Date().toISOString();
      qc.setQueryData<NotificationThread[]>(NOTIFICATIONS_KEY, old =>
        old?.map(n => ({ ...n, unread: false, last_read_at: readAt })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: NOTIFICATIONS_KEY,
        refetchType: "none",
      });
    },
  });
}
