# AGENTS.md - Agent Guidelines for awesome-github-app

## Project Overview

A modern GitHub mobile client built with **Expo 55 (CNG)**, **React Native 0.83**, **Expo Router**, and **Uniwind** (Tailwind CSS for React Native). Uses **bun** as the package manager.

Tech Stack: Expo 55, React Native 0.83, TypeScript 5.9, Expo Router, Uniwind, TanStack Query v5, @octokit/rest, @octokit/graphql, expo-auth-session, expo-secure-store, react-native-reanimated 4.

---

## Commands

### Development

```sh
bun run start          # Start Expo dev server
bun run android        # Prebuild (format, lint:fix, typecheck) → run on Android
bun run ios            # Run on iOS simulator
bun run web            # Web preview
bun run native:sync    # Regenerate android/ ios/ from app.json
bun run build          # Export for production (expo export)
bun run go             # Format, lint, typecheck, then start dev server
```

### Quality Assurance

```sh
bun run typecheck      # TypeScript strict check (tsc --noEmit)
bun run lint           # ESLint check
bun run lint:fix       # ESLint with auto-fix
bun run format         # Prettier (auto-sorts imports)
bun run doctor         # Run expo-doctor health checks
bun run prebuild       # Run format && lint:fix && typecheck
```

### Testing

```sh
bun run test           # Run Jest tests
bun run test:ci        # Run Jest with CI flags and coverage
bun test               # Run Jest directly (bunx jest)
bun test --watch       # Run Jest in watch mode
bun test path/to/test # Run a single test file
bun test -t "test name" # Run tests matching a pattern
```

---

## Code Style Guidelines

### Formatting (Prettier)

Configured in `.prettierrc`:

- **Double quotes** (`"`, not `'`)
- **Trailing commas** everywhere
- **2-space indent**
- **80-character print width**
- **singleAttributePerLine: true** for JSX
- **Arrow functions**: avoid parens when possible (`x => x`)

Run `bun run format` before committing - it auto-sorts imports.

### TypeScript

- **Strict mode** enabled (`tsconfig.json` extends `expo/tsconfig.base`)
- Use explicit types for function parameters and return values
- Use `interface` for object shapes, `type` for unions/intersections
- ESLint allows `any` types for GitHub API responses (`@typescript-eslint/no-explicit-any: warn`) - API types are extensive and not maintained locally

### ESLint

Configured in `eslint.config.mts`:

- React 17+ jsx-runtime (no class-component rules)
- TypeScript ESLint recommended rules
- Custom rules:
  - `@typescript-eslint/no-explicit-any: warn` (allows `any`)
  - `react/no-unescaped-entities: off` (allows unescaped apostrophes)

### Imports

- **Auto-sorted** by `prettier-plugin-sort-imports` on every `format` run
- **Don't manually order imports** - let Prettier handle it
- Barrel exports used - import from index files:
  - `src/components/ui/index.ts`
  - `src/lib/api/hooks/index.ts`

---

## Naming Conventions

### Files

- **Components**: PascalCase (`Button.tsx`, `AuthContext.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useNotifications.ts`)
- **Utils/lib**: camelCase (`github.ts`, `theme.ts`)
- **Constants**: PascalCase or SCREAMING_SNAKE_CASE depending on usage

### Variables/Functions

- **Functions**: camelCase (`getOctokit()`, `useAppTheme()`)
- **Components**: PascalCase (`function Button() {}`)
- **Constants**: PascalCase for React components, SCREAMING_SNAKE_CASE for config values
- **Booleans**: Use `is`, `has`, `can`, `should` prefixes (`isLoading`, `hasError`)

### Types/Interfaces

- PascalCase (`ButtonProps`, `User`, `Repository`)
- Export types explicitly: `export type { ButtonProps }`

---

## Component Patterns

### UI Components (`src/components/ui/`)

```tsx
// Props always exported as named type
export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  // ...
}

// Use react-native types
import type { PressableProps } from "react-native";

// Barrel export from index.ts
export { Button } from "./Button";
```

### React Native Built-ins

- Use `StyleSheet.create()` for styles (not inline objects)
- Use `className` with Uniwind for layout/colors
- Use `StyleSheet` for complex styles and animations
- Use `expo-image` (`<Image />`), not React Native's built-in `Image`

---

## Error Handling

### API Errors

- Let TanStack Query handle loading/error states via `useQuery`/`useMutation`
- Use toast notifications for user-facing errors
- Log errors to console in development

### Try/Catch

```tsx
try {
  const data = await apiCall();
} catch (error) {
  console.error("Failed to fetch:", error);
  throw error; // Re-throw for TanStack Query
}
```

### Type Safety

- Use `unknown` for catch block variables, then narrow
- Prefer type guards over `any`

---

## Architecture Patterns

### Routing (Expo Router)

- Routes in `src/app/` with file-based routing
- Dynamic segments: `repo/[owner]/[repo]/`
- Layouts: `_(group)/_layout.tsx`
- Auth gating in root `_layout.tsx`

### Data Fetching

- Hooks call `getOctokit()` / `getGraphQL()` internally
- **Never pass client as prop** - follow the pattern
- Use TanStack Query `staleTime: 5 min`, `retry: 2`, `refetchOnWindowFocus: false`
- Infinite scroll: `useInfiniteQuery` with page-based pagination (pageParam starts at 1, 30 items/page)

### Provider Stack

Order (outermost first):

```
QueryClientProvider → ThemeProvider → ToastProvider → AuthProvider
```

### Auth

- Token stored in `expo-secure-store` under `github_access_token`
- Call `resetOctokit()` after token changes
- OAuth via Cloudflare Worker (never expose client_secret)

---

## Theming

### Uniwind (Preferred)

Use `className` prop for layout and colors:

```tsx
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-bold text-primary">Hello</Text>
</View>
```

Custom CSS utilities in `src/global.css`:

- `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-accent`
- `text-primary`, `text-secondary`, `text-accent`
- Use `dark:` prefix for dark mode

### useAppTheme() (Fallback)

From `src/lib/theme.ts` - returns JS object of GitHub-palette colors. Use when `className` isn't applicable (tab bar `backgroundColor`, animated values).

---

## Icons

- Always use `Ionicons` from `expo-vector-icons`
- Type: `icon?: keyof typeof Ionicons.glyphMap`

---

## Testing Guidelines

### Jest Configuration

- Preset: `jest-expo`
- Environment: `jsdom`
- Path aliases: `@/*` maps to `src/*`

### Running Tests

```sh
bun test                                    # Run all tests
bun test --watch                           # Watch mode
bun test src/components/Button.test.tsx   # Single file
bun test -t "renders"                      # By name pattern
bun test --coverage                        # With coverage
```

### Test File Naming

- `*.test.tsx` or `*.test.ts`
- Co-locate with component: `Button.tsx` → `Button.test.tsx`

### Mocking

- See `jest.setup.js` for existing mocks (expo-secure-store, expo-router, etc.)
- Use `@testing-library/react-native` for component testing

---

## Git Workflow

### Before Committing

1. Run `bun run prebuild` (format, lint:fix, typecheck)
2. Run `bun test` to ensure tests pass

### Commit Messages

- Conventional commits supported
- Use `bun run changelog` to generate changelog

---

## CNG (Continuous Native Generation)

- `android/` and `ios/` are git-ignored
- Generated by `expo prebuild`
- Run `bun run native:sync` after changing `app.json` or native dependencies
