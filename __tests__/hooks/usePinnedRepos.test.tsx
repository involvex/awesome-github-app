import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { usePinnedRepos } from "../../src/lib/api/hooks/usePinnedRepos";
import { pinnedReposFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetGraphQL = jest.fn();

jest.mock("../../src/lib/api/graphql", () => ({
  getGraphQL: () => mockedGetGraphQL(),
}));

function PinnedReposConsumer({
  onState,
}: {
  onState: (state: ReturnType<typeof usePinnedRepos>) => void;
}) {
  const state = usePinnedRepos();
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("usePinnedRepos hook", () => {
  beforeEach(() => {
    mockedGetGraphQL.mockReset();
  });

  test("fetches pinned repositories", async () => {
    mockedGetGraphQL.mockResolvedValue({
      viewer: {
        pinnedItems: {
          totalCount: pinnedReposFixture.totalCount,
          nodes: pinnedReposFixture.repos,
        },
      },
    });
    const states: ReturnType<typeof usePinnedRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <PinnedReposConsumer onState={s => states.push(s)} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s =>
            s.isSuccess &&
            s.data?.totalCount === pinnedReposFixture.totalCount &&
            s.data?.repos.length === pinnedReposFixture.repos.length,
        ),
      ).toBeTruthy(),
    );
    expect(mockedGetGraphQL).toHaveBeenCalledWith(
      expect.stringContaining("pinnedItems"),
      undefined,
    );
  });

  test("filters non-repository nodes", async () => {
    mockedGetGraphQL.mockResolvedValue({
      viewer: {
        pinnedItems: {
          totalCount: 3,
          nodes: [
            pinnedReposFixture.repos[0],
            null,
            { __typename: "Gist", id: "G_1" },
            pinnedReposFixture.repos[1],
          ],
        },
      },
    });
    const states: ReturnType<typeof usePinnedRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <PinnedReposConsumer onState={s => states.push(s)} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(s => s.isSuccess && s.data?.repos.length === 2),
      ).toBeTruthy(),
    );
  });

  test("surfaces GraphQL errors", async () => {
    const error = new Error("GraphQL error");
    mockedGetGraphQL.mockRejectedValue(error);
    const states: ReturnType<typeof usePinnedRepos>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <PinnedReposConsumer onState={s => states.push(s)} />
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
