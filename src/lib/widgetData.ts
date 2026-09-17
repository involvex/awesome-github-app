import { NOTIFICATION_PREFS, syncNotificationWidget } from "./widgets/sync";
import { writeWidgetInt, writeWidgetString } from "./widgets/widgetBridge";
import type { NotificationThread } from "./api/hooks/useNotifications";
import { getItem, setItem } from "./storage";

export interface NotificationWidgetData {
  unreadCount: number;
  lastUpdated: string;
}

const WIDGET_DATA_KEY = "widget_data";

/**
 * @deprecated Prefer syncNotificationWidget() from ./widgets/sync, which
 * writes to SharedPreferences readable by the Android widget process.
 * This fallback persists to SecureStore so in-app reads keep working
 * (Expo Go, web, iOS) where the native bridge is unavailable.
 */
export async function getNotificationWidgetData(): Promise<NotificationWidgetData> {
  const stored = await getItem(WIDGET_DATA_KEY);
  if (!stored) return { unreadCount: 0, lastUpdated: new Date().toISOString() };
  try {
    return JSON.parse(stored) as NotificationWidgetData;
  } catch {
    return { unreadCount: 0, lastUpdated: new Date().toISOString() };
  }
}

/**
 * Writes the unread count to SharedPreferences (when the native bridge
 * exists) and mirrors it to SecureStore for in-app reads.
 */
export async function setNotificationWidgetData(
  data: NotificationWidgetData,
): Promise<void> {
  await setItem(WIDGET_DATA_KEY, JSON.stringify(data));
  await writeWidgetInt(NOTIFICATION_PREFS, "unread_count", data.unreadCount);
  await writeWidgetString(NOTIFICATION_PREFS, "last_updated", data.lastUpdated);
}

/** Full sync including the top unread titles shown on the widget. */
export async function syncNotificationsToWidget(
  threads: NotificationThread[],
): Promise<void> {
  const unreadCount = threads.filter(t => t.unread).length;
  await setItem(
    WIDGET_DATA_KEY,
    JSON.stringify({ unreadCount, lastUpdated: new Date().toISOString() }),
  );
  await syncNotificationWidget(threads);
}
