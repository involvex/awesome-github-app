import { useQuery } from "@tanstack/react-query";
import { getGraphQL } from "../graphql";

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export function useContributions(username: string) {
  return useQuery({
    queryKey: ["contributions", username],
    queryFn: async () => {
      const gql = await getGraphQL();
      const data = await gql<{
        user: {
          contributionsCollection: {
            contributionCalendar: { weeks: ContributionWeek[] };
          };
        };
      }>(
        `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
            }
          }
        }
      `,
        { username },
      );
      return data.user.contributionsCollection.contributionCalendar.weeks;
    },
    enabled: !!username,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
