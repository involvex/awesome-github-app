import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useTrending,
  type TrendingPeriod,
  type TrendingMode,
} from "../../src/lib/api/hooks/useTrending";
import { trendingRepoFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function TrendingConsumer({
  period,
  language,
  mode,
  onState,
}: {
  period: TrendingPeriod;
  language?: string;
  mode: TrendingMode;
  onState: (state: ReturnType<typeof useTrending>) => void;
}) {
  const state = useTrending(period, language, mode);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useTrending hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("fetches trending repos with default params", async () => {
    const search = jest
      .fn()
      .mockResolvedValue({ data: { items: trendingRepoFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos: search } });
    const states: ReturnType<typeof useTrending>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <TrendingConsumer
          period="today"
          mode="hot"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s => s.isSuccess && s.data?.length === trendingRepoFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.stringContaining("stars:>"),
        sort: "stars",
        order: "desc",
        per_page: 30,
      }),
    );
  });

  test("fetches trending repos with language filter", async () => {
    const search = jest
      .fn()
      .mockResolvedValue({ data: { items: trendingRepoFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos: search } });
    const states: ReturnType<typeof useTrending>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <TrendingConsumer
          period="week"
          language="TypeScript"
          mode="new"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s => s.isSuccess && s.data?.length === trendingRepoFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.stringContaining("language:TypeScript"),
      }),
    );
  });

  test("surfaces trending fetch errors", async () => {
    const error = new Error("boom");
    const search = jest.fn().mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({ search: { repos: search } });
    const states: ReturnType<typeof useTrending>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <TrendingConsumer
          period="month"
          mode="released"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(states.some(s => s.isError && s.error === error)).toBe(true),
    );
  });

  test("uses correct query key for different params", async () => {
    const search = jest
      .fn()
      .mockResolvedValue({ data: { items: trendingRepoFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos: search } });
    const client = createQueryClient();

    const { result: result1 } = renderHookWithClient(
      () => useTrending("today", undefined, "hot"),
      client,
    );
    const { result: result2 } = renderHookWithClient(
      () => useTrending("week", "TypeScript", "new"),
      client,
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    expect(result1.current.data).toEqual(trendingRepoFixture);
    expect(result2.current.data).toEqual(trendingRepoFixture);
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
