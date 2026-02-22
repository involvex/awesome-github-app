// @ts-check
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

dotenv.config();

/** @param {import("expo/config").ConfigContext} param0 */
module.exports = ({ config }) => {
  const oauthConfig = config.extra?.oauth ?? {};

  return {
    ...config,
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
