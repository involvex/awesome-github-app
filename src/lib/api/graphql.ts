import * as SecureStore from "expo-secure-store";
import { GITHUB_TOKEN_KEY } from "./github";
import { graphql } from "@octokit/graphql";

export async function getGraphQL() {
  const token = await SecureStore.getItemAsync(GITHUB_TOKEN_KEY);
  return graphql.defaults({
    headers: {
      authorization: token ? `token ${token}` : "",
    },
  });
}
