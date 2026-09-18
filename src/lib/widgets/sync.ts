import {
  requestWidgetUpdate,
  writeWidgetInt,
  writeWidgetString,
} from "./widgetBridge";
import type { NotificationThread } from "../api/hooks/useNotifications";
import type { Release } from "../api/hooks/useReleases";
import { filterPrInboxItems } from "../api/prInbox";
import type { AssignedPr } from "../api/prInbox";
import { getItem, setItem } from "../storage";

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

const PR_INBOX_FILTER_KEY = "pr_inbox_filter";

/** Serialized filter for storage (string form of the filter kind) */
type SerializedFilter = "all" | "assigned" | "review" | "draft";

export const PR_INBOX_FILTERS: { label: string; value: SerializedFilter }[] = [
  { label: "All", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "Review requested", value: "review" },
  { label: "Drafts", value: "draft" },
];

/**
 * Human-readable refresh label, preformatted in JS (the widget process has
 * no date library). Written alongside the ISO timestamp as
 * `last_updated_label`, e.g. "Updated 5m ago".
 */
export function formatWidgetTimestamp(date: Date = new Date()): string {
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${date.toISOString().slice(0, 10)}`;
}

export interface WidgetReleaseItem {
  id: number;
  repo_full_name: string;
  tag_name: string;
  name: string | null;
  published_at: string;
  assets_count: number;
  downloads: number;
}

interface ReleaseWithAssets extends Release {
  assets?: Array<{ download_count?: number }>;
}

export function buildReleasesPayload(releases: Release[]): WidgetReleaseItem[] {
  return releases.slice(0, MAX_WIDGET_ITEMS).map(r => {
    const assets = (r as ReleaseWithAssets).assets;
    const list = Array.isArray(assets) ? assets : [];
    return {
      id: r.id,
      repo_full_name: r.repo.full_name,
      tag_name: r.tag_name,
      name: r.name ?? null,
      published_at: r.published_at ?? r.created_at,
      assets_count: list.length,
      downloads: list.reduce(
        (sum, a) =>
          sum + (typeof a.download_count === "number" ? a.download_count : 0),
        0,
      ),
    };
  });
}

export interface WidgetNotificationItem {
  repo_full_name: string;
  title: string;
  type: string;
  url: string;
}

const NOTIFICATION_TITLE_LIMIT = 80;

function notificationDisplayText(
  repo: string,
  title: string,
  type: string,
): string {
  const prefix =
    type === "PullRequest" ? "PR" : type === "Issue" ? "Issue" : type;
  const combined = `${prefix} · ${repo}: ${title}`;
  return combined.length > NOTIFICATION_TITLE_LIMIT
    ? `${combined.slice(0, NOTIFICATION_TITLE_LIMIT - 3)}...`
    : combined;
}

export function buildNotificationItems(
  threads: NotificationThread[],
  limit = 5,
): WidgetNotificationItem[] {
  return threads
    .filter(t => t.unread)
    .slice(0, limit)
    .map(t => {
      const repo = t.repository?.full_name ?? "Unknown";
      const title = t.subject?.title ?? "New activity";
      const type = t.subject?.type ?? "Notification";
      const url = t.subject?.url ?? "";
      return {
        repo_full_name: repo,
        title:
          title.length > NOTIFICATION_TITLE_LIMIT
            ? `${title.slice(0, NOTIFICATION_TITLE_LIMIT - 3)}...`
            : title,
        type,
        url,
      };
    });
}

export function buildNotificationTitles(
  threads: NotificationThread[],
  limit = 5,
): string[] {
  return threads
    .filter(t => t.unread)
    .slice(0, limit)
    .map(t => {
      const repo = t.repository?.full_name ?? "Unknown";
      const title = t.subject?.title ?? "New activity";
      const type = t.subject?.type ?? "Notification";
      return notificationDisplayText(repo, title, type);
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

async function writeUpdatedLabel(prefs: string, now: Date): Promise<void> {
  await writeWidgetString(prefs, "last_updated", now.toISOString());
  await writeWidgetString(
    prefs,
    "last_updated_label",
    formatWidgetTimestamp(now),
  );
}

export async function syncNotificationWidget(
  threads: NotificationThread[],
): Promise<void> {
  const unread = threads.filter(t => t.unread);
  const items = buildNotificationItems(threads);
  await writeWidgetInt(NOTIFICATION_PREFS, "unread_count", unread.length);
  await writeUpdatedLabel(NOTIFICATION_PREFS, new Date());
  await writeWidgetString(
    NOTIFICATION_PREFS,
    "top_items_json",
    truncateToBytes(JSON.stringify(items), MAX_PAYLOAD_BYTES),
  );
  await requestWidgetUpdate(NOTIFICATION_PROVIDER);
}

export async function syncReleasesWidget(releases: Release[]): Promise<void> {
  const payload = truncateToBytes(
    JSON.stringify(buildReleasesPayload(releases)),
    MAX_PAYLOAD_BYTES,
  );
  await writeWidgetString(RELEASES_PREFS, "items_json", payload);
  await writeUpdatedLabel(RELEASES_PREFS, new Date());
  await requestWidgetUpdate(RELEASES_PROVIDER);
}

export interface WidgetPrItem {
  id: number;
  repo_full_name: string;
  number: number;
  title: string;
  updated_at: string;
  draft: boolean;
  source: "assigned" | "review" | "unknown";
}

export function buildPrInboxPayload(prs: AssignedPr[]): WidgetPrItem[] {
  return prs.slice(0, MAX_WIDGET_ITEMS).map(pr => ({
    id: pr.id,
    repo_full_name: pr.repo_full_name,
    number: pr.number,
    title: pr.title.length > 90 ? `${pr.title.slice(0, 87)}...` : pr.title,
    updated_at: pr.updated_at,
    draft: pr.draft,
    source: pr.source,
  }));
}

export async function getPrInboxFilter(): Promise<{ kind: SerializedFilter }> {
  try {
    const stored = await getItem(PR_INBOX_FILTER_KEY);
    if (
      stored === "all" ||
      stored === "assigned" ||
      stored === "review" ||
      stored === "draft"
    ) {
      return { kind: stored };
    }
  } catch {
    // Fall through to default.
  }
  return { kind: "all" };
}

export async function setPrInboxFilter(filter: {
  kind: SerializedFilter;
}): Promise<void> {
  await setItem(PR_INBOX_FILTER_KEY, filter.kind);
  await writeWidgetString(PR_INBOX_PREFS, "filter", filter.kind);
}

export async function syncPrInboxWidget(
  prs: AssignedPr[],
  filter: { kind: SerializedFilter } = { kind: "all" },
): Promise<void> {
  const visible = filterPrInboxItems(prs, filter);
  const payload = truncateToBytes(
    JSON.stringify(buildPrInboxPayload(visible)),
    MAX_PAYLOAD_BYTES,
  );
  await writeWidgetString(PR_INBOX_PREFS, "items_json", payload);
  await writeWidgetString(PR_INBOX_PREFS, "filter", filter.kind);
  await writeUpdatedLabel(PR_INBOX_PREFS, new Date());
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
  await writeWidgetString(PR_INBOX_PREFS, "filter", "all");
  await requestWidgetUpdate(NOTIFICATION_PROVIDER);
  await requestWidgetUpdate(RELEASES_PROVIDER);
  await requestWidgetUpdate(PR_INBOX_PROVIDER);
}
