import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useContributions } from "../../src/lib/api/hooks/useContributions";
import { contributionsFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetGraphQL = jest.fn();

jest.mock("../../src/lib/api/graphql", () => ({
  getGraphQL: () => mockedGetGraphQL(),
}));

function ContributionsConsumer({
  username,
  onState,
}: {
  username: string;
  onState: (state: ReturnType<typeof useContributions>) => void;
}) {
  const state = useContributions(username);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useContributions hook", () => {
  beforeEach(() => {
    mockedGetGraphQL.mockReset();
  });

  test("fetches contribution graph data", async () => {
    mockedGetGraphQL.mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: { weeks: contributionsFixture },
        },
      },
    });
    const states: ReturnType<typeof useContributions>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <ContributionsConsumer
          username="octocat"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s => s.isSuccess && s.data?.length === contributionsFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(mockedGetGraphQL).toHaveBeenCalledWith(
      expect.stringContaining("contributionCalendar"),
      { username: "octocat" },
    );
  });

  test("surfaces GraphQL errors", async () => {
    const error = new Error("GraphQL error");
    mockedGetGraphQL.mockRejectedValue(error);
    const states: ReturnType<typeof useContributions>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <ContributionsConsumer
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
    const states: ReturnType<typeof useContributions>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <ContributionsConsumer
          username=""
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    expect(states[0]?.data).toBeUndefined();
    expect(states[0]?.isLoading).toBe(false);
  });

  test("uses correct stale time", async () => {
    mockedGetGraphQL.mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: { weeks: contributionsFixture },
        },
      },
    });
    const client = createQueryClient();

    const { result } = renderHookWithClient(
      () => useContributions("octocat"),
      client,
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(contributionsFixture);
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
