# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern GitHub mobile client built with **Expo 55 (CNG)**, **React Native 0.83**, **Expo Router**, and **Uniwind** (Tailwind CSS for React Native). Uses **bun** as the package manager.

Tech Stack: Expo 55, React Native 0.83, TypeScript 5.9, Expo Router, Uniwind, TanStack Query v5, @octokit/rest, @octokit/graphql, expo-auth-session, expo-secure-store, react-native-reanimated 4.

## Commands

```sh
bun run start          # Start Expo dev server
bun run android        # Prebuild (format, lint:fix, typecheck) → run on Android
bun run ios            # Run on iOS simulator
bun run web            # Web preview
bun run native:sync    # Regenerate android/ and ios/ from app.json
bun run build          # Export for production (expo export)
bun run typecheck      # tsc --noEmit
bun run lint           # ESLint check
bun run lint:fix       # ESLint with auto-fix
bun run format         # Prettier (auto-sorts imports)
bun run doctor         # Run expo-doctor health checks
```

**No test suite exists in this project.**

The `prebuild` script runs `format && lint:fix && typecheck` — these run automatically before `bun run android`.

## Architecture

### Routing (Expo Router / file-based)

All routes live under `src/app/`. The entry point is `expo-router/entry` (set in `package.json`).

- `(auth)/` — Unauthenticated screens (login, OAuth callback)
- `(tabs)/` — 5-tab main app: feed, explore, notifications, repos, profile
- `repo/[owner]/[repo]/` — Repo detail, settings, pages, workflows
- `user/[login].tsx` — Public user profile

Auth gating is done in `src/app/_layout.tsx`: if `isAuthenticated`, render `(tabs)`; otherwise render `(auth)`.

### Provider Stack

`src/app/_layout.tsx` wraps the app in this order (outermost first):

```
QueryClientProvider → ThemeProvider → ToastProvider → AuthProvider
```

### Data Layer

- **REST API**: `getOctokit()` from `src/lib/api/github.ts` returns a lazily-cached `@octokit/rest` instance authenticated from `expo-secure-store`.
- **GraphQL API**: `getGraphQL()` from `src/lib/api/graphql.ts` returns a `@octokit/graphql` instance with the same token.
- **All data-fetching hooks** are in `src/lib/api/hooks/` and barrel-exported from `src/lib/api/hooks/index.ts`. Hooks call `getOctokit()` / `getGraphQL()` internally — **never pass the client as a prop**.
- TanStack Query v5 is configured with `staleTime: 5 min`, `retry: 2`, `refetchOnWindowFocus: false`.
- Infinite scroll lists use `useInfiniteQuery` with page-based pagination (`pageParam` starting at 1, 30 items per page).

Available hooks: `useActivity`, `useTrending`, `useRepo`, `useRepoTopics`, `useUpdateRepo`, `useUpdateTopics`, `useNotifications`, `useMarkNotificationRead`, `useMarkAllRead`, `useSearch`, `useMyRepos`, `useWorkflows`, `useWorkflowRuns`, `useDispatchWorkflow`, `useCancelRun`, `useContributions`.

### Auth

OAuth flow uses `expo-auth-session` + `expo-web-browser`. Two GitHub OAuth Apps are used:

| Platform             | Client ID env var      | Redirect URI                           |
| -------------------- | ---------------------- | -------------------------------------- |
| Native (Android/iOS) | `GITHUB_CLIENT_ID`     | `awesomegithubapp://oauth/callback`    |
| Web                  | `GITHUB_CLIENT_ID_WEB` | `http://localhost:8081/oauth/callback` |

**All** token exchanges go through the Cloudflare Worker (`workers/oauth-token-exchange`), which holds the client secrets. The app never has direct access to `client_secret`.

After the OAuth redirect, `src/app/oauth/callback.tsx` handles the deep link. It is registered in the root Stack in `_layout.tsx` so Expo Router can navigate to it regardless of auth state.

The GitHub access token is stored in `expo-secure-store` under the key `github_access_token`. `resetOctokit()` must be called after token changes (handled by `setToken` / `clearToken`).

Client IDs are configured in `app.json` under `extra.oauth.githubClientId` (native) and `extra.oauth.webGithubClientId` (web), populated from env vars by `app.config.js`.

## Key Conventions

### Styling with Uniwind

This project uses **Uniwind** (Tailwind CSS for React Native). Apply styles via the `className` prop on any React Native element:

```tsx
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-bold text-primary">Hello</Text>
</View>
```

Dark mode uses the `dark:` prefix. `ThemeProvider` adds/removes the `dark` class on the root element for web; on native Uniwind handles it automatically.

Custom CSS utility classes are defined in `src/global.css` and map to CSS variables:

- `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-accent`
- `text-primary`, `text-secondary`, `text-accent`

### Two Theming Approaches (both coexist)

1. **Uniwind `className`** — Preferred for component layout and colors using the custom CSS variables above.
2. **`useAppTheme()`** from `src/lib/theme.ts` — Returns a JS object of GitHub-palette color tokens. Used where `className` isn't applicable (e.g., tab bar `backgroundColor`, animated style values).

### UI Components

Reusable primitives live in `src/components/ui/` and are barrel-exported from `src/components/ui/index.ts`. **Always import from `../components/ui` (not individual files).**

Key components: `ThemedView`, `ThemedText`, `Button`, `Card`, `Input`, `Avatar`, `Badge`, `Skeleton`, `SkeletonCard`, `ChipFilter`, `LanguageDot`, `EmptyState`, `Section`, `SettingsRow`.

### Icons & Images

- **Icons**: Always use `Ionicons` from `expo-vector-icons`.
- **Images**: Use `expo-image` (`import { Image } from "expo-image"`), not React Native's built-in `Image`.

### Code Style

Prettier config enforces: **double quotes**, trailing commas, 2-space indent, 80-char print width, `singleAttributePerLine: true` for JSX. Imports are auto-sorted by `prettier-plugin-sort-imports` on every `format` run — **don't manually order imports**.

### CNG (Continuous Native Generation)

`android/` and `ios/` are git-ignored and generated by `expo prebuild`. To regenerate after changing `app.json` or native dependencies, run `bun run native:sync`.

### ESLint Configuration

The ESLint config allows `any` types for GitHub API responses (the API types are extensive and not worth maintaining locally).
