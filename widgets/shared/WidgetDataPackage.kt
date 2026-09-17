package com.involvex.awesomegithubapp.widget

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Manual ReactPackage for [WidgetDataModule].
 * Registered into MainApplication by the withAndroidNotificationWidget
 * config plugin (withDangerousMod). See plugins/withAndroidNotificationWidget.
 */
class WidgetDataPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(WidgetDataModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
