# awesome-github-app — Implementation Plan

## Overview

Build a feature-rich, modern GitHub mobile client as a superior alternative to the official GitHub app. The app targets an audience of active developers who want fast navigation, a beautiful feed, powerful exploration with lots of filters, and full repo management from their phone.

**Tech stack already in place:**

- Expo 55 (preview) · React 19.2 · React Native 0.83.2
- Expo Router (file-based routing) · react-native-screens
- Uniwind (Tailwind CSS for RN) + `global.css` theme vars already wired
- react-native-reanimated 4 + react-native-worklets 0.7 (animation engines)
- react-native-gesture-handler 2.30
- expo-vector-icons 10 · expo-font
- Contexts: AuthContext (mock OAuth), ThemeContext, ToastContext
- UI primitives: Button, Card, Input, ThemedText, ThemedView, Toast

**New packages to add:**

| Package                                      | Purpose                                              |
| -------------------------------------------- | ---------------------------------------------------- |
| `@tanstack/react-query`                      | Server state, caching, infinite queries              |
| `expo-secure-store`                          | Secure token storage (replace AsyncStorage for auth) |
| `expo-web-browser`                           | In-app OAuth browser                                 |
| `expo-image`                                 | Optimized avatar/cover images                        |
| `@octokit/rest`                              | GitHub REST API typed client                         |
| `@octokit/graphql`                           | GitHub GraphQL API (contribution graph, etc.)        |
| `react-native-mmkv` (or `expo-secure-store`) | Fast key-value store                                 |
| `date-fns`                                   | Relative timestamps ("2 hours ago")                  |

**App Icon / Assets tooling:**

- ImageMagick is available in PATH — use it to generate all required Expo icon sizes from a single source file
- `magick icon-source.png -resize 1024x1024 assets/icon.png`
- `magick icon-source.png -resize 1024x1024 assets/adaptive-icon.png`
- `magick icon-source.png -resize 32x32 assets/favicon.png`

---

## Navigation Architecture

```
Root Stack (_layout.tsx)
├── (auth)/           — unauthenticated screens
│   ├── login.tsx     — GitHub OAuth sign-in landing
│   └── callback.tsx  — OAuth callback handler
└── (tabs)/           — authenticated bottom tabs
    ├── feed/         — Activity Feed (home)
    ├── explore/      — Search & Trending
    ├── notifications/— Notification centre
    ├── repos/        — My Repositories
    └── profile/      — My Profile + Settings
```

Modal/Push screens (pushed from any tab):

- `repo/[owner]/[repo]/index.tsx` — Repo detail
- `repo/[owner]/[repo]/settings.tsx` — Repo settings (rename, topics, visibility)
- `repo/[owner]/[repo]/pages.tsx` — GitHub Pages settings
- `repo/[owner]/[repo]/workflows.tsx` — Actions workflow list
- `repo/[owner]/[repo]/workflow/[id].tsx` — Single workflow runs
- `user/[login].tsx` — Public user profile
- `search.tsx` — Global search modal

---

## Phase 1 — Foundation

### 1.1 Real GitHub OAuth

- Replace mock `signIn` in `AuthContext.tsx` with real OAuth using `expo-auth-session` + `expo-web-browser`
- Scopes: `read:user user:email repo notifications workflow`
- Store token in `expo-secure-store` (not AsyncStorage)
- Save user profile (login, avatar_url, name, bio, public_repos, followers, following)

### 1.2 API Client (`src/lib/api/`)

- `github.ts` — `@octokit/rest` singleton initialized with stored token
- `graphql.ts` — `@octokit/graphql` client for contribution graph
- `queryClient.ts` — TanStack Query client with defaults (stale 5 min, retry 2)
- `hooks/` — per-feature query hooks (useActivity, useTrending, useRepo, etc.)

### 1.3 Navigation restructure

- Replace simple `<Tabs>` in `_layout.tsx` with authenticated/unauthenticated routing guards
- Bottom tabs with expo-vector-icons icons + badge on notifications
- Stack navigator inside each tab for nested push screens

### 1.4 Design system extension (`src/components/ui/`)

- `Avatar.tsx` — circular image with fallback initials (uses `expo-image`)
- `Badge.tsx` — count badge (notifications, open issues count)
- `Skeleton.tsx` — animated loading placeholder (reanimated)
- `ChipFilter.tsx` — horizontal scrollable filter chip row
- `LanguageDot.tsx` — colored language indicator dot
- `StatBar.tsx` — stars/forks/watchers row
- `Section.tsx` — labeled section container
- `EmptyState.tsx` — illustration + CTA for empty lists
- `BottomSheet.tsx` — gesture-driven bottom sheet (reanimated + worklets)

---

## Phase 2 — Feed Tab

