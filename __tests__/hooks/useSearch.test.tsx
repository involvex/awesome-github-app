import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  searchReposFixture,
  searchUsersFixture,
  searchTopicsFixture,
} from "../test-utils/fixtures";
import { useSearch, type SearchType } from "../../src/lib/api/hooks/useSearch";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function SearchConsumer({
  query,
  type,
  onState,
}: {
  query: string;
  type: SearchType;
  onState: (state: ReturnType<typeof useSearch>) => void;
}) {
  const state = useSearch(query, type);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useSearch hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("searches repositories", async () => {
    const search = {
      repos: jest
        .fn()
        .mockResolvedValue({ data: { items: searchReposFixture } }),
    };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="react"
          type="repositories"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].length === searchReposFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(search.repos).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "react",
        per_page: 30,
        page: 1,
      }),
    );
  });

  test("searches users", async () => {
    const search = {
      users: jest
        .fn()
        .mockResolvedValue({ data: { items: searchUsersFixture } }),
    };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="octocat"
          type="users"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].length === searchUsersFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(search.users).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "octocat",
        per_page: 30,
        page: 1,
        sort: "followers",
        order: "desc",
      }),
    );
  });

  test("searches topics", async () => {
    const search = {
      repos: jest
        .fn()
        .mockResolvedValue({ data: { items: searchTopicsFixture } }),
    };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="topic:react"
          type="topics"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].length === searchTopicsFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(search.repos).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "topic:topic:react",
        per_page: 30,
        page: 1,
        sort: "stars",
        order: "desc",
      }),
    );
  });

  test("searches issues", async () => {
    const issuesAndPullRequests = jest
      .fn()
      .mockResolvedValue({ data: { items: searchReposFixture } });
    const search = { issuesAndPullRequests };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="bug"
          type="issues"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.pages[0].length === searchReposFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(issuesAndPullRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "bug",
        per_page: 30,
        page: 1,
      }),
    );
  });

  test("applies sort and order options", async () => {
    const search = {
      repos: jest
        .fn()
        .mockResolvedValue({ data: { items: searchReposFixture } }),
    };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="test"
          type="repositories"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(states.some(s => s.isSuccess)).toBe(true));
    expect(search.repos).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "best-match",
        order: "desc",
      }),
    );
  });

  test("does not fetch when query is too short", async () => {
    const search = { repos: jest.fn() };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="a"
          type="repositories"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(states[0]?.isLoading).toBe(false));
    expect(search.repos).not.toHaveBeenCalled();
  });

  test("surfaces search errors", async () => {
    const error = new Error("boom");
    const search = { repos: jest.fn().mockRejectedValue(error) };
    mockedGetOctokit.mockResolvedValue(search);
    const states: ReturnType<typeof useSearch>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <SearchConsumer
          query="test"
          type="repositories"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(states.some(s => s.isError && s.error === error)).toBe(true),
    );
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
  return { result: { current: result.current! } };
}
