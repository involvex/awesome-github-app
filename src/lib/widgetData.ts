import { getItem, setItem } from "./storage";

export interface NotificationWidgetData {
  unreadCount: number;
  lastUpdated: string;
}

const WIDGET_DATA_KEY = "widget_data";

export async function getNotificationWidgetData(): Promise<NotificationWidgetData> {
  const stored = await getItem(WIDGET_DATA_KEY);
  if (!stored) return { unreadCount: 0, lastUpdated: new Date().toISOString() };
  try {
    return JSON.parse(stored) as NotificationWidgetData;
  } catch {
    return { unreadCount: 0, lastUpdated: new Date().toISOString() };
  }
}

export async function setNotificationWidgetData(
  data: NotificationWidgetData,
): Promise<void> {
  await setItem(WIDGET_DATA_KEY, JSON.stringify(data));
}
