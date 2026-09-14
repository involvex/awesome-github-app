import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { createQueryClient, renderHookAndWait } from "../test-utils/render";
import { useStarredRepos } from "../../src/lib/api/hooks/useStarredRepos";
import { starredReposFixture } from "../test-utils/fixtures";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function StarredReposConsumer({
  username,
  onState,
}: {
  username: string;
  onState: (state: ReturnType<typeof useStarredRepos>) => void;
}) {
  const state = useStarredRepos(username);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useStarredRepos hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("fetches starred repos for user", async () => {
    const listReposStarredByAuthenticatedUser = jest
      .fn()
      .mockResolvedValue({ data: starredReposFixture });
    mockedGetOctokit.mockResolvedValue({
      activity: { listReposStarredByAuthenticatedUser },
    });
    const states: ReturnType<typeof useStarredRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <StarredReposConsumer
          username="octocat"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].length === starredReposFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(listReposStarredByAuthenticatedUser).toHaveBeenCalledWith({
      per_page: 30,
      page: 1,
    });
  });

  test("fetches next page of starred repos", async () => {
    const page1 = [starredReposFixture[0]];
    const page2 = [starredReposFixture[1]];
    const listReposStarredByAuthenticatedUser = jest
      .fn()
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: page2 });
    mockedGetOctokit.mockResolvedValue({
      activity: { listReposStarredByAuthenticatedUser },
    });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useStarredRepos("octocat"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.pages[0]).toEqual(page1);

    await result.fetchNextPage();
    await waitFor(() => expect(result.isFetchingNextPage).toBe(false));
    expect(result.data?.pages).toHaveLength(2);
  });

  test("surfaces fetch errors", async () => {
    const error = new Error("boom");
    const listReposStarredByAuthenticatedUser = jest
      .fn()
      .mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({
      activity: { listReposStarredByAuthenticatedUser },
    });
    const states: ReturnType<typeof useStarredRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <StarredReposConsumer
          username="octocat"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(states.some(s => s.isError && s.error === error)).toBe(true),
    );
  });

  test("returns undefined when username is empty", () => {
    const states: ReturnType<typeof useStarredRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <StarredReposConsumer
          username=""
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    expect(states[0]?.data).toBeUndefined();
    expect(states[0]?.isLoading).toBe(false);
  });
});
