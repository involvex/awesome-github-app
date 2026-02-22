import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOctokit } from "../github";

export function useWorkflows(owner: string, repo: string) {
  return useQuery({
    queryKey: ["workflows", owner, repo],
    queryFn: async () => {
      const octokit = await getOctokit();
      const { data } = await octokit.actions.listRepoWorkflows({ owner, repo });
      return data.workflows;
    },
    enabled: !!(owner && repo),
  });
}

export function useWorkflowRuns(
  owner: string,
  repo: string,
  workflowId?: number,
) {
  return useQuery({
    queryKey: ["workflowRuns", owner, repo, workflowId],
    queryFn: async () => {
      const octokit = await getOctokit();
      if (workflowId) {
        const { data } = await octokit.actions.listWorkflowRuns({
          owner,
          repo,
          workflow_id: workflowId,
          per_page: 20,
        });
        return data.workflow_runs;
      }
      const { data } = await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 20,
      });
      return data.workflow_runs;
    },
    enabled: !!(owner && repo),
    refetchInterval: 30 * 1000,
  });
}

export function useDispatchWorkflow(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workflowId,
      ref,
    }: {
      workflowId: number;
      ref: string;
    }) => {
      const octokit = await getOctokit();
      await octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
      });
    },
    onSuccess: (_, { workflowId }) =>
      qc.invalidateQueries({
        queryKey: ["workflowRuns", owner, repo, workflowId],
      }),
  });
}

export function useCancelRun(owner: string, repo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: number) => {
      const octokit = await getOctokit();
      await octokit.actions.cancelWorkflowRun({ owner, repo, run_id: runId });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["workflowRuns", owner, repo] }),
  });
}
