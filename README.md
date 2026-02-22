# awesome-github-app

A modern, feature-rich GitHub mobile client — a beautiful alternative to the official GitHub app. Built with Expo 55, React 19, and Uniwind.

[![Expo](https://img.shields.io/badge/Expo-55-blue)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-blue)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://typescriptlang.org)

---

## Features

### 🏠 Feed

- GitHub activity feed (Push, Watch, Fork, PR, Issue, Release events)
- Infinite scroll with pull-to-refresh
- Per-event-type cards with icons and relative timestamps

### 🔭 Explore

- **Global search** — repos, users, issues/PRs with debounced instant results
- **Trending Repositories** (powered by GitHub Search API):
  - Filter by period: Today · This Week · This Month
  - Filter by language: 25+ languages
  - Sort by stars, forks, recently pushed
- **Trending Developers** — filter by language
- **Topics Browser** — 8 category groups, 40+ curated topics

### 🔔 Notifications

- Segments: All · Participating · Assigned · Mentioned
- Grouped by type, mark individual or all as read
- Unread badge count

### 📁 Repositories

- List your repos with filter (Owner / All / Public / Private / Forks)
- Search, infinite scroll, last-updated timestamps
- Per-repo cards with language dot, stars, forks

### 📋 Repo Management

- **Detail view** — About (description, topics, stats), Issues, PRs, Actions, Branches tabs
- **Settings** — rename, description, website, topics/keywords (chip UI with autocomplete), visibility toggle (public ↔ private), archive
- **GitHub Pages** — live status, source branch, custom domain, HTTPS toggle
- **Actions / Workflows** — per-workflow run history, trigger manual dispatch, cancel runs, auto-refresh every 30s

### 👤 Profile

- Contribution heat-map (GitHub GraphQL `contributionCalendar`)
- Stats: repos · followers · following
- Bio, company, location, blog

### ⚙️ Settings

- Theme: Light · Dark · System
- Sign out

---

## Tech Stack

| Layer          | Library                                           |
| -------------- | ------------------------------------------------- |
| Framework      | Expo 55 (CNG) · Expo Router                       |
| UI / Styling   | React Native + Uniwind (Tailwind CSS)             |
| Icons          | expo-vector-icons (Ionicons)                      |
| Images         | expo-image                                        |
| GitHub API     | @octokit/rest + @octokit/graphql                  |
| Server state   | TanStack Query v5                                 |
| Auth           | expo-auth-session + expo-web-browser              |
| Secure storage | expo-secure-store                                 |
| Animations     | react-native-reanimated 4 + react-native-worklets |
| Dates          | date-fns                                          |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/involvex/awesome-github-app
cd awesome-github-app
bun install
```

### 2. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to: `http://localhost:8081` (for local web development)
3. Set **Authorization callback URL** to all three (one per line):
   ```
   https://auth.expo.io/@involvex/awesome-github-app
   awesomegithubapp://oauth/callback
   http://localhost:8081/oauth/callback
   ```
4. Copy your **Client ID** and **Client Secret**
5. Create a **second** OAuth App for web-only deployment (or use the same app with localhost URL)

### 2.1. Configure OAuth Credentials

For development, update `app.json` with your GitHub OAuth credentials:

```json
"extra": {
  "oauth": {
    "githubClientId": "YOUR_NATIVE_CLIENT_ID",
    "webGithubClientId": "YOUR_WEB_CLIENT_ID",
    "webGithubClientSecret": "YOUR_WEB_CLIENT_SECRET"
  }
}
```

**Important:** Never commit `webGithubClientSecret` to a public repository. Use environment variables in production.

### 3. Run

```bash
bun run start          # Expo dev server (scan with Expo Go)
bun run android        # Build + run on Android device/emulator
bun run ios            # Build + run on iOS simulator
bun run web            # Web preview
```

---

## Scripts

| Script                | Description                             |
| --------------------- | --------------------------------------- |
| `bun run start`       | Start Expo dev server                   |
| `bun run android`     | Prebuild → run Android                  |
| `bun run ios`         | Prebuild → run iOS                      |
| `bun run web`         | Web preview                             |
| `bun run native:sync` | Regenerate native folders from app.json |
| `bun run build`       | Export for production                   |
| `bun run doctor`      | Run expo-doctor health checks           |
| `bun run typecheck`   | TypeScript check                        |
| `bun run lint`        | ESLint                                  |
| `bun run format`      | Prettier                                |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login + OAuth callback
│   ├── (tabs)/           # Bottom tabs: feed, explore, notifications, repos, profile
│   ├── repo/[owner]/[repo]/  # Repo detail, settings, pages, workflows
│   └── user/[login].tsx  # Public user profile
├── components/
│   └── ui/               # Avatar, Badge, Skeleton, ChipFilter, LanguageDot,
│                         # StatBar, Section, SettingsRow, EmptyState, + primitives
├── contexts/             # AuthContext, ThemeContext, ToastContext
└── lib/
    ├── api/              # Octokit, GraphQL client, TanStack QueryClient
    │   └── hooks/        # useActivity, useTrending, useRepo, useNotifications,
    │                     # useSearch, useMyRepos, useWorkflows, useContributions
    └── theme.ts          # Light/dark theme tokens
```

---

## Notes

- This project uses **CNG** (Continuous Native Generation) — `android/` and `ios/` folders are generated by `expo prebuild` and are not committed to git.
- App icon source file: `assets/icon.png`. Use `magick icon-source.png -resize 1024x1024 assets/icon.png` to regenerate icons with ImageMagick.
- Sponsor: [github.com/sponsors/involvex](https://github.com/sponsors/involvex)
