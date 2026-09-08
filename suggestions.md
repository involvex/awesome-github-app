# Feature Suggestions — awesome-github-app

## Overview

This report identifies high-impact improvements, missing features, and optimizations for the **awesome-github-app** GitHub mobile client. Suggestions are grouped by priority and include specific implementation notes where applicable. Items marked **[DONE]** have been implemented in recent commits.

---

## High Priority Suggestions

| ID       | Category | Description                                                                                        | Impact | Effort | Confidence | Status  |
| -------- | -------- | -------------------------------------------------------------------------------------------------- | ------ | ------ | ---------- | ------- |
| FEAT-001 | Feature  | Implement Issues and PR tabs in repo detail (currently "Coming Soon" placeholders)                 | High   | High   | 95%        | Open    |
| FEAT-002 | Testing  | Add unit tests for API hooks (`useActivity`, `useNotifications`, `useTrending`, etc.)              | High   | Medium | 95%        | Open    |
| FEAT-003 | Feature  | Implement Issues list screen with labels, assignees, and state filters                             | High   | High   | 90%        | Open    |
| FEAT-004 | Feature  | Implement PR list with merge status, review state, and actionable merge buttons                    | High   | High   | 90%        | Open    |
| FEAT-005 | UX       | Add skeleton loaders to all list screens (repos, notifications, profile) for consistent loading UX | High   | Low    | 95%        | Partial |
| FEAT-006 | Testing  | Add integration tests for auth flow, navigation, and data fetching                                 | High   | Medium | 90%        | Open    |
| FEAT-007 | Feature  | Add Releases tab to repo detail with release notes, asset downloads, and tag browser               | High   | Medium | 90%        | Open    |
| FEAT-008 | UX       | Implement optimistic updates for star/watch/unstar actions with rollback on error                  | High   | Medium | 85%        | Open    |

### FEAT-001 — Issues & PR Tabs in Repo Detail

**Current state:** `src/app/repo/[owner]/[repo]/index.tsx` renders `ComingSoonTab` placeholders for Issues and PRs.
**Suggested improvement:** Replace placeholders with full list screens. Use `useInfiniteQuery` for pagination, support state filters (open/closed/all), labels, and assignees. Deep-link from notifications to specific issues/PRs.
**Impact:** Core GitHub workflow — reading and managing issues/PRs is essential for a GitHub client.

### FEAT-002 — Hook Unit Tests

**Current state:** Only 3 unit tests exist (`Button.test.tsx`, `Input.test.tsx`, `Markdown.test.tsx`), 1 hook test (`useRepo.test.tsx`), and 2 integration tests.
**Suggested improvement:** Add unit tests for all 12+ API hooks in `src/lib/api/hooks/`. Mock Octokit responses and verify query keys, pagination, and error states.
**Impact:** Prevents regressions in data fetching, the most critical layer of the app.

### FEAT-003 — Issues List Screen

**Current state:** No issues list exists; only a placeholder tab.
**Suggested improvement:** Build an `IssuesScreen` with infinite scroll, state filter chips (open/closed/all), label filter, assignee filter, and pull-to-refresh. Support creating new issues (mutation).
**Impact:** Essential for developers who triage bugs and feature requests on mobile.

### FEAT-004 — PR List Screen

**Current state:** No PR list exists; only a placeholder tab.
**Suggested improvement:** Build a `PullRequestsScreen` with state filters (open/closed/merged), review status chips, mergeability indicator, and action buttons (merge/close) for repo owners.
**Impact:** PR review and merging is a primary GitHub workflow.

### FEAT-005 — Skeleton Loaders Everywhere

**Current state:** **[DONE]** Skeleton components wired into repos and notifications. Profile and starred repos still use `ActivityIndicator`.
**Suggested improvement:** Replace remaining spinners in profile contribution graph and starred repos menu.
**Impact:** Perceived performance and visual polish — spinners feel slow; skeletons feel fast.

### FEAT-006 — Integration Tests

**Current state:** Only `HomeScreen.test.tsx` and `LayoutAuth.test.tsx` exist as integration tests.
**Suggested improvement:** Add integration tests for: OAuth callback handling, tab navigation, repo detail navigation, search flow, and notification marking as read. Use `renderWithProviders` from `__tests__/test-utils/`.
**Impact:** Catches navigation and state management regressions that unit tests miss.

### FEAT-007 — Releases Tab in Repo Detail

**Current state:** Releases are only available in the Feed tab ("My Releases"). No dedicated releases tab in repo detail.
**Suggested improvement:** Add a "Releases" tab to the repo detail screen showing release list with tag, date, body preview, and asset downloads. Use `useReleases` hook with owner/repo params.
**Impact:** Developers frequently check release notes and download assets from mobile.

