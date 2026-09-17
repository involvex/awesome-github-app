const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const WIDGET_PACKAGE = "com.involvex.awesomegithubapp.widget";
const WIDGET_ACTION = "android.appwidget.action.APPWIDGET_UPDATE";

const RECEIVERS = [
  {
    className: `${WIDGET_PACKAGE}.NotificationWidgetProvider`,
    label: "Notifications Widget",
    metaResource: "@xml/notification_widget_info",
  },
  {
    className: `${WIDGET_PACKAGE}.ReleasesWidgetProvider`,
    label: "Recent Releases Widget",
    metaResource: "@xml/releases_widget_info",
  },
  {
    className: `${WIDGET_PACKAGE}.PrInboxWidgetProvider`,
    label: "Pull Requests Widget",
    metaResource: "@xml/pr_inbox_widget_info",
  },
];

const SERVICES = [
  {
    className: `${WIDGET_PACKAGE}.ReleasesWidgetService`,
    permission: "android.permission.BIND_REMOTEVIEWS",
  },
  {
    className: `${WIDGET_PACKAGE}.PrInboxWidgetService`,
    permission: "android.permission.BIND_REMOTEVIEWS",
  },
];

function ensureReceiver(manifest, { className, label, metaResource }) {
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  app.receiver = app.receiver || [];
  const exists = app.receiver.some(r => r.$?.["android:name"] === className);
  if (exists) return;
  app.receiver.push({
    $: {
      "android:name": className,
      "android:exported": "false",
      "android:label": label,
    },
    "intent-filter": [{ action: [{ $: { "android:name": WIDGET_ACTION } }] }],
    "meta-data": [
      {
        $: {
          "android:name": "android.appwidget.provider",
          "android:resource": metaResource,
        },
      },
    ],
  });
}

function ensureService(manifest, { className, permission }) {
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  app.service = app.service || [];
  const exists = app.service.some(s => s.$?.["android:name"] === className);
  if (exists) return;
  app.service.push({
    $: {
      "android:name": className,
      "android:exported": "false",
      "android:permission": permission,
    },
  });
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

/**
 * Copies widget sources from widgets/ into the prebuilt android/ project:
 * - widgets/shared/*.kt + widgets/<Name>/*.kt
 *   -> android/app/src/main/java/com/involvex/awesomegithubapp/widget/
 * - widgets/<Name>/{layout,xml,drawable,values}
 *   -> android/app/src/main/res/{layout,xml,drawable,values}
 * Also registers WidgetDataPackage in MainApplication.kt.
 */
function syncWidgetsIntoProject(projectRoot, platformRoot) {
  const widgetsRoot = path.join(projectRoot, "widgets");
  const resRoot = path.join(platformRoot, "app/src/main/res");
  const javaRoot = path.join(
    platformRoot,
    "app/src/main/java/com/involvex/awesomegithubapp/widget",
  );
  fs.mkdirSync(javaRoot, { recursive: true });

  // SharedPreferences bridge (plain RN NativeModule, no autolinking needed).
  for (const f of ["WidgetDataModule.kt", "WidgetDataPackage.kt"]) {
    const src = path.join(widgetsRoot, "shared", f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(javaRoot, f));
  }

  if (!fs.existsSync(widgetsRoot)) return;
  for (const entry of fs.readdirSync(widgetsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "shared") continue;
    const dir = path.join(widgetsRoot, entry.name);
    for (const child of fs.readdirSync(dir, { withFileTypes: true })) {
      const src = path.join(dir, child.name);
      if (child.isFile() && child.name.endsWith(".kt")) {
        fs.copyFileSync(src, path.join(javaRoot, child.name));
      } else if (child.isDirectory()) {
        copyDirRecursive(src, path.join(resRoot, child.name));
      }
    }
  }

  const mainApp = path.join(
    platformRoot,
    "app/src/main/java/com/involvex/awesomegithubapp/MainApplication.kt",
  );
  if (fs.existsSync(mainApp)) {
    let content = fs.readFileSync(mainApp, "utf8");
    if (!content.includes("WidgetDataPackage")) {
      content = content.replace(
        "import expo.modules.ExpoReactHostFactory",
        "import expo.modules.ExpoReactHostFactory\nimport com.involvex.awesomegithubapp.widget.WidgetDataPackage",
      );
      content = content.replace(
        "// add(MyReactNativePackage())",
        "// add(MyReactNativePackage())\n          add(WidgetDataPackage())",
      );
      fs.writeFileSync(mainApp, content);
    }
  }
}

module.exports = function withAndroidWidgets(config) {
  config = withAndroidManifest(config, config => {
    for (const r of RECEIVERS) ensureReceiver(config.modResults, r);
    for (const s of SERVICES) ensureService(config.modResults, s);
    return config;
  });

  return withDangerousMod(config, [
    "android",
    async config => {
      syncWidgetsIntoProject(
        config.modRequest.projectRoot,
        config.modRequest.platformProjectRoot,
      );
      return config;
    },
  ]);
};
