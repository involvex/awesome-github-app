import {
  getPrInboxFilter,
  syncNotificationWidget,
  syncPrInboxWidget,
  syncReleasesWidget,
} from "./sync";
import { GITHUB_TOKEN_KEY, getOctokit } from "../api/github";
import * as BackgroundTask from "expo-background-task";
import { fetchReleasesForUser } from "../api/releases";
import { fetchAssignedPrs } from "../api/prInbox";
import * as TaskManager from "expo-task-manager";
import { getItem } from "../storage";

export const WIDGET_SYNC_TASK = "widget-background-sync";
const USER_STORAGE_KEY = "github_user_profile";
/** Slim pass so the background task stays well within OS time limits. */
const BG_REPO_LIMIT = 10;
const BG_PER_REPO = 1;

interface StoredUser {
  login?: string;
}

async function getBackgroundLogin(): Promise<string | null> {
  const [token, userJson] = await Promise.all([
    getItem(GITHUB_TOKEN_KEY),
    getItem(USER_STORAGE_KEY),
  ]);
  if (!token) return null;
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson) as StoredUser;
    return user.login ?? null;
  } catch {
    return null;
  }
}

/**
 * Runs all three widget syncs in parallel using Promise.allSettled.
 *
 * Tradeoff: Sequential execution (old) vs Parallel (new):
 * - Sequential: Spreading API calls over time reduces chance of hitting
 *   GitHub's secondary rate limits (abuse detection). Each call is in its
 *   own try/catch so one failure doesn't block others.
 * - Parallel: ~3x faster overall (important for background task time limits
 *   on Android ~10s). Still uses independent try/catch per source so
 *   failures are isolated. GitHub's primary rate limit (5000/hr) is per-token,
 *   not per-endpoint, so parallel doesn't increase primary limit risk.
 *
 * We choose parallel because: (1) background task has strict time budget,
 * (2) 3 calls is well within primary rate limit, (3) secondary limits are
 * rare for authenticated requests with proper User-Agent.
 */
async function runWidgetSync(): Promise<{ data?: string }> {
  const login = await getBackgroundLogin();
  if (!login) return { data: "no-data" };

  const octokit = await getOctokit();

  const results = await Promise.allSettled([
    (async () => {
      const { data } =
        await octokit.activity.listNotificationsForAuthenticatedUser({
          all: true,
          per_page: 50,
        });
      await syncNotificationWidget(data);
    })(),
    (async () => {
      const releases = await fetchReleasesForUser(
        octokit,
        login,
        BG_REPO_LIMIT,
        BG_PER_REPO,
      );
      await syncReleasesWidget(releases);
    })(),
    (async () => {
      await syncPrInboxWidget(
        await fetchAssignedPrs(),
        await getPrInboxFilter(),
      );
    })(),
  ]);

  // Log any failures for debugging (in production, these go to console)
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const source = ["notifications", "releases", "prInbox"][i];
      console.warn(`[WidgetSync] ${source} sync failed:`, result.reason);
    }
  });

  return { data: "new-data" };
}

try {
  TaskManager.defineTask(WIDGET_SYNC_TASK, async () => {
    try {
      await runWidgetSync();
    } catch {
      // Task failed — will be retried by OS.
    }
  });
} catch {
  // Task already defined (fast refresh) or unsupported runtime (Expo Go).
}

/**
 * Schedules periodic widget refresh (~30 min, OS-batched via JobScheduler).
 * No-op on web; requires a dev client or production build (not Expo Go).
 */
export async function registerWidgetBackgroundSync(): Promise<void> {
  try {
    const registered =
      await TaskManager.isTaskRegisteredAsync(WIDGET_SYNC_TASK);
    if (!registered) {
      await BackgroundTask.registerTaskAsync(WIDGET_SYNC_TASK, {
        minimumInterval: 30 * 60,
      });
    }
  } catch {
    // Background execution unavailable — foreground sync still works.
  }
}

export async function unregisterWidgetBackgroundSync(): Promise<void> {
  try {
    const registered =
      await TaskManager.isTaskRegisteredAsync(WIDGET_SYNC_TASK);
    if (registered) {
      await BackgroundTask.unregisterTaskAsync(WIDGET_SYNC_TASK);
    }
  } catch {
    // Best-effort cleanup.
  }
}

/** Foreground refresh of the PR inbox (e.g. when opening notifications). */
export async function refreshPrInboxWidget(): Promise<void> {
  try {
    await syncPrInboxWidget(await fetchAssignedPrs(), await getPrInboxFilter());
  } catch {
    // Offline or rate-limited — widget keeps its last snapshot.
  }
}
