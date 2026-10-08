# Implementation Plan — awesome-github-app

This plan covers high-priority features and quick wins based on the updated `suggestions.md`. Each item includes specific files to modify, dependencies, and acceptance criteria.

---

## Sprint 1 (Week 1-2): Foundation & Testing

### FEAT-002 — Hook Unit Tests (High Priority)

**Goal:** Add unit tests for all 12+ API hooks to prevent regressions in the data layer.

**Files to Create/Modify:**

- `__tests__/hooks/useActivity.test.tsx`
- `__tests__/hooks/useNotifications.test.tsx`
- `__tests__/hooks/useTrending.test.tsx`
- `__tests__/hooks/useMyRepos.test.tsx`
- `__tests__/hooks/useStarredRepos.test.tsx`
- `__tests__/hooks/useSearch.test.tsx`
- `__tests__/hooks/useContributions.test.tsx`
- `__tests__/hooks/usePinnedRepos.test.tsx`
- `__tests__/hooks/useRepoReleases.test.tsx`
- `__tests__/hooks/useWorkflows.test.tsx`
- `__tests__/test-utils/fixtures.ts` — Add more fixtures

**Implementation Steps:**

1. Extend `fixtures.ts` with mock data for each hook (notifications, trending repos, search results, contributions, etc.)
2. Create test pattern following `useRepo.test.tsx`:
   - Mock `getOctokit()` using `jest.mock()`
   - Render hook consumer wrapped in `QueryClientProvider`
   - Verify query keys, successful fetch, error states, and pagination
3. For infinite query hooks (`useTrending`, `useMyRepos`, `useStarredRepos`):
   - Test `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`
4. For mutation hooks (`useMarkNotificationRead`, `useCreateFork`):
   - Test `onMutate` optimistic updates
   - Test `onError` rollback
   - Test `onSettled` cache invalidation

**Acceptance Criteria:**

- [ ] All 12+ hooks have at least 3 tests each (success, error, edge case)
- [ ] Coverage for `src/lib/api/hooks/` > 80%
- [ ] Tests run in CI (`bun test --coverage`)

**Dependencies:** None — can start immediately.

---

### FEAT-008 — Optimistic Updates (Quick Win, High Priority)

**Goal:** Add TanStack Query `onMutate` optimistic updates for star, unstar, watch, and notification-read mutations.

**Files to Modify:**

- `src/lib/api/hooks/useRepo.ts` — `useStarRepo`, `useUnstarRepo`
- `src/lib/api/hooks/useNotifications.ts` — `useMarkNotificationRead`, `useMarkAllRead`
- (Future) `src/lib/api/hooks/useRepo.ts` — add `useWatchRepo`, `useUnwatchRepo`

**Implementation Steps:**

1. **Star/Unstar** (`useRepo.ts`):
   - In `useStarRepo`: Add `onMutate` to optimistically increment `stargazers_count` and set `viewer_has_starred: true` in repo cache
   - In `useUnstarRepo`: Add `onMutate` to decrement count and set `viewer_has_starred: false`
   - Add `onError` rollback to restore previous cache
   - Update `RepoCard` in `src/app/(tabs)/repos/index.tsx` to use optimistic state (already does local state update, but should rely on cache)

2. **Notifications** (`useNotifications.ts`):
   - `useMarkNotificationRead` already has `onMutate` — verify it works correctly
   - `useMarkAllRead` already has `onMutate` — verify it works correctly
   - Add toast on error for rollback notification

3. **Watch/Unwatch** (new hooks in `useRepo.ts`):
   - Create `useWatchRepo(owner, repo)` and `useUnwatchRepo(owner, repo)` mutations
   - Use `octokit.activity.setRepoSubscription` with `subscribed: true/false`
   - Add optimistic updates similar to star/unstar

**Acceptance Criteria:**

- [ ] Star/unstar shows immediate UI feedback without waiting for network
- [ ] Rollback works on network error with toast notification
- [ ] Watch/unwatch mutations exist and work
- [ ] No double-requests or race conditions

**Dependencies:** None — can start immediately.

---

### FEAT-005 — Skeleton Loaders Remaining (Quick Win)

**Goal:** Replace remaining `ActivityIndicator` spinners with `SkeletonCard`/`Skeleton` components.

**Files to Modify:**

