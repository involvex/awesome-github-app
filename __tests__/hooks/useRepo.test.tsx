import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useRepo,
  useRepoTopics,
  useUpdateRepo,
} from "../../src/lib/api/hooks/useRepo";
import { repoFixture, topicsFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function RepoConsumer({
  owner,
  repo,
  onState,
}: {
  owner: string;
  repo: string;
  onState: (state: ReturnType<typeof useRepo>) => void;
}) {
  const state = useRepo(owner, repo);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

function TopicsConsumer({
  owner,
  repo,
  onState,
}: {
  owner: string;
  repo: string;
  onState: (state: ReturnType<typeof useRepoTopics>) => void;
}) {
  const state = useRepoTopics(owner, repo);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useRepo hooks", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("fetches repository details", async () => {
    const get = jest.fn().mockResolvedValue({ data: repoFixture });
    mockedGetOctokit.mockResolvedValue({ repos: { get } });
    const states: ReturnType<typeof useRepo>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <RepoConsumer
          owner="octocat"
          repo="awesome-github-app"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(s => s.isSuccess && s.data?.id === repoFixture.id),
      ).toBeTruthy(),
    );
    expect(get).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "awesome-github-app",
    });
  });

  test("fetches topics list", async () => {
    const getAllTopics = jest
      .fn()
      .mockResolvedValue({ data: { names: topicsFixture } });
    mockedGetOctokit.mockResolvedValue({ repos: { getAllTopics } });
    const states: ReturnType<typeof useRepoTopics>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <TopicsConsumer
          owner="octocat"
          repo="awesome-github-app"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            Array.isArray(s.data) &&
            s.data.includes(topicsFixture[0]),
        ),
      ).toBeTruthy(),
    );
    expect(getAllTopics).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "awesome-github-app",
    });
  });

  test("surfaces repository fetch errors", async () => {
    const error = new Error("boom");
    const get = jest.fn().mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({ repos: { get } });
    const states: ReturnType<typeof useRepo>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <RepoConsumer
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

  test("updates repo invalidates cache", async () => {
    const invalidateQueries = jest.fn();
    const update = jest.fn().mockResolvedValue({ data: repoFixture });
    mockedGetOctokit.mockResolvedValue({
      repos: { update, get: jest.fn(), getAllTopics: jest.fn() },
    });
    const client = createQueryClient();
    const invalidateSpy = jest
      .spyOn(client, "invalidateQueries")
      .mockImplementation(invalidateQueries);

    const { result } = renderHookWithClient(
      () => useUpdateRepo("octocat", "awesome-github-app"),
      client,
    );

    await result.current.mutateAsync({ description: "Updated" });
    expect(update).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "awesome-github-app",
      description: "Updated",
    });
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { result: { current: result.current! } };
}
