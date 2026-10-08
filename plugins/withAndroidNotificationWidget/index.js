const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const WIDGET_PACKAGE = "com.involvex.awesomegithubapp.widget";
const WIDGET_ACTION = "android.appwidget.action.APPWIDGET_UPDATE";
const FIXED_NAMESPACE = "com.involvex.awesomegithubapp";

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

const SHARED_DRAWABLES = new Set([
  "widget_background.xml",
  "ic_github_mark_white.xml",
  "badge_background.xml",
]);

function copyDirRecursive(src, dest, widgetPrefix) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    let d = path.join(dest, entry.name);
    if (entry.isFile() && SHARED_DRAWABLES.has(entry.name)) {
      d = path.join(dest, widgetPrefix + "_" + entry.name);
    }
    if (entry.isDirectory()) copyDirRecursive(s, d, widgetPrefix);
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
function syncWidgetsIntoProject(projectRoot, platformRoot, packageName) {
  const widgetsRoot = path.join(projectRoot, "widgets");
  const resRoot = path.join(platformRoot, "app/src/main/res");
  // Widget Kotlin sources always go under the fixed namespace directory,
  // not the per-variant package directory.
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
    const widgetPrefix = entry.name
      .replace(/Widget$/, "")
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
    for (const child of fs.readdirSync(dir, { withFileTypes: true })) {
      const src = path.join(dir, child.name);
      if (child.isFile() && child.name.endsWith(".kt")) {
        fs.copyFileSync(src, path.join(javaRoot, child.name));
      } else if (child.isDirectory()) {
        copyDirRecursive(src, path.join(resRoot, child.name), widgetPrefix);
      }
    }
  }

  // Find MainApplication.kt at the correct package path (per-variant).
  // When APP_VARIANT=debug, android.package becomes com.involvex.awesomegithubapp.debug
  // and the file is at .../com/involvex/awesomegithubapp/debug/MainApplication.kt.
  const mainApp = path.join(
    platformRoot,
    "app/src/main/java",
    ...(packageName ?? FIXED_NAMESPACE).split("."),
    "MainApplication.kt",
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

  // Patch Expo-generated sources for the split namespace/package layout.
  // With a fixed namespace (com.involvex.awesomegithubapp) and a per-variant
  // package (com.involvex.awesomegithubapp.debug), the generated R and
  // BuildConfig live in the namespace package while MainActivity and
  // MainApplication live in the variant package — so they need explicit
  // imports. Without these, CI fails with "Unresolved reference 'R'" and
  // "Unresolved reference 'BuildConfig'".
  patchGeneratedSources(platformRoot, packageName ?? FIXED_NAMESPACE);
}

/**
 * Inserts a missing `import <fqcn>` after the last existing import line.
 * Idempotent — no-op when the import is already present.
 */
function ensureImport(content, fqcn) {
  if (content.includes(`import ${fqcn}`)) return content;
  const importLine = `import ${fqcn}`;
  const lines = content.split("\n");
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s+\S+/.test(lines[i].trim())) lastImportIdx = i;
  }
  if (lastImportIdx === -1) return content;
  lines.splice(lastImportIdx + 1, 0, importLine);
  return lines.join("\n");
}

function patchGeneratedSources(platformRoot, packageName) {
  // Only needed when the variant package differs from the fixed namespace.
  if (packageName === FIXED_NAMESPACE) return;
  const javaDir = path.join(
    platformRoot,
    "app/src/main/java",
    ...packageName.split("."),
  );
  const patches = [
    {
      file: path.join(javaDir, "MainActivity.kt"),
      imports: [`${FIXED_NAMESPACE}.R`, `${FIXED_NAMESPACE}.BuildConfig`],
    },
    {
      file: path.join(javaDir, "MainApplication.kt"),
      imports: [`${FIXED_NAMESPACE}.BuildConfig`],
    },
  ];
  for (const { file, imports } of patches) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, "utf8");
    const before = content;
    for (const fqcn of imports) content = ensureImport(content, fqcn);
    if (content !== before) fs.writeFileSync(file, content);
  }
}

/**
 * Fixes the namespace in build.gradle.
 *
 * Expo's withPackageGradle (setPackageInBuildGradle) replaces BOTH
 * `namespace` and `applicationId` with config.android.package. For the
 * debug variant, package becomes com.involvex.awesomegithubapp.debug,
 * which puts the R class in com.involvex.awesomegithubapp.debug.R.
 * The widget Kotlin files hardcode `import com.involvex.awesomegithubapp.R`,
 * so the namespace must stay fixed at com.involvex.awesomegithubapp
 * regardless of variant.
 *
 * This mod uses withAppBuildGradle (same mod phase as setPackageInBuildGradle)
 * but runs AFTER it because it's a plugin mod, while setPackageInBuildGradle
 * is a base mod.
 */
function withFixedNamespace(config) {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = config.modResults.contents.replace(
        /namespace\s+'[^']+'/,
        `namespace '${FIXED_NAMESPACE}'`,
      );
    }
    return config;
  });
}

module.exports = function withAndroidWidgets(config) {
  config = withAndroidManifest(config, config => {
    for (const r of RECEIVERS) ensureReceiver(config.modResults, r);
    for (const s of SERVICES) ensureService(config.modResults, s);
    return config;
  });

  // Apply the namespace fix using withAppBuildGradle so it runs AFTER
  // setPackageInBuildGradle (which is a base mod that runs first).
  config = withFixedNamespace(config);

  return withDangerousMod(config, [
    "android",
    async config => {
      syncWidgetsIntoProject(
        config.modRequest.projectRoot,
        config.modRequest.platformProjectRoot,
        config.android?.package ?? FIXED_NAMESPACE,
      );
      return config;
    },
  ]);
};
