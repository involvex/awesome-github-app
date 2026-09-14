import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useWorkflows,
  useWorkflowRuns,
  useDispatchWorkflow,
  useRunArtifacts,
  useDownloadArtifact,
  useCancelRun,
} from "../../src/lib/api/hooks/useWorkflows";
import { workflowsFixture, workflowRunsFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function WorkflowsConsumer({
  owner,
  repo,
  onState,
}: {
  owner: string;
  repo: string;
  onState: (state: ReturnType<typeof useWorkflows>) => void;
}) {
  const state = useWorkflows(owner, repo);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

function WorkflowRunsConsumer({
  owner,
  repo,
  workflowId,
  onState,
}: {
  owner: string;
  repo: string;
  workflowId?: number;
  onState: (state: ReturnType<typeof useWorkflowRuns>) => void;
}) {
  const state = useWorkflowRuns(owner, repo, workflowId);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useWorkflows hooks", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  describe("useWorkflows", () => {
    test("fetches workflows", async () => {
      const listRepoWorkflows = jest
        .fn()
        .mockResolvedValue({ data: { workflows: workflowsFixture } });
      mockedGetOctokit.mockResolvedValue({ actions: { listRepoWorkflows } });
      const states: ReturnType<typeof useWorkflows>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <WorkflowsConsumer
            owner="octocat"
            repo="awesome-github-app"
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(
          states.find(
            s => s.isSuccess && s.data?.length === workflowsFixture.length,
          ),
        ).toBeTruthy(),
      );
      expect(listRepoWorkflows).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
      });
    });

    test("surfaces fetch errors", async () => {
      const error = new Error("boom");
      const listRepoWorkflows = jest.fn().mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({ actions: { listRepoWorkflows } });
      const states: ReturnType<typeof useWorkflows>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <WorkflowsConsumer
            owner="octocat"
            repo="awesome-github-app"
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(states.some(s => s.isError && s.error === error)).toBe(true),
      );
    });
  });

  describe("useWorkflowRuns", () => {
    test("fetches workflow runs for specific workflow", async () => {
      const listWorkflowRuns = jest
        .fn()
        .mockResolvedValue({ data: { workflow_runs: workflowRunsFixture } });
      mockedGetOctokit.mockResolvedValue({ actions: { listWorkflowRuns } });
      const states: ReturnType<typeof useWorkflowRuns>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <WorkflowRunsConsumer
            owner="octocat"
            repo="awesome-github-app"
            workflowId={100}
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(
          states.find(
            s => s.isSuccess && s.data?.length === workflowRunsFixture.length,
          ),
        ).toBeTruthy(),
      );
      expect(listWorkflowRuns).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
        workflow_id: 100,
        per_page: 20,
      });
    });

    test("fetches all workflow runs for repo when no workflowId", async () => {
      const listWorkflowRunsForRepo = jest
        .fn()
        .mockResolvedValue({ data: { workflow_runs: workflowRunsFixture } });
      mockedGetOctokit.mockResolvedValue({
        actions: { listWorkflowRunsForRepo },
      });
      const states: ReturnType<typeof useWorkflowRuns>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <WorkflowRunsConsumer
            owner="octocat"
            repo="awesome-github-app"
            workflowId={undefined}
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(
          states.find(
            s => s.isSuccess && s.data?.length === workflowRunsFixture.length,
          ),
        ).toBeTruthy(),
      );
      expect(listWorkflowRunsForRepo).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
        per_page: 20,
      });
    });

    test("surfaces fetch errors", async () => {
      const error = new Error("boom");
      const listWorkflowRuns = jest.fn().mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({ actions: { listWorkflowRuns } });
      const states: ReturnType<typeof useWorkflowRuns>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <WorkflowRunsConsumer
            owner="octocat"
            repo="awesome-github-app"
            workflowId={100}
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(states.some(s => s.isError && s.error === error)).toBe(true),
      );
    });
  });

  describe("useDispatchWorkflow", () => {
    test("dispatches workflow and invalidates runs cache", async () => {
      const createWorkflowDispatch = jest.fn().mockResolvedValue({});
      mockedGetOctokit.mockResolvedValue({
        actions: { createWorkflowDispatch },
      });
      const client = createQueryClient();
      const invalidateSpy = jest
        .spyOn(client, "invalidateQueries")
        .mockImplementation(() => Promise.resolve());

      const { result } = renderHookWithClient(
        () => useDispatchWorkflow("octocat", "awesome-github-app"),
        client,
      );

      await result.current.mutateAsync({ workflowId: 100, ref: "main" });

      expect(createWorkflowDispatch).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
        workflow_id: 100,
        ref: "main",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["workflowRuns", "octocat", "awesome-github-app", 100],
      });
    });
  });

  describe("useRunArtifacts", () => {
    test("fetches run artifacts", async () => {
      const listWorkflowRunArtifacts = jest.fn().mockResolvedValue({
        data: { artifacts: [{ id: 1, name: "build", size_in_bytes: 1024 }] },
      });
      mockedGetOctokit.mockResolvedValue({
        actions: { listWorkflowRunArtifacts },
      });
      const states: ReturnType<typeof useRunArtifacts>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <RunArtifactsConsumer
            owner="octocat"
            repo="awesome-github-app"
            runId={10000}
            onState={s => states.push(s)}
          />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(
          states.find(s => s.isSuccess && s.data?.length === 1),
        ).toBeTruthy(),
      );
    });
  });

  describe("useDownloadArtifact", () => {
    test("downloads artifact and returns URL", async () => {
      const downloadArtifact = jest
        .fn()
        .mockResolvedValue({ url: "https://example.com/artifact.zip" });
      mockedGetOctokit.mockResolvedValue({ actions: { downloadArtifact } });
      const client = createQueryClient();

      const { result } = renderHookWithClient(
        () => useDownloadArtifact("octocat", "awesome-github-app"),
        client,
      );

      const url = await result.current.mutateAsync(1);
      expect(url).toBe("https://example.com/artifact.zip");
    });
  });

  describe("useCancelRun", () => {
    test("cancels workflow run and invalidates cache", async () => {
      const cancelWorkflowRun = jest.fn().mockResolvedValue({});
      mockedGetOctokit.mockResolvedValue({ actions: { cancelWorkflowRun } });
      const client = createQueryClient();
      const invalidateSpy = jest
        .spyOn(client, "invalidateQueries")
        .mockImplementation(() => Promise.resolve());

      const { result } = renderHookWithClient(
        () => useCancelRun("octocat", "awesome-github-app"),
        client,
      );

      await result.current.mutateAsync(10000);

      expect(cancelWorkflowRun).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
        run_id: 10000,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["workflowRuns", "octocat", "awesome-github-app"],
      });
    });
  });
});

function RunArtifactsConsumer({
  owner,
  repo,
  runId,
  onState,
}: {
  owner: string;
  repo: string;
  runId: number | null;
  onState: (state: ReturnType<typeof useRunArtifacts>) => void;
}) {
  const state = useRunArtifacts(owner, repo, runId);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

function renderHookWithClient<T>(
  hook: () => T,
  client = createQueryClient(),
): { result: { current: T } } {
  const result: { current: T | undefined } = { current: undefined };
  const Test = () => {
    result.current = hook();
    return null;
  };
  render(
    <QueryClientProvider client={client}>
      <Test />
    </QueryClientProvider>,
  );
  return { result: { current: result.current! } };
}
