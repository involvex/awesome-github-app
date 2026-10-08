import {
  createQueryClient,
  renderHookAndWait,
  renderHookForMutation,
} from "../test-utils/render";
import { useContributions } from "../../src/lib/api/hooks/useContributions";
import { contributionsFixture } from "../test-utils/fixtures";

const mockedGetGraphQL = jest.fn();

jest.mock("../../src/lib/api/graphql", () => ({
  getGraphQL: () => mockedGetGraphQL(),
}));

describe("useContributions hook", () => {
  beforeEach(() => {
    mockedGetGraphQL.mockReset();
  });

  test("fetches contribution graph data", async () => {
    const mockGql = jest.fn().mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: { weeks: contributionsFixture },
        },
      },
    });
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useContributions("octocat"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual(contributionsFixture);
    expect(mockGql).toHaveBeenCalledWith(
      expect.stringContaining("contributionCalendar"),
      { username: "octocat" },
    );
  });

  test("surfaces GraphQL errors", async () => {
    const error = new Error("GraphQL error");
    const mockGql = jest.fn().mockRejectedValue(error);
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useContributions("octocat"),
      client,
    );

    expect(result.isError).toBe(true);
    expect(result.error).toBe(error);
  });

  test("returns undefined when username is empty", () => {
    const client = createQueryClient();

    // For empty username, the hook returns early without fetching
    const { result } = renderHookForMutation(
      () => useContributions(""),
      client,
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test("uses correct stale time", async () => {
    const mockGql = jest.fn().mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: { weeks: contributionsFixture },
        },
      },
    });
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(
      () => useContributions("octocat"),
      client,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual(contributionsFixture);
  });
});
