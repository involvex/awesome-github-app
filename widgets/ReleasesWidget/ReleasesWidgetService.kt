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
 * Serves release rows to the collection widget. Reads the token-free
 * JSON snapshot written by src/lib/widgets/sync.ts.
 */
class ReleasesWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory =
        ReleasesFactory(applicationContext, intent)
}

private class ReleasesFactory(
    private val context: Context,
    intent: Intent
) : RemoteViewsService.RemoteViewsFactory {

    private val appWidgetId: Int = intent.getIntExtra(
        AppWidgetManager.EXTRA_APPWIDGET_ID,
        AppWidgetManager.INVALID_APPWIDGET_ID
    )
    private var items: List<ReleaseRow> = emptyList()

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
        return RemoteViews(context.packageName, R.layout.releases_row).apply {
            setTextViewText(R.id.repo, item.repoFullName)
            setTextViewText(R.id.tag, item.tagName)
            setTextViewText(R.id.date, item.publishedAt.take(10))
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
        RemoteViews(context.packageName, R.layout.releases_row).apply {
            setTextViewText(R.id.repo, "Loading…")
            setTextViewText(R.id.tag, "")
            setTextViewText(R.id.date, "")
        }

    private fun loadItems(): List<ReleaseRow> {
        return try {
            val prefs = context.getSharedPreferences(
                ReleasesWidgetProvider.PREFS_NAME,
                Context.MODE_PRIVATE
            )
            val raw = prefs.getString(ReleasesWidgetProvider.KEY_ITEMS, "[]") ?: "[]"
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val o = arr.getJSONObject(i)
                ReleaseRow(
                    id = o.optInt("id", i),
                    repoFullName = o.optString("repo_full_name", "unknown"),
                    tagName = o.optString("tag_name", ""),
                    publishedAt = o.optString("published_at", "")
                )
            }.take(10)
        } catch (_: Exception) {
            emptyList()
        }
    }

    private data class ReleaseRow(
        val id: Int,
        val repoFullName: String,
        val tagName: String,
        val publishedAt: String
    )
}