- `src/app/(tabs)/profile/index.tsx` — ContributionGraph loading state (line 30-36)
- `src/app/(tabs)/repos/index.tsx` — Already uses SkeletonCard for list, verify starred repos menu
- `src/app/(tabs)/profile/menu.tsx` — Check for starred repos loading (if exists)

**Implementation Steps:**

1. In `ContributionGraph` component: Replace `ActivityIndicator` with a skeleton grid matching the contribution graph layout (53 weeks × 7 days)
2. Create `SkeletonContributionGraph` component in `src/components/ui/Skeleton.tsx`
3. Verify all list screens use `SkeletonCard` or `Skeleton` consistently

**Acceptance Criteria:**

- [ ] No `ActivityIndicator` used for list/content loading (only for actions like fork, mark read)
- [ ] Skeleton shapes match actual content layout
- [ ] Consistent shimmer animation across all screens

**Dependencies:** None — can start immediately.

---

### FEAT-020 Completion — Copy Link on Repo Detail (Quick Win)

**Goal:** Add "Copy link" action to repo detail header alongside Share.

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — `actionRow` in repo header (around line 833-848)

**Implementation Steps:**

1. Add `Pressable` button with `copy-outline` icon next to Share button
2. Reuse `Clipboard.setStringAsync(data.html_url)` logic from profile screen
3. Show toast "Link copied" on success

**Acceptance Criteria:**

- [ ] Copy link button visible in repo header
- [ ] Copies `repo.html_url` to clipboard
- [ ] Shows success toast

**Dependencies:** None — can start immediately.

---

### FEAT-045 — Copy Clone URL (Quick Win)

**Goal:** Add "Copy clone URL" to repo header actions (already exists in fork success modal).

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — Add to `actionRow`

**Implementation Steps:**

1. Add button with `git-branch-outline` icon (or `code-outline`)
2. Copy `data.clone_url` to clipboard
3. Show toast "Clone URL copied"

**Acceptance Criteria:**

- [ ] Clone URL copy button in repo header
- [ ] Works for both HTTPS and SSH (maybe toggle?)

**Dependencies:** None.

---

### FEAT-049 — React Query `select` for Derived Data (Quick Win)

**Goal:** Prevent unnecessary re-renders by using `select` option in `useQuery`/`useInfiniteQuery` for derived data.

**Files to Modify:**

- `src/app/(tabs)/repos/index.tsx` — `useMyRepos` with client-side search filter
- `src/app/(tabs)/explore/index.tsx` — `useSearch` with suggestions
- `src/app/(tabs)/profile/index.tsx` — `usePinnedRepos`

**Implementation Steps:**

1. In `ReposScreen`: Move search filtering to `select` in `useMyRepos`:
   ```tsx
   const { data } = useMyRepos(filter, "updated", {
     select: data =>
       data?.pages
         .flat()
         .filter(r => r.name.toLowerCase().includes(search.toLowerCase())) ??
       [],
   });
   ```
2. Remove local `filtered` state and `useMemo`
3. Apply similar pattern where client-side filtering occurs

**Acceptance Criteria:**

- [ ] Components don't re-render when parent state changes but selected data unchanged
- [ ] Search filtering still works correctly
- [ ] Performance improvement measurable in React DevTools

**Dependencies:** None.

---

### FEAT-050 — Virtualized Lists Optimization (Quick Win)

**Goal:** Ensure all `FlatList` components have proper virtualization props for large datasets.

**Files to Modify:**

- `src/app/(tabs)/repos/index.tsx` — Repos FlatList
- `src/app/(tabs)/notifications/index.tsx` — Notifications FlatList
- `src/app/(tabs)/explore/index.tsx` — Search results FlatList
- `src/app/repo/[owner]/[repo]/index.tsx` — Branches, Releases lists

**Implementation Steps:**

1. Add these props to each `FlatList`:
   ```tsx
   initialNumToRender={10}
   maxToRenderPerBatch={10}
   windowSize={5}
   removeClippedSubviews={true}
   getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
   ```
2. Where item height varies, use estimated height or omit `getItemLayout`

**Acceptance Criteria:**

- [ ] All FlatLists have virtualization props
- [ ] Scroll performance smooth with 100+ items
- [ ] Memory usage stable during long scrolls

**Dependencies:** None.

---

## Sprint 2 (Week 2-3): Core Features — Issues & PRs

