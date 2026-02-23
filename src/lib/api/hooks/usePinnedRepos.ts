import { useQuery } from "@tanstack/react-query";
import { getGraphQL } from "../graphql";

export interface PinnedRepo {
  id: string;
  name: string;
  nameWithOwner: string;
  description?: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage?: { name: string } | null;
  owner: { login: string; avatarUrl?: string | null };
}

export function usePinnedRepos() {
  return useQuery({
    queryKey: ["pinnedRepos"],
    queryFn: async () => {
      const gql = await getGraphQL();
      const data = await gql<{
        viewer: {
          pinnedItems: {
            totalCount: number;
            nodes: Array<{
              __typename: string;
              id: string;
              name: string;
              nameWithOwner: string;
              description: string | null;
              stargazerCount: number;
              forkCount: number;
              primaryLanguage: { name: string } | null;
              owner: { login: string; avatarUrl: string | null };
            } | null>;
          };
        };
      }>(
        `
        query {
          viewer {
            pinnedItems(first: 6, types: [REPOSITORY]) {
              totalCount
              nodes {
                __typename
                ... on Repository {
                  id
                  name
                  nameWithOwner
                  description
                  stargazerCount
                  forkCount
                  primaryLanguage { name }
                  owner { login avatarUrl }
                }
              }
            }
          }
        }
      `,
      );

      const nodes =
        data.viewer.pinnedItems.nodes?.filter(
          (n): n is PinnedRepo => !!n && n.__typename === "Repository",
        ) ?? [];

      return {
        totalCount: data.viewer.pinnedItems.totalCount,
        repos: nodes,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
