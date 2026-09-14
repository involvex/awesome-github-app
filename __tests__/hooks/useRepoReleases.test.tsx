import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useRepoReleases } from "../../src/lib/api/hooks/useRepoReleases";
import { repoReleasesFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function RepoReleasesConsumer({
  owner,
  repo,
  onState,
}: {
  owner: string;
  repo: string;
  onState: (state: ReturnType<typeof useRepoReleases>) => void;
}) {
  const state = useRepoReleases(owner, repo);
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

describe("useRepoReleases hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("fetches repository releases", async () => {
    const listReleases = jest.fn().mockResolvedValue({
      data: [
        {
          id: 1000,
          name: "v1.0.0",
          tag_name: "v1.0.0",
          body: "Initial release",
          draft: false,
          prerelease: false,
          published_at: "2024-01-10T10:00:00Z",
          html_url:
            "https://github.com/octocat/awesome-github-app/releases/tag/v1.0.0",
          zipball_url:
            "https://github.com/octocat/awesome-github-app/zipball/v1.0.0",
          tarball_url:
            "https://github.com/octocat/awesome-github-app/tarball/v1.0.0",
          author: { login: "octocat" },
        },
        {
          id: 1001,
          name: "v0.9.0-beta",
          tag_name: "v0.9.0-beta",
          body: "Beta release",
          draft: false,
          prerelease: true,
          published_at: "2024-01-01T10:00:00Z",
          html_url:
            "https://github.com/octocat/awesome-github-app/releases/tag/v0.9.0-beta",
          zipball_url:
            "https://github.com/octocat/awesome-github-app/zipball/v0.9.0-beta",
          tarball_url:
            "https://github.com/octocat/awesome-github-app/tarball/v0.9.0-beta",
          author: { login: "octocat" },
        },
      ],
    });
    mockedGetOctokit.mockResolvedValue({ repos: { listReleases } });
    const states: ReturnType<typeof useRepoReleases>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <RepoReleasesConsumer
          owner="octocat"
          repo="awesome-github-app"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        states.find(
          s => s.isSuccess && s.data?.length === repoReleasesFixture.length,
        ),
      ).toBeTruthy(),
    );
    expect(listReleases).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "awesome-github-app",
      per_page: 30,
    });
  });

  test("maps releases to correct format", async () => {
    const listReleases = jest.fn().mockResolvedValue({
      data: [
        {
          id: 1000,
          name: "v1.0.0",
          tag_name: "v1.0.0",
          body: "Initial release",
          draft: false,
          prerelease: false,
          published_at: "2024-01-10T10:00:00Z",
          html_url:
            "https://github.com/octocat/awesome-github-app/releases/tag/v1.0.0",
          zipball_url:
            "https://github.com/octocat/awesome-github-app/zipball/v1.0.0",
          tarball_url:
            "https://github.com/octocat/awesome-github-app/tarball/v1.0.0",
          author: { login: "octocat" },
        },
      ],
    });
    mockedGetOctokit.mockResolvedValue({ repos: { listReleases } });
    const client = createQueryClient();

    const { result } = renderHookWithClient(
      () => useRepoReleases("octocat", "awesome-github-app"),
      client,
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toMatchObject({
      id: 1000,
      name: "v1.0.0",
      tag_name: "v1.0.0",
      body: "Initial release",
      draft: false,
      prerelease: false,
      author: "octocat",
    });
  });

  test("handles null name and author", async () => {
    const listReleases = jest.fn().mockResolvedValue({
      data: [
        {
          id: 1002,
          name: null,
          tag_name: "v1.0.1",
          body: null,
          draft: true,
          prerelease: false,
          published_at: null,
          html_url:
            "https://github.com/octocat/awesome-github-app/releases/tag/v1.0.1",
          zipball_url:
            "https://github.com/octocat/awesome-github-app/zipball/v1.0.1",
          tarball_url:
            "https://github.com/octocat/awesome-github-app/tarball/v1.0.1",
          author: null,
        },
      ],
    });
    mockedGetOctokit.mockResolvedValue({ repos: { listReleases } });
    const client = createQueryClient();

    const { result } = renderHookWithClient(
      () => useRepoReleases("octocat", "awesome-github-app"),
      client,
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]).toMatchObject({
      name: null,
      body: null,
      author: "unknown",
    });
  });

  test("surfaces fetch errors", async () => {
    const error = new Error("boom");
    const listReleases = jest.fn().mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({ repos: { listReleases } });
    const states: ReturnType<typeof useRepoReleases>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <RepoReleasesConsumer
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

  test("returns undefined when owner or repo is empty", () => {
    const states: ReturnType<typeof useRepoReleases>[] = [];
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <RepoReleasesConsumer
          owner=""
          repo="awesome-github-app"
          onState={s => states.push(s)}
        />
      </QueryClientProvider>,
    );

    expect(states[0]?.data).toBeUndefined();
    expect(states[0]?.isLoading).toBe(false);
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
