import { getItem, setItem, deleteItem } from "../storage";
import { Octokit } from "@octokit/rest";

export const GITHUB_TOKEN_KEY = "github_access_token";

let _octokit: Octokit | null = null;

export async function getOctokit(): Promise<Octokit> {
  if (_octokit) return _octokit;
  const token = await getItem(GITHUB_TOKEN_KEY);
  _octokit = new Octokit({ auth: token ?? undefined });
  return _octokit;
}

export function resetOctokit() {
  _octokit = null;
}

export async function setToken(token: string) {
  await setItem(GITHUB_TOKEN_KEY, token);
  resetOctokit();
}

export async function clearToken() {
  await deleteItem(GITHUB_TOKEN_KEY);
  resetOctokit();
}
