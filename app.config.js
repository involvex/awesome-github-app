// @ts-check
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

/** @param {import("expo/config").ConfigContext} param0 */
module.exports = ({ config }) => {
  const isDebug = process.env.APP_VARIANT === "debug";
  const oauthConfig = config.extra?.oauth ?? {};

  return {
    ...config,
    plugins: [...(config.plugins ?? []), "expo-background-task"],
    name: isDebug ? "Awesome GH (Debug)" : config.name,
    android: {
      ...config.android,
      // namespace must stay fixed so the R class is always in
      // com.involvex.awesomegithubapp — the widget Kotlin providers
      // hardcode this import. Only applicationId (package) changes per variant.
      namespace: "com.involvex.awesomegithubapp",
      package: isDebug
        ? "com.involvex.awesomegithubapp.debug"
        : config.android?.package,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: isDebug
        ? "com.involvex.awesomegithubapp.debug"
        : config.ios?.bundleIdentifier,
    },
    extra: {
      ...config.extra,
      oauth: {
        ...oauthConfig,
        githubClientId:
          process.env.GITHUB_CLIENT_ID_NATIVE ??
          process.env.GITHUB_CLIENT_ID ??
          oauthConfig.githubClientId ??
          "",
        // Web-only OAuth app — separate GitHub OAuth App with localhost callback
        webGithubClientId:
          process.env.GITHUB_CLIENT_ID_WEB ??
          oauthConfig.webGithubClientId ??
          "",
        webTokenExchangeUrl:
          process.env.GITHUB_WEB_TOKEN_EXCHANGE_URL ??
          oauthConfig.webTokenExchangeUrl ??
          "https://awesomegithubapp-api.involvex.workers.dev/token",
      },
    },
  };
};
