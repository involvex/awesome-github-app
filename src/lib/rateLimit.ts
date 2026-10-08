import { getOctokit } from "./api/github";

const RATE_LIMIT_WARNING_THRESHOLD = 100;

export type RateLimitStatus = {
  remaining: number;
  limit: number;
  resetAt: Date;
};

let lastKnownStatus: RateLimitStatus | null = null;

export function getLastKnownRateLimit(): RateLimitStatus | null {
  return lastKnownStatus;
}

export async function checkRateLimit(): Promise<RateLimitStatus | null> {
  try {
    const octokit = await getOctokit();
    const { data } = await octokit.rateLimit.get();
    const core = data.resources?.core;
    if (!core) return lastKnownStatus;

    const limit = core.limit;
    const remaining = core.remaining;
    const resetAt = new Date(core.reset * 1000);

    lastKnownStatus = { remaining, limit, resetAt };

    if (remaining <= RATE_LIMIT_WARNING_THRESHOLD) {
      console.warn(
        `GitHub API rate limit low: ${remaining}/${limit} remaining. Resets at ${resetAt.toLocaleTimeString()}.`,
      );
    }

    return lastKnownStatus;
  } catch {
    return lastKnownStatus;
  }
}