### FEAT-008 — Optimistic Updates

**Current state:** Star/watch/unstar actions don't exist in the UI at all. When mutations are added, they will show loading states with no immediate feedback.
**Suggested improvement:** Implement TanStack Query `onMutate` optimistic updates for star, watch, fork, and notification-read actions. Rollback on error with a toast notification.
**Impact:** Makes the app feel instant — critical for mobile UX where network latency is noticeable.

---

## Medium Priority Suggestions

| ID       | Category | Description                                                                       | Impact | Effort | Confidence | Status |
| -------- | -------- | --------------------------------------------------------------------------------- | ------ | ------ | ---------- | ------ |
| FEAT-009 | Feature  | Add search history with recent searches persisted locally                         | Medium | Low    | 95%        | DONE   |
| FEAT-010 | Feature  | Implement deep-linking from notifications to issues/PRs                           | Medium | Medium | 90%        | Open   |
| FEAT-011 | Feature  | Add star/unstar and watch/unwatch quick actions on repo cards                     | Medium | Medium | 85%        | Open   |
| FEAT-012 | UX       | Add haptic feedback on interactive elements (buttons, toggles, list item presses) | Medium | Low    | 90%        | DONE   |
| FEAT-013 | Feature  | Add "Contributors" and "Stargazers" tabs to repo detail                           | Medium | Medium | 85%        | Open   |
| FEAT-014 | Feature  | Add file content viewer for non-markdown files in Code tab                        | Medium | Medium | 80%        | Open   |
| FEAT-015 | UX       | Implement pull-to-refresh on notifications, profile, and repos screens            | Medium | Low    | 90%        | DONE   |
| FEAT-016 | Feature  | Add search suggestions/autocomplete as user types in explore search               | Medium | Medium | 85%        | Open   |
| FEAT-017 | Feature  | Add repo insights tab (traffic, commits, dependents)                              | Medium | High   | 75%        | Open   |
| FEAT-018 | Feature  | Add organization profile support (org repos, org members)                         | Medium | Medium | 85%        | Open   |
| FEAT-019 | UX       | Add empty state illustrations and branded empty screens across all lists          | Medium | Low    | 90%        | DONE   |
| FEAT-020 | Feature  | Add "Open in GitHub" / "Copy link" actions on repo, issue, and PR screens         | Medium | Low    | 95%        | DONE   |

### FEAT-009 — Search History

**Current state:** **[DONE]** Recent searches are persisted in AsyncStorage and displayed in the explore home screen with individual remove and bulk clear functionality.
**Impact:** Power users run the same searches repeatedly; history reduces friction.

### FEAT-010 — Notification Deep-Linking

**Current state:** Tapping a notification only marks it as read; it doesn't navigate to the underlying issue/PR/discussion.
**Suggested improvement:** Parse `notification.subject.url` and `notification.subject.latest_comment_url` to construct deep links to `/repo/{owner}/{repo}/issues/{number}` or `/repo/{owner}/{repo}/pull/{number}`.
**Impact:** The current notification flow is incomplete — users must manually find the referenced item.

### FEAT-011 — Star/Watch Quick Actions

**Current state:** The repos list (`src/app/(tabs)/repos/index.tsx`) is read-only; no quick actions exist.
**Suggested improvement:** Add swipe actions or overflow menus on repo cards for Star/Unstar and Watch/Unwatch. Use `useMutation` with optimistic updates.
**Impact:** Core GitHub interactions that mobile users expect.

### FEAT-012 — Haptic Feedback

**Current state:** **[DONE]** `expo-haptics` added with a shared `haptic()` helper. Applied to feed tabs, filter toggles, event cards, explore repo rows, notification rows, and mark-read buttons.
**Impact:** Tactile feedback dramatically improves mobile app feel and perceived responsiveness.

### FEAT-013 — Contributors & Stargazers Tabs

**Current state:** Only pinned repos are shown on the profile; no contributor or stargazer lists exist.
**Suggested improvement:** Add "Contributors" and "Stargazers" tabs to repo detail using `GET /repos/{owner}/{repo}/contributors` and `GET /repos/{owner}/{repo}/stargazers` with infinite scroll.
**Impact:** Social proof and community visibility are important for open-source projects.

### FEAT-014 — File Content Viewer

**Current state:** The Code tab only shows file/folder names and opens files in an external browser (`Linking.openURL(item.html_url)`).
**Suggested improvement:** Fetch and display plain-text file contents (code files, configs, markdown) in an in-app viewer with syntax highlighting. Fall back to external browser for binary/large files.
**Impact:** Developers frequently read source files, configs, and small scripts on mobile.

### FEAT-015 — Pull-to-Refresh on More Screens

