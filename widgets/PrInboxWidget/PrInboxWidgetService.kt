package com.involvex.awesomegithubapp.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import org.json.JSONArray

import com.involvex.awesomegithubapp.R

/**
 * Serves PR rows to the inbox widget. Reads the token-free
 * JSON snapshot written by src/lib/widgets/sync.ts.
 */
class PrInboxWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory =
        PrInboxFactory(applicationContext, intent)
}

private class PrInboxFactory(
    private val context: Context,
    intent: Intent
) : RemoteViewsService.RemoteViewsFactory {

    private val appWidgetId: Int = intent.getIntExtra(
        AppWidgetManager.EXTRA_APPWIDGET_ID,
        AppWidgetManager.INVALID_APPWIDGET_ID
    )
    private var items: List<PrRow> = emptyList()

    override fun onCreate() = Unit

    override fun onDataSetChanged() {
        items = loadItems()
    }

    override fun onDestroy() {
        items = emptyList()
    }

    override fun getCount(): Int = items.size

    override fun getViewAt(position: Int): RemoteViews {
        if (position < 0 || position >= items.size) {
            return loadingView()
        }
        val item = items[position]
        return RemoteViews(context.packageName, R.layout.pr_inbox_row).apply {
            setTextViewText(R.id.repo, item.repoFullName)
            val prefix = if (item.draft) "Draft · " else ""
            setTextViewText(R.id.title, "$prefix#${item.number} ${item.title}")
            setTextViewText(R.id.date, item.updatedAt.take(10))
            // Per-row deep link into the repo page (login-gated in-app).
            val fillIn = Intent().apply {
                data = Uri.parse("awesomegithubapp://repo/${item.repoFullName}")
            }
            setOnClickFillInIntent(R.id.row, fillIn)
        }
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 1

    override fun getItemId(position: Int): Long =
        items.getOrNull(position)?.id?.toLong() ?: position.toLong()

    override fun hasStableIds(): Boolean = true

    private fun loadingView(): RemoteViews =
        RemoteViews(context.packageName, R.layout.pr_inbox_row).apply {
            setTextViewText(R.id.repo, "Loading…")
            setTextViewText(R.id.title, "")
            setTextViewText(R.id.date, "")
        }

    private fun loadItems(): List<PrRow> {
        return try {
            val prefs = context.getSharedPreferences(
                PrInboxWidgetProvider.PREFS_NAME,
                Context.MODE_PRIVATE
            )
            val raw = prefs.getString(PrInboxWidgetProvider.KEY_ITEMS, "[]") ?: "[]"
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val o = arr.getJSONObject(i)
                PrRow(
                    id = o.optInt("id", i),
                    repoFullName = o.optString("repo_full_name", "unknown"),
                    number = o.optInt("number", 0),
                    title = o.optString("title", ""),
                    updatedAt = o.optString("updated_at", ""),
                    draft = o.optBoolean("draft", false),
                    source = o.optString("source", "unknown")
                )
            }.take(10)
        } catch (_: Exception) {
            emptyList()
        }
    }

    private data class PrRow(
        val id: Int,
        val repoFullName: String,
        val number: Int,
        val title: String,
        val updatedAt: String,
        val draft: Boolean,
        val source: String
    )
}