### FEAT-001 + FEAT-003 — Issues Tab & List Screen (High Priority)

**Goal:** Replace "Coming Soon" Issues tab with full-featured issues list.

**Files to Create:**

- `src/app/repo/[owner]/[repo]/issues.tsx` — Issues list screen (new route)
- `src/components/repo/IssuesList.tsx` — Reusable issues list component
- `src/components/repo/IssueRow.tsx` — Individual issue row
- `src/components/repo/IssueFilters.tsx` — Filter chips (state, labels, assignees)
- `src/lib/api/hooks/useIssues.ts` — New hook for fetching issues

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — Replace `ComingSoonTab` with navigation to issues screen
- `src/lib/api/hooks/index.ts` — Export new hooks

**Implementation Steps:**

1. **Create `useIssues` hook** (`src/lib/api/hooks/useIssues.ts`):

   ```tsx
   export function useIssues(
     owner: string,
     repo: string,
     options: {
       state?: "open" | "closed" | "all";
       labels?: string[];
       assignee?: string;
       sort?: "created" | "updated" | "comments";
       direction?: "asc" | "desc";
     } = {},
   ) {
     return useInfiniteQuery({
       queryKey: ["issues", owner, repo, options],
       queryFn: async ({ pageParam }) => {
         const octokit = await getOctokit();
         const { data } = await octokit.issues.listForRepo({
           owner,
           repo,
           state: options.state ?? "open",
           labels: options.labels?.join(","),
           assignee: options.assignee,
           sort: options.sort ?? "created",
           direction: options.direction ?? "desc",
           per_page: 30,
           page: pageParam,
         });
         return data;
       },
       initialPageParam: 1,
       getNextPageParam: lastPage =>
         lastPage.length === 30 ? lastPageParam + 1 : undefined,
       enabled: !!(owner && repo),
     });
   }
   ```

2. **Create `IssuesScreen`** (`src/app/repo/[owner]/[repo]/issues.tsx`):
   - Use `useLocalSearchParams` for owner/repo
   - State for filters: `state`, `labels`, `assignee`
   - `ChipFilter` for state (Open/Closed/All)
   - Label filter: modal or dropdown with multi-select
   - Assignee filter: text input or picker
   - Infinite scroll with `FlatList`
   - Pull-to-refresh
   - Empty state with illustration

3. **Create `IssueRow` component**:
   - Show issue number, title, state badge, labels, assignee avatars, updated time
   - Press to navigate to issue detail (future) or open in browser for now

4. **Update repo detail tabs**: Replace `Issues` ComingSoonTab with navigation to `/repo/${owner}/${repo}/issues`

**Acceptance Criteria:**

- [ ] Issues tab shows paginated list of issues
- [ ] State filter (Open/Closed/All) works
- [ ] Label filter works (multi-select)
- [ ] Assignee filter works
- [ ] Pull-to-refresh works
- [ ] Infinite scroll loads more issues
- [ ] Deep link from notification to specific issue works (see FEAT-010)

**Dependencies:** Requires `useIssues` hook first.

---

### FEAT-004 — PR List Screen (High Priority)

**Goal:** Replace "Coming Soon" PRs tab with full-featured PR list.

**Files to Create:**

- `src/app/repo/[owner]/[repo]/pulls.tsx` — PR list screen (new route)
- `src/components/repo/PullRequestsList.tsx` — Reusable PR list component
- `src/components/repo/PullRequestRow.tsx` — Individual PR row
- `src/components/repo/PRFilters.tsx` — Filter chips (state, review status, mergeability)
- `src/lib/api/hooks/usePullRequests.ts` — New hook for fetching PRs

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — Replace `PRs` ComingSoonTab with navigation
- `src/lib/api/hooks/index.ts` — Export new hooks

**Implementation Steps:**

