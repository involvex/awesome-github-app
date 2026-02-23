# GEMINI.md

This file provides context and instructions for AI agents working in this repository.

## Project Overview

**awesome-github-app** is a modern, feature-rich GitHub client built with **Expo 55 (CNG)**, **React Native 0.83 (React 19)**, and **Uniwind** (Tailwind CSS for React Native). It supports Android, iOS, and Web.

- **Primary Stack**: Expo 55, Expo Router, TypeScript 5.9, React 19, React Native 0.83.
- **UI & Styling**: Uniwind (Tailwind CSS), React Native Reanimated 4, Ionicons (`expo-vector-icons`), `expo-image`.
- **API & Data**: Octokit (REST & GraphQL), TanStack Query v5 (React Query).
- **Auth**: `expo-auth-session` + `expo-web-browser` with a **Cloudflare Worker** for secure server-side token exchange.
- **Package Manager**: `bun`.

## Architecture & Conventions

### 📂 Directory Structure

- `src/app/` — **Expo Router (File-based Routing)**.
  - `(auth)/` — Unauthenticated screens (Login, OAuth callback).
  - `(tabs)/` — Main app navigation (Feed, Explore, Notifications, Repos, Profile).
  - `repo/[owner]/[repo]/` — Repository detail and management (Settings, Pages, Workflows).
  - `user/[login].tsx` — Public user profile.
- `src/components/ui/` — Reusable UI primitives (Button, Card, Input, Avatar, etc.). **Always import from `../components/ui` (barrel export)**.
- `src/contexts/` — Global state: `AuthContext`, `ThemeContext`, `ToastContext`.
- `src/lib/api/` — API clients and hooks.
  - `hooks/` — All data-fetching hooks (e.g., `useActivity`, `useTrending`, `useRepo`).
- `workers/` — **Cloudflare Worker** source code (`oauth-token-exchange`).
- `__tests__/` — Comprehensive test suite (Unit, Integration, E2E).

### 🎨 Styling (Two Coexisting Approaches)

1.  **Uniwind (`className`)**: Use Tailwind classes for layout and colors.
    - Custom colors map to CSS variables in `src/global.css`: `bg-background`, `bg-card`, `text-primary`, `text-secondary`, etc.
    - Dark mode support via `dark:` prefix.
2.  **`StyleSheet` + `useAppTheme()`**: Still widely used in core components (e.g., `Button.tsx`, `HomeScreen.tsx`).
    - `useAppTheme()` from `src/lib/theme.ts` returns a JS object with GitHub-palette color tokens.
    - Prefer `StyleSheet` for complex layouts and `useAppTheme()` for dynamic colors not easily covered by Uniwind.

### 🔄 Data Fetching

- **Octokit**: Use `getOctokit()` / `getGraphQL()` inside hooks from `src/lib/api/github.ts` and `src/lib/api/graphql.ts`.
- **Hooks**: **Never pass API clients as props**. Use the pre-built hooks in `src/lib/api/hooks/`.
- **Query Configuration**: `staleTime: 5 min`, `retry: 2`, `refetchOnWindowFocus: false`.
- **Infinite Lists**: Use `useInfiniteQuery` with page-based pagination (starting at page 1).

### 🔐 Authentication

- OAuth flow redirects to `awesomegithubapp://oauth/callback` (native) or `http://localhost:8081/oauth/callback` (web).
- **Token Exchange**: Native and web clients MUST use the Cloudflare Worker to exchange the code for a token (secrets are stored server-side).
- **Worker API**: The worker in `workers/oauth-token-exchange/` exposes `POST /token` which proxies requests to GitHub:
  - Required params: `code`, `code_verifier`, `redirect_uri`.
  - Deployment: `bun run deploy` (dev) or `bun run deploy:prod` (production with secrets).
- **Storage**: The `github_access_token` is stored in `expo-secure-store`.

### 🧪 Testing

- **Runner**: Jest (`jest-expo` preset).
- **Utilities**: `renderWithProviders` from `__tests__/test-utils/render.tsx` to wrap components in necessary providers.
- **Mocks**: Global mocks are in `jest.setup.js`.
- **Note**: `CLAUDE.md` incorrectly states no test suite exists; it is fully present in `__tests__/`.

### 🏗️ Build & CI (CNG)

- **Continuous Native Generation (CNG)**: `android/` and `ios/` folders are generated via `expo prebuild` and should NOT be committed.
- **Prebuild Script**: The project runs `format && lint:fix && typecheck` automatically before building native folders.

## Key Commands

```sh
# Development
bun run start          # Start Expo dev server
bun run android        # Prebuild → run on Android emulator/device
bun run ios            # Prebuild → run on iOS simulator
bun run web            # Web preview
bun run go             # Start Expo server with --go -c (clean cache)

# Maintenance
bun run prebuild       # format + lint:fix + typecheck
bun run native:sync    # Regenerate native folders (android/ios) from app.json
bun run typecheck      # TypeScript validation
bun run lint           # ESLint check
bun run format         # Prettier formatting (auto-sorts imports)
bun run doctor         # Expo environment health check

# Testing
bun run test           # Run Jest in watch mode
bun run test:ci        # Run tests with coverage (for CI)

# Build & Versioning
bun run build          # Export for production (expo export)
bun run version:patch  # Bump patch version in app.json
```

## Engineering Standards

- **Imports**: Auto-sorted on format. Do not manually order them.
- **UI Primitives**: Do not re-invent common components; use/extend the ones in `src/components/ui/`.
- **Images**: Use `expo-image` for all images to leverage caching and performance.
- **Icons**: Use `Ionicons` from `expo-vector-icons`.
- **Native Sync**: If you add native dependencies or change `app.json`, run `bun run native:sync`.
