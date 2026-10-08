import {
  useWorkflows,
  useWorkflowRuns,
  useDispatchWorkflow,
  useRunArtifacts,
  useDownloadArtifact,
  useCancelRun,
} from "../../src/lib/api/hooks/useWorkflows";
import {
  createQueryClient,
  renderHookAndWait,
  renderHookForMutation,
} from "../test-utils/render";
import { workflowsFixture, workflowRunsFixture } from "../test-utils/fixtures";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

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
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useWorkflows("octocat", "awesome-github-app"),
        client,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(workflowsFixture.length);
      expect(listRepoWorkflows).toHaveBeenCalledWith({
        owner: "octocat",
        repo: "awesome-github-app",
      });
    });

    test("surfaces fetch errors", async () => {
      const error = new Error("boom");
      const listRepoWorkflows = jest.fn().mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({ actions: { listRepoWorkflows } });
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useWorkflows("octocat", "awesome-github-app"),
        client,
      );

      expect(result.isError).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("useWorkflowRuns", () => {
    test("fetches workflow runs for specific workflow", async () => {
      const listWorkflowRuns = jest
        .fn()
        .mockResolvedValue({ data: { workflow_runs: workflowRunsFixture } });
      mockedGetOctokit.mockResolvedValue({ actions: { listWorkflowRuns } });
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useWorkflowRuns("octocat", "awesome-github-app", 100),
        client,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(workflowRunsFixture.length);
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
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useWorkflowRuns("octocat", "awesome-github-app", undefined),
        client,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(workflowRunsFixture.length);
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
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useWorkflowRuns("octocat", "awesome-github-app", 100),
        client,
      );

      expect(result.isError).toBe(true);
      expect(result.error).toBe(error);
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

      const { result } = await renderHookForMutation(
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
      const client = createQueryClient();

      const result = await renderHookAndWait(
        () => useRunArtifacts("octocat", "awesome-github-app", 10000),
        client,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("useDownloadArtifact", () => {
    test("downloads artifact and returns URL", async () => {
      const downloadArtifact = jest
        .fn()
        .mockResolvedValue({ url: "https://example.com/artifact.zip" });
      mockedGetOctokit.mockResolvedValue({ actions: { downloadArtifact } });
      const client = createQueryClient();

      const { result } = await renderHookForMutation(
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

      const { result } = await renderHookForMutation(
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
