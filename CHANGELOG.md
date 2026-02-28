## [0.0.7](https://github.com/involvex/awesome-github-app/compare/v0.0.6...v0.0.7) (2026-02-28)

## [0.0.6](https://github.com/involvex/awesome-github-app/compare/v0.0.3...v0.0.6) (2026-02-28)

### Bug Fixes

- remove sensitive data from OAuth logs and update build trigger ([ec69370](https://github.com/involvex/awesome-github-app/commit/ec69370e95ce23c7a95def0574f1d86d32040b88))
- **ui:** cast Markdown image styles to ImageStyle to resolve TS incompatibility ([13d228f](https://github.com/involvex/awesome-github-app/commit/13d228f7b12917dd937adad8feb7e54797a0ab76))
- **ui:** resolve React 19 key spread error and improve Markdown README layout ([3d5dc47](https://github.com/involvex/awesome-github-app/commit/3d5dc47924c5660237efdd6ca61168cc92ba6543))
- **ui:** resolve React 19 key spread error and improve Markdown README layout ([5748df7](https://github.com/involvex/awesome-github-app/commit/5748df795b2b0c17983e8f5b7fb8c6ae78686215))
- **ui:** use correct types for Markdown styles to resolve ESLint any warning ([065dd95](https://github.com/involvex/awesome-github-app/commit/065dd953bbfc59ece0d7622584be38dbd4493c59))
- **ui:** use proper types in Markdown image rule to resolve ESLint warnings ([5509e7b](https://github.com/involvex/awesome-github-app/commit/5509e7b145332bc4afd4635f1806f0c2479b9607))

## [0.0.3](https://github.com/involvex/awesome-github-app/compare/v0.0.2...v0.0.3) (2026-02-23)

### Features

- **feed:** replace chip filters with modal-based filter selection ([670ab60](https://github.com/involvex/awesome-github-app/commit/670ab603be86e9c4b30ec861faeb3023fa8e26bf))
- **ios:** add ITSAppUsesNonExemptEncryption to iOS infoPlist for App Store compliance ([3d99863](https://github.com/involvex/awesome-github-app/commit/3d998631fc4120b6300b77e9ac8eb2c3273272d5))
- release v0.0.3 with modal-based feed filters and iOS App Store compliance ([fbdc994](https://github.com/involvex/awesome-github-app/commit/fbdc99432b82ba3bffed67224df6105492aa905b))

## [0.0.2](https://github.com/involvex/awesome-github-app/compare/b2fedb7ae362f4368cdde7d8c920355d8f4a10ec...v0.0.2) (2026-02-23)

### Bug Fixes

- normalize line endings in test utility files ([46784b3](https://github.com/involvex/awesome-github-app/commit/46784b3c80b875318e507ef2a11828c33fac1099))
- remove unused vars to pass ESLint ([371bba7](https://github.com/involvex/awesome-github-app/commit/371bba75e4f95aeac7e4f0e25f2193b7b6885caa))
- rename API route for Expo Router compatibility ([e921945](https://github.com/involvex/awesome-github-app/commit/e9219457486bf32f4eef4b14c7f9c305b75a123d))

### Features

- add Alert UI component with design tokens ([f02bd59](https://github.com/involvex/awesome-github-app/commit/f02bd59d895390b3357e541d36c5736637455e16))
- add date format settings and improve explore screens ([2456590](https://github.com/involvex/awesome-github-app/commit/24565900e977a42849e7213f2392af72341dc4cf))
- add Expo Go OAuth support with separate client ID configuration ([3674531](https://github.com/involvex/awesome-github-app/commit/3674531bb77b93ae5f220db6796ec732db5abf57))
- add expo-version-bump and improve header navigation ([40b8370](https://github.com/involvex/awesome-github-app/commit/40b83709345dbac89ade984c2e97f895d0477446))
- add favorites functionality to explore screen ([a42aec2](https://github.com/involvex/awesome-github-app/commit/a42aec292165da46420a1429e98ca0054736a377))
- add GitHub OAuth client secret support and auth redirection ([ab4e2e3](https://github.com/involvex/awesome-github-app/commit/ab4e2e36a877d0c9432154fd123d90f7982b841e))
- add GitHub URL to app.json and repository to package.json ([8b06059](https://github.com/involvex/awesome-github-app/commit/8b060599bccff0848cbc953adb6a052a47cb0540))
- add iOS configuration and versionCode to app.json ([25f9e61](https://github.com/involvex/awesome-github-app/commit/25f9e619971fe1d6a52552b44cdc06156cd4b6a2))
- add OAuth callback route and redirect to feed after login ([6756dff](https://github.com/involvex/awesome-github-app/commit/6756dff6ba9937f0a3153b3c357d2aff28b04b3e))
- add OAuth config and improve type safety in explore screens ([0e8ae38](https://github.com/involvex/awesome-github-app/commit/0e8ae38559c0b353c2a37a4577f84b337378172e))
- add useActivity hook, Plan.md, and update gitignore ([b4acdc6](https://github.com/involvex/awesome-github-app/commit/b4acdc65da1a0e6dde7c17f0c28cea6727b167fb))
- add web OAuth credentials to app.json ([82179f7](https://github.com/involvex/awesome-github-app/commit/82179f7715786b71554aa73f0b8655d42d12d101))
- **app.json:** enable new architecture for Android build ([26004b2](https://github.com/involvex/awesome-github-app/commit/26004b25231bb68fc40759e1e4425ede34351b41))
- **auth:** enhance GitHub OAuth flow with improved token exchange ([17edcce](https://github.com/involvex/awesome-github-app/commit/17edcce91d6b6ccdf82c1c93ad9de0822bc027db))
- **auth:** enhance OAuth authentication with PKCE and Expo Go validation ([7071b97](https://github.com/involvex/awesome-github-app/commit/7071b975a45ae1eb2ae4d9649192623a5e178dfe))
- **ChipFilter:** adjust spacing and sizing for more compact layout ([fe66925](https://github.com/involvex/awesome-github-app/commit/fe669252e7f8aca030e4127cc67411930f85b35f))
- configure expoGo client ID and add prebuild scripts ([54f84f8](https://github.com/involvex/awesome-github-app/commit/54f84f8dd7d1e7aa5e5e48772b0debc8f73677dd))
- enhance home screen UI and replace SecureStore with custom storage ([0437282](https://github.com/involvex/awesome-github-app/commit/0437282d5a150a390a6a87762534136d80654107))
- integrate Expo splash screen and add adaptive Android app icons ([b2fedb7](https://github.com/involvex/awesome-github-app/commit/b2fedb7ae362f4368cdde7d8c920355d8f4a10ec))
- **oauth:** add Cloudflare Worker for secure web OAuth token exchange ([3b87a9e](https://github.com/involvex/awesome-github-app/commit/3b87a9e5c0426c25c381524d7e364d55b3e66e93))
- **oauth:** add configurable web token exchange URL for web OAuth flow ([f0c155f](https://github.com/involvex/awesome-github-app/commit/f0c155f3b12076066c719f6b9568d8f23facc4d4))
- **oauth:** redirect users based on auth status after OAuth callback ([b4d187d](https://github.com/involvex/awesome-github-app/commit/b4d187d69cf4df02d1afec5ec1ff14c426118fd5))
- separate native and web OAuth client IDs ([014b29f](https://github.com/involvex/awesome-github-app/commit/014b29f70ce893da42b5aa6dc4a39e7384ca82ad))
