import {
  syncNotificationWidget,
  syncPrInboxWidget,
  syncReleasesWidget,
} from "./sync";
import { GITHUB_TOKEN_KEY, getOctokit } from "../api/github";
import * as BackgroundFetch from "expo-background-fetch";
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

async function runWidgetSync(): Promise<BackgroundFetch.BackgroundFetchResult> {
  const login = await getBackgroundLogin();
  if (!login) return BackgroundFetch.BackgroundFetchResult.NoData;

  const octokit = await getOctokit();

  try {
    const { data } =
      await octokit.activity.listNotificationsForAuthenticatedUser({
        all: true,
        per_page: 50,
      });
    await syncNotificationWidget(data);
  } catch {
    // One source failing must not block the others.
  }

  try {
    const releases = await fetchReleasesForUser(
      octokit,
      login,
      BG_REPO_LIMIT,
      BG_PER_REPO,
    );
    await syncReleasesWidget(releases);
  } catch {
    // Keep other widgets fresh.
  }

  try {
    await syncPrInboxWidget(await fetchAssignedPrs());
  } catch {
    // Search rate limits fail soft.
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
}

try {
  TaskManager.defineTask(WIDGET_SYNC_TASK, async () => {
    try {
      return await runWidgetSync();
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
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
      await BackgroundFetch.registerTaskAsync(WIDGET_SYNC_TASK, {
        minimumInterval: 30 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
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
      await BackgroundFetch.unregisterTaskAsync(WIDGET_SYNC_TASK);
    }
  } catch {
    // Best-effort cleanup.
  }
}

/** Foreground refresh of the PR inbox (e.g. when opening notifications). */
export async function refreshPrInboxWidget(): Promise<void> {
  try {
    await syncPrInboxWidget(await fetchAssignedPrs());
  } catch {
    // Offline or rate-limited — widget keeps its last snapshot.
  }
}
