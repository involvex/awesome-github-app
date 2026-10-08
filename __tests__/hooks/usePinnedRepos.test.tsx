import { waitFor } from "@testing-library/react-native";
import React from "react";

import { createQueryClient, renderHookAndWait } from "../test-utils/render";
import { usePinnedRepos } from "../../src/lib/api/hooks/usePinnedRepos";
import { pinnedReposFixture } from "../test-utils/fixtures";

const mockedGetGraphQL = jest.fn();

jest.mock("../../src/lib/api/graphql", () => ({
  getGraphQL: () => mockedGetGraphQL(),
}));

describe("usePinnedRepos hook", () => {
  beforeEach(() => {
    mockedGetGraphQL.mockReset();
  });

  test("fetches pinned repositories", async () => {
    const mockGql = jest.fn().mockResolvedValue({
      viewer: {
        pinnedItems: {
          totalCount: pinnedReposFixture.totalCount,
          nodes: pinnedReposFixture.repos,
        },
      },
    });
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(() => usePinnedRepos(), client);

    expect(result.isSuccess).toBe(true);
    expect(result.data?.totalCount).toBe(pinnedReposFixture.totalCount);
    expect(result.data?.repos).toHaveLength(pinnedReposFixture.repos.length);
    expect(mockGql).toHaveBeenCalledWith(
      expect.stringContaining("pinnedItems"),
    );
  });

  test("filters non-repository nodes", async () => {
    const mockGql = jest.fn().mockResolvedValue({
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
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(() => usePinnedRepos(), client);

    expect(result.isSuccess).toBe(true);
    expect(result.data?.repos).toHaveLength(2);
  });

  test("surfaces GraphQL errors", async () => {
    const error = new Error("GraphQL error");
    const mockGql = jest.fn().mockRejectedValue(error);
    mockedGetGraphQL.mockResolvedValue(mockGql);
    const client = createQueryClient();

    const result = await renderHookAndWait(() => usePinnedRepos(), client);

    expect(result.isError).toBe(true);
    expect(result.error).toBe(error);
  });
});
