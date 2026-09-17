package com.involvex.awesomegithubapp.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Plain React Native bridge for home-screen widgets.
 *
 * Widgets run in the launcher process and can only read plain
 * SharedPreferences — never SecureStore / EncryptedSharedPreferences
 * (which holds the GitHub token). The JS side fetches data while
 * authenticated, then snapshots a small token-free JSON payload here.
 *
 * Source template lives in widgets/shared/ and is copied into the
 * prebuilt android/ project by plugins/withAndroidNotificationWidget.
 */
class WidgetDataModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun setWidgetData(prefsName: String, key: String, value: String, promise: Promise) {
        try {
            val prefs =
                reactApplicationContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.edit().putString(key, value).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_WRITE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun setWidgetInt(prefsName: String, key: String, value: Int, promise: Promise) {
        try {
            val prefs =
                reactApplicationContext.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.edit().putInt(key, value).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_WRITE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun requestWidgetUpdate(providerClassName: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val provider = Class.forName(providerClassName)
            val component = ComponentName(context, provider)
            val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(component)
            if (ids.isNotEmpty()) {
                val intent = Intent(context, provider).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                }
                context.sendBroadcast(intent)
            }
            promise.resolve(ids.size)
        } catch (e: Exception) {
            promise.reject("WIDGET_UPDATE_FAILED", e.message, e)
        }
    }

    companion object {
        const val NAME = "WidgetData"
    }
}