**Current state:** **[DONE]** Pull-to-refresh added to profile, starred repos, and notifications. Feed and explore already had it.
**Suggested improvement:** Add to trending screen and repo detail tabs.
**Impact:** Consistent interaction pattern across the app.

### FEAT-016 — Search Suggestions/Autocomplete

**Current state:** Search is instant but offers no suggestions or autocomplete.
**Suggested improvement:** After the user types 2+ characters, show a dropdown of matching repos, users, and topics from a lightweight search query. Debounce at 300ms.
**Impact:** Helps users discover exact names and reduces typing effort.

### FEAT-017 — Repo Insights Tab

**Current state:** No traffic, commit frequency, or dependency information is shown.
**Suggested improvement:** Add an "Insights" tab to repo detail with: traffic views/clones (if available), commit activity (via GraphQL), dependents count, and dependency graph link.
**Impact:** Valuable for maintainers monitoring repo health.

### FEAT-018 — Organization Profiles

**Current state:** Only user profiles are supported; org profiles fall through to the user screen.
**Suggested improvement:** Detect if `user.type === "Organization"` and render an org-specific layout with: org description, org repos, org members, and teams.
**Impact:** Many developers contribute to org-owned repos and need to browse org content.

### FEAT-019 — Branded Empty States

**Current state:** **[DONE]** `EmptyState` component wired into repos, notifications, and profile pinned repos.
**Impact:** Polished feel; reduces perceived "broken" state when lists are empty.

### FEAT-020 — Share & Copy Link Actions

**Current state:** **[DONE]** Copy profile link added to profile header. Copy + share actions added to public user profile screen.
**Suggested improvement:** Extend to repo detail and, later, issue/PR screens.
**Impact:** Sharing specific code references and issues is a common mobile workflow.

---

## Low Priority Suggestions

| ID       | Category | Description                                                                          | Impact | Effort | Confidence | Status  |
| -------- | -------- | ------------------------------------------------------------------------------------ | ------ | ------ | ---------- | ------- |
| FEAT-021 | Feature  | Add multi-account support (switch between GitHub accounts)                           | Low    | High   | 70%        | Open    |
| FEAT-022 | Feature  | Add GitHub Discussions support (list, view, create)                                  | Low    | High   | 70%        | Open    |
| FEAT-023 | Feature  | Add GitHub Projects (v2) board/list view                                             | Low    | High   | 60%        | Open    |
| FEAT-024 | Feature  | Add repo Wiki support (view and edit wiki pages)                                     | Low    | Medium | 70%        | Open    |
| FEAT-025 | Feature  | Add GitHub Packages support (view and download package assets)                       | Low    | High   | 60%        | Open    |
| FEAT-026 | UX       | Add notification sound customization per notification type                           | Low    | Low    | 80%        | Open    |
| FEAT-027 | UX       | Add compact/dense list mode toggle (already in preferences, needs UI implementation) | Low    | Low    | 90%        | Open    |
| FEAT-028 | Feature  | Add saved searches with alerts                                                       | Low    | High   | 60%        | Open    |
| FEAT-029 | UX       | Add onboarding/tutorial screens for first-time users                                 | Low    | Medium | 85%        | Open    |
| FEAT-030 | Feature  | Add GitHub Sponsors integration (view sponsors, sponsor tiers)                       | Low    | High   | 60%        | Open    |
| FEAT-031 | UX       | Add widget support (iOS/Android home screen widgets for notifications/feed)          | Low    | High   | 50%        | Partial |
| FEAT-032 | Feature  | Add code search within repository (search file contents)                             | Low    | Medium | 75%        | Open    |
| FEAT-033 | Feature  | Add branch comparison view (diff between two branches)                               | Low    | Medium | 75%        | Open    |
| FEAT-034 | UX       | Add iPad/tablet adaptive layout (two-pane master-detail)                             | Low    | High   | 70%        | Open    |
| FEAT-035 | Feature  | Add issue/PR creation flow with template support                                     | Low    | High   | 75%        | Open    |
| FEAT-036 | UX       | Add offline mode with cached data and sync-on-reconnect                              | Low    | High   | 65%        | Open    |
| FEAT-037 | Feature  | Add GitHub CLI-style command palette for power users                                 | Low    | Medium | 60%        | Open    |
| FEAT-038 | Feature  | Add dependency graph and security advisory views                                     | Low    | High   | 60%        | Open    |
| FEAT-039 | UX       | Add accessibility labels and screen reader support audit                             | Low    | Medium | 90%        | Open    |
| FEAT-040 | DX       | Add Storybook or component explorer for UI primitives                                | Low    | Medium | 80%        | Open    |

### FEAT-031 — Widget Support

