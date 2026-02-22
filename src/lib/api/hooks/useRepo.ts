import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOctokit } from "../github";

export function useRepo(owner: string, repo: string) {
  return useQuery({
    queryKey: ["repo", owner, repo],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.get({ owner, repo });
      return data;
    },
    enabled: !!(owner && repo),
  });
}

export function useRepoTopics(owner: string, repo: string) {
  return useQuery({
    queryKey: ["repo", owner, repo, "topics"],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.getAllTopics({ owner, repo });
      return data.names;
    },
    enabled: !!(owner && repo),
  });
}

export function useUpdateRepo(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: {
      name?: string;
      description?: string;
      homepage?: string;
      private?: boolean;
      has_issues?: boolean;
      has_wiki?: boolean;
      has_projects?: boolean;
      allow_squash_merge?: boolean;
      allow_merge_commit?: boolean;
      allow_rebase_merge?: boolean;
      delete_branch_on_merge?: boolean;
      archived?: boolean;
    }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.update({ owner, repo, ...updates });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repo", owner, repo] }),
  });
}

export function useUpdateTopics(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (names: string[]) => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.replaceAllTopics({
        owner,
        repo,
        names,
      });
      return data.names;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["repo", owner, repo, "topics"] }),
  });
}