1. **Create `usePullRequests` hook** (`src/lib/api/hooks/usePullRequests.ts`):

   ```tsx
   export function usePullRequests(
     owner: string,
     repo: string,
     options: {
       state?: "open" | "closed" | "all";
       head?: string;
       base?: string;
       sort?: "created" | "updated" | "popularity" | "long-running";
       direction?: "asc" | "desc";
     } = {},
   ) {
     return useInfiniteQuery({
       queryKey: ["pulls", owner, repo, options],
       queryFn: async ({ pageParam }) => {
         const octokit = await getOctokit();
         const { data } = await octokit.pulls.list({
           owner,
           repo,
           state: options.state ?? "open",
           head: options.head,
           base: options.base,
           sort: options.sort ?? "created",
           direction: options.direction ?? "desc",
           per_page: 30,
           page: pageParam,
         });
         return data;
       },
       initialPageParam: 1,
       getNextPageParam: lastPage =>
         lastPage.length === 30 ? lastPageParam + 1 : undefined,
       enabled: !!(owner && repo),
     });
   }

   // Add mutation for merging (repo owners only)
   export function useMergePullRequest(
     owner: string,
     repo: string,
     pullNumber: number,
   ) {
     return useMutation({
       mutationFn: async (options: {
         commit_title?: string;
         commit_message?: string;
         merge_method?: "merge" | "squash" | "rebase";
       }) => {
         const octokit = await getOctokit();
         const { data } = await octokit.pulls.merge({
           owner,
           repo,
           pull_number: pullNumber,
           ...options,
         });
         return data;
       },
     });
   }
   ```

2. **Create `PullRequestsScreen`** (`src/app/repo/[owner]/[repo]/pulls.tsx`):
   - State filters: Open/Closed/Merged (3 chips)
   - Review status filter: All/Needs Review/Approved/Changes Requested
   - Mergeability indicator (mergeable/conflicts/checks passing)
   - For repo owners: Merge button (when mergeable)
   - PR row shows: number, title, author, labels, review status, merge status, updated time
   - Draft PR badge
   - Press to navigate to PR detail (future) or open in browser

3. **Add review status fetching**: May need additional GraphQL query for review states

**Acceptance Criteria:**

- [ ] PRs tab shows paginated list of PRs
- [ ] State filter (Open/Closed/Merged) works
- [ ] Review status filter works
- [ ] Mergeability indicator shown
- [ ] Merge button works for repo owners on mergeable PRs
- [ ] Draft PR badge visible
- [ ] Deep link from notification to specific PR works (FEAT-010)

**Dependencies:** Requires `usePullRequests` hook first. Can parallelize with Issues.

---

## Sprint 3 (Week 3-4): Integration & Polish

### FEAT-010 — Notification Deep-Linking (High Priority)

**Goal:** Navigate from notification to underlying issue/PR/discussion.

**Files to Modify:**

- `src/app/(tabs)/notifications/index.tsx` — `NotifRow` `onPress` handler
- `src/lib/api/hooks/useNotifications.ts` — Add helper to parse notification URLs

**Implementation Steps:**

1. **Add URL parsing utility** in `useNotifications.ts` or new `lib/navigation.ts`:

   ```tsx
   export function parseNotificationUrl(
     subject: NotificationThread["subject"],
   ): {
     route: string;
     params?: Record<string, string>;
   } | null {
     if (!subject?.url) return null;
     // Parse GitHub API URLs like:
     // https://api.github.com/repos/owner/repo/issues/123
     // https://api.github.com/repos/owner/repo/pulls/456
     // https://api.github.com/repos/owner/repo/discussions/789
     const match = subject.url.match(
       /repos\/([^/]+)\/([^/]+)\/(issues|pulls|discussions)\/(\d+)/,
     );
     if (!match) return null;
     const [, owner, repo, type, number] = match;
     return {
       route: `/repo/${owner}/${repo}/${type === "pulls" ? "pull" : type}/${number}`,
       params: { owner, repo, number },
     };
   }
   ```

2. **Update `NotifRow`** in `notifications/index.tsx`:
   - On press (when not marking read), call `parseNotificationUrl`
   - If route found, `router.push(route)`
   - Else fallback to `Linking.openURL(subject.url)`

3. **Handle discussion routing**: Add `/repo/[owner]/[repo]/discussions/[number].tsx` route later

**Acceptance Criteria:**

- [ ] Tapping notification navigates to issue/PR in-app
- [ ] Falls back to browser for unsupported types (discussions, commits, releases)
- [ ] Back navigation returns to notifications list

**Dependencies:** FEAT-003/004 (Issues/PR screens) for full in-app experience.

---

### FEAT-006 — Integration Tests (High Priority)

**Goal:** Add integration tests for critical user flows.

**Files to Create:**

