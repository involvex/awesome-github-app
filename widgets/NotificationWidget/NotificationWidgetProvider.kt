package com.involvex.awesomegithubapp.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray

// NOTE: The R import below is hardcoded to the app namespace defined in app.json.
// The Android namespace stays fixed even for the .debug applicationId variant,
// so this import intentionally does not change per variant.
import com.involvex.awesomegithubapp.R

class NotificationWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { appWidgetId ->
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // First widget instance created — no-op; data is pushed from the app.
    }

    override fun onDisabled(context: Context) {
        // Last widget instance removed — no-op.
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.notification_widget)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val unreadCount = prefs.getInt(KEY_UNREAD_COUNT, 0)
            val lastUpdated = prefs.getString(KEY_LAST_UPDATED, "") ?: ""
            val topItems = parseTitles(prefs.getString(KEY_TOP_ITEMS, "[]") ?: "[]")

            if (unreadCount > 0) {
                views.setViewVisibility(R.id.count_badge, View.VISIBLE)
                views.setTextViewText(R.id.count_badge, formatCount(unreadCount))
                views.setViewVisibility(R.id.count, View.GONE)
            } else {
                views.setViewVisibility(R.id.count_badge, View.GONE)
                views.setViewVisibility(R.id.count, View.VISIBLE)
                views.setTextViewText(R.id.count, "You're all caught up")
            }

            bindTopItems(views, topItems, unreadCount)
            views.setTextViewText(R.id.updated, formatUpdated(lastUpdated))

            // Tapping the widget opens the notifications tab. Requires login;
            // logged-out users land on the login screen via the root gate.
            val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse(DEEP_LINK)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pending = PendingIntent.getActivity(
                context,
                0,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pending)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun bindTopItems(views: RemoteViews, items: List<String>, unreadCount: Int) {
            val slots = intArrayOf(R.id.item_1, R.id.item_2, R.id.item_3)
            if (unreadCount <= 0 || items.isEmpty()) {
                views.setViewVisibility(R.id.items, View.GONE)
                return
            }
            views.setViewVisibility(R.id.items, View.VISIBLE)
            slots.forEachIndexed { index, viewId ->
                if (index < items.size) {
                    views.setViewVisibility(viewId, View.VISIBLE)
                    views.setTextViewText(viewId, items[index])
                } else {
                    views.setViewVisibility(viewId, View.GONE)
                }
            }
        }

        private fun parseTitles(raw: String): List<String> {
            return try {
                val arr = JSONArray(raw)
                List(arr.length()) { i -> arr.optString(i) }.filter { it.isNotBlank() }.take(3)
            } catch (_: Exception) {
                emptyList()
            }
        }

        private fun formatUpdated(iso: String): String {
            if (iso.isBlank()) return "Open app to refresh"
            // Keep it short for the widget: show date portion only, full
            // relative time is rendered in-app.
            return "Updated ${iso.take(10)}"
        }

        private fun formatCount(count: Int): String {
            return when {
                count >= 100 -> "99+"
                else -> count.toString()
            }
        }

        const val PREFS_NAME = "notification_widget_prefs"
        const val KEY_UNREAD_COUNT = "unread_count"
        const val KEY_LAST_UPDATED = "last_updated"
        const val KEY_TOP_ITEMS = "top_items_json"
        private const val DEEP_LINK = "awesomegithubapp://(tabs)/notifications"
    }
}