**Goal:** Show a rich, real-time activity feed — better than the official app.

### Screens

- `(tabs)/feed/index.tsx` — main feed

### Features

- **Activity events** via `GET /users/{user}/received_events/public`
  - Render cards per event type: PushEvent, WatchEvent, ForkEvent, PullRequestEvent, IssueCommentEvent, CreateEvent, ReleaseEvent, PublicEvent
  - Repo name + owner avatar + time ago
  - Commit messages preview for PushEvent
  - PR/Issue title for those events
- **Stories-style following activity bar** — horizontal scroll of avatars of who was active recently
- **Infinite scroll** with TanStack Query `useInfiniteQuery`
- **Pull-to-refresh** (`RefreshControl`)
- **Pinned repos** section at top (from user's pinned repos via GraphQL)
- **Trending today** horizontal card row at top (language=all, period=daily)
- Smooth entry animations via `reanimated` + `worklets` shared values

---

## Phase 3 — Explore Tab

**Goal:** Powerful discovery with lots of filters — the killer feature.

### Screens

- `(tabs)/explore/index.tsx` — hub with search bar + sections
- `(tabs)/explore/trending.tsx` — trending repos full list
- `(tabs)/explore/developers.tsx` — trending developers
- `(tabs)/explore/topics.tsx` — topic browser

### Features

#### Search

- Global search bar (always visible at top)
- Debounced instant search across: Repositories · Users · Code · Issues · PRs
- Recent searches persisted locally (MMKV)
- Search suggestions as you type

#### Trending Repositories

- Source: **GitHub Search API** — `GET /search/repositories` with dynamic `q` construction:
  - **Today:** `q=stars:>10+created:>YYYY-MM-DD` (date = today)
  - **This Week:** `q=stars:>50+pushed:>YYYY-MM-DD` (date = 7 days ago)
  - **This Month:** `q=stars:>100+pushed:>YYYY-MM-DD` (date = 30 days ago)
  - Language filter appended as `+language:typescript` etc.
  - Sort via `sort=stars&order=desc`
- Results cached by TanStack Query (stale 15 min for trending)
- **Filter chips (horizontal scroll):**
  - **Period:** Today · This Week · This Month
  - **Language:** All · JavaScript · TypeScript · Python · Go · Rust · Swift · Kotlin · C++ · Java (+ "More…" expanding list of 50+)
  - **Sort:** Stars · Forks · Recently pushed
- Trending card shows: rank, repo name+owner, description, language dot, ⭐ total stars, fork count
- Animated shimmer skeleton while loading
- Swipe-to-star gesture on trending card (reanimated + worklets)

#### Trending Developers

- Avatar + name + username + popular repo of the day
- Filter by language

#### Topics Browser

- Curated topic tiles with icons (uses GitHub Topics API)
- Category filter: Frontend · Backend · ML · DevOps · Mobile · Security …

---

## Phase 4 — Repository Management

### Repo List Screen (`(tabs)/repos/index.tsx`)

- My repos list + search
- Filter: All · Owner · Forked · Archived · Starred · Watched
- Sort: Recently updated · Stars · Name · Size
- Quick-action swipe: ⭐ Star/Unstar, 👁️ Watch/Unwatch

### Repo Detail (`repo/[owner]/[repo]/index.tsx`)

- Header: avatar, name, description, stars/forks/watchers, language, license
- Tab bar inside: **Code · Issues · PRs · Actions · Branches · Releases**
- **Code tab:** README rendered (markdown parser), file tree browser, branch selector
- **Issues tab:** open/closed toggle, labels filter, assignee filter, infinite list
- **PRs tab:** same filters as issues, merge status chips
- **Actions tab:** workflow runs list with status icon (✅❌⏳), triggered by, duration
- **Branches tab:** default + all branches, compare button
- **Releases tab:** tag, assets download count, body preview

### Repo Settings (`repo/[owner]/[repo]/settings.tsx`)

- **General:**
  - Rename (PATCH `/repos/{owner}/{repo}`)
  - Description edit
  - Website URL
  - Topics/keywords (add/remove chips with autocomplete via `GET /repos/{owner}/{repo}/topics`)
  - Visibility toggle (public ↔ private) with confirmation modal
  - Archive/Unarchive
  - Delete repo (with "type repo name to confirm" gate)
- **Features toggles:** Issues · Projects · Wiki · Discussions
- **Merge options:** Merge commit · Squash · Rebase; auto-delete head branch

### GitHub Pages (`repo/[owner]/[repo]/pages.tsx`)

- Current Pages status (enabled/disabled, URL)
- Source branch + folder selector
- Custom domain input
- HTTPS enforcement toggle
- Build status indicator

### Workflows Viewer (`repo/[owner]/[repo]/workflows.tsx`)

- List all workflow YAML files
- Each workflow → run history list with commit SHA, actor, status, duration
- Trigger manual dispatch (`POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches`)
- Cancel run button
- Re-run failed jobs button
- View live log lines (polling or SSE)

---

## Phase 5 — Notifications Tab

### Screen (`(tabs)/notifications/index.tsx`)

- All, Participating, Assigned, Mentioned segments
- Grouped by repo
- Unread indicator dot
- Mark as read (single / all / by repo)
- Swipe left: mark read; swipe right: unsubscribe
- Deep-link tap → push to correct repo/issue/PR screen

---

## Phase 6 — Profile Tab

### My Profile (`(tabs)/profile/index.tsx`)

- Avatar, name, bio, location, company, blog, followers/following/repos
- **Contribution graph** (GitHub GraphQL `contributionCalendar`) — heat-map grid
- Pinned repos
- Recent activity summary

### Public User Profile (`user/[login].tsx`)

- Same layout, follow/unfollow button
- Repos tab, Stars tab, Followers/Following lists

### App Settings (nested in profile)

- Theme switcher (Light / Dark / System)
- Default repo sort / feed density
- Notifications preferences
- Clear cache
- Logout

---

## Phase 7 — UI Polish & Animations

- **Entry animations:** list items stagger in with `FadeInDown` (reanimated) sequenced via `worklets`
- **Shared Element Transitions:** repo card → repo detail (expo-router shared element)
- **Haptic feedback** on swipe actions + star/unstar
- **Optimistic updates** on star/watch via TanStack Query `onMutate`
- **Pull-to-refresh elastic spring** (worklets custom animation)
- **Skeleton loaders** everywhere — no spinner-only loading states
- **Global error boundary** + retry buttons
- **Empty states** with branded illustrations

---

## File Structure (target)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── callback.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← bottom tabs definition
│   │   ├── feed/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── explore/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── trending.tsx
│   │   │   ├── developers.tsx
│   │   │   └── topics.tsx
│   │   ├── notifications/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── repos/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   └── profile/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── settings.tsx
│   ├── repo/
│   │   └── [owner]/
│   │       └── [repo]/
│   │           ├── index.tsx
│   │           ├── settings.tsx
│   │           ├── pages.tsx
│   │           ├── workflows.tsx
│   │           └── workflow/[id].tsx
│   ├── user/
│   │   └── [login].tsx
│   ├── search.tsx
│   └── _layout.tsx              ← root stack (auth guard)
├── components/
│   ├── ui/                      ← existing primitives + new ones
│   ├── feed/                    ← FeedCard, EventCard, StoryBar
│   ├── explore/                 ← TrendingCard, FilterChips, TopicTile
│   ├── repo/                    ← RepoHeader, FileTree, IssueRow, WorkflowRow
│   └── profile/                 ← ContributionGraph, PinnedRepo
├── lib/
│   ├── api/
│   │   ├── github.ts            ← Octokit singleton
│   │   ├── graphql.ts           ← GraphQL client
│   │   ├── queryClient.ts       ← TanStack Query client
│   │   └── hooks/               ← per-feature hooks
│   ├── storage.ts               ← SecureStore + MMKV helpers
│   └── theme.ts                 ← extended (keep existing)
└── contexts/
    ├── AuthContext.tsx           ← rewrite with real OAuth
    ├── ThemeContext.tsx          ← keep as-is
    └── ToastContext.tsx          ← keep as-is
```

---

## Todos (tracked in SQL)

| ID               | Phase | Title                                                   |
| ---------------- | ----- | ------------------------------------------------------- |
| deps-install     | 1     | Install new packages                                    |
| auth-oauth       | 1     | Real GitHub OAuth flow                                  |
| api-client       | 1     | Octokit + QueryClient setup                             |
| nav-restructure  | 1     | Navigation restructure + auth guard                     |
| ds-components    | 1     | Design system new components                            |
| feed-screen      | 2     | Feed tab — activity + trending                          |
| explore-screen   | 3     | Explore hub + search                                    |
| explore-trending | 3     | Trending repos with filters                             |
| explore-devs     | 3     | Trending developers                                     |
| explore-topics   | 3     | Topics browser                                          |
| repos-list       | 4     | Repo list screen                                        |
| repo-detail      | 4     | Repo detail (Code/Issues/PRs/Actions/Branches/Releases) |
| repo-settings    | 4     | Repo settings (rename, topics, visibility, pages)       |
| repo-workflows   | 4     | Workflows/Actions viewer                                |
| notifications    | 5     | Notifications tab                                       |
| profile          | 6     | Profile + contribution graph                            |
| settings-screen  | 6     | App settings screen                                     |
| animations       | 7     | Polish: animations, haptics, skeletons                  |
