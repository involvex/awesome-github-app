import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOctokit } from "../github";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } =
        await octokit.activity.listNotificationsForAuthenticatedUser({
          all: true,
          per_page: 50,
        });
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const octokit = await getOctokit();
      await octokit.activity.markThreadAsRead({
        thread_id: parseInt(threadId),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.markNotificationsAsRead();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
