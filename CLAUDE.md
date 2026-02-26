# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

All commands run from the repo root unless noted.

```bash
# Run everything in dev mode (turbo parallel)
npm run dev

# Build all apps and packages (respects dependency order)
npm run build

# Lint all workspaces
npm run lint

# Type-check all workspaces
npm run check-types

# Format all TS/TSX/MD files
npm run format

# Run a single workspace's script
npm run dev --workspace=apps/mobile
npm run dev --workspace=apps/backend
npm run build --workspace=packages/shared
```

> There are no test scripts yet. When tests are added, they will be run via `turbo run test`.

---

## Architecture Overview

### Monorepo Layout

```
apps/mobile      → React Native + Expo Router (client)
apps/backend     → Express + TypeScript (API server)
packages/shared        → @garagely/shared   — Yup-first models, payloads, enums
packages/api-sdk       → @garagely/api-sdk  — typed API client used by mobile
packages/tsconfig      → shared TS configs
packages/eslint-config → shared ESLint configs
```

### Data & Request Flow

```
Component → Zustand store → @garagely/api-sdk → backend (Express)
                                                      ↓
                                               Firestore (via repository)
```

- **Components never call APIs directly.** Every API call goes through a Zustand store, which calls `@garagely/api-sdk`.
- **`@garagely/api-sdk`** exposes typed methods with `onSuccess`/`onError` callbacks. Auth token is set globally via `sdk.setAuthToken(token)`.
- **Stores** are Zustand v5. They hold UI state (`isLoading`, `error`) and domain data. They do not import `fetch`/`axios` directly.

### Auth Flow

1. Mobile calls `sdk.auth.login()` or `sdk.auth.register()`.
2. Backend validates credentials via **Firebase Admin SDK**, issues a **custom token**.
3. Mobile receives the custom token and stores it; exchanges it for a Firebase ID token client-side for subsequent requests.
4. There is **no Firebase client SDK** installed on mobile — all Firebase interaction is through the backend.

### Backend Module Structure (`apps/backend/src/`)

Each feature lives in `modules/{domain}/` with the same internal shape:

```
modules/auth/
  auth.routes.ts          ← Express Router, wires middleware + handler
  auth.controller.ts      ← thin handler: validates, calls service, sends response
  auth.service.ts         ← business logic
  auth.repository.ts      ← Firestore queries (implements interface)
  auth.repository.interface.ts
  auth.payload.ts         ← Yup schemas for request bodies
```

Cross-cutting pieces:

- `common/errors/` — `AppError` base + `NotFoundError`, `UnauthorizedError`, `ConflictError`, etc.
- `common/middleware/` — `authMiddleware`, `validatePayload(Schema)`, `errorHandler`, `subscriptionGuard`.
- `common/utils/` — `sendSuccess()`, `sendPaginated()`, `pagination()`.
- `providers/firebase/` — Firebase Admin SDK init, exports `db` (Firestore instance).

### Mobile Structure (`apps/mobile/`)

```
app/                      ← Expo Router file-based routes (screens only — keep thin)
  _layout.tsx             ← ThemeProvider + AuthGuard
  (auth)/                 ← Auth group: sign-in / sign-up
  (tabs)/                 ← Bottom tab navigator (4 tabs)
components/
  ui/                     ← Primitive components — app-* prefix (AppButton, AppInput, …)
  {domain}/               ← Composite components (e.g. components/auth/)
context/theme/            ← ThemeProvider, useTheme(), color tokens (light + dark)
stores/                   ← Zustand stores
```

Screen files import composites and call stores — no inline form logic, no business logic.

---

## Key Conventions

### Naming

| Artifact             | Suffix / Pattern            |
| -------------------- | --------------------------- |
| Yup schema           | `*Validator`                |
| Request body type    | `*Payload`                  |
| Firestore model      | `*Model`                    |
| Repository class     | `*Repository`               |
| Repository interface | `*.repository.interface.ts` |

### `@garagely/shared`

- Contains Yup-first models, shared payloads, and enums consumed by both `api-sdk` and `backend`.
- **No barrel `index.ts`.** Each file uses named `export` directly; consumers import from the specific file path.

### Styling (mobile)

- **All colors** come from `useTheme()` — passed as inline style props (`{ color: theme.primary }`).
- Layout and spacing use `StyleSheet.create()`.
- **No NativeWind, no Tailwind, no `className` prop** anywhere.

### Backend responses

- Always use `sendSuccess(res, data)` or `sendPaginated(res, data, meta)` — never `res.json()` directly.
- Route handlers must apply `validatePayload(Schema)` middleware before the controller for any mutating endpoint.
- Throw `AppError` subclasses inside services; `errorHandler` middleware converts them to HTTP responses.

### Repository pattern

- Define the interface (`*.repository.interface.ts`) before the Firestore implementation.
- Firestore implementation is injected into the service — swappable without touching business logic.

### API SDK usage pattern

```typescript
// Zustand store — canonical pattern
await sdk.auth.login(
  { email, password },
  {
    onSuccess: (data) => {
      set({ user: data.user, customToken: data.customToken });
      callbacks?.onSuccess?.();
    },
    onError: (err) => {
      set({ error: err.message });
      callbacks?.onError?.(err.message);
    },
  },
);
```
