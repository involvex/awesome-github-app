// @ts-check
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

dotenv.config();

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    oauth: {
      githubClientId:
        process.env.GITHUB_CLIENT_ID ?? appJson.expo.extra.oauth.githubClientId,
      // Web-only OAuth app — separate GitHub OAuth App with localhost callback
      webGithubClientId: dotenv.config().parsed?.GITHUB_CLIENT_ID_WEB ?? "",
      webGithubClientSecret:
        dotenv.config().parsed?.GITHUB_CLIENT_SECRET_WEB ?? "",
    },
  },
};
