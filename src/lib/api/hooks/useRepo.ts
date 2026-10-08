import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getOctokit } from "../github";

interface RepoStarFields {
  stargazers_count: number;
  viewer_has_starred: boolean;
}

interface RepoWatchFields {
  subscribers_count: number;
  watchers_count: number;
  viewer_subscription: string;
}

interface RepoBase {
  full_name: string;
  stargazers_count: number;
  viewer_has_starred?: boolean;
  subscribers_count?: number;
  watchers_count?: number;
  viewer_subscription?: string;
}

type RepoData = RepoBase & Partial<RepoStarFields> & Partial<RepoWatchFields>;

interface MyReposData {
  pages: RepoData[][];
  pageParams: unknown[];
}

function updateRepoStarInCache(repo: RepoData, starred: boolean): RepoData {
  return {
    ...repo,
    stargazers_count: starred
      ? repo.stargazers_count + 1
      : Math.max(0, repo.stargazers_count - 1),
    viewer_has_starred: starred,
  };
}

function updateRepoWatchInCache(repo: RepoData, watched: boolean): RepoData {
  const count = watched ? 1 : -1;
  return {
    ...repo,
    subscribers_count: (repo.subscribers_count ?? 0) + count,
    watchers_count: (repo.watchers_count ?? 0) + count,
    viewer_subscription: watched ? "subscribed" : "ignored",
  };
}

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

export function useStarRepo(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.starRepoForAuthenticatedUser({
        owner,
        repo,
      });
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["repo", owner, repo] });
      await qc.cancelQueries({ queryKey: ["myRepos"] });
      const previousRepo = qc.getQueryData<RepoData>(["repo", owner, repo]);
      const previousMyRepos = qc.getQueryData<MyReposData>(["myRepos"]);
      qc.setQueryData<RepoData>(["repo", owner, repo], old =>
        old ? updateRepoStarInCache(old, true) : old,
      );
      qc.setQueryData<MyReposData>(["myRepos"], old => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page =>
            page.map(r =>
              r.full_name === `${owner}/${repo}`
                ? updateRepoStarInCache(r, true)
                : r,
            ),
          ),
        };
      });
      return { previousRepo, previousMyRepos };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRepo) {
        qc.setQueryData(["repo", owner, repo], context.previousRepo);
      }
      if (context?.previousMyRepos) {
        qc.setQueryData(["myRepos"], context.previousMyRepos);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["repo", owner, repo] });
      qc.invalidateQueries({ queryKey: ["myRepos"] });
    },
  });
}

export function useUnstarRepo(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.unstarRepoForAuthenticatedUser({
        owner,
        repo,
      });
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["repo", owner, repo] });
      await qc.cancelQueries({ queryKey: ["myRepos"] });
      const previousRepo = qc.getQueryData<RepoData>(["repo", owner, repo]);
      const previousMyRepos = qc.getQueryData<MyReposData>(["myRepos"]);
      qc.setQueryData<RepoData>(["repo", owner, repo], old =>
        old ? updateRepoStarInCache(old, false) : old,
      );
      qc.setQueryData<MyReposData>(["myRepos"], old => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page =>
            page.map(r =>
              r.full_name === `${owner}/${repo}`
                ? updateRepoStarInCache(r, false)
                : r,
            ),
          ),
        };
      });
      return { previousRepo, previousMyRepos };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRepo) {
        qc.setQueryData(["repo", owner, repo], context.previousRepo);
      }
      if (context?.previousMyRepos) {
        qc.setQueryData(["myRepos"], context.previousMyRepos);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["repo", owner, repo] });
      qc.invalidateQueries({ queryKey: ["myRepos"] });
    },
  });
}

export function useWatchRepo(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.setRepoSubscription({
        owner,
        repo,
        subscribed: true,
      });
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["repo", owner, repo] });
      const previousRepo = qc.getQueryData<RepoData>(["repo", owner, repo]);
      qc.setQueryData<RepoData>(["repo", owner, repo], old =>
        old ? updateRepoWatchInCache(old, true) : old,
      );
      return { previousRepo };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRepo) {
        qc.setQueryData(["repo", owner, repo], context.previousRepo);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["repo", owner, repo] });
    },
  });
}

export function useUnwatchRepo(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const octokit = await getOctokit();
      await octokit.activity.setRepoSubscription({
        owner,
        repo,
        subscribed: false,
      });
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["repo", owner, repo] });
      const previousRepo = qc.getQueryData<RepoData>(["repo", owner, repo]);
      qc.setQueryData<RepoData>(["repo", owner, repo], old =>
        old ? updateRepoWatchInCache(old, false) : old,
      );
      return { previousRepo };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRepo) {
        qc.setQueryData(["repo", owner, repo], context.previousRepo);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["repo", owner, repo] });
    },
  });
}

export type IssueState = "open" | "closed" | "all";

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  labels:
    | Array<{
        id: number;
        name: string;
        color: string;
        description: string | null;
      }>
    | string[];
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
  };
  assignee: {
    login: string;
    avatar_url: string;
  } | null;
}

export function useIssues(
  owner: string,
  repo: string,
  state: IssueState = "open",
) {
  return useInfiniteQuery({
    queryKey: ["repo", owner, repo, "issues", state],
    queryFn: async ({ pageParam }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: state === "all" ? undefined : state,
        per_page: 30,
        page: pageParam,
        sort: "created",
        direction: "desc",
      });
      return data.filter((item: unknown) => {
        const issue = item as Issue;
        return !issue.pull_request;
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!(owner && repo),
  });
}

export type PRState = "open" | "closed" | "all";

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  head: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    } | null;
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    };
  };
  draft: boolean;
  merged: boolean;
  mergeable_state: string | null;
  review_comments: number;
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export function usePullRequests(
  owner: string,
  repo: string,
  state: PRState = "open",
) {
  return useInfiniteQuery({
    queryKey: ["repo", owner, repo, "pulls", state],
    queryFn: async ({ pageParam }) => {
      const octokit = await getOctokit();
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: state === "all" ? undefined : state,
        per_page: 30,
        page: pageParam,
        sort: "created",
        direction: "desc",
      });
      return data as unknown as PullRequest[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 30 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!(owner && repo),
  });
}
