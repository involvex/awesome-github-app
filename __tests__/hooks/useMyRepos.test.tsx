import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useMyRepos,
  type RepoFilter,
  type RepoSort,
} from "../../src/lib/api/hooks/useMyRepos";
import { createQueryClient, renderHookAndWait } from "../test-utils/render";
import { myReposFixture } from "../test-utils/fixtures";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function MyReposConsumer({
  type,
  sort,
  onState,
}: {
  type: RepoFilter;
  sort: RepoSort;
  onState: (state: ReturnType<typeof useMyRepos>) => void;
}) {
  const state = useMyRepos(type, sort);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useMyRepos hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("fetches repos with default params", async () => {
    const listForAuthenticatedUser = jest
      .fn()
      .mockResolvedValue({ data: myReposFixture });
    mockedGetOctokit.mockResolvedValue({ repos: { listForAuthenticatedUser } });
    const states: ReturnType<typeof useMyRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <MyReposConsumer
          type="owner"
          sort="updated"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s => s.isSuccess && s.data?.pages[0].length === myReposFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(listForAuthenticatedUser).toHaveBeenCalledWith({
      type: "owner",
      sort: "updated",
      per_page: 30,
      page: 1,
    });
  });

  test("fetches repos with forks filter", async () => {
    const forksOnly = myReposFixture.filter(r => r.fork);
    const listForAuthenticatedUser = jest
      .fn()
      .mockResolvedValue({ data: myReposFixture });
    mockedGetOctokit.mockResolvedValue({ repos: { listForAuthenticatedUser } });
    const states: ReturnType<typeof useMyRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <MyReposConsumer
          type="forks"
          sort="updated"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].every((r: (typeof myReposFixture)[0]) => r.fork),
        ),
      ).toBeTruthy(),
    );
    expect(listForAuthenticatedUser).toHaveBeenCalledWith({
      type: "all",
      sort: "updated",
      per_page: 30,
      page: 1,
    });
  });

  test("fetches next page", async () => {
    const page1 = [myReposFixture[0]];
    const page2 = [myReposFixture[1]];
    const listForAuthenticatedUser = jest
      .fn()
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: page2 });
    mockedGetOctokit.mockResolvedValue({ repos: { listForAuthenticatedUser } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useMyRepos("owner", "updated"),
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
    const listForAuthenticatedUser = jest.fn().mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({ repos: { listForAuthenticatedUser } });
    const states: ReturnType<typeof useMyRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <MyReposConsumer
          type="owner"
          sort="updated"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(states.some(s => s.isError && s.error === error)).toBe(true),
    );
  });
});
