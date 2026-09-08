const { withAndroidManifest } = require("@expo/config-plugins");

const WIDGET_PROVIDER_PATH =
  "com/involvex/awesomegithubapp/widget/NotificationWidgetProvider";
const WIDGET_ACTION = "android.appwidget.action.APPWIDGET_UPDATE";

function addWidgetProviderToManifest(androidManifest) {
  const application = androidManifest.manifest.application;
  if (!application) return androidManifest;

  const existingReceiver = application.receiver?.find(
    r => r.$["android:name"] === WIDGET_PROVIDER_PATH,
  );
  if (existingReceiver) return androidManifest;

  const receiver = {
    $: {
      "android:name": WIDGET_PROVIDER_PATH,
      "android:exported": "false",
      "android:label": "Notification Widget",
    },
    "intent-filter": [
      {
        action: [
          {
            $: {
              "android:name": WIDGET_ACTION,
            },
          },
        ],
      },
    ],
    "meta-data": [
      {
        $: {
          "android:name": "android.appwidget.provider",
          "android:resource": "@xml/notification_widget_info",
        },
      },
    ],
  };

  application.receiver = application.receiver || [];
  application.receiver.push(receiver);

  return androidManifest;
}

module.exports = function withAndroidNotificationWidget(config) {
  return withAndroidManifest(config, config => {
    const androidManifest = config.modResults;
    return {
      ...config,
      modResults: addWidgetProviderToManifest(androidManifest),
    };
  });
};
