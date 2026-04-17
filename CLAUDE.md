# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
expo start          # Start dev server (scan QR with Expo Go or simulator)
expo start --ios    # Start iOS simulator
expo start --android # Start Android emulator
expo lint           # ESLint check
npx tsc --noEmit    # TypeScript type check (no build output)
```

No test runner is configured yet.

## Path Aliases

`@/` maps to the project root. Always use `@/` imports, never relative `../` paths.

## Architecture

### Routing

Expo Router file-based routing lives in `app/`. The root layout (`app/_layout.tsx`) wraps the app in `LocalizationProvider` and `SafeAreaView`. Tab navigation is in `app/(tabs)/`.

`typedRoutes` and `reactCompiler` experimental features are enabled in `app.json`.

### Theme System

Theme state is managed by `ThemeService` (`theme/theme-service.ts`) — a static singleton that implements the observable pattern with `useSyncExternalStore`.

- **Hook**: `useTheme()` from `@/theme/hooks/use-theme` — returns `{ theme, selectedTheme, changeTheme, withOpacity }`
- **Outside React** (module-level, e.g. SVA definitions): use `ThemeService.getTheme()` directly
- **Design tokens**: imported from `@/theme` — `spacing`, `typography`, `radius`, `colors`
- **`withOpacity(colorKey, alpha)`**: converts a theme color token to `rgba()` string

There is no React Context for theming — do not add a ThemeProvider.

### Styling with SVA

`utils/sva/sva.ts` is a custom slot-based variant utility (like CVA but for React Native StyleSheet arrays).

```ts
const styles = sva({
  base: {
    root: { /* Pressable base styles */ },
    text: { /* Text base styles */ },
  },
  variants: {
    size: {
      sm: { root: { padding: 4 }, text: { fontSize: 12 } },
      lg: { root: { padding: 16 }, text: { fontSize: 18 } },
    },
  },
  defaultVariants: { size: "sm" },
});

// Usage in component:
const { root, text } = styles({ size: "lg" });
<Pressable style={root(extraStyle)}>
  <Text style={text()} />
</Pressable>
```

Each slot function accepts rest-style params: `root(style1, style2, ...)`.

Use `VariantProps<typeof styles>` to extract the variant prop types.

### UI Components

Reusable components live in `components/ui/`. Prefer `AppButton` and `AppText` over raw React Native primitives. `AppButton` has variants: `primary | secondary | outline | ghost | destructive | link` and sizes: `default | sm | lg | icon`.

### Localization

i18next with two languages (EN, TR) and two namespaces: `COMMON` and `ERRORS`.

- **In components**: `useI18n()` from `@/i18n`
- **Translation files**: `i18n/locales/en/` and `i18n/locales/tr/`
- `LocalizationProvider` initializes i18next on mount — it must wrap the app in `app/_layout.tsx`

### Shared Utilities

- `useAsyncState()` — tracks async operation lifecycle (idle → pending → success/error) with an imperative ref API
- `useDisclosure()` — boolean toggle state (modal open/close, etc.)
- `AppError` / `GlobalErrors` — standardized error types in `shared/errors/`