- `__tests__/integration/AuthFlow.test.tsx`
- `__tests__/integration/TabNavigation.test.tsx`
- `__tests__/integration/RepoDetailNavigation.test.tsx`
- `__tests__/integration/SearchFlow.test.tsx`
- `__tests__/integration/NotificationRead.test.tsx`

**Implementation Steps:**

1. **AuthFlow**: Test OAuth callback, token storage, sign-out
   - Mock `expo-auth-session` and `expo-web-browser`
   - Verify token saved to `expo-secure-store`
   - Verify `resetOctokit()` called

2. **TabNavigation**: Test tab switching, deep links
   - Render `(tabs)` layout
   - Press tab buttons, verify screen changes

3. **RepoDetailNavigation**: Test navigation from various entry points
   - From repos list, explore search, notifications
   - Verify params passed correctly

4. **SearchFlow**: Test search input, suggestions, results, navigation
   - Type in search, verify suggestions appear
   - Press suggestion, verify navigation

5. **NotificationRead**: Test mark read, mark all read
   - Render notifications screen with mock data
   - Press mark read, verify optimistic update
   - Press mark all read, verify all marked

**Acceptance Criteria:**

- [ ] All 5 integration test files exist and pass
- [ ] Tests cover happy paths and error states
- [ ] CI runs integration tests

**Dependencies:** FEAT-002 (hook tests) for shared test utilities.

---

### FEAT-013 — Contributors & Stargazers Tabs (Medium Priority)

**Goal:** Add Contributors and Stargazers tabs to repo detail.

**Files to Create:**

- `src/lib/api/hooks/useContributors.ts`
- `src/lib/api/hooks/useStargazers.ts`
- `src/components/repo/ContributorsTab.tsx`
- `src/components/repo/StargazersTab.tsx`

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — Add tabs to `TABS` array and render components
- `src/lib/api/hooks/index.ts` — Export new hooks

**Implementation Steps:**

1. **Hooks**: Use `useInfiniteQuery` with `octokit.repos.listContributors` and `octokit.activity.listStargazersForRepo`
2. **Components**: Simple list with avatar, name, contribution count (contributors) / starred date (stargazers)
3. **Tabs**: Add "Contributors" and "Stargazers" to `TABS` array

**Acceptance Criteria:**

- [ ] Contributors tab shows paginated list with avatar, name, contributions
- [ ] Stargazers tab shows paginated list with avatar, name, starred date
- [ ] Infinite scroll works for both
- [ ] Empty states handled

**Dependencies:** None — can start after Sprint 1.

---

### FEAT-014 — File Content Viewer (Medium Priority)

**Goal:** View file contents in-app instead of opening in browser.

**Files to Create:**

- `src/components/repo/FileViewer.tsx`
- `src/lib/api/hooks/useFileContent.ts`

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — `CodeTab` onPress handler

**Implementation Steps:**

1. **Hook** `useFileContent(owner, repo, path, ref?)`:
   - Fetch raw content via `octokit.repos.getContent` with `mediaType: { format: "raw" }`
   - Handle encoding (base64)
   - Return string content

2. **FileViewer Component**:
   - Syntax highlighting using `react-native-markdown-display` or `react-native-highlight`
   - Detect language from file extension
   - Show line numbers
   - "Open in GitHub" button
   - Copy content button
   - Handle large files (>100KB) with warning and fallback to browser

3. **CodeTab Integration**:
   - On file press, if text file (check extension/mime), show FileViewer modal
   - Else open in browser

**Acceptance Criteria:**

- [ ] Text files (code, markdown, config) open in-app
- [ ] Syntax highlighting works for common languages
- [ ] Large files show warning and offer browser fallback
- [ ] Binary files open in browser

**Dependencies:** None.

---

## Sprint 4 (Week 4-5): Advanced Features

### FEAT-017 — Repo Insights Tab (Medium Priority)

**Files to Create:**

- `src/components/repo/InsightsTab.tsx`
- `src/lib/api/hooks/useRepoInsights.ts` (GraphQL for commit activity, traffic)

**Files to Modify:**

- `src/app/repo/[owner]/[repo]/index.tsx` — Add "Insights" tab

**Implementation Steps:**

1. GraphQL query for commit activity (last 52 weeks)
2. REST API for traffic (views/clones) — requires repo admin access
3. Display charts using simple React Native chart library or custom SVG
4. Link to dependency graph, security advisories

**Dependencies:** GraphQL infrastructure already exists (`getGraphQL()`).

---

