import {
  searchReposFixture,
  searchUsersFixture,
  searchTopicsFixture,
} from "../test-utils/fixtures";
import { useSearch, type SearchType } from "../../src/lib/api/hooks/useSearch";
import { createQueryClient, renderHookAndWait } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

describe("useSearch hook", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  test("searches repositories", async () => {
    const repos = jest
      .fn()
      .mockResolvedValue({ data: { items: searchReposFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("react", "repositories"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.pages[0]).toHaveLength(searchReposFixture.length);
    expect(repos).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "react",
        per_page: 30,
        page: 1,
      }),
    );
  });

  test("searches users", async () => {
    const users = jest
      .fn()
      .mockResolvedValue({ data: { items: searchUsersFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { users } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("octocat", "users"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.pages[0]).toHaveLength(searchUsersFixture.length);
    expect(users).toHaveBeenCalledWith(
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
    const repos = jest
      .fn()
      .mockResolvedValue({ data: { items: searchTopicsFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("topic:react", "topics"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.pages[0]).toHaveLength(searchTopicsFixture.length);
    expect(repos).toHaveBeenCalledWith(
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
    mockedGetOctokit.mockResolvedValue({ search: { issuesAndPullRequests } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("bug", "issues"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.pages[0]).toHaveLength(searchReposFixture.length);
    expect(issuesAndPullRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "bug",
        per_page: 30,
        page: 1,
      }),
    );
  });

  test("applies sort and order options", async () => {
    const repos = jest
      .fn()
      .mockResolvedValue({ data: { items: searchReposFixture } });
    mockedGetOctokit.mockResolvedValue({ search: { repos } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () =>
        useSearch("test", "repositories", {
          sort: "best-match",
          order: "desc",
        }),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(repos).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "best-match",
        order: "desc",
      }),
    );
  });

  test("does not fetch when query is too short", async () => {
    const repos = jest.fn();
    mockedGetOctokit.mockResolvedValue({ search: { repos } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("a", "repositories"),
      client,
    );

    expect(result.isLoading).toBe(false);
    expect(result.isSuccess).toBe(false);
    expect(repos).not.toHaveBeenCalled();
  });

  test("surfaces search errors", async () => {
    const error = new Error("boom");
    const repos = jest.fn().mockRejectedValue(error);
    mockedGetOctokit.mockResolvedValue({ search: { repos } });
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useSearch("test", "repositories"),
      client,
    );

    expect(result.isError).toBe(true);
    expect(result.error).toBe(error);
  });
});
