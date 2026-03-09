import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

export function useRepoContents(
  owner: string,
  repo: string,
  path: string = "",
) {
  return useQuery({
    queryKey: ["repo", owner, repo, "contents", path],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      // getContent returns array for directories, single object for files
      return (Array.isArray(data) ? data : [data]) as Array<{
        name: string;
        path: string;
        type: "file" | "dir" | "symlink" | "submodule";
        size: number;
        sha: string;
        html_url: string | null;
      }>;
    },
    enabled: !!(owner && repo),
  });
}

export function useCreateFork(owner: string, repo: string) {
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.createFork({ owner, repo });
      return data;
    },
  });
}

export function useRepoReadme(owner: string, repo: string) {
  return useQuery({
    queryKey: ["repo", owner, repo, "readme"],
    queryFn: async () => {
      const octokit = await getOctokit();
      const response = await octokit.repos.getReadme({
        owner,
        repo,
      });
      const data = response.data as {
        content: string;
        encoding: string;
      };

      if (data.encoding === "base64") {
        // Decode base64 in React Native/Web
        const decoded = decodeURIComponent(
          escape(atob(data.content.replace(/\n/g, ""))),
        );
        return decoded;
      }
      return data.content;
    },
    enabled: !!(owner && repo),
  });
}

export function useBranches(owner: string, repo: string) {
  return useInfiniteQuery({
    queryKey: ["repo", owner, repo, "branches"],
    queryFn: async ({ pageParam }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 30,
        page: pageParam,
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!(owner && repo),
  });
}
