package com.involvex.awesomegithubapp.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

// NOTE: The R import below is hardcoded to the app package name defined in app.json.
// If the android.package value changes, this import must be updated to match.
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
        // Widget instance created
    }

    override fun onDisabled(context: Context) {
        // Last widget instance removed
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

            if (unreadCount > 0) {
                views.setViewVisibility(R.id.count_badge, android.view.View.VISIBLE)
                views.setTextViewText(R.id.count_badge, formatCount(unreadCount))
                views.setViewVisibility(R.id.count, android.view.View.GONE)
            } else {
                views.setViewVisibility(R.id.count_badge, android.view.View.GONE)
                views.setViewVisibility(R.id.count, android.view.View.VISIBLE)
                views.setTextViewText(R.id.count, "No notifications")
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
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
    }
}
