# awesome-github-app

A modern, feature-rich GitHub mobile client — a beautiful alternative to the official GitHub app. Built with Expo 57, React 19, and Uniwind.

[![Expo](https://img.shields.io/badge/Expo-57-blue)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-blue)](https://reactnative.dev)
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

- **Detail view** — About (description, topics, stats), Actions, Branches tabs
- **Issues & PRs** — coming soon
- **Settings** — rename, description, website, topics/keywords (chip UI with autocomplete), visibility toggle (public ↔ private), archive
- **GitHub Pages** — live status, source branch, custom domain, HTTPS toggle
- **Actions / Workflows** — per-workflow run history, trigger manual dispatch, cancel runs, auto-refresh every 30s

### 👤 Profile

- Contribution heat-map (GitHub GraphQL `contributionCalendar`)
- Stats: repos · followers · following
- Bio, company, location, blog
- **Starred Repositories** — browse starred repos with infinite scroll
- **Favorites** — save trending languages/topics for quick access

### 📌 Favorites & History

- Favorite trending languages and topics
- Search history for repeat queries

### ⚙️ Settings

- Theme: Light · Dark · System
- Sign out

---

## Tech Stack

| Layer          | Library                                           |
| -------------- | ------------------------------------------------- |
| Framework      | Expo 57 (CNG) · Expo Router                       |
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

## Testing

- `bun run test` — run Jest (jest-expo preset) in watch mode.
- `bun run test:ci` — run the suite with coverage in CI-friendly mode.
- Tests use `__tests__/test-utils/render.tsx` for provider-wrapped renders and `jest.setup.js` for Expo/React Native mocks.

### 2. Create GitHub OAuth Apps

Two separate GitHub OAuth Apps are required — one for native (Android/iOS) and one for web.

#### Native app (Android & iOS)

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Authorization callback URL** to: `awesomegithubapp://oauth/callback`
3. Copy the **Client ID** and **Client Secret**

#### Web app

1. Create a second OAuth App
2. Set **Authorization callback URL** to: `http://localhost:8081/oauth/callback`
3. Copy the **Client ID** and **Client Secret**

### 2.1. Configure OAuth Credentials

Set a `.env` file at the project root (loaded via `app.config.js`):

```bash
GITHUB_CLIENT_ID=<native-client-id>
GITHUB_CLIENT_ID_WEB=<web-client-id>
```

> The client secrets are **never** stored in the app. They live only in the Cloudflare Worker. Never commit `.env`.

### 2.2. Set Up the Cloudflare Worker

All token exchanges (both native and web) go through the Cloudflare Worker, which holds the client secrets server-side.

1. **Navigate to the worker directory:**

   ```bash
   cd workers/oauth-token-exchange
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

3. **Add credentials to `.env`:**

   ```bash
   GITHUB_CLIENT_ID=<native-client-id>
   GITHUB_CLIENT_SECRET=<native-client-secret>
   GITHUB_CLIENT_ID_WEB=<web-client-id>
   GITHUB_CLIENT_SECRET_WEB=<web-client-secret>
   ```

4. **Deploy the worker:**

   ```bash
   bun install
   bun run deploy
   ```

5. **The worker will be deployed at:** `https://awesomegithubapp-api.involvex.workers.dev`

**For production,** use Cloudflare secrets instead of `.env`:

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID_WEB
wrangler secret put GITHUB_CLIENT_SECRET_WEB
bun run deploy:prod
```

### 3. Run

```bash
bun run android        # Build + run on Android device/emulator
bun run ios            # Build + run on iOS simulator
bun run web            # Web preview in browser
bun run start          # Expo dev server (requires a dev client build)
```

> Native OAuth requires a **development build** (`bun run android` / `bun run ios`). Expo Go is not supported.

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
│   ├── user/[login].tsx  # Public user profile
│   └── settings/         # App settings screens
├── components/
│   ├── ui/               # Avatar, Badge, Skeleton, ChipFilter, LanguageDot,
│   │                     # StatBar, Section, SettingsRow, EmptyState, + primitives
│   ├── explore/          # TrendingCard and explore-specific components
│   └── layout/           # Shared layout components
├── contexts/             # AuthContext, ThemeContext, ToastContext
└── lib/
    ├── api/              # Octokit, GraphQL client, TanStack QueryClient
    │   └── hooks/        # useActivity, useTrending, useRepo, useNotifications,
    │                     # useSearch, useMyRepos, useWorkflows, useContributions
    ├── hooks/            # usePreferences, shared UI hooks
    └── theme.ts          # Light/dark theme tokens
```

---

## Roadmap

See [`suggestions.md`](./suggestions.md) for the full feature backlog. Current priorities:

- Issues & PRs list screens
- Unit tests for API hooks
- Skeleton loaders across all list screens
- Optimistic updates + haptic feedback
- Notification, PR inbox, and releases home screen widgets (Android)

### Home screen widgets (Android)

Three resizable widgets (Notifications, Pull requests, Recent releases).
They refresh about every 30 minutes via background fetch and on every app
open; the PR widget filter (All / Assigned / Review requested / Drafts) lives
in Profile → Settings → Home widgets. Widgets never hold your GitHub token —
the app snapshots token-free JSON to SharedPreferences, and sign-out clears
it. After changing `widgets/` or `plugins/`, run `bun run native:sync`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
