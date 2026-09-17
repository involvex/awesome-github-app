import {
  requestWidgetUpdate,
  writeWidgetInt,
  writeWidgetString,
} from "./widgetBridge";
import type { NotificationThread } from "../api/hooks/useNotifications";
import type { Release } from "../api/hooks/useReleases";
import type { AssignedPr } from "../api/prInbox";

export const NOTIFICATION_PREFS = "notification_widget_prefs";
export const NOTIFICATION_PROVIDER =
  "com.involvex.awesomegithubapp.widget.NotificationWidgetProvider";

export const RELEASES_PREFS = "releases_widget_prefs";
export const RELEASES_PROVIDER =
  "com.involvex.awesomegithubapp.widget.ReleasesWidgetProvider";

export const PR_INBOX_PREFS = "pr_inbox_widget_prefs";
export const PR_INBOX_PROVIDER =
  "com.involvex.awesomegithubapp.widget.PrInboxWidgetProvider";

const MAX_WIDGET_ITEMS = 10;
/** Keep SharedPreferences payloads small — widgets read the whole file. */
const MAX_PAYLOAD_BYTES = 48 * 1024;

export interface WidgetReleaseItem {
  id: number;
  repo_full_name: string;
  tag_name: string;
  published_at: string;
}

export function buildReleasesPayload(releases: Release[]): WidgetReleaseItem[] {
  return releases.slice(0, MAX_WIDGET_ITEMS).map(r => ({
    id: r.id,
    repo_full_name: r.repo.full_name,
    tag_name: r.tag_name,
    published_at: r.published_at ?? r.created_at,
  }));
}

export function buildNotificationTitles(
  threads: NotificationThread[],
  limit = 3,
): string[] {
  return threads
    .filter(t => t.unread)
    .slice(0, limit)
    .map(t => {
      const repo = t.repository?.full_name ?? "Unknown";
      const title = t.subject?.title ?? "New activity";
      const combined = `${repo}: ${title}`;
      return combined.length > 80 ? `${combined.slice(0, 77)}...` : combined;
    });
}

function truncateToBytes(value: string, maxBytes: number): string {
  const encoded = encodeURIComponent(value);
  if (encoded.length <= maxBytes) return value;
  // Binary-search a prefix that fits; payloads here are small so this is cheap.
  let low = 0;
  let high = value.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (encodeURIComponent(value.slice(0, mid)).length <= maxBytes) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return value.slice(0, Math.max(0, low - 1));
}

export async function syncNotificationWidget(
  threads: NotificationThread[],
): Promise<void> {
  const unread = threads.filter(t => t.unread);
  const titles = buildNotificationTitles(threads);
  await writeWidgetInt(NOTIFICATION_PREFS, "unread_count", unread.length);
  await writeWidgetString(
    NOTIFICATION_PREFS,
    "last_updated",
    new Date().toISOString(),
  );
  await writeWidgetString(
    NOTIFICATION_PREFS,
    "top_items_json",
    truncateToBytes(JSON.stringify(titles), MAX_PAYLOAD_BYTES),
  );
  await requestWidgetUpdate(NOTIFICATION_PROVIDER);
}

export async function syncReleasesWidget(releases: Release[]): Promise<void> {
  const payload = truncateToBytes(
    JSON.stringify(buildReleasesPayload(releases)),
    MAX_PAYLOAD_BYTES,
  );
  await writeWidgetString(RELEASES_PREFS, "items_json", payload);
  await writeWidgetString(
    RELEASES_PREFS,
    "last_updated",
    new Date().toISOString(),
  );
  await requestWidgetUpdate(RELEASES_PROVIDER);
}

export interface WidgetPrItem {
  id: number;
  repo_full_name: string;
  number: number;
  title: string;
  updated_at: string;
}

export function buildPrInboxPayload(prs: AssignedPr[]): WidgetPrItem[] {
  return prs.slice(0, MAX_WIDGET_ITEMS).map(pr => ({
    id: pr.id,
    repo_full_name: pr.repo_full_name,
    number: pr.number,
    title: pr.title.length > 90 ? `${pr.title.slice(0, 87)}...` : pr.title,
    updated_at: pr.updated_at,
  }));
}

export async function syncPrInboxWidget(prs: AssignedPr[]): Promise<void> {
  const payload = truncateToBytes(
    JSON.stringify(buildPrInboxPayload(prs)),
    MAX_PAYLOAD_BYTES,
  );
  await writeWidgetString(PR_INBOX_PREFS, "items_json", payload);
  await writeWidgetString(
    PR_INBOX_PREFS,
    "last_updated",
    new Date().toISOString(),
  );
  await requestWidgetUpdate(PR_INBOX_PROVIDER);
}

/**
 * Clears all widget snapshots (e.g. on sign-out) so a signed-out device
 * never shows the previous account's data. Each step is best-effort.
 */
export async function clearWidgetData(): Promise<void> {
  await writeWidgetInt(NOTIFICATION_PREFS, "unread_count", 0);
  await writeWidgetString(NOTIFICATION_PREFS, "top_items_json", "[]");
  await writeWidgetString(RELEASES_PREFS, "items_json", "[]");
  await writeWidgetString(PR_INBOX_PREFS, "items_json", "[]");
  await requestWidgetUpdate(NOTIFICATION_PROVIDER);
  await requestWidgetUpdate(RELEASES_PROVIDER);
  await requestWidgetUpdate(PR_INBOX_PROVIDER);
}
