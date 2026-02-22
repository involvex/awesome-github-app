import { GITHUB_TOKEN_KEY } from "./github";
import { graphql } from "@octokit/graphql";
import { getItem } from "../storage";

export async function getGraphQL() {
  const token = await getItem(GITHUB_TOKEN_KEY);
  return graphql.defaults({
    headers: {
      authorization: token ? `token ${token}` : "",
    },
  });
}
