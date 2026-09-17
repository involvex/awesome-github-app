package com.involvex.awesomegithubapp.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

import com.involvex.awesomegithubapp.MainActivity
import com.involvex.awesomegithubapp.R

/**
 * Scrollable list of open PRs assigned to (or awaiting review from) the
 * user. Data is snapshotted to SharedPreferences by the authenticated app
 * (see src/lib/widgets/sync.ts); the widget never holds the GitHub token
 * and requires login.
 */
class PrInboxWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { appWidgetId ->
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.pr_inbox_widget)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val lastUpdated = prefs.getString(KEY_LAST_UPDATED, "") ?: ""
            views.setTextViewText(
                R.id.updated,
                if (lastUpdated.isBlank()) "Open app to refresh" else "Updated ${lastUpdated.take(10)}"
            )

            // Collection adapter — unique URI per widget id so instances don't share cursors.
            val serviceIntent = Intent(context, PrInboxWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
            }
            views.setRemoteAdapter(R.id.list, serviceIntent)
            views.setEmptyView(R.id.list, R.id.empty)

            // Header opens the app (login-gated via the root redirect).
            val headerIntent = Intent(Intent.ACTION_VIEW, Uri.parse(APP_DEEP_LINK)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            views.setOnClickPendingIntent(
                R.id.header,
                PendingIntent.getActivity(
                    context,
                    3,
                    headerIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            )

            // Row taps are filled in by the factory with per-PR repo links.
            // Must be explicit: Android 14+ rejects MUTABLE PendingIntents
            // with implicit intents. The factory merges the deep-link URI in.
            val rowTemplate = Intent(context, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            views.setPendingIntentTemplate(
                R.id.list,
                PendingIntent.getActivity(
                    context,
                    4,
                    rowTemplate,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                )
            )

            appWidgetManager.updateAppWidget(appWidgetId, views)
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.list)
        }

        const val PREFS_NAME = "pr_inbox_widget_prefs"
        const val KEY_ITEMS = "items_json"
        const val KEY_LAST_UPDATED = "last_updated"
        private const val APP_DEEP_LINK = "awesomegithubapp://"
    }
}