### FEAT-018 — Organization Profiles (Medium Priority)

**Files to Modify:**

- `src/app/user/[login].tsx` — Detect org type and render org layout
- `src/lib/api/hooks/useOrgRepos.ts`, `useOrgMembers.ts`

**Implementation Steps:**

1. In `user/[login].tsx`, check `user.type === "Organization"`
2. If org: fetch org repos, members, teams
3. Render org-specific layout with tabs: Overview, Repositories, People, Teams

**Dependencies:** None.

---

### FEAT-031 — Widget Completion (Low Priority, High Effort)

**Files to Modify:**

- `widgets/NotificationWidget/` — Complete Android widget
- `src/lib/widgetData.ts` — Add feed/trending data
- iOS: Create WidgetKit extension (if needed)

**Implementation Steps:**

1. Test Android widget on device/emulator
2. Add widget configuration activity
3. Add feed/trending widget variants
4. Investigate iOS WidgetKit

**Dependencies:** Android widget foundation exists.

---

## Quick Wins Summary (Can Be Done Anytime)

| Task                          | Effort | Files                                | Sprint   |
| ----------------------------- | ------ | ------------------------------------ | -------- |
| FEAT-008 Optimistic Updates   | ~4h    | `useRepo.ts`, `useNotifications.ts`  | Sprint 1 |
| FEAT-005 Skeleton Loaders     | ~3h    | `profile/index.tsx`, `Skeleton.tsx`  | Sprint 1 |
| FEAT-020 Copy Link Repo       | ~2h    | `repo/[owner]/[repo]/index.tsx`      | Sprint 1 |
| FEAT-045 Copy Clone URL       | ~2h    | `repo/[owner]/[repo]/index.tsx`      | Sprint 1 |
| FEAT-049 React Query `select` | ~4h    | Multiple screens                     | Sprint 1 |
| FEAT-050 Virtualized Lists    | ~3h    | Multiple FlatLists                   | Sprint 1 |
| SEC-002 Rate Limit UI         | ~3h    | `rateLimit.ts`, notification/context | Sprint 1 |
| MAINT-003 Smoke Script        | ~2h    | `scripts/smoke.ps1`                  | Sprint 1 |

---

## Technical Debt & Maintenance

### MAINT-001 — Shared Style Utilities

Extract repeated `StyleSheet.create` patterns into `src/lib/styles.ts`:

- Common card styles
- Header styles
- Button variants
- Spacing/sizing tokens

### MAINT-002 — Error Boundaries

Add `ErrorBoundary` component wrapping each tab screen and repo detail tabs.

### MAINT-004 — ESLint Query Key Rule

Create custom ESLint rule to enforce query key patterns: `["entity", "id", "subresource"]`.

### MAINT-005 — ADR Documentation

Create `docs/adr/` with Architecture Decision Records for:

- TanStack Query configuration choices
- Uniwind vs StyleSheet decisions
- Authentication flow design
- Navigation structure

---

## Risk Mitigation

| Risk                                           | Likelihood | Impact | Mitigation                                       |
| ---------------------------------------------- | ---------- | ------ | ------------------------------------------------ |
| GitHub API rate limits during testing          | Medium     | High   | Use recorded fixtures, mock Octokit              |
| Issues/PR API complexity (pagination, filters) | High       | Medium | Start with basic list, add filters incrementally |
| Notification deep-link parsing edge cases      | Medium     | Medium | Comprehensive URL parsing tests                  |
| React Query cache invalidation conflicts       | Low        | High   | Test each mutation's invalidation in isolation   |
| iOS widget development complexity              | High       | Low    | Defer to later, focus on Android first           |

---

## Success Metrics

- **Test Coverage**: >80% for hooks, >60% for screens
- **Performance**: <100ms median interaction latency (measured via Flipper)
- **Crash-free sessions**: >99.5%
- **User retention**: Day 7 > 40%, Day 30 > 20%

---

## Review Checkpoints

1. **End of Sprint 1**: Hook tests passing, optimistic updates working, quick wins merged
2. **End of Sprint 2**: Issues & PRs tabs functional with filters and pagination
3. **End of Sprint 3**: Deep-linking works, integration tests pass, contributors/stargazers done
4. **End of Sprint 4**: File viewer, insights, org profiles merged

---

_Generated from suggestions.md analysis. Update as implementation progresses._