**Current state:** **[PARTIAL]** Android notification widget foundation implemented: widget data layer, config plugin, layout XML, and `AppWidgetProvider`. iOS widget not started.
**Suggested improvement:** Complete Android notification widget testing, then add feed and trending widgets. Investigate iOS WidgetKit extension if needed.
**Impact:** Home screen widgets provide at-a-glance access to notifications and trending repos.

---

## Cross-Cutting Concerns

### Security

| ID      | Category | Description                                                                             | Impact | Effort | Status  |
| ------- | -------- | --------------------------------------------------------------------------------------- | ------ | ------ | ------- |
| SEC-001 | Security | Add token expiry handling and proactive refresh before expiration                       | High   | Medium | Open    |
| SEC-002 | Security | Implement rate-limit awareness (parse `X-RateLimit-*` headers, show warnings, back off) | Medium | Low    | Partial |
| SEC-003 | Security | Add request signing/verification for Cloudflare Worker token exchange                   | Medium | Medium | Open    |

**SEC-001:** Currently, the token is stored indefinitely with no expiry handling. If GitHub revokes the token, the app silently fails. Add a check on app launch and intercept 401 responses to trigger re-auth.

**SEC-002:** **[PARTIAL]** `src/lib/rateLimit.ts` helper created but not yet wired into the UI or called automatically. Should be integrated to show warnings when approaching limits.

### Performance

| ID       | Category     | Description                                                       | Impact | Effort | Status |
| -------- | ------------ | ----------------------------------------------------------------- | ------ | ------ | ------ |
| PERF-001 | Optimization | Implement image caching strategy with `expo-image` cache policies | Medium | Low    | DONE   |
| PERF-002 | Optimization | Add request deduplication for concurrent identical queries        | Medium | Low    | Open   |
| PERF-003 | Optimization | Lazy-load non-critical screens and heavy components               | Medium | Low    | Open   |

**PERF-001:** **[DONE]** `cachePolicy="memory-disk"` added to `Avatar` component.

### Maintainability

| ID        | Category | Description                                                                   | Impact | Effort | Status |
| --------- | -------- | ----------------------------------------------------------------------------- | ------ | ------ | ------ |
| MAINT-001 | Refactor | Extract repeated style patterns into shared style utilities                   | Medium | Low    | Open   |
| MAINT-002 | Refactor | Add error boundaries to catch render errors in nested screens                 | Medium | Low    | Open   |
| MAINT-003 | DX       | Add a `scripts/smoke.sh` or `scripts/smoke.ps1` for quick manual QA checklist | Medium | Low    | Open   |

---

## Testing Gaps

The project has a test infrastructure (Jest + `jest-expo`) but coverage is sparse:

- **0% hook coverage** for data-fetching hooks (`useActivity`, `useNotifications`, `useTrending`, `useMyRepos`, etc.)
- **0% screen component coverage** for Feed, Explore, Notifications, Repos, Profile
- **0% mutation coverage** for `useUpdateRepo`, `useCreateFork`, `useMarkNotificationRead`, etc.
- **0% E2E coverage** beyond one `HomeWorkflow.test.tsx`

Recommended test additions in priority order:

1. Hook tests for all 12 API hooks
2. Screen render tests for Feed, Notifications, Repos list
3. Auth flow integration test (sign-in, token storage, sign-out)
4. Mutation tests with mocked Octokit

---

## Completion Summary

| Category                 | Total  | Done  | Partial | Open   |
| ------------------------ | ------ | ----- | ------- | ------ |
| High Priority Features   | 8      | 0     | 1       | 7      |
| Medium Priority Features | 12     | 4     | 0       | 8      |
| Low Priority Features    | 20     | 0     | 1       | 19     |
| Security                 | 3      | 0     | 1       | 2      |
| Performance              | 3      | 1     | 0       | 2      |
| Maintainability          | 3      | 0     | 0       | 3      |
| **Total**                | **49** | **5** | **3**   | **41** |

---

## Next Recommended Features

Based on current progress, the highest-impact next features are:

1. **FEAT-001 + FEAT-003 + FEAT-004** — Issues and PRs are the largest remaining gaps and core GitHub workflows. Implementing these unblocks the most user-facing functionality.

2. **FEAT-002** — Hook unit tests. The data layer is growing; adding tests now prevents regressions as new features are built.

3. **FEAT-011** — Star/unstar quick actions on repo cards. Low complexity, high user value, and pairs naturally with optimistic updates (FEAT-008).

4. **FEAT-010** — Notification deep-linking. Completes the notification flow and is a natural companion to the Issues/PRs work.

5. **FEAT-007** — Releases tab in repo detail. Uses existing `useReleases` hook; medium effort, high value for release-heavy workflows.

6. **FEAT-016** — Search suggestions/autocomplete. Builds on the existing search infrastructure and search history.
