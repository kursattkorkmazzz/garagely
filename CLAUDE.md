# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Start Expo dev server (clears cache)
npm run lint           # ESLint via Expo preset
npm run build:android  # EAS local Android APK build (development profile)
npm run migration:generate  # Generate TypeORM database migrations
```

No test suite is configured.

## Architecture Overview

**Garagely** is a local-first React Native / Expo app for vehicle garage management. All data is stored in a local SQLite database — there is no remote backend.

### Key Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Routing       | Expo Router (file-based, `app/` directory) |
| State         | Zustand (`stores/`)                        |
| Database      | TypeORM + `expo-sqlite` (`db/`)            |
| Forms         | Formik + Yup                               |
| Styling       | `react-native-unistyles` (`theme/`)        |
| i18n          | i18next + react-i18next (`i18n/`)          |
| Bottom sheets | `react-native-actions-sheet`               |
| Icons         | `lucide-react-native`                      |

### Data Flow

```
Component → Zustand Store → Service (TypeORM) → SQLite
```

Stores are the only way components access or mutate data. Services are never called directly from UI.

### Navigation

File-based Expo Router with a bottom tab layout:

- `(tabs)/garage/` — vehicle list and detail/edit screens
- `(tabs)/settings.tsx` — preferences screen

The root `index.tsx` immediately redirects to `/garage`.

### State Stores

Two Zustand stores in `stores/`:

- **`useVehicleStore`** — vehicles list, active vehicle, CRUD operations
- **`useUserPreferencesStore`** — theme, language, distance/currency/volume units; changes propagate to Unistyles runtime and i18next immediately

### Database

`db/db.ts` creates the TypeORM `DataSource` with `synchronize: true`. Entities live in `db/entity/`. Manual migrations are in `db/migrations/`. The `DatabaseProvider` component (`db/hooks/`) initializes the connection and loads user preferences before the app renders.

### Feature Modules

`features/` follows a DDD-inspired structure. Each feature (e.g. `vehicle`, `asset`, `user-preferences`) contains its own screens, services, and TypeORM repository logic. Screen components do not call services directly — they go through stores.

## UI Components

Always use the `App*` components from `components/ui/` — never raw React Native primitives for UI:

- `AppButton`, `AppText`, `AppView` — base primitives
- `AppInput` — use `app-input-v2` variant for form inputs
- `AppToggle`, `AppSegmented`, `AppBadge`, `EnumPickerRow`

### Styling with Unistyles

Use `StyleSheet.create()` from `react-native-unistyles`. Theme tokens (colors, spacing, typography, radius) come from `theme/tokens/`. Access them via the Unistyles theme object in stylesheets.

## Forms

All forms use Formik + Yup. The wizard pattern (e.g. Add Vehicle) uses a single top-level `Formik` wrapper; each step calls `useFormikContext<FormState>()` — no prop drilling. Validation schemas accept a `t` translation function so error messages are localized.

## i18n

Translation files are in `i18n/locales/{en,tr}/`. Each feature area has its own JSON file (e.g. `vehicle.json`, `garage.json`). Use `useTranslation()` from react-i18next in components. Pass `t` into Yup schemas to localize validation errors.

## TypeScript

Strict mode is on. Path alias `@/*` resolves to the project root. TypeORM decorators require `experimentalDecorators` and `emitDecoratorMetadata` — both are set in `tsconfig.json`.
